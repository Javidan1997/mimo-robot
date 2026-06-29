import { useRef, useState } from "react";
import { useMimoStore } from "../state/useMimoStore.js";
import CameraAR, { AR_STRINGS } from "./CameraAR.jsx";
import { trackEvent } from "../lib/tracking.js";

const DEFAULT_COPY = {
  eyebrow: "Camera AR",
  nativeTitle: "See Mimo in your real space.",
  nativeBody: "Open your phone's live camera and place the 3D Mimo into the real world - move it, scale it, and capture a photo to share.",
  fallbackTitle: "Prefer the system camera?",
  fallbackBody: "You can also take a plain photo or video with the native camera screen.",
  takePhoto: "Take photo",
  recordVideo: "Record video",
  captured: "Selected:",
  capturedFallback: "camera file",
};

export default function CameraStudio({ copy }) {
  const language = useMimoStore((s) => s.language);
  const ar = AR_STRINGS[language] ?? AR_STRINGS.en;
  const text = { ...DEFAULT_COPY, ...copy };
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState("");
  const [arOpen, setArOpen] = useState(false);

  const openNativeCamera = (inputRef) => {
    setSelectedFile("");
    inputRef.current?.click();
  };

  const handleCapture = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFile(file.name || text.capturedFallback);
  };

  return (
    <section className="camera-studio section" id="camera">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> {text.eyebrow}
        </p>
        <h2 className="section__title">{text.nativeTitle}</h2>
        <p className="section__lead">{ar.intro}</p>
      </div>

      <div className="ar-card glass">
        <div className="ar-card__preview" aria-hidden="true">
          <div className="ar-card__phone">
            <span className="ar-card__mimo">M</span>
            <span className="ar-card__pulse" />
          </div>
        </div>
        <div className="ar-card__body">
          <h3>{ar.title}</h3>
          <p>{text.nativeBody}</p>
          <div className="ar-card__actions">
            <button className="btn btn--primary" type="button" onClick={() => { setArOpen(true); trackEvent("camera_open", { mode: "ar" }); }}>
              {ar.launch}
            </button>
          </div>

          <div className="ar-card__fallback">
            <p>{text.fallbackBody}</p>
            <div className="ar-card__fallback-actions">
              <button className="btn btn--ghost" type="button" onClick={() => openNativeCamera(photoInputRef)}>
                {text.takePhoto}
              </button>
              <button className="btn btn--ghost" type="button" onClick={() => openNativeCamera(videoInputRef)}>
                {text.recordVideo}
              </button>
            </div>
            {selectedFile && <p className="native-camera__status">{text.captured} {selectedFile}</p>}
          </div>
        </div>

        <input ref={photoInputRef} className="native-camera__input" type="file" accept="image/*" capture="environment" onChange={handleCapture} />
        <input ref={videoInputRef} className="native-camera__input" type="file" accept="video/*" capture="environment" onChange={handleCapture} />
      </div>

      <CameraAR open={arOpen} onClose={() => setArOpen(false)} />
    </section>
  );
}
