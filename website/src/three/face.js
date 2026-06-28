import * as THREE from "three";

/**
 * Mimo's live face, drawn on a 2D canvas and mapped onto the `MimoFace`
 * plane. Each mood gets distinct eyes + mouth; it blinks, tracks the cursor
 * with its pupils, and flaps its mouth while talking.
 */
const W = 512;
const H = 356;

// Per-mood face design. openY = eye height factor, smile = mouth curve
// (+up / -down), browTilt rotates the eyes for attitude.
const FACES = {
  happy: { eye: "round", openY: 0.95, smile: 0.9, browTilt: 0, mouth: "smile" },
  loving: { eye: "heart", openY: 1.0, smile: 0.85, browTilt: 0, mouth: "smile" },
  curious: { eye: "round", openY: 1.05, smile: 0.2, browTilt: 0.12, mouth: "o", asym: 0.18 },
  silly: { eye: "wonky", openY: 1.0, smile: 0.7, browTilt: 0.18, mouth: "grin", asym: 0.35 },
  excited: { eye: "star", openY: 1.2, smile: 1.0, browTilt: 0, mouth: "grin" },
  shy: { eye: "round", openY: 0.72, smile: 0.45, browTilt: -0.08, mouth: "small", blush: true },
  focused: { eye: "half", openY: 0.42, smile: 0.0, browTilt: -0.05, mouth: "line" },
  brave: { eye: "round", openY: 0.9, smile: 0.55, browTilt: -0.14, mouth: "smile" },
  dreamy: { eye: "sparkle", openY: 0.78, smile: 0.3, browTilt: 0.04, mouth: "small" },
  sleepy: { eye: "sleepy", openY: 0.28, smile: -0.25, browTilt: 0.0, mouth: "small" },
  custom: { eye: "sparkle", openY: 1.0, smile: 0.75, browTilt: 0.04, mouth: "smile", blush: true },
};

export function createMimoFace() {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  // The Blender UVs map the plane 0..1; flip so the face sits upright.
  texture.flipY = true;
  texture.center.set(0.5, 0.5);
  texture.rotation = Math.PI; // orient to the screen's "up"

  function eye(cx, cy, rx, ry, look, design, glow) {
    ctx.save();
    ctx.translate(cx + look.x * 14, cy + look.y * 10);
    ctx.rotate(design.browTilt * (cx < W / 2 ? -1 : 1));
    ctx.shadowColor = glow;
    ctx.shadowBlur = 26;
    ctx.fillStyle = "#d8f6ff";

    if (design.eye === "half" || design.eye === "sleepy") {
      // narrowed / sleepy: a thick curved bar
      ctx.lineWidth = ry * 1.5;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#d8f6ff";
      ctx.beginPath();
      const dip = design.eye === "sleepy" ? ry * 0.9 : 0;
      ctx.moveTo(-rx, 0);
      ctx.quadraticCurveTo(0, dip, rx, 0);
      ctx.stroke();
    } else if (design.eye === "star" || design.eye === "sparkle") {
      // excited: rounded eye + sparkle
      roundedEye(ctx, rx, ry);
      ctx.fill();
      ctx.shadowBlur = 14;
      ctx.fillStyle = "#ffffff";
      sparkle(ctx, -rx * 0.3, -ry * 0.35, ry * 0.5);
    } else if (design.eye === "heart") {
      heart(ctx, 0, 0, Math.min(rx, ry) * 0.9);
      ctx.fill();
    } else if (design.eye === "wonky") {
      roundedEye(ctx, rx * (cx < W / 2 ? 0.78 : 1.08), ry * (cx < W / 2 ? 1.12 : 0.86));
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(8,30,46,0.48)";
      ctx.beginPath();
      ctx.arc(look.x * 8, look.y * 5, Math.max(8, ry * 0.28), 0, Math.PI * 2);
      ctx.fill();
    } else {
      roundedEye(ctx, rx, ry);
      ctx.fill();
      // pupil glint
      ctx.shadowBlur = 0;
      ctx.fillStyle = "rgba(8,30,46,0.55)";
      ctx.beginPath();
      ctx.ellipse(look.x * 6, look.y * 5, rx * 0.34, ry * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(-rx * 0.25, -ry * 0.3, rx * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function roundedEye(c, rx, ry) {
    c.beginPath();
    c.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  }

  function sparkle(c, x, y, r) {
    c.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const rr = i % 2 === 0 ? r : r * 0.4;
      c[i ? "lineTo" : "moveTo"](x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    c.closePath();
    c.fill();
  }

  function heart(c, x, y, r) {
    c.beginPath();
    c.moveTo(x, y + r * 0.62);
    c.bezierCurveTo(x - r * 1.3, y - r * 0.15, x - r * 0.65, y - r * 1.0, x, y - r * 0.35);
    c.bezierCurveTo(x + r * 0.65, y - r * 1.0, x + r * 1.3, y - r * 0.15, x, y + r * 0.62);
    c.closePath();
  }

  function mouth(design, openAmt, glow) {
    const my = H * 0.7;
    const mw = W * 0.16;
    ctx.save();
    ctx.shadowColor = glow;
    ctx.shadowBlur = 20;
    ctx.strokeStyle = "#d8f6ff";
    ctx.fillStyle = "#d8f6ff";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";

    const open = openAmt * 26; // talking opens the mouth
    if (design.mouth === "o" || open > 6) {
      ctx.beginPath();
      ctx.ellipse(W / 2, my, mw * 0.4, 7 + open, 0, 0, Math.PI * 2);
      open > 6 ? ctx.fill() : ctx.stroke();
    } else if (design.mouth === "grin") {
      ctx.beginPath();
      ctx.moveTo(W / 2 - mw, my - 4);
      ctx.quadraticCurveTo(W / 2, my + 26 + open, W / 2 + mw, my - 4);
      ctx.quadraticCurveTo(W / 2, my + 8, W / 2 - mw, my - 4);
      ctx.fill();
    } else if (design.mouth === "line" || design.mouth === "small") {
      const ww = design.mouth === "small" ? mw * 0.45 : mw * 0.7;
      ctx.beginPath();
      ctx.moveTo(W / 2 - ww, my);
      ctx.lineTo(W / 2 + ww, my);
      ctx.stroke();
    } else {
      // smile arc
      ctx.beginPath();
      ctx.moveTo(W / 2 - mw, my - design.smile * 6);
      ctx.quadraticCurveTo(W / 2, my + design.smile * 26 + open, W / 2 + mw, my - design.smile * 6);
      ctx.stroke();
    }
    ctx.restore();
  }

  function render({ mood, accent, blink = 1, look = { x: 0, y: 0 }, mouthOpen = 0 }) {
    const d = FACES[mood] ?? FACES.happy;
    const glow = accent ?? MOOD_GLOW[mood] ?? "#39c2ff";
    ctx.clearRect(0, 0, W, H);

    const baseRx = W * 0.1;
    const baseRy = H * 0.17 * d.openY * blink;
    const cy = H * 0.4;
    const lx = W * 0.34;
    const rx = W * 0.66;
    const asym = d.asym ?? 0;
    eye(lx, cy, baseRx, baseRy * (1 + asym), look, d, glow);
    eye(rx, cy, baseRx, baseRy * (1 - asym), look, d, glow);
    if (d.blush) {
      ctx.save();
      ctx.fillStyle = "rgba(255, 122, 217, 0.38)";
      ctx.shadowColor = glow;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.ellipse(W * 0.23, H * 0.58, W * 0.05, H * 0.025, -0.15, 0, Math.PI * 2);
      ctx.ellipse(W * 0.77, H * 0.58, W * 0.05, H * 0.025, 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    mouth(d, mouthOpen, glow);

    texture.needsUpdate = true;
  }

  return { texture, render, canvas };
}

const MOOD_GLOW = {
  happy: "#39c2ff",
  loving: "#ff7ad9",
  curious: "#22d3ee",
  silly: "#facc15",
  excited: "#c084fc",
  shy: "#fb7185",
  focused: "#38bdf8",
  brave: "#34d399",
  dreamy: "#818cf8",
  sleepy: "#7c93b5",
  custom: "#ff7ad9",
};
