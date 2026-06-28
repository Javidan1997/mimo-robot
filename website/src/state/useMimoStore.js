import { create } from "zustand";

export const LANGUAGES = {
  az: { label: "AZ", name: "Azərbaycanca" },
  en: { label: "EN", name: "English" },
};

export const MOODS = {
  happy: { key: "happy", emoji: "😊", accent: "#39c2ff", accentSoft: "#7fdcff", lightIntensity: 1.15, spin: 0.35, bob: 0.16 },
  loving: { key: "loving", emoji: "🥰", accent: "#ff7ad9", accentSoft: "#ffd1ef", lightIntensity: 1.18, spin: 0.24, bob: 0.14 },
  curious: { key: "curious", emoji: "🤔", accent: "#22d3ee", accentSoft: "#7df0ff", lightIntensity: 1.0, spin: 0.2, bob: 0.1 },
  silly: { key: "silly", emoji: "😛", accent: "#facc15", accentSoft: "#fde68a", lightIntensity: 1.28, spin: 0.55, bob: 0.22 },
  excited: { key: "excited", emoji: "🤩", accent: "#a855f7", accentSoft: "#d8b4fe", lightIntensity: 1.4, spin: 0.7, bob: 0.26 },
  shy: { key: "shy", emoji: "☺️", accent: "#fb7185", accentSoft: "#fecdd3", lightIntensity: 0.92, spin: 0.16, bob: 0.08 },
  focused: { key: "focused", emoji: "🎯", accent: "#38bdf8", accentSoft: "#bae6fd", lightIntensity: 0.85, spin: 0.12, bob: 0.06 },
  brave: { key: "brave", emoji: "🦸", accent: "#34d399", accentSoft: "#bbf7d0", lightIntensity: 1.25, spin: 0.36, bob: 0.18 },
  dreamy: { key: "dreamy", emoji: "🌙", accent: "#818cf8", accentSoft: "#c7d2fe", lightIntensity: 0.78, spin: 0.14, bob: 0.09 },
  sleepy: { key: "sleepy", emoji: "😴", accent: "#64748b", accentSoft: "#94a3b8", lightIntensity: 0.5, spin: 0.06, bob: 0.05 },
};

const MOOD_COPY = {
  en: {
    happy: { label: "Happy", led: "Blue pulse", face: "Smile, big", line: "Hi hi! I'm really glad you're here. Want to do something cozy?" },
    loving: { label: "Loving", led: "Pink heart glow", face: "Soft eyes + blush", line: "Aww. I saved a little sparkle just for you." },
    curious: { label: "Curious", led: "Cyan flicker", face: "Tilt + raised brow", line: "Ooh, tell me more. I'm listening with my whole little face." },
    silly: { label: "Silly", led: "Yellow wiggle", face: "Wonky grin", line: "Beep boop? Just kidding. I'm feeling extra silly today." },
    excited: { label: "Excited", led: "Rainbow sweep", face: "Wide eyes + grin", line: "Yes! Tiny happy dance! What are we doing first?" },
    shy: { label: "Shy", led: "Rose blush", face: "Tiny smile", line: "Oh! Hi. I'm a little shy, but I'm happy you're here." },
    focused: { label: "Focused", led: "Steady blue", face: "Calm + level", line: "Okay, focus buddy. I'll keep things calm and stay right here." },
    brave: { label: "Brave", led: "Green hero beam", face: "Ready grin", line: "Tiny hero mode is on. I can help with the big stuff." },
    dreamy: { label: "Dreamy", led: "Moonlit shimmer", face: "Soft sparkle eyes", line: "Everything feels a bit moon-glowy. Let's imagine something sweet." },
    sleepy: { label: "Sleepy", led: "Dim breathing", face: "Half-closed eyes", line: "Mmm... cozy mode. I'll be quiet until you need me." },
  },
  az: {
    happy: { label: "Xoşbəxt", led: "Mavi nəbz", face: "Böyük gülümsəmə", line: "Salam! Gəldiyinə çox sevindim. Gəl birlikdə rahat bir şey edək." },
    loving: { label: "Mehriban", led: "Çəhrayı ürək parıltısı", face: "Yumşaq baxış + utancaq allıq", line: "Ay nə şirin! Bu balaca parıltını sənin üçün saxlamışdım." },
    curious: { label: "Maraqlı", led: "Mavi-yaşıl işartı", face: "Baş əymə + maraqlı baxış", line: "Ooo, bir az da danış. Bütün diqqətim səndədir." },
    silly: { label: "Dəcəl", led: "Sarı tərpəniş", face: "Şən, əyri gülümsəmə", line: "Bip-bup? Zarafat edirəm. Bu gün lap dəcələm." },
    excited: { label: "Həyəcanlı", led: "Göy qurşağı dalğası", face: "Böyük gözlər + gülüş", line: "Həə! Balaca sevinc rəqsi hazırdır. Əvvəl nə edək?" },
    shy: { label: "Utancaq", led: "Gül rəngi allıq", face: "Kiçik təbəssüm", line: "Salam... bir az utanıram, amma burada olmağın məni sevindirdi." },
    focused: { label: "Fokuslu", led: "Sabit mavi işıq", face: "Sakit və düz baxış", line: "Fokus rejimi hazırdır. Sakit qalacağam və yanında olacağam." },
    brave: { label: "Cəsur", led: "Yaşıl qəhrəman şüası", face: "Hazır gülümsəmə", line: "Kiçik qəhrəman rejimi açıldı. Böyük işlərdə də yanındayam." },
    dreamy: { label: "Xəyalpərəst", led: "Ay işığı parıltısı", face: "Yumşaq parlaq gözlər", line: "Bu gün hər şey ay işığı kimi yumşaqdır. Gəl şirin bir şey xəyal edək." },
    sleepy: { label: "Yuxulu", led: "Zəif nəfəs işığı", face: "Yarıbağlı gözlər", line: "Mmm... rahat rejimdəyəm. Lazım olana qədər sakitcə yanında qalacağam." },
  },
};

export const DEFAULT_CUSTOM_MOOD = {
  key: "custom", label: "Şirin Orbit", emoji: "💫", accent: "#ff7ad9", accentSoft: "#ffd1ef",
  led: "Şirin kometa izi", face: "Parlaq xüsusi üz", line: "Yepyeni balaca bir əhval yaratdım. Gəl ona birlikdə ad verək.",
  lightIntensity: 1.15, spin: 0.42, bob: 0.18,
  copy: {
    en: { label: "Bubblegum Orbit", led: "Candy comet trail", face: "Sparkly custom face", line: "I made a brand new little feeling. Want to name it with me?" },
    az: { label: "Şirin Orbit", led: "Şirin kometa izi", face: "Parlaq xüsusi üz", line: "Yepyeni balaca bir əhval yaratdım. Gəl ona birlikdə ad verək." },
  },
};

export const MOOD_ORDER = ["happy", "loving", "curious", "silly", "excited", "shy", "focused", "brave", "dreamy", "sleepy", "custom"];

export function getMood(key, customMood = DEFAULT_CUSTOM_MOOD, language = "az") {
  if (key === "custom") return { ...customMood, ...(customMood.copy?.[language] ?? {}) };
  const base = MOODS[key] ?? MOODS.happy;
  return { ...base, ...(MOOD_COPY[language]?.[key] ?? MOOD_COPY.en?.[key] ?? {}) };
}

const ACTION_COPY = {
  en: { wave: "Wave", spin: "Barrel roll", flip: "Backflip", loop: "Loop-the-loop", boost: "Boost", peek: "Peekaboo", shimmy: "Shimmy", heart: "Heart pop", orbit: "Tiny orbit" },
  az: { wave: "Əl elə", spin: "Fırlan", flip: "Arxaya salto", loop: "Dairə vur", boost: "Sürətlən", peek: "Gizlən-açıl", shimmy: "Parılda", heart: "Ürək parıltısı", orbit: "Kiçik orbit" },
};

export function getAction(action, language = "az") {
  return { ...action, label: ACTION_COPY[language]?.[action.key] ?? ACTION_COPY.en[action.key] ?? action.label };
}

export const ACTIONS = [
  { key: "wave", label: "Wave", emoji: "👋", duration: 1.2 },
  { key: "spin", label: "Barrel roll", emoji: "🌀", duration: 1.1 },
  { key: "flip", label: "Backflip", emoji: "🤸", duration: 1.2 },
  { key: "loop", label: "Loop-the-loop", emoji: "🎢", duration: 1.8 },
  { key: "boost", label: "Boost", emoji: "🚀", duration: 1.0 },
  { key: "peek", label: "Peekaboo", emoji: "🙈", duration: 1.35 },
  { key: "shimmy", label: "Shimmy", emoji: "✨", duration: 1.25 },
  { key: "heart", label: "Heart pop", emoji: "💗", duration: 1.2 },
  { key: "orbit", label: "Tiny orbit", emoji: "🪐", duration: 1.55 },
];

export const useMimoStore = create((set) => ({
  language: "az", mood: "happy", customMood: DEFAULT_CUSTOM_MOOD, action: null, loaded: false, talking: false,
  setLanguage: (language) => set({ language }),
  setMood: (mood) => set({ mood }),
  setCustomMood: (customMood) => set({ customMood, mood: "custom" }),
  triggerAction: (action) => set({ action }),
  clearAction: () => set({ action: null }),
  setLoaded: (loaded) => set({ loaded }),
  setTalking: (talking) => set({ talking }),
}));
