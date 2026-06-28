import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { useMimoStore, getMood } from "../state/useMimoStore.js";
import { createMimoFace } from "../three/face.js";

const MODEL_URL = `${import.meta.env.BASE_URL}models/mimo.glb?v=face2`;

const STR = {
  az: {
    title: "Mimo AR kamera",
    intro: "Mimonu real kameranın görüntüsündə yerləşdir, sürüşdürərək yerini dəyiş, ölçüsünü tənzimlə və şəkil çək.",
    launch: "AR kameranı aç",
    permission: "Kameraya icazə gözlənilir…",
    denied: "Kameraya giriş yoxdur. Brauzer icazəsini yoxlayın və ya aşağıdakı native kamera ilə şəkil çəkin.",
    capture: "Şəkil çək",
    saved: "Şəkil hazırdır",
    close: "Bağla",
    smaller: "Kiçilt",
    bigger: "Böyüt",
    hint: "Mimonu sürüşdürərək yerləşdir",
    share: "Paylaş",
  },
  en: {
    title: "Mimo AR camera",
    intro: "Place Mimo into your real camera view, drag to move it, scale it, and take a photo.",
    launch: "Open AR camera",
    permission: "Waiting for camera permission…",
    denied: "No camera access. Check your browser permission, or use the native camera below.",
    capture: "Take photo",
    saved: "Photo ready",
    close: "Close",
    smaller: "Smaller",
    bigger: "Bigger",
    hint: "Drag to place Mimo",
    share: "Share",
  },
};

export default function CameraAR({ open, onClose }) {
  const language = useMimoStore((s) => s.language);
  const t = STR[language] ?? STR.en;
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [status, setStatus] = useState("loading"); // loading | live | denied
  const apiRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    let disposed = false;
    let stream = null;
    let raf = 0;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    setStatus("loading");
    // hide the site's flying Mimo while the AR view is open
    document.body.classList.add("ar-active");

    // ---- three.js scene ----
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      preserveDrawingBuffer: true, // needed to composite the photo
      powerPreference: "high-performance",
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.setClearAlpha(0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.set(0, 0, 6);

    const ambient = new THREE.AmbientLight(0xffffff, 1.1);
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(3, 5, 4);
    const rim = new THREE.PointLight(0x39c2ff, 6, 30);
    rim.position.set(-3, 1, 3);
    scene.add(ambient, key, rim);

    const pivot = new THREE.Group(); // user-positioned anchor
    const spin = new THREE.Group(); // idle motion
    pivot.add(spin);
    scene.add(pivot);
    pivot.position.set(0, -0.2, 0);

    const face = createMimoFace();
    const rt = { blinkUntil: 0, nextBlink: 1.5, baseScale: 1, userScale: 1 };

    const draco = new DRACOLoader();
    draco.setDecoderPath("https://www.gstatic.com/draco/v1/decoders/");
    const loader = new GLTFLoader();
    loader.setDRACOLoader(draco);
    loader.load(MODEL_URL, (gltf) => {
      if (disposed) return;
      const root = gltf.scene;
      const box = new THREE.Box3().setFromObject(root);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const s = 2.4 / maxDim;
      root.scale.setScalar(s);
      root.position.set(-center.x * s, -center.y * s, -center.z * s);
      rt.baseScale = 1;
      const node = root.getObjectByName("MimoFace");
      if (node) {
        node.material = new THREE.MeshBasicMaterial({
          map: face.texture,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
          toneMapped: false,
        });
        node.renderOrder = 5;
      }
      spin.add(root);
    });

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    const clock = new THREE.Clock();
    const look = { x: 0, y: 0 };
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      const store = useMimoStore.getState();
      const m = getMood(store.mood, store.customMood, store.language);

      rim.color.set(m.accent);
      spin.rotation.y = Math.sin(time * 0.5) * 0.35;
      spin.position.y = Math.sin(time * 1.4) * 0.08;
      spin.rotation.z = Math.sin(time * 0.8) * 0.04;

      // blink + talking mouth
      if (time > rt.nextBlink) {
        rt.blinkUntil = time + 0.16;
        rt.nextBlink = time + 2.4 + Math.random() * 3;
      }
      let blink = 1;
      if (time < rt.blinkUntil) {
        const bp = 1 - (rt.blinkUntil - time) / 0.16;
        blink = Math.abs(Math.cos(bp * Math.PI));
      }
      const talking = store.talking;
      const mouthOpen = talking ? 0.35 + 0.45 * Math.abs(Math.sin(time * 15)) : 0;
      look.x = Math.sin(time * 0.6) * 0.5;
      look.y = Math.sin(time * 0.9) * 0.3;
      face.render({ mood: store.mood, accent: m.accent, blink, mouthOpen, look });

      pivot.scale.setScalar(rt.baseScale * rt.userScale);
      renderer.render(scene, camera);
    };
    animate();

    // ---- drag to move Mimo ----
    let dragging = false;
    const planeZ = 0;
    const ndcToWorld = (clientX, clientY) => {
      const ndc = new THREE.Vector3(
        (clientX / window.innerWidth) * 2 - 1,
        -(clientY / window.innerHeight) * 2 + 1,
        0.5,
      );
      ndc.unproject(camera);
      const dir = ndc.sub(camera.position).normalize();
      const dist = (planeZ - camera.position.z) / dir.z;
      return camera.position.clone().add(dir.multiplyScalar(dist));
    };
    const onDown = (e) => {
      dragging = true;
      const p = ndcToWorld(e.clientX, e.clientY);
      pivot.position.x = p.x;
      pivot.position.y = p.y;
    };
    const onMoveDrag = (e) => {
      if (!dragging) return;
      const p = ndcToWorld(e.clientX, e.clientY);
      pivot.position.x = p.x;
      pivot.position.y = p.y;
    };
    const onUp = () => {
      dragging = false;
    };
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMoveDrag);
    window.addEventListener("pointerup", onUp);

    // ---- start the camera ----
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (disposed) {
          stream.getTracks().forEach((tr) => tr.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        setStatus("live");
      } catch {
        setStatus("denied");
      }
    })();

    // ---- expose capture/scale to the buttons ----
    apiRef.current = {
      scale: (factor) => {
        rt.userScale = THREE.MathUtils.clamp(rt.userScale * factor, 0.4, 3.2);
      },
      capture: async () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        const out = document.createElement("canvas");
        out.width = w;
        out.height = h;
        const ctx = out.getContext("2d");
        // draw the camera frame (cover-fit)
        if (video.videoWidth) {
          const vr = video.videoWidth / video.videoHeight;
          const sr = w / h;
          let dw = w;
          let dh = h;
          let dx = 0;
          let dy = 0;
          if (vr > sr) {
            dh = h;
            dw = h * vr;
            dx = (w - dw) / 2;
          } else {
            dw = w;
            dh = w / vr;
            dy = (h - dh) / 2;
          }
          ctx.drawImage(video, dx, dy, dw, dh);
        }
        renderer.render(scene, camera);
        ctx.drawImage(canvas, 0, 0, w, h);
        // watermark
        ctx.fillStyle = "rgba(255,255,255,0.85)";
        ctx.font = "600 22px Sora, sans-serif";
        ctx.fillText("MIMO", 24, h - 28);

        await new Promise((resolve) => {
          out.toBlob(async (blob) => {
            if (!blob) return resolve();
            const file = new File([blob], "mimo-ar.png", { type: "image/png" });
            try {
              if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({ files: [file], title: "Mimo AR" });
              } else {
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "mimo-ar.png";
                a.click();
                URL.revokeObjectURL(url);
              }
            } catch {
              /* user cancelled share */
            }
            resolve();
          }, "image/png");
        });
      },
    };

    return () => {
      disposed = true;
      document.body.classList.remove("ar-active");
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMoveDrag);
      window.removeEventListener("pointerup", onUp);
      if (stream) stream.getTracks().forEach((tr) => tr.stop());
      draco.dispose();
      renderer.dispose();
      apiRef.current = null;
    };
  }, [open]);

  if (!open) return null;

  return createPortal(
    <div className="ar-overlay" role="dialog" aria-label={t.title}>
      <video ref={videoRef} className="ar-video" playsInline muted />
      <canvas ref={canvasRef} className="ar-canvas" />

      <button className="ar-close" type="button" onClick={onClose} aria-label={t.close}>
        ✕
      </button>

      {status !== "live" && (
        <div className="ar-status">
          <p>{status === "denied" ? t.denied : t.permission}</p>
        </div>
      )}

      {status === "live" && (
        <div className="ar-hint">{t.hint}</div>
      )}

      <div className="ar-controls">
        <button type="button" className="ar-btn" onClick={() => apiRef.current?.scale(0.85)} aria-label={t.smaller}>
          −
        </button>
        <button type="button" className="ar-capture" onClick={() => apiRef.current?.capture()}>
          <span className="ar-capture__ring" />
        </button>
        <button type="button" className="ar-btn" onClick={() => apiRef.current?.scale(1.18)} aria-label={t.bigger}>
          +
        </button>
      </div>
    </div>,
    document.body,
  );
}

export { STR as AR_STRINGS };
