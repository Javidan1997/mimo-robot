import { create } from "zustand";

/**
 * Mood presets drive everything: the 3D scene lighting + accent glow,
 * the UI accent color, and the personality copy. Each reaction blends
 * face, glow, movement and sound so Mimo feels like a tiny companion.
 */
export const MOODS = {
  happy: {
    key: "happy",
    label: "Happy",
    emoji: "😊",
    accent: "#39c2ff",
    accentSoft: "#7fdcff",
    led: "Blue pulse",
    face: "Smile, big",
    line: "Hi hi! I'm really glad you're here. Want to do something cozy?",
    lightIntensity: 1.15,
    spin: 0.35,
    bob: 0.16,
  },
  loving: {
    key: "loving",
    label: "Loving",
    emoji: "🥰",
    accent: "#ff7ad9",
    accentSoft: "#ffd1ef",
    led: "Pink heart glow",
    face: "Soft eyes + blush",
    line: "Aww. I saved a little sparkle just for you.",
    lightIntensity: 1.18,
    spin: 0.24,
    bob: 0.14,
  },
  curious: {
    key: "curious",
    label: "Curious",
    emoji: "🤔",
    accent: "#22d3ee",
    accentSoft: "#7df0ff",
    led: "Cyan flicker",
    face: "Tilt + raised brow",
    line: "Ooh, tell me more. I'm listening with my whole little face.",
    lightIntensity: 1.0,
    spin: 0.2,
    bob: 0.1,
  },
  silly: {
    key: "silly",
    label: "Silly",
    emoji: "😛",
    accent: "#facc15",
    accentSoft: "#fde68a",
    led: "Yellow wiggle",
    face: "Wonky grin",
    line: "Beep boop? Just kidding. I'm feeling extra silly today.",
    lightIntensity: 1.28,
    spin: 0.55,
    bob: 0.22,
  },
  excited: {
    key: "excited",
    label: "Excited",
    emoji: "🤩",
    accent: "#a855f7",
    accentSoft: "#d8b4fe",
    led: "Rainbow sweep",
    face: "Wide eyes + grin",
    line: "Yes! Tiny happy dance! What are we doing first?",
    lightIntensity: 1.4,
    spin: 0.7,
    bob: 0.26,
  },
  shy: {
    key: "shy",
    label: "Shy",
    emoji: "☺️",
    accent: "#fb7185",
    accentSoft: "#fecdd3",
    led: "Rose blush",
    face: "Tiny smile",
    line: "Oh! Hi. I'm a little shy, but I'm happy you're here.",
    lightIntensity: 0.92,
    spin: 0.16,
    bob: 0.08,
  },
  focused: {
    key: "focused",
    label: "Focused",
    emoji: "🎯",
    accent: "#38bdf8",
    accentSoft: "#bae6fd",
    led: "Steady blue",
    face: "Calm + level",
    line: "Okay, focus buddy. I'll keep things calm and stay right here.",
    lightIntensity: 0.85,
    spin: 0.12,
    bob: 0.06,
  },
  brave: {
    key: "brave",
    label: "Brave",
    emoji: "🦸",
    accent: "#34d399",
    accentSoft: "#bbf7d0",
    led: "Green hero beam",
    face: "Ready grin",
    line: "Tiny hero mode is on. I can help with the big stuff.",
    lightIntensity: 1.25,
    spin: 0.36,
    bob: 0.18,
  },
  dreamy: {
    key: "dreamy",
    label: "Dreamy",
    emoji: "🌙",
    accent: "#818cf8",
    accentSoft: "#c7d2fe",
    led: "Moonlit shimmer",
    face: "Soft sparkle eyes",
    line: "Everything feels a bit moon-glowy. Let's imagine something sweet.",
    lightIntensity: 0.78,
    spin: 0.14,
    bob: 0.09,
  },
  sleepy: {
    key: "sleepy",
    label: "Sleepy",
    emoji: "😴",
    accent: "#64748b",
    accentSoft: "#94a3b8",
    led: "Dim breathing",
    face: "Half-closed eyes",
    line: "Mmm... cozy mode. I'll be quiet until you need me.",
    lightIntensity: 0.5,
    spin: 0.06,
    bob: 0.05,
  },
};

export const DEFAULT_CUSTOM_MOOD = {
  key: "custom",
  label: "Bubblegum Orbit",
  emoji: "💫",
  accent: "#ff7ad9",
  accentSoft: "#ffd1ef",
  led: "Candy comet trail",
  face: "Sparkly custom face",
  line: "I made a brand new little feeling. Want to name it with me?",
  lightIntensity: 1.15,
  spin: 0.42,
  bob: 0.18,
};

export const MOOD_ORDER = [
  "happy",
  "loving",
  "curious",
  "silly",
  "excited",
  "shy",
  "focused",
  "brave",
  "dreamy",
  "sleepy",
  "custom",
];

export function getMood(key, customMood = DEFAULT_CUSTOM_MOOD) {
  if (key === "custom") return customMood;
  return MOODS[key] ?? MOODS.happy;
}

// One-shot flight tricks Mimo can perform.
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
  mood: "happy",
  customMood: DEFAULT_CUSTOM_MOOD,
  // a one-shot trick the flying model performs, then clears itself
  action: null,
  // whether the 3D model has finished loading
  loaded: false,
  // true while Mimo is speaking (drives mouth flap + head nod)
  talking: false,

  setMood: (mood) => set({ mood }),
  setCustomMood: (customMood) => set({ customMood, mood: "custom" }),
  triggerAction: (action) => set({ action }),
  clearAction: () => set({ action: null }),
  setLoaded: (loaded) => set({ loaded }),
  setTalking: (talking) => set({ talking }),
}));
