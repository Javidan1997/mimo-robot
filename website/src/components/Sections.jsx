import { useEffect, useMemo, useState } from "react";
import { useMimoStore, getMood } from "../state/useMimoStore.js";
import { MoodPills, ActionButtons, TalkButton } from "./MoodControls.jsx";
import { getContent } from "../data/content.js";
import { getCopy } from "../data/i18n.js";
import { speak } from "../state/speech.js";
import SvgIcon from "./SvgIcon.jsx";

function useLocale() {
  const language = useMimoStore((s) => s.language);
  return {
    language,
    copy: getCopy(language),
    content: getContent(language),
  };
}

function SectionEyebrow({ children }) {
  return (
    <p className="eyebrow">
      <span className="eyebrow__dot" /> {children}
    </p>
  );
}

/* ------------------------------------------------------------------ Hero */
export function Hero() {
  const { copy } = useLocale();
  const hero = copy.hero;
  return (
    <section className="hero panel" id="top">
      <div className="hero__inner">
        <SectionEyebrow>{hero.eyebrow}</SectionEyebrow>
        <h1 className="hero__title">
          {hero.titleStart} <span className="grad">{hero.titleAccent}</span>{hero.titleEnd}
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__cta">
          <a className="btn btn--primary" href="#personality">
            {hero.primary}
          </a>
          <a className="btn btn--ghost" href="#everywhere">
            {hero.secondary}
          </a>
        </div>
        <div className="hero__actions">
          <TalkButton />
          <ActionButtons />
        </div>
        <p className="hero__hint">{hero.hint}</p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Scope */
export function ProjectScope() {
  const { copy, content } = useLocale();
  const text = copy.scope;

  return (
    <section className="scope section" id="scope">
      <div className="scope__intro">
        <div>
          <SectionEyebrow>{text.eyebrow}</SectionEyebrow>
          <h2 className="section__title">{text.title}</h2>
          <p className="section__lead">{text.lead}</p>
        </div>
        <aside className="scope__note glass">
          <h3>{text.noteTitle}</h3>
          <p>{text.note}</p>
        </aside>
      </div>
      <div className="scope__grid">
        {content.scaleItems.map((item) => (
          <article className="scope-step" key={item.title}>
            <span>{item.marker}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ----------------------------------------------------------- Personality */
export function Personality() {
  const { language, copy } = useLocale();
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const m = getMood(mood, customMood, language);
  const text = copy.personality;
  return (
    <section className="personality panel" id="personality">
      <div className="personality__card glass" style={{ "--accent": m.accent }}>
        <SectionEyebrow>{text.eyebrow}</SectionEyebrow>
        <h2 className="section__title">{text.title}</h2>
        <p className="section__lead">{text.lead}</p>
        <MoodPills />
        <div className="mood-readout">
          <div className="mood-readout__face" aria-hidden="true">
            <SvgIcon name={m.icon} />
          </div>
          <div className="mood-readout__meta">
            <span className="mood-readout__name">{m.label}</span>
            <p className="mood-readout__line">“{m.line}”</p>
            <div className="mood-readout__tags">
              <span>{text.led} · {m.led}</span>
              <span>{text.face} · {m.face}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

const MOOD_LAB_BASE = [
  { icon: "focused", accent: "#ff7ad9", aura: "#ffd1ef", glow: 1.15, energy: 0.42, wiggle: 0.18 },
  { icon: "moon", accent: "#818cf8", aura: "#c7d2fe", glow: 0.82, energy: 0.18, wiggle: 0.08 },
  { icon: "bolt", accent: "#facc15", aura: "#fde68a", glow: 1.36, energy: 0.72, wiggle: 0.27 },
  { icon: "leaf", accent: "#34d399", aura: "#bbf7d0", glow: 1.18, energy: 0.34, wiggle: 0.14 },
];

function localizedLabPresets(copy) {
  return MOOD_LAB_BASE.map((base, index) => ({ ...base, ...copy.moodLab.presets[index] }));
}

function toCustomMood(draft, language, fallbackLine) {
  const label = draft.name.trim() || (language === "az" ? "Xüsusi əhval" : "Custom mood");
  const line = draft.line.trim() || fallbackLine;
  const led = draft.led;
  const face = draft.face;
  const localizedCopy = { label, led, face, line };

  return {
    key: "custom",
    label,
    icon: draft.icon || "focused",
    accent: draft.accent,
    accentSoft: draft.aura,
    led,
    face,
    line,
    lightIntensity: Number(draft.glow),
    spin: Number(draft.energy),
    bob: Number(draft.wiggle),
    copy: {
      az: localizedCopy,
      en: localizedCopy,
      [language]: localizedCopy,
    },
  };
}

/* --------------------------------------------------------------- Mood Lab */
export function MoodLab() {
  const { language, copy } = useLocale();
  const lab = copy.moodLab;
  const presets = useMemo(() => localizedLabPresets(copy), [copy]);
  const [draft, setDraft] = useState(presets[0]);
  const customMood = useMimoStore((s) => s.customMood);
  const setCustomMood = useMimoStore((s) => s.setCustomMood);
  const setMood = useMimoStore((s) => s.setMood);

  useEffect(() => {
    setDraft(presets[0]);
  }, [language, presets]);

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const applyMood = (nextDraft = draft, shouldSpeak = false) => {
    const nextMood = toCustomMood(nextDraft, language, lab.lineFallback);
    setCustomMood(nextMood);
    if (shouldSpeak) speak(nextMood.line, language);
  };
  const surprise = () => {
    const preset = presets[Math.floor(Math.random() * presets.length)];
    const nextDraft = {
      ...preset,
      name: `${preset.name} ${Math.floor(10 + Math.random() * 89)}`,
      energy: Math.min(0.78, Math.max(0.08, preset.energy + (Math.random() - 0.5) * 0.22)).toFixed(2),
      wiggle: Math.min(0.3, Math.max(0.04, preset.wiggle + (Math.random() - 0.5) * 0.1)).toFixed(2),
    };
    setDraft(nextDraft);
    applyMood(nextDraft, true);
  };
  const savedMood = getMood("custom", customMood, language);

  return (
    <section className="mood-lab section" id="mood-lab">
      <div className="section__head">
        <SectionEyebrow>{lab.eyebrow}</SectionEyebrow>
        <h2 className="section__title">{lab.title}</h2>
        <p className="section__lead">{lab.lead}</p>
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
              {lab.moodName}
              <input
                value={draft.name}
                onChange={(e) => update("name", e.target.value)}
                maxLength={28}
              />
            </label>
            <label>
              {lab.iconLabel}
              <select value={draft.icon} onChange={(e) => update("icon", e.target.value)}>
                {presets.map((preset) => (
                  <option key={preset.icon} value={preset.icon}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="lab-color-grid">
            <label className="lab-color">
              {lab.coreGlow}
              <input
                type="color"
                value={draft.accent}
                onChange={(e) => update("accent", e.target.value)}
              />
            </label>
            <label className="lab-color">
              {lab.softAura}
              <input
                type="color"
                value={draft.aura}
                onChange={(e) => update("aura", e.target.value)}
              />
            </label>
            {presets.map((preset) => (
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
                <SvgIcon name={preset.icon} className="lab-swatch__icon" />
                {preset.name}
              </button>
            ))}
          </div>

          <div className="lab-field lab-field--split">
            <label>
              {lab.ledVibe}
              <select value={draft.led} onChange={(e) => update("led", e.target.value)}>
                {lab.ledOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              {lab.faceStyle}
              <select value={draft.face} onChange={(e) => update("face", e.target.value)}>
                {lab.faceOptions.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>

          <label className="lab-field">
            {lab.mimoSays}
            <textarea
              value={draft.line}
              onChange={(e) => update("line", e.target.value)}
              maxLength={140}
              rows={3}
            />
          </label>

          <div className="lab-sliders">
            <label>
              {lab.glow}
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
              {lab.energy}
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
              {lab.wiggle}
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
              {lab.tryMood}
            </button>
            <button className="btn btn--ghost" type="button" onClick={surprise}>
              {lab.surprise}
            </button>
          </div>
        </form>

        <div className="lab-preview glass" style={{ "--accent": draft.accent, "--accent-soft": draft.aura }}>
          <div className="lab-preview__orb" aria-hidden="true">
            <SvgIcon name={draft.icon || "focused"} />
          </div>
          <div>
            <SectionEyebrow>{lab.liveCustomMood}</SectionEyebrow>
            <h3>{draft.name || lab.customFallback}</h3>
            <p className="lab-preview__line">“{draft.line || lab.lineFallback}”</p>
          </div>
          <div className="lab-readout">
            <span>{copy.personality.led} · {draft.led}</span>
            <span>{copy.personality.face} · {draft.face}</span>
            <span>{lab.glow} · {Math.round(draft.glow * 100)}%</span>
            <span>{lab.energy} · {Math.round(draft.energy * 100)}%</span>
            <span>{lab.wiggle} · {Math.round(draft.wiggle * 100)}%</span>
          </div>
          <div className="lab-mini-play">
            <button
              type="button"
              className="action-btn action-btn--talk"
              onClick={() => {
                applyMood(draft, true);
              }}
            >
              <SvgIcon name="speak" className="action-btn__icon" /> {lab.speakIt}
            </button>
            <button
              type="button"
              className="action-btn"
              onClick={() => {
                setMood("custom");
                speak(savedMood.line, language);
              }}
            >
              <SvgIcon name="saved" className="action-btn__icon" /> {lab.recallSaved}
            </button>
          </div>
          <div className="lab-play-deck">
            <p>{lab.giveTrick}</p>
            <ActionButtons />
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------- Features */
export function Features() {
  const { copy, content } = useLocale();
  const head = copy.featuresHead;
  return (
    <section className="features section" id="features">
      <div className="section__head">
        <SectionEyebrow>{head.eyebrow}</SectionEyebrow>
        <h2 className="section__title">{head.title}</h2>
        <p className="section__lead">{head.lead}</p>
      </div>
      <div className="grid grid--3">
        {content.features.map((f) => (
          <article className="card glass" key={f.title}>
            <span className="card__icon" aria-hidden="true">
              <SvgIcon name={f.icon} />
            </span>
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </div>
      <div className="stats">
        {content.stats.map((s) => (
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
  const { copy, content } = useLocale();
  const text = copy.everywhere;
  return (
    <section className="everywhere section" id="everywhere">
      <div className="section__head">
        <SectionEyebrow>{text.eyebrow}</SectionEyebrow>
        <h2 className="section__title">
          {text.titleStart} <span className="grad">{text.titleAccent}</span>{text.titleEnd}
        </h2>
        <p className="section__lead">{text.lead}</p>
      </div>
      <div className="grid grid--4">
        {content.channels.map((c) => (
          <article className="card glass card--channel" key={c.title}>
            <span className="card__icon" aria-hidden="true">
              <SvgIcon name={c.icon} />
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

/* ----------------------------------------------------------------- Build */
const PROTOCOL_SAMPLE = `{
  "request_id": "cmd-001",
  "mood": "happy",
  "face": "smile_big",
  "actions": [
    { "type": "servo", "name": "wave_left", "speed": 0.6 },
    { "type": "led",   "name": "blue_pulse", "duration_ms": 1500 },
    { "type": "sound", "track": "01/001.mp3" }
  ]
}`;

export function BuildSection() {
  const { copy, content } = useLocale();
  const text = copy.build;
  return (
    <section className="build section" id="build">
      <div className="section__head">
        <SectionEyebrow>{text.eyebrow}</SectionEyebrow>
        <h2 className="section__title">{text.title}</h2>
        <p className="section__lead">{text.lead}</p>
      </div>

      <h3 className="build__subhead">{text.architectureTitle}</h3>
      <div className="build-grid">
        {content.buildArchitecture.map((item) => (
          <article className="card glass build-cell" key={item.title}>
            <span className="card__icon" aria-hidden="true">{item.marker}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <h3 className="build__subhead">{text.hardwareTitle}</h3>
      <div className="build-grid">
        {content.buildHardware.map((item) => (
          <article className="card glass build-cell" key={item.title}>
            <span className="card__icon" aria-hidden="true">{item.marker}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>

      <div className="build-protocol glass">
        <h3 className="build-protocol__title">{text.protocolTitle}</h3>
        <pre className="build-protocol__code">
          <code>{PROTOCOL_SAMPLE}</code>
        </pre>
        <p className="build-protocol__note">{text.protocolNote}</p>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------- Roadmap */
export function Roadmap() {
  const { copy, content } = useLocale();
  const text = copy.roadmap;
  return (
    <section className="roadmap section" id="roadmap">
      <div className="section__head">
        <SectionEyebrow>{text.eyebrow}</SectionEyebrow>
        <h2 className="section__title">{text.title}</h2>
        <p className="section__lead">{text.lead}</p>
      </div>
      <ol className="timeline">
        {content.roadmap.map((r) => (
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
  const { copy } = useLocale();
  const text = copy.waitlist;
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
        <h2 className="section__title">{text.title}</h2>
        <p className="section__lead">{text.lead}</p>
        {done ? (
          <p className="waitlist__done">{text.done}</p>
        ) : (
          <form className="waitlist__form" onSubmit={submit}>
            <input
              type="email"
              required
              placeholder={text.placeholder}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-label={text.emailLabel}
            />
            <button className="btn btn--primary" type="submit">
              {text.submit}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Footer */
export function Footer() {
  const { copy } = useLocale();
  return (
    <footer className="footer">
      <div className="footer__brand">
        <span className="nav__logo" aria-hidden="true">
          <span className="nav__logo-ring" />
        </span>
        <span className="nav__name">MIMO</span>
      </div>
      <p className="footer__tag">{copy.footer.tag}</p>
      <p className="footer__legal">© {new Date().getFullYear()} Mimo. {copy.footer.legal}</p>
    </footer>
  );
}
