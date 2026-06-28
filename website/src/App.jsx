import { Suspense, lazy, useEffect } from "react";
import Nav from "./components/Nav.jsx";
import {
  Hero,
  Personality,
  MoodLab,
  Features,
  Everywhere,
  Roadmap,
  Waitlist,
  Footer,
} from "./components/Sections.jsx";
import { useMimoStore } from "./state/useMimoStore.js";
import { getCopy } from "./data/i18n.js";

// Keep the heavy 3D bundle out of the critical path.
const MimoStage = lazy(() => import("./three/MimoStage.jsx"));

export default function App() {
  const language = useMimoStore((s) => s.language);

  useEffect(() => {
    const meta = getCopy(language).meta;
    document.documentElement.lang = language === "az" ? "az" : "en";
    document.title = meta.title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", meta.description);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute("content", meta.socialDescription);
    document.querySelector('meta[property="og:title"]')?.setAttribute("content", meta.title);
    document.querySelector('meta[property="og:description"]')?.setAttribute("content", meta.socialDescription);
    document.querySelector('meta[property="og:locale"]')?.setAttribute("content", meta.locale);
  }, [language]);

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow--a" aria-hidden="true" />
      <div className="bg-glow bg-glow--b" aria-hidden="true" />

      <Nav />

      {/* Mimo flies across the whole site on a fixed, click-through layer. */}
      <div className="flight-layer" aria-hidden="true">
        <Suspense fallback={null}>
          <MimoStage />
        </Suspense>
      </div>

      <main className="content">
        <Hero />
        <Personality />
        <MoodLab />
        <Features />
        <Everywhere />
        <Roadmap />
        <Waitlist />
      </main>

      <Footer />
    </div>
  );
}
