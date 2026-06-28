import { useMimoStore } from "./useMimoStore.js";

/**
 * Make Mimo talk out loud using the browser's built-in speech synthesis.
 * Toggles `talking` in the store so the 3D face can flap its mouth + nod.
 * No backend needed; works on a user gesture (click).
 */
let preferredVoice = null;

function pickVoice() {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  // Prefer warm, natural English voices so Mimo sounds soft instead of robotic.
  const score = (v) => {
    let s = 0;
    if (/en[-_]/i.test(v.lang)) s += 3;
    if (/female|samantha|zira|aria|jenny|natural|neural|google us/i.test(v.name)) s += 4;
    if (/google|microsoft/i.test(v.name)) s += 1;
    return s;
  };
  return voices.slice().sort((a, b) => score(b) - score(a))[0];
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  preferredVoice = pickVoice();
  window.speechSynthesis.onvoiceschanged = () => {
    preferredVoice = pickVoice();
  };
}

export function speak(text) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  const synth = window.speechSynthesis;
  try {
    synth.cancel(); // stop any current line
    const u = new SpeechSynthesisUtterance(text);
    if (!preferredVoice) preferredVoice = pickVoice();
    if (preferredVoice) u.voice = preferredVoice;
    u.pitch = 1.16;
    u.rate = 0.94;
    u.volume = 1;
    const set = useMimoStore.getState().setTalking;
    u.onstart = () => set(true);
    u.onend = () => set(false);
    u.onerror = () => set(false);
    synth.speak(u);
  } catch {
    /* speech not available — fail silently */
  }
}
