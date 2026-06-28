# Mimo Website

The marketing + interactive 3D experience site for **Mimo**, the desktop AI pet robot.
Built to be promoted via Instagram reels: visitors land, play with Mimo's 3D personality,
switch its moods, and join the waitlist for the apps / AR filters / physical robot.

## Stack
- **Vite** + **React 18**
- **Three.js** via **@react-three/fiber** + **@react-three/drei**
- **zustand** for shared mood/action state between the UI and the 3D scene

## Run it
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # preview the build
```

## Natural Voice
Mimo tries to use a neural TTS endpoint first and falls back to the browser voice if the
endpoint is not available. For the best Azerbaijani voice, run the proxy with an Azure AI
Speech resource:

```bash
# terminal 1
$env:AZURE_SPEECH_REGION="your_region"
$env:AZURE_SPEECH_KEY="your_key"
npm run tts

# terminal 2
npm run dev
```

The proxy uses `az-AZ-BanuNeural` for Azerbaijani and `en-US-JennyNeural` for English by
default. Override them with `AZURE_SPEECH_VOICE_AZ` and `AZURE_SPEECH_VOICE_EN`.

## How it works
- `public/models/mimo.glb` — the real Mimo 3D scan, **compressed to ~757 KB** (from 15 MB)
  with Blender: Draco mesh compression + 2K WebP textures. Re-generate with
  `blender --background --python scripts/compress_mimo.py -- ../mimi-3d/textured.glb public/models/mimo.glb 2048`.
  The uncompressed original is kept at `../mimi-3d/textured_original_backup.glb`.
  It is a static mesh (no rig/animations), so personality is created procedurally.
- **Mimo flies across the whole site.** A fixed, click-through `<Canvas>` layer
  (`.flight-layer`, `pointer-events: none`) sits above the content, and Mimo flies between
  per-section screen anchors as you scroll.
- **Native Camera** lets visitors hand off to the phone or tablet camera using the device's
  own camera UI instead of an embedded web camera panel.
- `src/three/MimoModel.jsx` — the flight pilot. Scroll position blends between `ANCHORS`
  (one per section), with figure-8 hover drift, **banking into turns**, velocity-based
  pitch, cursor look, and one-shot tricks. Forwards a ref so the trail can follow it.
- `src/three/MimoStage.jsx` — the full-screen R3F `<Canvas>`: mood-tinted lights, a glowing
  mood-colored **`<Trail>`** that streaks behind Mimo, and a soft aura billboard that flies
  along with it.
- **Tricks** (`ACTIONS` in the store): professional inline SVG icons for Wave, Barrel roll,
  Backflip, Loop-the-loop, and Boost are triggered from the hero buttons.
- `src/state/useMimoStore.js` — the 5 **moods** (happy, curious, excited, focused, sleepy),
  each mapping to an accent color, light intensity, motion energy, LED/face descriptor and a
  spoken line. Mirrors Mimo's real "every reaction = face + LED + servo + sound" concept.
- `src/state/speech.js` — remote neural TTS first, browser `speechSynthesis` fallback second.
  The local proxy lives in `scripts/tts-proxy.mjs`.
- `src/components/` — `Nav`, `MoodControls`, `CameraStudio`, and `Sections`
  (Hero, Personality, Features, Everywhere, Roadmap, Waitlist, Footer).

## Sections
Hero (live 3D) · Personality lab (mood switcher) · Features · Everywhere
(Instagram / WhatsApp / AR filters / stickers) · Native Camera · Roadmap (3D → social → iOS & Android →
physical robot) · Waitlist.

## Known follow-ups
- Done: ~~Model is 15 MB~~ — now Draco + 2K-WebP compressed to **757 KB**.
- Waitlist form is **front-end only** — wire it to a real backend/CRM (e.g. an email API).
- Open Graph image `public/social/og-cover.png` referenced in `index.html` is not yet added.
- Draco decoder is fetched from the gstatic CDN at runtime (via drei's `useGLTF`); self-host
  the decoder if you need fully offline/CDN-independent loading.
