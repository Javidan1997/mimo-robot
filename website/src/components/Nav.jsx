export default function Nav() {
  return (
    <header className="nav">
      <a className="nav__brand" href="#top">
        <span className="nav__logo" aria-hidden="true">
          <span className="nav__logo-ring" />
        </span>
        <span className="nav__name">MIMO</span>
      </a>
      <nav className="nav__links" aria-label="Primary">
        <a href="#personality">Personality</a>
        <a href="#mood-lab">Mood Lab</a>
        <a href="#features">Features</a>
        <a href="#everywhere">Everywhere</a>
        <a href="#roadmap">Roadmap</a>
      </nav>
      <a className="btn btn--ghost nav__cta" href="#waitlist">
        Join the waitlist
      </a>
    </header>
  );
}
