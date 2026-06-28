import { useMemo, useState } from "react";

function encode(value) {
  return encodeURIComponent(value.trim() || "Mimo robot");
}

function openUrl(url) {
  window.open(url, "_blank", "noopener,noreferrer");
}

function copyCurrentLink() {
  return navigator.clipboard?.writeText(window.location.href).catch(() => {});
}

export default function DeviceController({ copy }) {
  const [device, setDevice] = useState(copy.devices[0]?.key ?? "desktop");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const activeDevice = useMemo(
    () => copy.devices.find((item) => item.key === device) ?? copy.devices[0],
    [copy.devices, device],
  );

  const runAction = async (action) => {
    if (!action) return;

    const q = encode(query);
    setStatus("");

    switch (action.kind) {
      case "camera":
        window.location.hash = "camera";
        window.dispatchEvent(new CustomEvent("mimo:start-camera"));
        break;
      case "sticky":
        window.dispatchEvent(new CustomEvent("mimo:open-sticky"));
        break;
      case "search":
        openUrl(`https://www.google.com/search?q=${q}`);
        break;
      case "maps":
        openUrl(`https://www.google.com/maps/search/?api=1&query=${q}`);
        break;
      case "youtube":
        openUrl(`https://www.youtube.com/results?search_query=${q}`);
        break;
      case "whatsapp":
        openUrl(`https://wa.me/?text=${encodeURIComponent(`${query || "Mimo"} ${window.location.href}`)}`);
        break;
      case "instagram":
        openUrl("https://www.instagram.com/");
        break;
      case "email":
        window.location.href = `mailto:?subject=Mimo&body=${encodeURIComponent(query || "Mimo linki: ")}${encodeURIComponent(window.location.href)}`;
        break;
      case "timer":
        window.setTimeout(() => {
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Mimo", { body: copy.timerDone });
          } else {
            setStatus(copy.timerDone);
          }
        }, 15 * 60 * 1000);
        if ("Notification" in window && Notification.permission === "default") {
          void Notification.requestPermission();
        }
        setStatus(copy.timerSet);
        break;
      case "copy":
        await copyCurrentLink();
        setStatus(copy.copied);
        break;
      case "fullscreen":
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen?.().catch(() => {});
        } else {
          await document.exitFullscreen?.().catch(() => {});
        }
        break;
      case "share":
        if (navigator.share) {
          await navigator.share({ title: "Mimo", text: "Mimo interaktiv AI robot prototipi", url: window.location.href }).catch(() => {});
        } else {
          await copyCurrentLink();
        }
        setStatus(copy.copied);
        break;
      default:
        break;
    }
  };

  const addShortcut = async () => {
    if (navigator.share) {
      await navigator.share({ title: "Mimo", text: copy.install, url: window.location.href }).catch(() => {});
    } else {
      await copyCurrentLink();
      setStatus(copy.copied);
    }
  };

  return (
    <section className="device-controller section" id="controller">
      <div className="section__head">
        <p className="eyebrow">
          <span className="eyebrow__dot" /> {copy.eyebrow}
        </p>
        <h2 className="section__title">{copy.title}</h2>
        <p className="section__lead">{copy.lead}</p>
      </div>

      <div className="controller-shell">
        <div className="controller-pad glass">
          <div className="controller-device-tabs" role="tablist" aria-label={copy.eyebrow}>
            {copy.devices.map((item) => (
              <button
                key={item.key}
                type="button"
                className={device === item.key ? "is-active" : ""}
                onClick={() => setDevice(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="controller-device-copy">
            <h3>{activeDevice.label}</h3>
            <p>{activeDevice.body}</p>
          </div>

          <form
            className="controller-search"
            onSubmit={(event) => {
              event.preventDefault();
              void runAction(copy.actions.find((item) => item.kind === "search"));
            }}
          >
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={copy.searchPlaceholder}
            />
            <button className="btn btn--primary" type="submit">
              {copy.searchButton}
            </button>
          </form>

          <div className="controller-actions">
            {copy.actions.map((action) => (
              <button key={action.key} type="button" className="controller-action" onClick={() => runAction(action)}>
                <span className="controller-action__marker">{action.marker}</span>
                <span className="controller-action__label">{action.label}</span>
                <small>{action.detail}</small>
              </button>
            ))}
          </div>
        </div>

        <aside className="controller-native glass">
          <h3>{copy.nativeTitle}</h3>
          <p>{copy.nativeBody}</p>
          <div className="controller-coming">
            {copy.nativeItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          <button className="btn btn--ghost" type="button" onClick={addShortcut}>
            {copy.install}
          </button>
          {status && <p className="controller-status">{status}</p>}
        </aside>
      </div>
    </section>
  );
}
