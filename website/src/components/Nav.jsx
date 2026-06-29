import { useState } from "react";
import { LANGUAGES, useMimoStore } from "../state/useMimoStore.js";
import { getCopy } from "../data/i18n.js";

export default function Nav() {
  const language = useMimoStore((s) => s.language);
  const setLanguage = useMimoStore((s) => s.setLanguage);
  const copy = getCopy(language).nav;
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <a className="skip-link" href="#scope">
        {language === "az" ? "Əsas məzmuna keç" : "Skip to main content"}
      </a>
      <header className="nav">
        <a className="nav__brand" href="#top" onClick={closeMenu}>
          <span className="nav__logo" aria-hidden="true">
            <span className="nav__logo-ring" />
          </span>
          <span className="nav__name">MIMO</span>
        </a>
        <nav
          className="nav__links"
          aria-label={language === "az" ? "Əsas naviqasiya" : "Primary navigation"}
        >
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
          <div
            className="language-toggle"
            role="group"
            aria-label={language === "az" ? "Dil seçimi" : "Language selector"}
          >
            {Object.entries(LANGUAGES).map(([key, item]) => (
              <button
                key={key}
                type="button"
                className={key === language ? "is-active" : ""}
                onClick={() => setLanguage(key)}
                aria-pressed={key === language}
                aria-label={key === "az" ? "Azərbaycanca" : "English"}
              >
                {item.label}
              </button>
            ))}
          </div>
          <a className="btn btn--ghost nav__cta" href="#waitlist" onClick={closeMenu}>
            {copy.waitlist}
          </a>
          <button
            className="nav__hamburger"
            type="button"
            aria-label={language === "az" ? "Menyu" : "Menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-mobile-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>
      {menuOpen && (
        <nav
          id="nav-mobile-menu"
          className="nav__mobile-menu"
          aria-label={language === "az" ? "Mobil naviqasiya" : "Mobile navigation"}
        >
          <a href="#scope" onClick={closeMenu}>{copy.scope}</a>
          <a href="#personality" onClick={closeMenu}>{copy.personality}</a>
          <a href="#mood-lab" onClick={closeMenu}>{copy.moodLab}</a>
          <a href="#features" onClick={closeMenu}>{copy.features}</a>
          <a href="#everywhere" onClick={closeMenu}>{copy.everywhere}</a>
          <a href="#camera" onClick={closeMenu}>{copy.camera}</a>
          <a href="#build" onClick={closeMenu}>{copy.build}</a>
          <a href="#roadmap" onClick={closeMenu}>{copy.roadmap}</a>
          <a href="#contact" onClick={closeMenu}>{copy.contact}</a>
        </nav>
      )}
    </>
  );
}
