import { useRef, useState } from "react";

const DEFAULT_COPY = {
  eyebrow: "Native camera",
  title: "Open the device camera naturally.",
  lead: "This section now hands off to the phone or tablet camera instead of embedding the camera inside a website panel.",
  nativeTitle: "Use your device camera",
  nativeBody: "Take a photo or record a video using the system camera screen. On desktop browsers this may open a file picker.",
  takePhoto: "Take photo",
  recordVideo: "Record video",
  captured: "Selected:",
  capturedFallback: "camera file",
};

export default function CameraStudio({ copy }) {
  const text = { ...copy, ...DEFAULT_COPY };
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState("");

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
        <p className="section__lead">{text.nativeBody}</p>
      </div>

      <div className="native-camera glass">
        <div className="native-camera__icon" aria-hidden="true">
          CAM
        </div>
        <div className="native-camera__copy">
          <h3>{text.title}</h3>
          <p>{text.lead}</p>
          {selectedFile && <p className="native-camera__status">{text.captured} {selectedFile}</p>}
        </div>
        <div className="native-camera__actions">
          <button className="btn btn--primary" type="button" onClick={() => openNativeCamera(photoInputRef)}>
            {text.takePhoto}
          </button>
          <button className="btn btn--ghost" type="button" onClick={() => openNativeCamera(videoInputRef)}>
            {text.recordVideo}
          </button>
        </div>
        <input
          ref={photoInputRef}
          className="native-camera__input"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
        />
        <input
          ref={videoInputRef}
          className="native-camera__input"
          type="file"
          accept="video/*"
          capture="environment"
          onChange={handleCapture}
        />
      </div>
    </section>
  );
}
