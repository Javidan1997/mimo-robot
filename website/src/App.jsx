import { Suspense, lazy, useEffect, useState } from "react";
import Nav from "./components/Nav.jsx";
import CameraStudio from "./components/CameraStudio.jsx";
import {
  Hero,
  ProjectScope,
  Personality,
  MoodLab,
  Features,
  Everywhere,
  BuildSection,
  Roadmap,
  Contact,
  Waitlist,
  Footer,
} from "./components/Sections.jsx";
import { getMoodClickAction, useMimoStore } from "./state/useMimoStore.js";
import { getCopy } from "./data/i18n.js";
import { trackPageView } from "./lib/tracking.js";

// Keep the heavy 3D bundle out of the critical path.
const MimoStage = lazy(() => import("./three/MimoStage.jsx"));
// Admin panel is its own route (#admin) — kept out of the main bundle.
const AdminPanel = lazy(() => import("./components/AdminPanel.jsx"));

function useIsAdminRoute() {
  const [isAdmin, setIsAdmin] = useState(
    typeof window !== "undefined" && window.location.hash.replace(/^#\/?/, "") === "admin",
  );
  useEffect(() => {
    const onHash = () => setIsAdmin(window.location.hash.replace(/^#\/?/, "") === "admin");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return isAdmin;
}

function isInteractiveElement(target) {
  return Boolean(
    target?.closest?.(
      "a, button, input, textarea, select, label, summary, [role='button'], [role='link'], [contenteditable='true']",
    ),
  );
}

function MimoClickController() {
  useEffect(() => {
    const onPointerDown = (event) => {
      if (event.button !== 0 || event.defaultPrevented) return;

      const state = useMimoStore.getState();
      const screen = state.mimoScreen;
      const dx = screen ? event.clientX - screen.x : Infinity;
      const dy = screen ? event.clientY - screen.y : Infinity;
      const hitRadius = screen?.radius ?? 0;
      const hitMimo = screen?.visible && Math.hypot(dx, dy) <= hitRadius;

      if (hitMimo) {
        const action = getMoodClickAction(state.mood);
        state.triggerAction(action);
        return;
      }

      if (isInteractiveElement(event.target)) return;

      state.setClickTarget({
        id: Date.now(),
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, []);

  return null;
}

export default function App() {
  const language = useMimoStore((s) => s.language);
  const isAdmin = useIsAdminRoute();

  useEffect(() => {
    if (!isAdmin) trackPageView();
  }, [isAdmin]);

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

  if (isAdmin) {
    return (
      <Suspense fallback={<p className="admin-loading">Loading…</p>}>
        <AdminPanel />
      </Suspense>
    );
  }

  return (
    <div className="app">
      <div className="bg-grid" aria-hidden="true" />
      <div className="bg-glow bg-glow--a" aria-hidden="true" />
      <div className="bg-glow bg-glow--b" aria-hidden="true" />

      <Nav />
      <MimoClickController />

      {/* Mimo flies across the whole site on a fixed, click-through layer. */}
      <div className="flight-layer" aria-hidden="true">
        <Suspense fallback={null}>
          <MimoStage />
        </Suspense>
      </div>

      <main className="content">
        <Hero />
        <ProjectScope />
        <Personality />
        <MoodLab />
        <Features />
        <Everywhere />
        <CameraStudio copy={getCopy(language).camera} />
        <BuildSection />
        <Roadmap />
        <Contact />
        <Waitlist />
      </main>

      <Footer />
    </div>
  );
}
