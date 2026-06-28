import { useMimoStore } from "./useMimoStore.js";

const REMOTE_TTS_ENDPOINT = import.meta.env.VITE_MIMO_TTS_ENDPOINT || "/api/tts";
const TTS_MODE = import.meta.env.VITE_MIMO_TTS_MODE || "auto";
const REMOTE_RETRY_DELAY = 60_000;

let preferredVoiceByLanguage = {};
let remoteUnavailableUntil = 0;
let speechRun = 0;
let currentAudio = null;
let currentAudioUrl = null;
let currentRequest = null;

function currentLanguage() {
  return useMimoStore.getState().language ?? "az";
}

function setTalking(value) {
  useMimoStore.getState().setTalking(value);
}

function stopCurrentSpeech() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }

  if (currentRequest) {
    currentRequest.abort();
    currentRequest = null;
  }

  if (currentAudio) {
    currentAudio.pause();
    currentAudio.src = "";
    currentAudio = null;
  }

  if (currentAudioUrl) {
    URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = null;
  }

  setTalking(false);
}

function voiceFamily(voice) {
  if (!voice) return "native";
  if (/^az([-_]|$)/i.test(voice.lang)) return "az";
  if (/^tr([-_]|$)/i.test(voice.lang)) return "tr";
  return "other";
}

function scoreVoice(voice, language) {
  const lang = language === "az" ? "az" : "en";
  const name = `${voice.name} ${voice.lang}`.toLowerCase();
  let score = 0;

  if (lang === "az") {
    if (/^az([-_]|$)/i.test(voice.lang)) score += 140;
    if (/azerbaijani|azərbaycan|azeri|azərbaycanca|banu|babek/i.test(name)) score += 80;
    if (/natural|neural|online|microsoft|edge/i.test(name)) score += 20;
    if (/^tr([-_]|$)/i.test(voice.lang)) score += 32;
    if (/turkish|türkçe|turkce/i.test(name)) score += 20;
    if (/^en([-_]|$)/i.test(voice.lang)) score -= 100;
  } else {
    if (/^en([-_]|$)/i.test(voice.lang)) score += 110;
    if (/jenny|aria|zira|samantha|natural|neural|online|google|microsoft|edge/i.test(name)) score += 22;
  }

  return score;
}

function pickVoiceFromList(voices, language = currentLanguage()) {
  if (!voices.length) return null;
  const ranked = voices.slice().sort((a, b) => scoreVoice(b, language) - scoreVoice(a, language));
  const best = ranked[0] ?? null;
  if (language === "az" && best && scoreVoice(best, language) < 45) return null;
  return best;
}

function browserVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  return window.speechSynthesis.getVoices();
}

function waitForVoices() {
  if (typeof window === "undefined" || !window.speechSynthesis) return Promise.resolve([]);
  const voices = browserVoices();
  if (voices.length) return Promise.resolve(voices);

  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => resolve(browserVoices()), 450);
    window.speechSynthesis.onvoiceschanged = () => {
      window.clearTimeout(timeout);
      preferredVoiceByLanguage.az = pickVoiceFromList(browserVoices(), "az");
      preferredVoiceByLanguage.en = pickVoiceFromList(browserVoices(), "en");
      resolve(browserVoices());
    };
  });
}

function normalizeForSpeech(text, language, family = "native") {
  let spoken = String(text || "")
    .replace(/\bAI\b/g, language === "az" ? "süni intellekt" : "AI")
    .replace(/\bAR\b/g, language === "az" ? "artırılmış reallıq" : "AR")
    .replace(/\b3D\b/g, language === "az" ? "üç de" : "three D")
    .replace(/\bLED\b/g, language === "az" ? "led" : "LED")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\.\.\./g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  if (language === "az" && family === "tr") {
    spoken = spoken
      .replace(/Ə/g, "E")
      .replace(/ə/g, "e")
      .replace(/Q/g, "G")
      .replace(/q/g, "g")
      .replace(/X/g, "H")
      .replace(/x/g, "h");
  }

  return spoken;
}

function splitForNaturalPacing(text, language) {
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);

  if (language === "az") return parts.length ? parts : [text];
  return parts.length > 1 ? parts : [text];
}

function configureUtterance(utterance, { language, voice, index, count }) {
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = language === "az" ? "az-AZ" : "en-US";
  }

  if (language === "az") {
    utterance.pitch = 0.98 + (index > 0 ? 0.02 : 0);
    utterance.rate = count > 1 ? 0.82 : 0.85;
  } else {
    utterance.pitch = 1.02;
    utterance.rate = 0.92;
  }

  utterance.volume = 1;
}

function shouldTryRemote() {
  if (TTS_MODE === "browser") return false;
  if (!REMOTE_TTS_ENDPOINT) return false;
  if (Date.now() < remoteUnavailableUntil) return false;
  if (typeof window === "undefined") return false;
  if (window.location.protocol === "file:") return false;
  return true;
}

async function playRemoteSpeech(text, language, runId) {
  if (!shouldTryRemote()) return false;

  const controller = new AbortController();
  currentRequest = controller;
  const spokenText = normalizeForSpeech(text, language);

  try {
    const response = await fetch(REMOTE_TTS_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: spokenText, language }),
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`TTS endpoint returned ${response.status}`);
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("audio/")) throw new Error("TTS endpoint did not return audio.");

    const audioBlob = await response.blob();
    if (runId !== speechRun) return true;

    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    currentAudio = audio;
    currentAudioUrl = audioUrl;

    window.__mimoLastSpeech = {
      provider: "remote",
      displayText: text,
      spokenText,
      language,
      endpoint: REMOTE_TTS_ENDPOINT,
    };

    audio.onplay = () => setTalking(true);
    audio.onended = () => {
      if (runId === speechRun) setTalking(false);
      URL.revokeObjectURL(audioUrl);
      if (currentAudio === audio) currentAudio = null;
      if (currentAudioUrl === audioUrl) currentAudioUrl = null;
    };
    audio.onerror = () => {
      if (runId === speechRun) setTalking(false);
      URL.revokeObjectURL(audioUrl);
      if (currentAudio === audio) currentAudio = null;
      if (currentAudioUrl === audioUrl) currentAudioUrl = null;
    };

    await audio.play();
    return true;
  } catch (error) {
    if (error.name !== "AbortError") {
      remoteUnavailableUntil = Date.now() + REMOTE_RETRY_DELAY;
      console.info("Mimo remote TTS unavailable; using browser voice fallback.", error.message);
    }
    return false;
  } finally {
    if (currentRequest === controller) currentRequest = null;
  }
}

async function playBrowserSpeech(text, language, runId) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  const voices = await waitForVoices();
  if (runId !== speechRun) return;

  const voice = preferredVoiceByLanguage[language] ?? pickVoiceFromList(voices, language);
  if (voice) preferredVoiceByLanguage[language] = voice;

  const family = voiceFamily(voice);
  const spokenText = normalizeForSpeech(text, language, family);
  const segments = splitForNaturalPacing(spokenText, language);
  let remaining = segments.length;

  window.__mimoLastSpeech = {
    provider: "browser",
    displayText: text,
    spokenText,
    language,
    voice: voice ? { name: voice.name, lang: voice.lang, family } : { name: "browser default", lang: language === "az" ? "az-AZ" : "en-US", family },
    segments,
  };

  synth.cancel();
  segments.forEach((segment, index) => {
    const utterance = new SpeechSynthesisUtterance(segment);
    configureUtterance(utterance, { language, voice, index, count: segments.length });
    utterance.onstart = () => {
      if (runId === speechRun) setTalking(true);
    };
    utterance.onend = () => {
      remaining -= 1;
      if (remaining <= 0 && runId === speechRun) setTalking(false);
    };
    utterance.onerror = () => {
      remaining -= 1;
      if (remaining <= 0 && runId === speechRun) setTalking(false);
    };
    synth.speak(utterance);
  });
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  preferredVoiceByLanguage.az = pickVoiceFromList(browserVoices(), "az");
  preferredVoiceByLanguage.en = pickVoiceFromList(browserVoices(), "en");
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoiceByLanguage.az = pickVoiceFromList(browserVoices(), "az");
    preferredVoiceByLanguage.en = pickVoiceFromList(browserVoices(), "en");
  };
}

export function speak(text, language = currentLanguage()) {
  const runId = ++speechRun;
  stopCurrentSpeech();

  void (async () => {
    const usedRemote = await playRemoteSpeech(text, language, runId);
    if (!usedRemote && runId === speechRun) {
      await playBrowserSpeech(text, language, runId);
    }
  })();
}
