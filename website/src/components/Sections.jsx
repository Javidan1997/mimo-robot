import { useState } from "react";
import { useMimoStore, getMood } from "../state/useMimoStore.js";
import { MoodPills, ActionButtons, TalkButton } from "./MoodControls.jsx";
import { FEATURES, CHANNELS, ROADMAP, STATS } from "../data/content.js";
import { speak } from "../state/speech.js";

/* ------------------------------------------------------------------ Hero */
export function Hero() {
  return (
    <section className="hero panel" id="top">
      <div className="hero__inner">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> Meet Mimo · your tiny AI desk friend
        </p>
        <h1 className="hero__title">
          A tiny friend with a <span className="grad">very big heart</span>.
        </h1>
        <p className="hero__lead">
          Mimo listens, chats back and reacts with its whole tiny self. Change a
          mood, make it wave, hear its little voice and let it brighten your desk
          for a minute.
        </p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#personality">
            Play with Mimo
          </a>
          <a className="btn btn--ghost" href="#everywhere">
            Take Mimo with you
          </a>
        </div>
        <div className="hero__actions">
          <TalkButton />
          <ActionButtons />
        </div>
        <p className="hero__hint">
          Move your cursor — Mimo's eyes follow you 👀 · tap a mood for a tiny hello
        </p>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Personality */
export function Personality() {
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const m = getMood(mood, customMood);
  return (
    <section className="personality panel" id="personality">
      <div className="personality__card glass" style={{ "--accent": m.accent }}>
        <p className="eyebrow">
          <span className="eyebrow__dot" /> Tiny mood magic
        </p>
        <h2 className="section__title">Pick how Mimo feels.</h2>
        <p className="section__lead">
          Every mood changes Mimo's face, glow, wiggle and voice, so it feels
          more like a little companion than a control panel.
        </p>
        <MoodPills />
        <div className="mood-readout">
          <div className="mood-readout__face" aria-hidden="true">
            {m.emoji}
          </div>
          <div className="mood-readout__meta">
            <span className="mood-readout__name">{m.label}</span>
            <p className="mood-readout__line">“{m.line}”</p>
            <div className="mood-readout__tags">
              <span>LED · {m.led}</span>
              <span>Face · {m.face}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MOOD_LAB_PRESETS = [
  {
    name: "Bubblegum Orbit",
    emoji: "💫",
    accent: "#ff7ad9",
    aura: "#ffd1ef",
    led: "Candy comet trail",
    face: "Sparkly custom face",
    line: "I made a brand new little feeling. Want to name it with me?",
    glow: 1.15,
    energy: 0.42,
    wiggle: 0.18,
  },
  {
    name: "Moon Muffin",
    emoji: "🌙",
    accent: "#818cf8",
    aura: "#c7d2fe",
    led: "Soft moon blink",
    face: "Sleepy sparkle eyes",
    line: "Moon Muffin mode is soft, floaty and a tiny bit magical.",
    glow: 0.82,
    energy: 0.18,
    wiggle: 0.08,
  },
  {
    name: "Zoomie Bean",
    emoji: "⚡",
    accent: "#facc15",
    aura: "#fde68a",
    led: "Lemon lightning",
    face: "Big zoomie grin",
    line: "Zoomie Bean is awake! I have exactly too much sparkle.",
    glow: 1.36,
    energy: 0.72,
    wiggle: 0.27,
  },
  {
    name: "Garden Hero",
    emoji: "🌱",
    accent: "#34d399",
    aura: "#bbf7d0",
    led: "Leafy hero pulse",
    face: "Brave little smile",
    line: "Garden Hero is ready. Tiny courage, big kindness.",
    glow: 1.18,
    energy: 0.34,
    wiggle: 0.14,
  },
];

const LED_OPTIONS = [
  "Candy comet trail",
  "Soft moon blink",
  "Lemon lightning",
  "Leafy hero pulse",
  "Ocean bubble shimmer",
  "Tiny disco twinkle",
];

const FACE_OPTIONS = [
  "Sparkly custom face",
  "Sleepy sparkle eyes",
  "Big zoomie grin",
  "Brave little smile",
  "Blushy heart eyes",
  "Curious wonky grin",
];

function toCustomMood(draft) {
  return {
    key: "custom",
    label: draft.name.trim() || "Custom mood",
    emoji: draft.emoji.trim() || "💫",
    accent: draft.accent,
    accentSoft: draft.aura,
    led: draft.led,
    face: draft.face,
    line: draft.line.trim() || "This is my brand new tiny mood.",
    lightIntensity: Number(draft.glow),
    spin: Number(draft.energy),
    bob: Number(draft.wiggle),
  };
}

/* --------------------------------------------------------------- Mood Lab */
export function MoodLab() {
  const [draft, setDraft] = useState(MOOD_LAB_PRESETS[0]);
  const customMood = useMimoStore((s) => s.customMood);
  const setCustomMood = useMimoStore((s) => s.setCustomMood);
  const setMood = useMimoStore((s) => s.setMood);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const applyMood = (nextDraft = draft, shouldSpeak = false) => {
    const nextMood = toCustomMood(nextDraft);
    setCustomMood(nextMood);
    if (shouldSpeak) speak(nextMood.line);
  };
  const surprise = () => {
    const preset = MOOD_LAB_PRESETS[Math.floor(Math.random() * MOOD_LAB_PRESETS.length)];
    const nextDraft = {
      ...preset,
      name: `${preset.name} ${Math.floor(10 + Math.random() * 89)}`,
      energy: Math.min(0.78, Math.max(0.08, preset.energy + (Math.random() - 0.5) * 0.22)).toFixed(2),
      wiggle: Math.min(0.3, Math.max(0.04, preset.wiggle + (Math.random() - 0.5) * 0.1)).toFixed(2),
    };
    setDraft(nextDraft);
    applyMood(nextDraft, true);
  };

  return (
    <section className="mood-lab section" id="mood-lab">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> Mimo Mood Lab
        </p>
        <h2 className="section__title">
          Build a tiny feeling from scratch.
        </h2>
        <p className="section__lead">
          Mix color, wiggle, glow, face style and a spoken line, then try your
          custom mood on Mimo. It is a little personality playground.
        </p>
      </div>

      <div className="lab-shell">
        <form
          className="lab-panel glass"
          onSubmit={(e) => {
            e.preventDefault();
            applyMood(draft, true);
          }}
        >
          <div className="lab-field lab-field--split">
            <label>
              Mood name
              <input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={28}
              />
            </label>
            <label>
              Emoji
              <input
                className="lab-emoji-input"
                value={draft.emoji}
                onChange={(e) => update("emoji", e.target.value)}
                maxLength={4}
              />
            </label>
          </div>

          <div className="lab-color-grid">
            <label className="lab-color">
              Core glow
              <input
                type="color"
                value={draft.accent}
                onChange={(e) => update("accent", e.target.value)}
              />
            </label>
            <label className="lab-color">
              Soft aura
              <input
                type="color"
                value={draft.aura}
                onChange={(e) => update("aura", e.target.value)}
              />
            </label>
            {MOOD_LAB_PRESETS.map((preset) => (
              <button
                className="lab-swatch"
                key={preset.name}
                type="button"
                style={{ "--swatch": preset.accent, "--swatch-soft": preset.aura }}
                onClick={() => {
                  setDraft(preset);
                  applyMood(preset, true);
                }}
              >
                <span>{preset.emoji}</span>
                {preset.name}
              </button>
            ))}
          </div>

          <div className="lab-field lab-field--split">
            <label>
              LED vibe
              <select value={draft.led} onChange={(e) => update("led", e.target.value)}>
                {LED_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              Face style
              <select value={draft.face} onChange={(e) => update("face", e.target.value)}>
                {FACE_OPTIONS.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="lab-field">
            Mimo says
            <textarea
              value={draft.line}
              onChange={(e) => update("line", e.target.value)}
              maxLength={120}
              rows={3}
            />
          </label>

          <div className="lab-sliders">
            <label>
              Glow
              <input
                type="range"
                min="0.45"
                max="1.5"
                step="0.01"
                value={draft.glow}
                onChange={(e) => update("glow", e.target.value)}
              />
              <span>{Math.round(draft.glow * 100)}%</span>
            </label>
            <label>
              Energy
              <input
                type="range"
                min="0.02"
                max="0.8"
                step="0.01"
                value={draft.energy}
                onChange={(e) => update("energy", e.target.value)}
              />
              <span>{Math.round(draft.energy * 100)}%</span>
            </label>
            <label>
              Wiggle
              <input
                type="range"
                min="0.02"
                max="0.3"
                step="0.01"
                value={draft.wiggle}
                onChange={(e) => update("wiggle", e.target.value)}
              />
              <span>{Math.round(draft.wiggle * 100)}%</span>
            </label>
          </div>

          <div className="lab-actions">
            <button className="btn btn--primary" type="submit">
              Try this mood
            </button>
            <button className="btn btn--ghost" type="button" onClick={surprise}>
              Surprise me
            </button>
          </div>
        </form>

        <div className="lab-preview glass" style={{ "--accent": draft.accent, "--accent-soft": draft.aura }}>
          <div className="lab-preview__orb" aria-hidden="true">
            <span>{draft.emoji || "💫"}</span>
          </div>
          <div>
            <p className="eyebrow">
              <span className="eyebrow__dot" /> Live custom mood
            </p>
            <h3>{draft.name || "Custom mood"}</h3>
            <p className="lab-preview__line">“{draft.line || "This is my brand new tiny mood."}”</p>
          </div>
          <div className="lab-readout">
            <span>LED · {draft.led}</span>
            <span>Face · {draft.face}</span>
            <span>Glow · {Math.round(draft.glow * 100)}%</span>
            <span>Energy · {Math.round(draft.energy * 100)}%</span>
            <span>Wiggle · {Math.round(draft.wiggle * 100)}%</span>
          </div>
          <div className="lab-mini-play">
            <button
              type="button"
              className="action-btn action-btn--talk"
              onClick={() => {
                applyMood(draft, true);
              }}
            >
              <span aria-hidden="true">🗣️</span> Speak it
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                setMood("custom");
                speak(customMood.line);
              }}
            >
              <span aria-hidden="true">💫</span> Recall saved
            </button>
          </div>
          <div className="lab-play-deck">
            <p>Give the mood a trick</p>
            <ActionButtons />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Features */
export function Features() {
  return (
    <section className="features section" id="features">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> What Mimo can help with
        </p>
        <h2 className="section__title">Cute, useful and always expressive.</h2>
        <p className="section__lead">
          Mimo keeps the serious bits tucked away, then shows up as something
          simple: a cheerful voice, a bright face and help that feels gentle.
        </p>
      </div>
      <div className="grid grid--3">
        {FEATURES.map((f) => (
          <article className="card glass" key={f.title}>
            <span className="card__icon" aria-hidden="true">
              {f.icon}
            </span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
      <div className="stats">
        {STATS.map((s) => (
          <div className="stat" key={s.label}>
            <span className="stat__value grad">{s.value}</span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------ Everywhere */
export function Everywhere() {
  return (
    <section className="everywhere section" id="everywhere">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> Bring Mimo everywhere
        </p>
        <h2 className="section__title">
          One personality, <span className="grad">every screen</span>.
        </h2>
        <p className="section__lead">
          Mimo does not have to stay on your desk. Add it to reels, chats and
          camera moments, then let the same little personality follow along.
        </p>
      </div>
      <div className="grid grid--4">
        {CHANNELS.map((c) => (
          <article className="card glass card--channel" key={c.title}>
            <span className="card__icon" aria-hidden="true">
              {c.icon}
            </span>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
            <span className="badge">{c.badge}</span>
          </article>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Roadmap */
export function Roadmap() {
  return (
    <section className="roadmap section" id="roadmap">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> Where Mimo is headed
        </p>
        <h2 className="section__title">From browser buddy to desk companion.</h2>
        <p className="section__lead">
          Mimo starts here as a tiny virtual friend, then grows into apps, AR and
          a real companion you can keep nearby.
        </p>
      </div>
      <ol className="timeline">
        {ROADMAP.map((r) => (
          <li className={`timeline__item is-${r.state}`} key={r.title}>
            <span className="timeline__dot" />
            <span className="timeline__phase">{r.phase}</span>
            <h3>{r.title}</h3>
            <p>{r.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/* -------------------------------------------------------------- Waitlist */
export function Waitlist() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const submit = (e) => {
    e.preventDefault();
    if (!email) return;
    // Front-end only for now — wire to a real backend/CRM later.
    setDone(true);
  };
  return (
    <section className="waitlist section" id="waitlist">
      <div className="waitlist__card glass">
        <h2 className="section__title">Save a little spot for Mimo.</h2>
        <p className="section__lead">
          Join the waitlist for early access to the apps, AR filters and the
          physical companion. No spam — just small, happy updates.
        </p>
        {done ? (
          <p className="waitlist__done">
            🎉 You're on the list! Mimo saved you a tiny wave.
          </p>
        ) : (
          <form className="waitlist__form" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder="you@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label="Email address"
            />
            <button className="btn btn--primary" type="submit">
              Join the waitlist
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Footer */
export function Footer() {
  return (
    <footer className="footer">
      <div className="footer__brand">
        <span className="nav__logo" aria-hidden="true">
          <span className="nav__logo-ring" />
        </span>
        <span className="nav__name">MIMO</span>
      </div>
      <p className="footer__tag">Your tiny AI desk friend — with a very big heart.</p>
      <p className="footer__legal">© {new Date().getFullYear()} Mimo. Built with curiosity.</p>
    </footer>
  );
}
