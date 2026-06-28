import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Trail, Billboard, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import { useMimoStore, MOODS } from "../state/useMimoStore.js";
import MimoModel from "./MimoModel.jsx";

/* soft radial sprite used for Mimo's glowing aura */
function radialTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.4, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function MoodLights() {
  const mood = useMimoStore((s) => s.mood);
  const m = MOODS[mood] ?? MOODS.happy;
  return (
    <>
      <ambientLight intensity={0.6 * m.lightIntensity} />
      <directionalLight position={[4, 6, 5]} intensity={1.5 * m.lightIntensity} />
      <pointLight position={[-4, 2, -3]} intensity={9 * m.lightIntensity} color={m.accent} distance={20} />
      <pointLight position={[4, -1, 4]} intensity={5 * m.lightIntensity} color={m.accentSoft} distance={18} />
    </>
  );
}

function FlyingMimo() {
  const pilot = useRef();
  const mood = useMimoStore((s) => s.mood);
  const m = MOODS[mood] ?? MOODS.happy;
  const tex = useRef();
  if (!tex.current) tex.current = radialTexture();

  return (
    <>
      {/* glowing trail that streaks behind Mimo when it moves fast */}
      <Trail
        target={pilot}
        width={3.2}
        length={5}
        decay={1.4}
        color={new THREE.Color(m.accent)}
        attenuation={(t) => t * t}
      />
      {/* aura is a child of the pilot, so it flies along with Mimo */}
      <MimoModel ref={pilot}>
        <Billboard position={[0, 0, -0.6]}>
          <mesh scale={3.6}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial
              map={tex.current}
              color={m.accent}
              transparent
              opacity={0.2}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
        </Billboard>
      </MimoModel>
    </>
  );
}

export default function MimoStage() {
  return (
    <Canvas
      className="mimo-canvas"
      dpr={[1, 1.8]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0.3, 9], fov: 42 }}
    >
      <AdaptiveDpr pixelated />
      <MoodLights />
      <Suspense fallback={null}>
        <FlyingMimo />
        <Environment preset="city" />
      </Suspense>
    </Canvas>
  );
}
