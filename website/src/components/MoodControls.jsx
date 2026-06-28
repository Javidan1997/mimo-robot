import { useMimoStore, MOOD_ORDER, ACTIONS, getMood } from "../state/useMimoStore.js";
import { speak } from "../state/speech.js";

export function MoodPills({ compact = false }) {
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const setMood = useMimoStore((s) => s.setMood);
  return (
    <div className={`mood-pills${compact ? " mood-pills--compact" : ""}`}>
      {MOOD_ORDER.map((key) => {
        const m = getMood(key, customMood);
        const active = key === mood;
        return (
          <button
            key={key}
            type="button"
            className={`mood-pill${active ? " is-active" : ""}`}
            style={active ? { "--pill": m.accent } : undefined}
            onClick={() => {
              setMood(key);
              speak(m.line);
            }}
            aria-pressed={active}
          >
            <span className="mood-pill__emoji" aria-hidden="true">
              {m.emoji}
            </span>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

export function TalkButton() {
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const talking = useMimoStore((s) => s.talking);
  const m = getMood(mood, customMood);
  return (
    <button
      type="button"
      className="action-btn action-btn--talk"
      onClick={() => speak(m.line)}
    >
      <span aria-hidden="true">🗣️</span> {talking ? "Mimo's chatting…" : "Say hi"}
    </button>
  );
}

export function ActionButtons() {
  const triggerAction = useMimoStore((s) => s.triggerAction);
  const action = useMimoStore((s) => s.action);
  return (
    <div className="action-buttons">
      {ACTIONS.map((a) => (
        <button
          key={a.key}
          type="button"
          className="action-btn"
          disabled={!!action}
          onClick={() => triggerAction(a.key)}
        >
          <span aria-hidden="true">{a.emoji}</span> {a.label}
        </button>
      ))}
    </div>
  );
}
