import { useMimoStore, MOOD_ORDER, ACTIONS, getAction, getMood } from "../state/useMimoStore.js";
import { speak } from "../state/speech.js";

export function MoodPills({ compact = false }) {
  const language = useMimoStore((s) => s.language);
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const setMood = useMimoStore((s) => s.setMood);
  return (
    <div className={`mood-pills${compact ? " mood-pills--compact" : ""}`}>
      {MOOD_ORDER.map((key) => {
        const m = getMood(key, customMood, language);
        const active = key === mood;
        return (
          <button key={key} type="button" className={`mood-pill${active ? " is-active" : ""}`} style={active ? { "--pill": m.accent } : undefined} onClick={() => { setMood(key); speak(m.line, language); }} aria-pressed={active}>
            <span className="mood-pill__emoji" aria-hidden="true">{m.emoji}</span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function TalkButton() {
  const language = useMimoStore((s) => s.language);
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const talking = useMimoStore((s) => s.talking);
  const m = getMood(mood, customMood, language);
  const idleLabel = language === "az" ? "Salam de" : "Say hi";
  const talkingLabel = language === "az" ? "Mimo danışır..." : "Mimo's chatting...";
  return <button type="button" className="action-btn action-btn--talk" onClick={() => speak(m.line, language)}><span aria-hidden="true">🗣️</span> {talking ? talkingLabel : idleLabel}</button>;
}

export function ActionButtons() {
  const language = useMimoStore((s) => s.language);
  const triggerAction = useMimoStore((s) => s.triggerAction);
  const action = useMimoStore((s) => s.action);
  return (
    <div className="action-buttons">
      {ACTIONS.map((baseAction) => {
        const a = getAction(baseAction, language);
        return <button key={a.key} type="button" className="action-btn" disabled={!!action} onClick={() => triggerAction(a.key)}><span aria-hidden="true">{a.emoji}</span> {a.label}</button>;
      })}
    </div>
  );
}
