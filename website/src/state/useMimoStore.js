import { create } from "zustand";

export const LANGUAGES = {
  az: { label: "AZ", name: "Azərbaycan dili" },
  en: { label: "EN", name: "English" },
};

export const MOODS = {
  happy: { key: "happy", icon: "happy", accent: "#39c2ff", accentSoft: "#7fdcff", lightIntensity: 1.15, spin: 0.35, bob: 0.16 },
  loving: { key: "loving", icon: "loving", accent: "#ff7ad9", accentSoft: "#ffd1ef", lightIntensity: 1.18, spin: 0.24, bob: 0.14 },
  curious: { key: "curious", icon: "curious", accent: "#22d3ee", accentSoft: "#7df0ff", lightIntensity: 1.0, spin: 0.2, bob: 0.1 },
  silly: { key: "silly", icon: "silly", accent: "#facc15", accentSoft: "#fde68a", lightIntensity: 1.28, spin: 0.55, bob: 0.22 },
  excited: { key: "excited", icon: "excited", accent: "#a855f7", accentSoft: "#d8b4fe", lightIntensity: 1.4, spin: 0.7, bob: 0.26 },
  shy: { key: "shy", icon: "shy", accent: "#fb7185", accentSoft: "#fecdd3", lightIntensity: 0.92, spin: 0.16, bob: 0.08 },
  focused: { key: "focused", icon: "focused", accent: "#38bdf8", accentSoft: "#bae6fd", lightIntensity: 0.85, spin: 0.12, bob: 0.06 },
  brave: { key: "brave", icon: "brave", accent: "#34d399", accentSoft: "#bbf7d0", lightIntensity: 1.25, spin: 0.36, bob: 0.18 },
  dreamy: { key: "dreamy", icon: "dreamy", accent: "#818cf8", accentSoft: "#c7d2fe", lightIntensity: 0.78, spin: 0.14, bob: 0.09 },
  sleepy: { key: "sleepy", icon: "sleepy", accent: "#64748b", accentSoft: "#94a3b8", lightIntensity: 0.5, spin: 0.06, bob: 0.05 },
};

const MOOD_COPY = {
  en: {
    happy: { label: "Positive", led: "Blue pulse", face: "Open smile", line: "I am ready. What should we work on first?" },
    loving: { label: "Supportive", led: "Soft rose light", face: "Warm expression", line: "I am here. We can handle this calmly and clearly." },
    curious: { label: "Curious", led: "Cyan signal", face: "Attentive look", line: "Share more context. I will keep the details in view." },
    silly: { label: "Light", led: "Yellow impulse", face: "Relaxed smile", line: "Let us keep it light and still get the task done." },
    excited: { label: "Energetic", led: "Fast color sweep", face: "Active expression", line: "Good. Let us choose the first step and move." },
    shy: { label: "Quiet", led: "Low rose light", face: "Minimal smile", line: "Quiet mode is on. I will stay available without getting in the way." },
    focused: { label: "Focused", led: "Steady blue", face: "Calm level look", line: "Focus mode is active. We can continue without distraction." },
    brave: { label: "Confident", led: "Green signal", face: "Ready expression", line: "We can take the difficult part one step at a time." },
    dreamy: { label: "Creative", led: "Soft violet glow", face: "Open reflective look", line: "Let us explore the ideas freely, then choose what works." },
    sleepy: { label: "Rest", led: "Low breathing light", face: "Half-closed eyes", line: "Rest mode is active. I will stay quiet until you need me." },
  },
  az: {
    happy: { label: "Pozitiv", led: "Mavi nəbz", face: "Açıq təbəssüm", line: "Hazıram. Əvvəl nə üzərində işləyək?" },
    loving: { label: "Dəstək", led: "Yumşaq çəhrayı işıq", face: "Mehriban ifadə", line: "Buradayam. Bunu sakit və aydın şəkildə həll edə bilərik." },
    curious: { label: "Maraqlı", led: "Mavi-yaşıl siqnal", face: "Diqqətli baxış", line: "Bir az daha izah et. Konteksti diqqətdə saxlayacağam." },
    silly: { label: "Yüngül", led: "Sarı impuls", face: "Rahat təbəssüm", line: "Gəlin işi yüngül ritmdə aparaq və nəticəyə çataq." },
    excited: { label: "Enerjili", led: "Sürətli rəng keçidi", face: "Canlı ifadə", line: "Yaxşı. İlk addımı seçək və başlayaq." },
    shy: { label: "Sakit", led: "Zəif çəhrayı işıq", face: "Minimal təbəssüm", line: "Sakit rejimdəyəm. Lazım olanda yanında olacağam." },
    focused: { label: "Fokus", led: "Sabit mavi işıq", face: "Düz və sakit baxış", line: "Fokus rejimi aktivdir. Diqqəti yayındırmadan davam edək." },
    brave: { label: "Qətiyyətli", led: "Yaşıl siqnal", face: "Hazır ifadə", line: "Çətin hissəni də addım-addım həll edə bilərik." },
    dreamy: { label: "Yaradıcı", led: "Bənövşəyi yumşaq işıq", face: "Açıq düşüncəli baxış", line: "Fikirləri sərbəst yoxlayaq, sonra ən işlək variantı seçək." },
    sleepy: { label: "Rahat", led: "Zəif nəfəs ritmi", face: "Yarıbağlı gözlər", line: "Rahat rejimdəyəm. Lazım olana qədər sakit qalacağam." },
  },
};

export const DEFAULT_CUSTOM_MOOD = {
  key: "custom",
  label: "Parlaq Fokus",
  icon: "focused",
  accent: "#ff7ad9",
  accentSoft: "#ffd1ef",
  led: "Sabit mavi ritm",
  face: "Sakit və diqqətli baxış",
  line: "Fokus rejimi aktivdir. Sakit qalırıq və işi addım-addım aparırıq.",
  lightIntensity: 1.15,
  spin: 0.42,
  bob: 0.18,
  copy: {
    en: { label: "Clear Focus", led: "Steady blue rhythm", face: "Calm attentive look", line: "Focus mode is active. We can move step by step." },
    az: { label: "Parlaq Fokus", led: "Sabit mavi ritm", face: "Sakit və diqqətli baxış", line: "Fokus rejimi aktivdir. Sakit qalırıq və işi addım-addım aparırıq." },
  },
};

export const MOOD_ORDER = ["happy", "loving", "curious", "silly", "excited", "shy", "focused", "brave", "dreamy", "sleepy", "custom"];

export function getMood(key, customMood = DEFAULT_CUSTOM_MOOD, language = "az") {
  if (key === "custom") return { ...customMood, ...(customMood.copy?.[language] ?? {}) };
  const base = MOODS[key] ?? MOODS.happy;
  return { ...base, ...(MOOD_COPY[language]?.[key] ?? MOOD_COPY.en?.[key] ?? {}) };
}

const ACTION_COPY = {
  en: { wave: "Greet", spin: "Turn", flip: "Flip", loop: "Loop", boost: "Boost", peek: "Peek", shimmy: "Signal", heart: "Support", orbit: "Orbit" },
  az: { wave: "Salam ver", spin: "Fırlan", flip: "Salto", loop: "Dairə çək", boost: "Sürətlən", peek: "Görün", shimmy: "Siqnal ver", heart: "Dəstək ver", orbit: "Orbit" },
};

export function getAction(action, language = "az") {
  return { ...action, label: ACTION_COPY[language]?.[action.key] ?? ACTION_COPY.en[action.key] ?? action.label };
}

export function getMoodClickAction(mood) {
  const byMood = {
    happy: "wave",
    loving: "heart",
    curious: "peek",
    silly: "shimmy",
    excited: "loop",
    shy: "peek",
    focused: "orbit",
    brave: "boost",
    dreamy: "orbit",
    sleepy: "wave",
    custom: "heart",
  };
  return byMood[mood] ?? "wave";
}

export const ACTIONS = [
  { key: "wave", label: "Greet", icon: "wave", duration: 1.2 },
  { key: "spin", label: "Turn", icon: "spin", duration: 1.1 },
  { key: "flip", label: "Flip", icon: "flip", duration: 1.2 },
  { key: "loop", label: "Loop", icon: "loop", duration: 1.8 },
  { key: "boost", label: "Boost", icon: "boost", duration: 1.0 },
  { key: "peek", label: "Peek", icon: "peek", duration: 1.35 },
  { key: "shimmy", label: "Signal", icon: "signal", duration: 1.25 },
  { key: "heart", label: "Support", icon: "support", duration: 1.2 },
  { key: "orbit", label: "Orbit", icon: "orbit", duration: 1.55 },
];

export const useMimoStore = create((set) => ({
  language: "az",
  mood: "happy",
  customMood: DEFAULT_CUSTOM_MOOD,
  action: null,
  clickTarget: null,
  mimoScreen: null,
  loaded: false,
  talking: false,
  setLanguage: (language) => set({ language }),
  setMood: (mood) => set({ mood }),
  setCustomMood: (customMood) => set({ customMood, mood: "custom" }),
  triggerAction: (action) => set({ action: { key: action, id: Date.now() } }),
  clearAction: () => set({ action: null }),
  setClickTarget: (target) => set({ clickTarget: target }),
  clearClickTarget: () => set({ clickTarget: null }),
  setMimoScreen: (mimoScreen) => set({ mimoScreen }),
  setLoaded: (loaded) => set({ loaded }),
  setTalking: (talking) => set({ talking }),
}));
