import { forwardRef, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { useMimoStore, ACTIONS, getMood } from "../state/useMimoStore.js";
import { createMimoFace } from "./face.js";

// ?v bumped whenever the GLB changes, to defeat browser caching of the model
const MODEL_URL = "./models/mimo.glb?v=face2";

/* Per-section screen anchors Mimo flies between (world units, camera fixed).
   Order MUST match the DOM section order in App.jsx. */
const ANCHORS = [
  { pos: [2.7, 0.1, 0], scale: 1.0 }, // hero        — text left, Mimo right
  { pos: [-2.8, 1.5, -0.2], scale: 0.78 }, // scope       — introduce the platform story
  { pos: [-2.9, 0.0, 0.4], scale: 1.0 }, // personality — card right, Mimo left
  { pos: [3.25, 1.75, -0.5], scale: 0.62 }, // mood lab   — sparkle above the mixer
  { pos: [3.2, 1.9, -0.6], scale: 0.66 }, // features  — fly top-right
  { pos: [-3.3, 1.9, -0.6], scale: 0.66 }, // everywhere — fly top-left
  { pos: [3.3, 1.7, -0.6], scale: 0.66 }, // roadmap   — fly top-right
  { pos: [0.0, 1.7, 0.5], scale: 0.85 }, // waitlist  — hero finale, center
];

const ACTION_DUR = Object.fromEntries(ACTIONS.map((a) => [a.key, a.duration]));

function scrollProgress() {
  const doc = document.documentElement;
  const max = Math.max(1, doc.scrollHeight - window.innerHeight);
  return Math.min(1, Math.max(0, window.scrollY / max));
}

function screenToWorld(clientX, clientY, camera, targetZ = 0) {
  const ndc = new THREE.Vector3(
    (clientX / window.innerWidth) * 2 - 1,
    -(clientY / window.innerHeight) * 2 + 1,
    0.5,
  );
  ndc.unproject(camera);
  const dir = ndc.sub(camera.position).normalize();
  const distance = (targetZ - camera.position.z) / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(distance));
}

/* The textured Mimo scan, centred + tidied once. */
function useMimoScene() {
  const { scene } = useGLTF(MODEL_URL);
  return useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = 2.7 / maxDim;
    root.scale.setScalar(s);
    root.position.set(-center.x * s, -center.y * s, -center.z * s);
    root.traverse((c) => {
      if (c.isMesh) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach((m) => {
          if (!m) return;
          m.envMapIntensity = 1.15;
          if ("roughness" in m) m.roughness = Math.min(m.roughness ?? 0.6, 0.78);
          if ("metalness" in m) m.metalness = Math.max(m.metalness ?? 0, 0.12);
        });
      }
    });
    return root;
  }, [scene]);
}

/**
 * Mimo the flying pilot. Forwards a ref to its outer group so a <Trail> can
 * follow it. Handles: scroll-driven flight between section anchors, idle
 * figure-8 drift, banking into turns, cursor look, and one-shot tricks.
 */
const MimoModel = forwardRef(function MimoModel({ children }, ref) {
  const prepared = useMimoScene();
  const innerRef = useRef(); // tricks (roll/pitch/bob) live here
  const setLoaded = useMimoStore((s) => s.setLoaded);
  const action = useMimoStore((s) => s.action);
  const clearAction = useMimoStore((s) => s.clearAction);
  const { viewport, camera, size } = useThree();

  // the live animated face drawn onto the MimoFace plane
  const face = useMemo(() => createMimoFace(), []);

  // mutable runtime state (kept out of React render)
  const rt = useRef({
    pos: new THREE.Vector3(2.7, 0.1, 0),
    prev: new THREE.Vector3(2.7, 0.1, 0),
    pointer: new THREE.Vector2(0, 0),
    clickTarget: null,
    clickTargetId: null,
    clickStarted: 0,
    clickUntil: 0,
    screenPos: new THREE.Vector3(),
    trick: null,
    trickT: 0,
    trickDur: 0,
    nextBlink: 1.5,
    blinkUntil: 0,
  }).current;

  useEffect(() => setLoaded(true), [setLoaded]);

  // attach the animated face material onto the named MimoFace plane
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

  // capture pointer globally (canvas has pointer-events: none)
  useEffect(() => {
    const onMove = (e) => {
      rt.pointer.set(
        (e.clientX / window.innerWidth - 0.5) * 2,
        (e.clientY / window.innerHeight - 0.5) * 2,
      );
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rt]);

  // start a trick when the store action changes
  useEffect(() => {
    if (!action) return;
    const actionKey = typeof action === "string" ? action : action.key;
    rt.trick = actionKey;
    rt.trickT = 0;
    rt.trickDur = ACTION_DUR[actionKey] ?? 1.2;
    const id = setTimeout(() => clearAction(), rt.trickDur * 1000);
    return () => clearTimeout(id);
  }, [action, rt, clearAction]);

  useFrame((state, delta) => {
    const g = ref.current;
    const inner = innerRef.current;
    if (!g || !inner) return;
    const dt = Math.min(delta, 0.05);
    const t = state.clock.elapsedTime;
    // read live store values each frame (avoids stale-closure issues)
    const store = useMimoStore.getState();
    const { mood: liveMood, customMood, clickTarget } = store;
    const m = getMood(liveMood, customMood);
    const energy = 0.5 + m.spin; // excitement multiplier

    // --- where should Mimo be? blend between section anchors by scroll ---
    const p = scrollProgress();
    const f = p * (ANCHORS.length - 1);
    const i = Math.min(ANCHORS.length - 2, Math.floor(f));
    const frac = THREE.MathUtils.clamp(f - i, 0, 1);
    const a = ANCHORS[i];
    const b = ANCHORS[i + 1];
    const ease = frac * frac * (3 - 2 * frac);

    const tx = THREE.MathUtils.lerp(a.pos[0], b.pos[0], ease);
    const ty = THREE.MathUtils.lerp(a.pos[1], b.pos[1], ease);
    const tz = THREE.MathUtils.lerp(a.pos[2], b.pos[2], ease);
    const tScale = THREE.MathUtils.lerp(a.scale, b.scale, ease);

    // playful figure-8 / hover drift so Mimo is never static
    const driftX = Math.sin(t * 0.7) * 0.45 * energy;
    const driftY = Math.sin(t * 1.25) * 0.28 * energy + Math.sin(t * 0.4) * 0.1;
    const driftZ = Math.cos(t * 0.55) * 0.3;

    // responsive clamp so Mimo stays on-screen on narrow viewports
    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;
    let goalX = THREE.MathUtils.clamp(tx + driftX, -halfW + 0.6, halfW - 0.6);
    let goalY = THREE.MathUtils.clamp(ty + driftY, -halfH + 0.6, halfH - 0.6);
    let goalZ = tz + driftZ;

    // Direct page clicks temporarily override the scroll anchor and make
    // Mimo fly to that screen position.
    if (clickTarget && clickTarget.id !== rt.clickTargetId) {
      const world = screenToWorld(clickTarget.x, clickTarget.y, camera, 0);
      rt.clickTarget = new THREE.Vector3(
        THREE.MathUtils.clamp(world.x, -halfW + 0.62, halfW - 0.62),
        THREE.MathUtils.clamp(world.y, -halfH + 0.62, halfH - 0.62),
        0.15,
      );
      rt.clickTargetId = clickTarget.id;
      rt.clickStarted = t;
      rt.clickUntil = t + 2.65;
    }

    if (rt.clickTarget) {
      if (t <= rt.clickUntil) {
        const settle = Math.min(1, Math.max(0, (t - rt.clickStarted) / 0.45));
        const hover = Math.sin(t * 4.4) * 0.05 * settle;
        goalX = rt.clickTarget.x + Math.sin(t * 1.8) * 0.08 * settle;
        goalY = rt.clickTarget.y + hover;
        goalZ = rt.clickTarget.z + Math.cos(t * 2.1) * 0.08 * settle;
      } else {
        rt.clickTarget = null;
        rt.clickTargetId = null;
        store.clearClickTarget();
      }
    }

    // --- trick path overrides ---
    let extraRoll = 0;
    let extraPitch = 0;
    let extraYaw = 0;
    let bobBoost = 0;
    if (rt.trick) {
      rt.trickT += dt;
      const tp = Math.min(rt.trickT / rt.trickDur, 1);
      const swell = Math.sin(tp * Math.PI);
      switch (rt.trick) {
        case "spin":
          extraRoll = tp * Math.PI * 2;
          break;
        case "flip":
          extraPitch = tp * Math.PI * 2;
          break;
        case "loop":
          // soar up-and-over in a vertical loop
          goalY += Math.sin(tp * Math.PI) * 2.6;
          goalZ += Math.sin(tp * Math.PI * 2) * 1.2;
          extraPitch = tp * Math.PI * 2;
          break;
        case "wave":
          extraRoll = Math.sin(tp * Math.PI * 5) * 0.4 * swell;
          bobBoost = swell * 0.25;
          break;
        case "boost":
          goalZ += swell * 2.4; // lunge toward the camera
          bobBoost = swell * 0.2;
          extraPitch = -swell * 0.25;
          break;
        case "peek":
          goalX += Math.sin(tp * Math.PI * 2) * 1.1 * swell;
          goalY += Math.cos(tp * Math.PI * 2) * 0.45 * swell;
          extraYaw = Math.sin(tp * Math.PI * 4) * 0.75 * swell;
          bobBoost = swell * 0.18;
          break;
        case "shimmy":
          goalX += Math.sin(tp * Math.PI * 10) * 0.35 * swell;
          extraRoll = Math.sin(tp * Math.PI * 12) * 0.35 * swell;
          extraYaw = Math.sin(tp * Math.PI * 8) * 0.22 * swell;
          break;
        case "heart":
          goalY += swell * 0.7;
          goalZ += swell * 1.1;
          extraRoll = Math.sin(tp * Math.PI * 2) * 0.22;
          bobBoost = swell * 0.36;
          break;
        case "orbit":
          goalX += Math.cos(tp * Math.PI * 2) * 1.1 * swell;
          goalY += Math.sin(tp * Math.PI * 2) * 0.85 * swell;
          extraRoll = tp * Math.PI * 2;
          extraYaw = Math.sin(tp * Math.PI * 2) * 0.45;
          break;
        default:
          break;
      }
      if (tp >= 1) rt.trick = null;
    }

    // --- fly toward the goal (spring) and track velocity for banking ---
    rt.prev.copy(rt.pos);
    const follow = 1 - Math.pow(0.0016, dt) * (1.1 - energy * 0.25);
    rt.pos.x += (goalX - rt.pos.x) * follow;
    rt.pos.y += (goalY - rt.pos.y) * follow;
    rt.pos.z += (goalZ - rt.pos.z) * follow;
    g.position.copy(rt.pos);

    rt.screenPos.copy(g.position).project(camera);
    const screenState = {
      x: (rt.screenPos.x * 0.5 + 0.5) * size.width,
      y: (-rt.screenPos.y * 0.5 + 0.5) * size.height,
      radius: Math.max(64, 92 * g.scale.x),
      visible: rt.screenPos.z > -1 && rt.screenPos.z < 1,
    };
    store.setMimoScreen(screenState);

    const vx = rt.pos.x - rt.prev.x;
    const vy = rt.pos.y - rt.prev.y;

    // --- talking: mouth flap + eager head nod ---
    const talking = useMimoStore.getState().talking;
    const nod = talking ? Math.sin(t * 17) * 0.06 : 0;
    const mouthOpen = talking ? 0.35 + 0.45 * Math.abs(Math.sin(t * 15)) : 0;

    // --- orientation: face camera, bank into turns, look at cursor ---
    const lookYaw = rt.pointer.x * 0.35 + THREE.MathUtils.clamp(vx * 6, -0.5, 0.5);
    const lookPitch = -rt.pointer.y * 0.2 + THREE.MathUtils.clamp(vy * 6, -0.4, 0.4) + nod;
    const bank = THREE.MathUtils.clamp(-vx * 9, -0.7, 0.7); // roll into the turn

    g.rotation.y += (lookYaw + extraYaw - g.rotation.y) * 0.08;
    inner.rotation.x += (lookPitch + extraPitch - inner.rotation.x) * 0.12;
    inner.rotation.z += (bank + extraRoll - inner.rotation.z) * 0.12;
    inner.position.y = Math.sin(t * 1.6) * 0.08 * energy + bobBoost;

    // gentle scale toward the section's target
    const sc = THREE.MathUtils.lerp(g.scale.x, tScale, 0.05);
    g.scale.setScalar(sc);

    // --- draw the live face: blink + cursor-tracking pupils + mouth ---
    if (t > rt.nextBlink) {
      rt.blinkUntil = t + 0.16;
      rt.nextBlink = t + 2.4 + Math.random() * 3.2;
    }
    let blink = 1;
    if (t < rt.blinkUntil) {
      const bp = 1 - (rt.blinkUntil - t) / 0.16; // 0..1 across the blink
      blink = Math.abs(Math.cos(bp * Math.PI)); // open → shut → open
    }
    face.render({
      mood: liveMood,
      accent: m.accent,
      blink,
      mouthOpen,
      look: {
        x: THREE.MathUtils.clamp(rt.pointer.x, -1, 1),
        y: THREE.MathUtils.clamp(rt.pointer.y, -1, 1),
      },
    });
  });

  return (
    <group ref={ref}>
      <group ref={innerRef}>
        <primitive object={prepared} />
      </group>
      {children}
    </group>
  );
});

export default MimoModel;
useGLTF.preload(MODEL_URL);
