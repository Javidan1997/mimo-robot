import { useMimoStore } from "./useMimoStore.js";

/**
 * Make Mimo talk out loud using the browser's built-in speech synthesis.
 * Toggles `talking` in the store so the 3D face can flap its mouth + nod.
 * No backend needed; works on a user gesture (click).
 */
let preferredVoiceByLanguage = {};

function currentLanguage() {
  return useMimoStore.getState().language ?? "az";
}

function voiceFamily(voice) {
  if (!voice) return "native";
  if (/^az([-_]|$)/i.test(voice.lang)) return "az";
  if (/^tr([-_]|$)/i.test(voice.lang)) return "tr";
  return "other";
}

function pickVoice(language = currentLanguage()) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const lang = language === "az" ? "az" : "en";
  const score = (voice) => {
    const name = `${voice.name} ${voice.lang}`.toLowerCase();
    let s = 0;

    if (lang === "az") {
      // True Azerbaijani voices are rare in browsers. Prefer them strongly,
      // then Turkish voices, which pronounce Azerbaijani far more naturally
      // than English voices after the speech-only pronunciation pass below.
      if (/^az([-_]|$)/i.test(voice.lang)) s += 100;
      if (/azerbaijani|azərbaycan|azeri|azərbaycanca/i.test(name)) s += 100;
      if (/^tr([-_]|$)/i.test(voice.lang)) s += 70;
      if (/turkish|türkçe|turkce|tr-tr/i.test(name)) s += 70;
      if (/natural|neural|online|google|microsoft|female|zira|aria/i.test(name)) s += 8;
      if (voice.localService) s += 2;
      if (/^en([-_]|$)/i.test(voice.lang)) s -= 80;
    } else {
      if (/^en([-_]|$)/i.test(voice.lang)) s += 80;
      if (/female|samantha|zira|aria|jenny|natural|neural|google us/i.test(name)) s += 10;
      if (/google|microsoft/i.test(name)) s += 4;
    }

    return s;
  };

  const ranked = voices.slice().sort((a, b) => score(b) - score(a));
  const best = ranked[0] ?? null;
  if (lang === "az" && best && score(best) < 50) return null;
  return best;
}

function normalizeForAzerbaijaniSpeech(text, family) {
  let spoken = text
    .replace(/AI/g, "süni intellekt")
    .replace(/AR/g, "artırılmış reallıq")
    .replace(/Mimo/g, "Mimo")
    .replace(/\.\.\./g, ". ")
    .replace(/\s+/g, " ")
    .trim();

  if (family === "tr") {
    // Turkish fallback voices do not handle Azerbaijani ə/q/x consistently.
    // This is only for the hidden utterance text; visible site copy stays native.
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
  if (language !== "az") return [text];
  return text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function configureUtterance(utterance, { language, voice, index, count }) {
  if (voice) {
    utterance.voice = voice;
    utterance.lang = voice.lang;
  } else {
    utterance.lang = language === "az" ? "az-AZ" : "en-US";
  }

  if (language === "az") {
    utterance.pitch = 1.02;
    utterance.rate = count > 1 ? 0.86 : 0.88;
  } else {
    utterance.pitch = 1.16;
    utterance.rate = 0.94;
  }

  // Tiny pitch lift after the first Azerbaijani sentence keeps Mimo cute
  // without making it sound like a cartoon translator.
  if (language === "az" && index > 0) utterance.pitch += 0.02;
  utterance.volume = 1;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  preferredVoiceByLanguage.az = pickVoice("az");
  preferredVoiceByLanguage.en = pickVoice("en");
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoiceByLanguage.az = pickVoice("az");
    preferredVoiceByLanguage.en = pickVoice("en");
  };
}

export function speak(text, language = currentLanguage()) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  try {
    synth.cancel();
    const voice = preferredVoiceByLanguage[language] ?? pickVoice(language);
    if (voice) preferredVoiceByLanguage[language] = voice;

    const family = voiceFamily(voice);
    const spokenText = language === "az" ? normalizeForAzerbaijaniSpeech(text, family) : text;
    const segments = splitForNaturalPacing(spokenText, language);
    const set = useMimoStore.getState().setTalking;
    let remaining = segments.length;

    if (typeof window !== "undefined") {
      window.__mimoLastSpeech = {
        displayText: text,
        spokenText,
        language,
        voice: voice ? { name: voice.name, lang: voice.lang, family } : { name: "browser default", lang: language === "az" ? "az-AZ" : "en-US", family },
        segments,
      };
    }

    segments.forEach((segment, index) => {
      const utterance = new SpeechSynthesisUtterance(segment);
      configureUtterance(utterance, { language, voice, index, count: segments.length });
      utterance.onstart = () => set(true);
      utterance.onend = () => {
        remaining -= 1;
        if (remaining <= 0) set(false);
      };
      utterance.onerror = () => {
        remaining -= 1;
        if (remaining <= 0) set(false);
      };
      synth.speak(utterance);
    });
  } catch {
    /* speech not available — fail silently */
  }
}
