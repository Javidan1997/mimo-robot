# Mimo AI Pet Robot — Project Notes

A planned **scalable desktop AI pet / mini robot platform** (codename "Mimo v1").
The hardware/firmware/backend is at the planning/handoff stage. The **marketing + 3D
experience website** has been built and lives in `website/` (see its own README).

## Sub-projects
- `website/` — **Mimo marketing site** (Vite + React + React-Three-Fiber). Interactive
  hero with the real 3D Mimo, a 5-mood "personality engine" that recolors the scene, and
  Instagram/WhatsApp/AR-filter + roadmap + waitlist sections. Run: `cd website && npm i && npm run dev`.
- `mimi-3d/` — the 3D source models: `textured.glb` (used by the site) and `highres.glb`
  (330k verts, no textures — too heavy for web).

## Files in this repo
- `mimo-plan.doc` — actually a **UTF-8 markdown plan** (not a real Word doc): voice
  architecture, reaction engine, module layout, personality, memory, safety, dev phases.
- `mimo_codex_handoff_summary.pdf` — 19-page master spec: shopping list, hardware wiring,
  software architecture, 7-day sprint plan, smoke tests, safety rules, 8 wiring drawings.
- `*.png` (4) — concept/reference sheets: industrial design + color palette, animation +
  rigging reference (rig targets, blendshape face states), and a GLB modeling prompt for a
  Three.js / React-Three-Fiber render.

## Product concept
Cute premium **desktop AI pet robot**: expressive touchscreen face, servo motion,
touch/proximity reactions, LED emotion glow, sound. Personality (curious, playful, helpful,
slightly shy idle, excited when praised) with persistent moods. Design language: matte black
+ dark graphite body, blue glow accents, articulated arms with simple claws.

**Core architectural decision:** keep the robot *body* controller (ESP32-S3) simple — it only
receives small structured robot-action commands and returns telemetry. All heavy AI (voice,
intent, smart-home, desktop automation, memory, personality) lives in backend/mobile/desktop
apps. The body can later upgrade (foam desktop base → upper body → biped → quadruped) without
rewriting firmware.

## Layered architecture
- **Mimo Body / ESP32-S3** — local controller: touchscreen face UI, servos, sensors, LED,
  DFPlayer sounds, telemetry. Knows nothing about OpenAI / smart-home brands.
- **Mimo Brain (backend)** — AI reasoning, personality, emotion engine, command routing,
  memory, safety guard, integrations. Recommended **FastAPI**.
- **Mobile app** — voice remote + companion control (React Native or PWA): push-to-talk, mood
  settings, routines, smart-home shortcuts, telemetry/logs.
- **Desktop app** — developer/computer helper (**Tauri or Electron**): project shortcuts,
  coding mode, reminders, safe allow-listed desktop actions.
- **Plugin/Skill layer** — every feature is a modular skill/plugin (TV, AC, Home Assistant,
  timers, coding helper, games, emotion behaviors). No hardcoded monolith.

Recommended stack: React Native mobile + Tauri/Electron desktop + FastAPI brain +
MQTT/WebSocket robot protocol + ESP32-S3 firmware + Home Assistant + OpenAI voice/text.

Planned tree (from the spec):
```
mimo/
  firmware/esp32-s3-body/src/  (main.cpp, face_ui, servo_controller, sensors, audio, led, protocol)
  backend/mimo-brain/app/      (main.py, agents/, skills/, integrations/, storage/)
  mobile-app/
  desktop-app/
  docs/  (hardware/, drawings/, safety.md, build_log.md)
```

## Robot command protocol (backend → ESP32)
Small JSON commands; firmware just executes face/servo/led/sound and reports telemetry:
```json
{ "request_id": "cmd-001", "mood": "happy", "face": "smile_big",
  "actions": [ {"type":"servo","name":"wave_left","speed":0.6},
               {"type":"led","name":"blue_pulse","duration_ms":1500},
               {"type":"sound","track":"01/001.mp3"} ] }
```
Every AI response should produce **speech + emotion + actions together** ("answers + feels +
moves + acts") — the "reaction engine" that makes it feel alive. Command understanding uses
**AI tool/function calling** (e.g. `set_mimo_emotion`, `control_smart_home`), not hardcoded
text matching.

## Hardware (v1 bill of materials)
- **Controller/face:** ESP32-S3 2.8" capacitive touchscreen (8MB PSRAM, 16MB Flash).
- **Servos:** PCA9685 16-ch I2C driver + 6× **MG90S 180° metal-gear** servos (neck/head,
  arms; NOT 360° — avoid continuous-rotation for positional joints).
- **Sensors:** 2× VL53L0X ToF distance, TTP223 capacitive touch modules, MPU6050 gyro/accel.
- **Light/sound:** WS2812B LED ring/strip; DFPlayer Mini (YX5200) MP3 + 3W speaker + microSD.
- **Power chain (critical safety):** 12V 5A adapter → female DC barrel → **12V→5V 10A
  step-down buck converter** → PCA9685 V+ / servos. **Never** connect 12V directly to
  servos/PCA9685 servo rail. Verify buck output is **5.0–5.2V with a multimeter** before
  connecting servos. Shared ground between ESP32, PCA9685, and converter.
- **Bus:** ESP32-S3 I2C shared by PCA9685 + VL53L0X + MPU6050; DFPlayer on UART; WS2812B on
  one digital pin; TTP223 on digital inputs.
- **Body:** ~6mm black EVA foam board with fixed foam claws for v1.
- **Not needed for v1:** plastic project box, active gripper kit, 360° servos, Raspberry Pi,
  loose lithium batteries (use wall-adapter setup first).

## Safety policy (firmware + apps)
- **Low risk → run immediately:** move servo, blink, change face, play sound, set LED, local timer.
- **Medium → ask confirmation:** change AC temp, turn off TV, open local files, send message.
- **High → blocked by default:** delete files, run shell commands, install software, expose
  secrets, make payments, unlock doors.
- API keys live **only in backend `.env`** — never in ESP32 firmware or frontend.

## Smart home / TV / AC
Route everything through **Home Assistant** as the bridge (REST + WebSocket API) rather than
hardcoding brand APIs. Mimo calls one integration layer; HA handles lights/TV/AC/plugs/scenes.

## Build phases / dev order
1. Mimo reacts without AI (button → backend → ESP32: smile/sad/blink/wave/nod/sound/LED).
2. Mimo understands text (text → AI → speech+emotion+actions).
3. Mimo understands voice (push-to-talk → STT → AI → TTS → reaction; OpenAI Audio API).
4. Smart-home skills via Home Assistant (TV/AC/lights/routines).
5. Realtime conversation (OpenAI Realtime API / WebRTC, interruptions, function calling).

**First implementation task (per spec):** create the repo with firmware, backend, dashboard,
docs, `.env.example`, and smoke tests, implementing a **mock robot protocol** before real
hardware is connected.

## Memory layers (planned)
Short-term (current convo/mood/last command), daily (today's work, reminders, tasks,
routines), long-term (preferences, favorite devices, project folders, common commands,
personality evolution).
