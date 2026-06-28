import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getMood, useMimoStore } from "../state/useMimoStore.js";
import { createMimoFace } from "../three/face.js";

const MODEL_URL = "./models/mimo.glb?v=face1";
const WIDGET_SIZE = { expanded: { w: 154, h: 198 }, minimized: { w: 92, h: 112 } };

function usePreparedMimoScene() {
  const { scene } = useGLTF(MODEL_URL);

  return useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.35 / maxDim;

    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -center.y * scale - 0.05, -center.z * scale);
    root.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        material.envMapIntensity = 1.2;
        if ("roughness" in material) material.roughness = Math.min(material.roughness ?? 0.6, 0.74);
      });
    });

    return root;
  }, [scene]);
}

function StickyMimoModel({ minimized }) {
  const prepared = usePreparedMimoScene();
  const group = useRef();
  const face = useMemo(() => createMimoFace(), []);
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const m = getMood(mood, customMood);

  useEffect(() => {
    const node = prepared.getObjectByName("MimoFace");
    if (!node) return;

    node.material = new THREE.MeshBasicMaterial({
      map: face.texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide,
      toneMapped: false,
    });
    node.renderOrder = 5;
  }, [prepared, face]);

  useFrame((state) => {
    if (!group.current) return;
    const t = state.clock.elapsedTime;
    const pulse = minimized ? 0.06 : 0.1;

    group.current.rotation.y = Math.sin(t * 0.7) * 0.22;
    group.current.rotation.x = Math.sin(t * 0.9) * 0.07;
    group.current.position.y = Math.sin(t * 1.6) * pulse;
    group.current.scale.setScalar(minimized ? 0.82 : 1);

    face.render({
      mood,
      accent: m.accent,
      blink: 1,
      mouthOpen: 0,
      look: { x: Math.sin(t * 0.6) * 0.35, y: Math.cos(t * 0.4) * 0.18 },
    });
  });

  return (
    <group ref={group}>
      <primitive object={prepared} />
    </group>
  );
}

function clampPosition(next, minimized) {
  const size = minimized ? WIDGET_SIZE.minimized : WIDGET_SIZE.expanded;
  const maxX = Math.max(12, window.innerWidth - size.w - 12);
  const maxY = Math.max(72, window.innerHeight - size.h - 12);
  return {
    x: Math.min(maxX, Math.max(12, next.x)),
    y: Math.min(maxY, Math.max(72, next.y)),
  };
}

export function StickyCompanionWidget({ copy }) {
  const [active, setActive] = useState(true);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 24, y: 120 });
  const drag = useRef(null);

  useEffect(() => {
    const initial = {
      x: Math.max(14, window.innerWidth - WIDGET_SIZE.expanded.w - 18),
      y: Math.max(86, window.innerHeight - WIDGET_SIZE.expanded.h - 18),
    };
    const saved = JSON.parse(localStorage.getItem("mimo-sticky-position") || "null");
    setPosition(clampPosition(saved || initial, minimized));

    const open = () => {
      setActive(true);
      setMinimized(false);
    };
    window.addEventListener("mimo:open-sticky", open);
    return () => window.removeEventListener("mimo:open-sticky", open);
  }, []);

  useEffect(() => {
    if (!active) return;
    localStorage.setItem("mimo-sticky-position", JSON.stringify(position));
  }, [active, position]);

  useEffect(() => {
    const onResize = () => setPosition((current) => clampPosition(current, minimized));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [minimized]);

  useEffect(() => {
    const onMove = (event) => {
      if (!drag.current) return;
      setPosition(clampPosition({
        x: event.clientX - drag.current.dx,
        y: event.clientY - drag.current.dy,
      }, minimized));
    };
    const onUp = () => {
      drag.current = null;
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [minimized]);

  const startDrag = (event) => {
    if (event.button !== 0) return;
    drag.current = {
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
    };
  };

  const runCamera = () => {
    window.location.hash = "camera";
    window.dispatchEvent(new CustomEvent("mimo:start-camera"));
  };

  const runSearch = () => {
    window.open("https://www.google.com/search?q=Mimo%20robot", "_blank", "noopener,noreferrer");
  };

  const runShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Mimo", text: "Sticky Mimo companion", url: window.location.href }).catch(() => {});
    } else {
      await navigator.clipboard?.writeText(window.location.href).catch(() => {});
    }
  };

  if (!active) return null;

  return (
    <aside
      className={`sticky-mimo glass${minimized ? " is-minimized" : ""}`}
      style={{ transform: `translate3d(${position.x}px, ${position.y}px, 0)` }}
      aria-label="Sticky Mimo"
    >
      <div className="sticky-mimo__drag" onPointerDown={startDrag}>
        <span className="sticky-mimo__status" />
        <strong>MIMO</strong>
      </div>

      <div className="sticky-mimo__canvas">
        <Canvas dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }} camera={{ position: [0, 0, 5], fov: 40 }}>
          <ambientLight intensity={0.72} />
          <directionalLight position={[3, 4, 4]} intensity={1.35} />
          <Suspense fallback={null}>
            <StickyMimoModel minimized={minimized} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>
      </div>

      {!minimized && (
        <div className="sticky-mimo__actions">
          <button type="button" onClick={runCamera} aria-label={copy.camera}>CAM</button>
          <button type="button" onClick={runSearch} aria-label={copy.search}>WEB</button>
          <button type="button" onClick={runShare} aria-label={copy.share}>SHR</button>
        </div>
      )}

      <div className="sticky-mimo__chrome">
        <button type="button" onClick={() => setMinimized((value) => !value)}>
          {minimized ? "+" : "-"}
        </button>
        <button type="button" onClick={() => setActive(false)}>x</button>
      </div>
    </aside>
  );
}

export function StickyCompanionSection({ copy }) {
  return (
    <section className="sticky-companion section" id="companion">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> {copy.eyebrow}
        </p>
        <h2 className="section__title">{copy.title}</h2>
        <p className="section__lead">{copy.lead}</p>
      </div>

      <div className="companion-shell">
        <button className="companion-launch glass" type="button" onClick={() => window.dispatchEvent(new CustomEvent("mimo:open-sticky"))}>
          <span>3D</span>
          <strong>{copy.activate}</strong>
        </button>

        <div className="companion-platforms">
          <article className="glass">
            <h3>{copy.desktopTitle}</h3>
            <p>{copy.desktopBody}</p>
          </article>
          <article className="glass">
            <h3>{copy.iphoneTitle}</h3>
            <p>{copy.iphoneBody}</p>
          </article>
          <article className="glass">
            <h3>{copy.androidTitle}</h3>
            <p>{copy.androidBody}</p>
          </article>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload(MODEL_URL);
