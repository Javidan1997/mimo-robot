const iconPaths = {
  happy: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M8.8 10h.01M15.2 10h.01M8.8 14.2c1.9 1.7 4.5 1.7 6.4 0" />
    </>
  ),
  loving: (
    <path d="M12 19.2 5.9 13.6c-2.9-2.7-1.5-7.6 2.4-7.6 1.6 0 2.9.8 3.7 2 .8-1.2 2.1-2 3.7-2 3.9 0 5.3 4.9 2.4 7.6L12 19.2Z" />
  ),
  curious: (
    <>
      <circle cx="11" cy="11" r="5.8" />
      <path d="m15.3 15.3 3.7 3.7M9.3 9.4c.4-1 1.3-1.6 2.4-1.6 1.3 0 2.5.9 2.5 2.2 0 1.5-1.4 2-2.2 2.6-.6.4-.8.8-.8 1.4M11.2 16h.01" />
    </>
  ),
  silly: (
    <>
      <path d="m13 2.8-8.2 11h6.4L11 21.2l8.2-11h-6.4L13 2.8Z" />
      <path d="M7.5 6.4 5.8 4.7M16.5 17.6l1.7 1.7" />
    </>
  ),
  excited: (
    <>
      <path d="M12 3.2 13.8 9l5.9.1-4.7 3.5 1.8 5.8-4.8-3.5-4.8 3.5 1.8-5.8-4.7-3.5 5.9-.1L12 3.2Z" />
      <path d="M4.2 4.8 3 3.6M20.8 4.8 22 3.6M4.2 19.2 3 20.4M20.8 19.2l1.2 1.2" />
    </>
  ),
  shy: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M9.4 10.4h.01M14.6 10.4h.01M10 15c1.2.6 2.8.6 4 0M7.1 13.6h.01M16.9 13.6h.01" />
    </>
  ),
  focused: (
    <>
      <circle cx="12" cy="12" r="8.3" />
      <circle cx="12" cy="12" r="4.7" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </>
  ),
  brave: (
    <>
      <path d="M12 3.5 19 6v5.4c0 4.1-2.8 7.2-7 9.1-4.2-1.9-7-5-7-9.1V6l7-2.5Z" />
      <path d="m9.2 12.2 2 2 4-4" />
    </>
  ),
  dreamy: (
    <path d="M18.2 15.4A8.2 8.2 0 0 1 8.6 5.8 7.5 7.5 0 1 0 18.2 15.4Z" />
  ),
  sleepy: (
    <>
      <path d="M6 10h12M8 14h8M10 18h4" />
      <path d="M7.4 6.2c2.5-2 6.7-2 9.2 0" />
    </>
  ),
  sparkle: (
    <>
      <path d="M12 3.5 14 10l6.5 2-6.5 2-2 6.5-2-6.5-6.5-2 6.5-2 2-6.5Z" />
      <path d="M5 4.5v3M3.5 6h3M19 16.5v3M17.5 18h3" />
    </>
  ),
  moon: (
    <path d="M18.8 15.5A7.6 7.6 0 0 1 8.5 5.2 8 8 0 1 0 18.8 15.5Z" />
  ),
  bolt: <path d="m13 2.8-8.2 11h6.4L11 21.2l8.2-11h-6.4L13 2.8Z" />,
  leaf: (
    <>
      <path d="M5 19c9.4-.5 14-5.1 14-14-8.9 0-13.5 4.6-14 14Z" />
      <path d="M5 19c2.8-4.6 6.2-7.6 10.2-9" />
    </>
  ),
  speak: (
    <>
      <path d="M4.5 10.2v3.6h3.2l4.1 3.3V6.9l-4.1 3.3H4.5Z" />
      <path d="M15 9.2c.8.8 1.2 1.7 1.2 2.8s-.4 2-1.2 2.8M17.8 6.7A7.2 7.2 0 0 1 20 12c0 2.1-.7 3.9-2.2 5.3" />
    </>
  ),
  saved: (
    <>
      <path d="M7 4.5h10a1 1 0 0 1 1 1v15l-6-3.8-6 3.8v-15a1 1 0 0 1 1-1Z" />
      <path d="M9.5 8.5h5" />
    </>
  ),
  wave: (
    <>
      <path d="M8.5 12.5V6.2a1.3 1.3 0 0 1 2.6 0v5.2" />
      <path d="M11.1 11V5.1a1.3 1.3 0 0 1 2.6 0v6" />
      <path d="M13.7 11.4V6.2a1.3 1.3 0 0 1 2.6 0v7.2" />
      <path d="M16.3 13.4V9a1.3 1.3 0 0 1 2.6 0v4.7c0 4.2-2.7 6.8-6.3 6.8-3.2 0-5.1-1.7-6.7-4.3l-1.2-2a1.4 1.4 0 0 1 2.4-1.5l1.4 2.1" />
      <path d="M4.5 4.5 2.8 2.8M19.5 4.5l1.7-1.7" />
    </>
  ),
  spin: (
    <>
      <path d="M18.8 8.2A7.5 7.5 0 0 0 5.4 7" />
      <path d="M18.8 4.8v3.4h-3.4M5.2 15.8A7.5 7.5 0 0 0 18.6 17" />
      <path d="M5.2 19.2v-3.4h3.4" />
    </>
  ),
  flip: (
    <>
      <path d="M12 4v16M8.2 7.8 12 4l3.8 3.8M8.2 16.2 12 20l3.8-3.8" />
      <path d="M5 12h14" />
    </>
  ),
  loop: (
    <>
      <path d="M6 13c0-3 2.1-5 5.1-5h3.6" />
      <path d="m12.3 4.8 3.9 3.2-3.9 3.2" />
      <path d="M18 11c0 3-2.1 5-5.1 5H9.3" />
      <path d="m11.7 19.2-3.9-3.2 3.9-3.2" />
    </>
  ),
  boost: (
    <>
      <path d="M12 3.5c3 2 4.6 4.8 4.6 8.2 0 3.2-1.9 6.1-4.6 8.8-2.7-2.7-4.6-5.6-4.6-8.8 0-3.4 1.6-6.2 4.6-8.2Z" />
      <path d="M12 8.5h.01M8.8 17.2 6 20.3M15.2 17.2l2.8 3.1" />
    </>
  ),
  peek: (
    <>
      <path d="M3.5 12s3-5.5 8.5-5.5 8.5 5.5 8.5 5.5-3 5.5-8.5 5.5S3.5 12 3.5 12Z" />
      <circle cx="12" cy="12" r="2.5" />
    </>
  ),
  signal: (
    <>
      <path d="M4 17.5h16" />
      <path d="M6.5 15v-3M12 15V7M17.5 15V4.5" />
      <path d="M6.5 9.2h.01M12 4.2h.01M17.5 2h.01" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="m8.4 12.2 2.3 2.3 4.9-5" />
    </>
  ),
  orbit: (
    <>
      <circle cx="12" cy="12" r="2.2" />
      <ellipse cx="12" cy="12" rx="8.4" ry="3.8" transform="rotate(-24 12 12)" />
      <ellipse cx="12" cy="12" rx="8.4" ry="3.8" transform="rotate(24 12 12)" />
    </>
  ),
  voice: (
    <>
      <path d="M12 14.5a3 3 0 0 0 3-3V6.8a3 3 0 1 0-6 0v4.7a3 3 0 0 0 3 3Z" />
      <path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0M12 17.4v3.1M9 20.5h6" />
    </>
  ),
  led: (
    <>
      <path d="M9 16.5h6M9.5 19h5" />
      <path d="M8 10.3a4 4 0 1 1 8 0c0 1.5-.8 2.5-1.7 3.5-.5.5-.8 1.1-.8 1.7h-3c0-.6-.3-1.2-.8-1.7C8.8 12.8 8 11.8 8 10.3Z" />
    </>
  ),
  home: (
    <>
      <path d="m4 11 8-6.5 8 6.5" />
      <path d="M6.5 10v9h11v-9M10 19v-5h4v5" />
    </>
  ),
  desk: (
    <>
      <path d="M4.5 8h15v7h-15z" />
      <path d="M7 15v5M17 15v5M9 11.5h6" />
    </>
  ),
  ai: (
    <>
      <path d="M8 7.2a3.1 3.1 0 0 1 6-1.1 3.1 3.1 0 0 1 2.1 5.4 3.1 3.1 0 0 1-2.1 5.4A3.1 3.1 0 0 1 8 15.8a3.1 3.1 0 0 1-.1-5.6A3.1 3.1 0 0 1 8 7.2Z" />
      <path d="M12 5.5v13M8 10h8M8.5 14h7" />
    </>
  ),
  ok: (
    <>
      <circle cx="12" cy="12" r="8.4" />
      <path d="m8.3 12.3 2.5 2.5 5-5.2" />
    </>
  ),
  instagram: (
    <>
      <rect x="5" y="5" width="14" height="14" rx="4" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M16.5 7.7h.01" />
    </>
  ),
  whatsapp: (
    <>
      <path d="M5.3 19.2 6.2 16A7.6 7.6 0 1 1 9 18.1l-3.7 1.1Z" />
      <path d="M9.1 9.2c.3 2.5 2.2 4.4 4.7 4.7l1.1-1.1c.2-.2.4-.2.7-.1l1.4.6c.3.1.5.4.4.8-.2 1.1-1 1.8-2.1 1.8-4.2 0-7.4-3.2-7.4-7.4 0-1.1.7-1.9 1.8-2.1.4-.1.7.1.8.4l.6 1.4c.1.3.1.5-.1.7L9.1 9.2Z" />
    </>
  ),
  ar: (
    <>
      <path d="M5 9V5h4M15 5h4v4M19 15v4h-4M9 19H5v-4" />
      <path d="m12 8 4 2.2v4.6L12 17l-4-2.2v-4.6L12 8Z" />
      <path d="M12 12.4 16 10.2M12 12.4v4.4M12 12.4 8 10.2" />
    </>
  ),
  cube: (
    <>
      <path d="m12 3.8 7.2 4.1v8.2L12 20.2l-7.2-4.1V7.9L12 3.8Z" />
      <path d="M12 12 4.8 7.9M12 12l7.2-4.1M12 12v8.2" />
    </>
  ),
};

const aliases = {
  "3d": "cube",
  voice: "voice",
  ses: "voice",
  led: "led",
  home: "home",
  ev: "home",
  desk: "desk",
  is: "desk",
  ai: "ai",
  ok: "ok",
  ig: "instagram",
  wa: "whatsapp",
};

export function normalizeIconName(name) {
  return String(name || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase();
}

export default function SvgIcon({ name, className = "", title }) {
  const normalized = normalizeIconName(name);
  const iconName = aliases[normalized] ?? normalized;
  const paths = iconPaths[iconName] ?? iconPaths.sparkle;

  return (
    <svg
      className={`svg-icon${className ? ` ${className}` : ""}`}
      viewBox="0 0 24 24"
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {title ? <title>{title}</title> : null}
      {paths}
    </svg>
  );
}
