import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { getMood, useMimoStore } from "../state/useMimoStore.js";
import { createMimoFace } from "../three/face.js";

const MODEL_URL = "./models/mimo.glb?v=face1";

function usePreparedMimoScene() {
  const { scene } = useGLTF(MODEL_URL);

  return useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.45 / maxDim;

    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    root.traverse((child) => {
      if (!child.isMesh) return;
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => {
        if (!material) return;
        material.envMapIntensity = 1.18;
        if ("roughness" in material) material.roughness = Math.min(material.roughness ?? 0.6, 0.76);
        if ("metalness" in material) material.metalness = Math.max(material.metalness ?? 0, 0.12);
      });
    });

    return root;
  }, [scene]);
}

function CameraMimo({ placement, mode }) {
  const prepared = usePreparedMimoScene();
  const group = useRef();
  const inner = useRef();
  const face = useMemo(() => createMimoFace(), []);
  const mood = useMimoStore((s) => s.mood);
  const customMood = useMimoStore((s) => s.customMood);
  const talking = useMimoStore((s) => s.talking);
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
    if (!group.current || !inner.current) return;
    const t = state.clock.elapsedTime;
    const modeDepth = mode === "desk" ? -0.15 : 0.1;

    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, placement.x * 2.15, 0.08);
    group.current.position.y = THREE.MathUtils.lerp(group.current.position.y, placement.y * 1.35, 0.08);
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, modeDepth, 0.08);
    group.current.scale.setScalar(placement.scale);

    inner.current.rotation.y = Math.sin(t * 0.65) * 0.16 + placement.turn;
    inner.current.rotation.x = Math.sin(t * 0.9) * 0.06;
    inner.current.rotation.z = Math.sin(t * 1.2) * 0.045;
    inner.current.position.y = Math.sin(t * 1.5) * 0.055;

    face.render({
      mood,
      accent: m.accent,
      blink: 1,
      mouthOpen: talking ? 0.4 + 0.42 * Math.abs(Math.sin(t * 15)) : 0,
      look: {
        x: Math.sin(t * 0.5) * 0.35,
        y: Math.sin(t * 0.7) * 0.2,
      },
    });
  });

  return (
    <group ref={group}>
      <group ref={inner}>
        <primitive object={prepared} />
      </group>
      <pointLight position={[0, 1.4, 2.2]} intensity={4.5 * m.lightIntensity} color={m.accent} distance={6} />
    </group>
  );
}

function drawCovered(ctx, source, x, y, width, height, mirrored = false) {
  const sourceWidth = source.videoWidth || source.width;
  const sourceHeight = source.videoHeight || source.height;
  if (!sourceWidth || !sourceHeight) return;

  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const drawX = x + (width - drawWidth) / 2;
  const drawY = y + (height - drawHeight) / 2;

  ctx.save();
  if (mirrored) {
    ctx.translate(x + width, y);
    ctx.scale(-1, 1);
    ctx.drawImage(source, 0 + (width - drawWidth) / 2, drawY - y, drawWidth, drawHeight);
  } else {
    ctx.drawImage(source, drawX, drawY, drawWidth, drawHeight);
  }
  ctx.restore();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function CameraStudio({ copy }) {
  const videoRef = useRef(null);
  const previewRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState("");
  const [facingMode, setFacingMode] = useState("environment");
  const [mode, setMode] = useState("desk");
  const [placement, setPlacement] = useState({ x: 0.18, y: -0.16, scale: 0.92, turn: -0.18 });

  const isLive = Boolean(stream);
  const mirrored = facingMode === "user";

  useEffect(() => {
    const video = videoRef.current;
    if (video && stream) {
      video.srcObject = stream;
      void video.play();
    }
  }, [stream]);

  useEffect(() => () => stream?.getTracks().forEach((track) => track.stop()), [stream]);

  const startCamera = async (nextFacingMode = facingMode) => {
    try {
      setCameraError("");
      stream?.getTracks().forEach((track) => track.stop());
      const nextStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nextFacingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setFacingMode(nextFacingMode);
      setStream(nextStream);
    } catch {
      setCameraError(copy.cameraError);
    }
  };

  useEffect(() => {
    const start = () => void startCamera();
    window.addEventListener("mimo:start-camera", start);
    return () => window.removeEventListener("mimo:start-camera", start);
  });

  const switchCamera = () => {
    const next = facingMode === "environment" ? "user" : "environment";
    void startCamera(next);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    const preview = previewRef.current;
    const overlay = preview?.querySelector("canvas");
    if (!video || !preview || !overlay || !video.videoWidth) {
      setCameraError(copy.cameraFirst);
      return;
    }

    const ratio = preview.clientHeight / preview.clientWidth;
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = Math.round(canvas.width * ratio);
    const ctx = canvas.getContext("2d");

    drawCovered(ctx, video, 0, 0, canvas.width, canvas.height, mirrored);
    ctx.drawImage(overlay, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], "mimo-ar-photo.png", { type: blob.type });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mimo AR" }).catch(() => downloadBlob(blob, file.name));
      } else {
        downloadBlob(blob, file.name);
      }
    }, "image/png");
  };

  const exportSticker = () => {
    const overlay = previewRef.current?.querySelector("canvas");
    if (!overlay) return;

    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 512, 512);
    ctx.drawImage(overlay, 0, 0, 512, 512);

    canvas.toBlob((blob) => {
      if (!blob) return;
      downloadBlob(blob, "mimo-whatsapp-sticker.webp");
    }, "image/webp", 0.9);
  };

  const setPlacementValue = (key, value) => {
    setPlacement((current) => ({ ...current, [key]: Number(value) }));
  };

  return (
    <section className="camera-studio section" id="camera">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> {copy.eyebrow}
        </p>
        <h2 className="section__title">{copy.title}</h2>
        <p className="section__lead">{copy.lead}</p>
      </div>

      <div className="camera-shell">
        <div className="camera-preview glass" ref={previewRef}>
          <video
            ref={videoRef}
            className={`${isLive ? "is-live" : ""}${mirrored ? " is-mirrored" : ""}`}
            playsInline
            muted
            aria-label={copy.previewLabel}
          />
          {!isLive && (
            <div className="camera-preview__empty">
              <span>3D</span>
              <p>{copy.empty}</p>
            </div>
          )}
          <Canvas
            className="camera-canvas"
            dpr={[1, 1.6]}
            gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
            camera={{ position: [0, 0, 5.2], fov: 38 }}
          >
            <ambientLight intensity={0.72} />
            <directionalLight position={[3, 4, 4]} intensity={1.45} />
            <Suspense fallback={null}>
              <CameraMimo placement={placement} mode={mode} />
              <Environment preset="city" />
            </Suspense>
          </Canvas>
        </div>

        <div className="camera-panel glass">
          <div className="camera-mode-tabs" role="tablist" aria-label={copy.modeLabel}>
            {copy.modes.map((item) => (
              <button
                key={item.key}
                type="button"
                className={mode === item.key ? "is-active" : ""}
                onClick={() => setMode(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="camera-actions">
            <button className="btn btn--primary" type="button" onClick={() => startCamera()}>
              {isLive ? copy.restartCamera : copy.startCamera}
            </button>
            <button className="btn btn--ghost" type="button" onClick={switchCamera}>
              {copy.switchCamera}
            </button>
          </div>

          {cameraError && <p className="camera-error">{cameraError}</p>}

          <div className="camera-controls">
            <label>
              {copy.positionX}
              <input type="range" min="-1" max="1" step="0.01" value={placement.x} onChange={(e) => setPlacementValue("x", e.target.value)} />
            </label>
            <label>
              {copy.positionY}
              <input type="range" min="-1" max="1" step="0.01" value={placement.y} onChange={(e) => setPlacementValue("y", e.target.value)} />
            </label>
            <label>
              {copy.scale}
              <input type="range" min="0.45" max="1.5" step="0.01" value={placement.scale} onChange={(e) => setPlacementValue("scale", e.target.value)} />
            </label>
            <label>
              {copy.turn}
              <input type="range" min="-0.75" max="0.75" step="0.01" value={placement.turn} onChange={(e) => setPlacementValue("turn", e.target.value)} />
            </label>
          </div>

          <div className="camera-export">
            <button className="btn btn--primary" type="button" onClick={capturePhoto}>
              {copy.capture}
            </button>
            <button className="btn btn--ghost" type="button" onClick={exportSticker}>
              {copy.sticker}
            </button>
          </div>

          <div className="camera-notes">
            {copy.notes.map((note) => (
              <p key={note}>{note}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

useGLTF.preload(MODEL_URL);
