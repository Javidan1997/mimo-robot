import { Suspense, lazy } from "react";
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

// Keep the heavy 3D bundle out of the critical path.
const MimoStage = lazy(() => import("./three/MimoStage.jsx"));

export default function App() {
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
