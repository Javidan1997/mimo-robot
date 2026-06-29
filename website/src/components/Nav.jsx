import { LANGUAGES, useMimoStore } from "../state/useMimoStore.js";
import { getCopy } from "../data/i18n.js";

export default function Nav() {
  const language = useMimoStore((s) => s.language);
  const setLanguage = useMimoStore((s) => s.setLanguage);
  const copy = getCopy(language).nav;

  return (
    <header className="nav">
      <a className="nav__brand" href="#top">
        <span className="nav__logo" aria-hidden="true">
          <span className="nav__logo-ring" />
        </span>
        <span className="nav__name">MIMO</span>
      </a>
      <nav className="nav__links" aria-label={language === "az" ? "Əsas naviqasiya" : "Primary"}>
        <a href="#scope">{copy.scope}</a>
        <a href="#personality">{copy.personality}</a>
        <a href="#mood-lab">{copy.moodLab}</a>
        <a href="#features">{copy.features}</a>
        <a href="#everywhere">{copy.everywhere}</a>
        <a href="#camera">{copy.camera}</a>
        <a href="#build">{copy.build}</a>
        <a href="#roadmap">{copy.roadmap}</a>
        <a href="#contact">{copy.contact}</a>
      </nav>
      <div className="nav__actions">
        <div className="language-toggle" aria-label={language === "az" ? "Dil seçimi" : "Language selector"}>
          {Object.entries(LANGUAGES).map(([key, item]) => (
            <button
              key={key}
              type="button"
              className={key === language ? "is-active" : ""}
              onClick={() => setLanguage(key)}
              aria-pressed={key === language}
            >
              {item.label}
            </button>
          ))}
        </div>
        <a className="btn btn--ghost nav__cta" href="#waitlist">
          {copy.waitlist}
        </a>
      </div>
    </header>
  );
}
