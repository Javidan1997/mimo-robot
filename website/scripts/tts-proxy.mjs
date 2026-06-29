import http from "node:http";
import { execFile } from "node:child_process";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

// Load credentials from .env.local / .env so `npm run tts` "just works"
// after the user pastes their Azure key - no shell exports required.
function loadEnvFiles() {
  for (const file of [".env.local", ".env"]) {
    try {
      const full = path.resolve(process.cwd(), file);
      if (!fs.existsSync(full)) continue;
      for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
        const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
        if (!match) continue;
        const key = match[1];
        const value = match[2].replace(/^["']|["']$/g, "");
        if (!(key in process.env)) process.env[key] = value;
      }
    } catch {
      /* ignore unreadable env file */
    }
  }
}
loadEnvFiles();

const PORT = Number(process.env.PORT || process.env.TTS_PORT || 8787);
const HOST = process.env.HOST || (process.env.RENDER ? "0.0.0.0" : "127.0.0.1");
const PROVIDER = (process.env.TTS_PROVIDER || (process.env.ELEVENLABS_API_KEY ? "elevenlabs" : "azure")).toLowerCase();
const REGION = process.env.AZURE_SPEECH_REGION;
const KEY = process.env.AZURE_SPEECH_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_multilingual_v2";
const ELEVENLABS_OUTPUT_FORMAT = process.env.ELEVENLABS_OUTPUT_FORMAT || "mp3_44100_128";
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "";
const ELEVENLABS_VOICE_ID_AZ = process.env.ELEVENLABS_VOICE_ID_AZ || ELEVENLABS_VOICE_ID;
const ELEVENLABS_VOICE_ID_EN = process.env.ELEVENLABS_VOICE_ID_EN || ELEVENLABS_VOICE_ID;
const EDGE_TTS_PYTHON = process.env.EDGE_TTS_PYTHON || process.env.PYTHON || "python";
const EDGE_TTS_VOICE_AZ = process.env.EDGE_TTS_VOICE_AZ || "az-AZ-BanuNeural";
const EDGE_TTS_VOICE_EN = process.env.EDGE_TTS_VOICE_EN || "en-US-AriaNeural";
const EDGE_TTS_RATE_AZ = process.env.EDGE_TTS_RATE_AZ || "-4%";
const EDGE_TTS_RATE_EN = process.env.EDGE_TTS_RATE_EN || "-3%";
const cache = new Map();

const VOICES = {
  az: {
    locale: "az-AZ",
    voice: process.env.AZURE_SPEECH_VOICE_AZ || "az-AZ-BanuNeural",
    fallback: "az-AZ-BabekNeural",
    rate: "-4%",
    pitch: "+1%",
  },
  en: {
    locale: "en-US",
    voice: process.env.AZURE_SPEECH_VOICE_EN || "en-US-JennyNeural",
    fallback: "en-US-AriaNeural",
    rate: "-3%",
    pitch: "+1%",
  },
};

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 8192) {
        reject(new Error("Request body is too large."));
        req.destroy();
      }
    });
    req.on("end", () => resolve(body));
    req.on("error", reject);
  });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function normalizeText(text, language) {
  const clean = String(text || "")
    .replace(/\bAI\b/g, language === "az" ? "süni intellekt" : "AI")
    .replace(/\bAR\b/g, language === "az" ? "artırılmış reallıq" : "AR")
    .replace(/\b3D\b/g, language === "az" ? "üç de" : "three D")
    .replace(/\bLED\b/g, language === "az" ? "led" : "LED")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return clean.slice(0, 420);
}

function buildSsml(text, language, voiceName) {
  const profile = VOICES[language] || VOICES.en;
  // Break the line into sentences and add short pauses for natural pacing.
  const sentences = String(text)
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean);
  const spoken = sentences.length
    ? sentences.map((part) => escapeXml(part)).join('<break time="220ms"/>')
    : escapeXml(text);

  return [
    `<speak version="1.0" xml:lang="${profile.locale}" xmlns="http://www.w3.org/2001/10/synthesis">`,
    `<voice name="${voiceName || profile.voice}">`,
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">${spoken}</prosody>`,
    "</voice>",
    "</speak>",
  ].join("");
}

async function requestAzure(ssml) {
  return fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "mimo-website-tts",
    },
    body: ssml,
  });
}

async function synthesizeAzure(text, language) {
  if (!REGION || !KEY) {
    throw new Error("AZURE_SPEECH_REGION and AZURE_SPEECH_KEY are required.");
  }

  const profile = VOICES[language] || VOICES.en;
  const candidates = [profile.voice, profile.fallback].filter(Boolean);
  let lastDetail = "";

  for (const voiceName of candidates) {
    const response = await requestAzure(buildSsml(text, language, voiceName));
    if (response.ok) return Buffer.from(await response.arrayBuffer());
    lastDetail = `${response.status} ${await response.text().catch(() => "")}`;
  }

  throw new Error(`Azure TTS failed for ${candidates.join(", ")}: ${lastDetail}`);
}

function elevenLabsVoiceFor(language) {
  return language === "az" ? ELEVENLABS_VOICE_ID_AZ : ELEVENLABS_VOICE_ID_EN;
}

async function synthesizeElevenLabs(text, language) {
  if (!ELEVENLABS_API_KEY) {
    throw new Error("ELEVENLABS_API_KEY is required.");
  }

  const voiceId = elevenLabsVoiceFor(language);
  if (!voiceId) {
    throw new Error("ELEVENLABS_VOICE_ID is required. Free ElevenLabs API keys need a voice from your own My Voices list.");
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=${encodeURIComponent(ELEVENLABS_OUTPUT_FORMAT)}`,
    {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: JSON.stringify({
        text,
        model_id: ELEVENLABS_MODEL_ID,
        voice_settings: {
          stability: 0.58,
          similarity_boost: 0.8,
          style: 0.18,
          use_speaker_boost: true,
        },
      }),
    },
  );

  if (response.ok) return Buffer.from(await response.arrayBuffer());

  const detail = await response.text().catch(() => "");
  throw new Error(`ElevenLabs TTS failed for ${voiceId}: ${response.status} ${detail}`);
}

function edgeVoiceFor(language) {
  return language === "az" ? EDGE_TTS_VOICE_AZ : EDGE_TTS_VOICE_EN;
}

function edgeRateFor(language) {
  return language === "az" ? EDGE_TTS_RATE_AZ : EDGE_TTS_RATE_EN;
}

async function synthesizeEdge(text, language) {
  const voice = edgeVoiceFor(language);
  const rate = edgeRateFor(language);
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "mimo-edge-tts-"));
  const mediaPath = path.join(tempDir, `${crypto.randomUUID()}.mp3`);

  try {
    await execFileAsync(
      EDGE_TTS_PYTHON,
      [
        "-m",
        "edge_tts",
        "--voice",
        voice,
        `--rate=${rate}`,
        "--text",
        text,
        "--write-media",
        mediaPath,
      ],
      {
        windowsHide: true,
        timeout: 30_000,
        maxBuffer: 1024 * 1024,
      },
    );

    return await fs.promises.readFile(mediaPath);
  } catch (error) {
    const detail = [error.message, error.stderr, error.stdout].filter(Boolean).join(" ");
    throw new Error(`Edge TTS failed for ${voice}: ${detail}`);
  } finally {
    await fs.promises.rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

async function synthesize(text, language) {
  if (PROVIDER === "edge") return synthesizeEdge(text, language);
  if (PROVIDER === "elevenlabs") return synthesizeElevenLabs(text, language);
  if (PROVIDER === "azure") return synthesizeAzure(text, language);
  throw new Error(`Unsupported TTS_PROVIDER "${PROVIDER}". Use "edge", "elevenlabs", or "azure".`);
}

const server = http.createServer(async (req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "/health")) {
    sendJson(res, 200, { ok: true, provider: PROVIDER });
    return;
  }

  if (req.method !== "POST" || req.url !== "/api/tts") {
    sendJson(res, 404, { error: "Not found" });
    return;
  }

  try {
    const body = JSON.parse(await readBody(req));
    const language = body.language === "az" ? "az" : "en";
    const text = normalizeText(body.text, language);

    if (!text) {
      sendJson(res, 400, { error: "Text is required." });
      return;
    }

    const cacheKey = crypto.createHash("sha256").update(`${PROVIDER}:${language}:${text}`).digest("hex");
    let audio = cache.get(cacheKey);
    if (!audio) {
      audio = await synthesize(text, language);
      cache.set(cacheKey, audio);
      if (cache.size > 80) cache.delete(cache.keys().next().value);
    }

    res.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
      "Access-Control-Allow-Origin": "*",
    });
    res.end(audio);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "TTS failed." });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use. Stop the existing TTS proxy or set TTS_PORT to another port.`);
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Mimo TTS proxy listening on http://${HOST}:${PORT}/api/tts`);
  console.log(`Mimo TTS provider: ${PROVIDER}`);
  if (PROVIDER === "azure" && (!REGION || !KEY)) {
    console.warn("Set AZURE_SPEECH_REGION and AZURE_SPEECH_KEY to enable neural voice output.");
  }
  if (PROVIDER === "elevenlabs" && !ELEVENLABS_API_KEY) {
    console.warn("Set ELEVENLABS_API_KEY to enable ElevenLabs voice output.");
  }
  if (PROVIDER === "elevenlabs" && !ELEVENLABS_VOICE_ID) {
    console.warn("Set ELEVENLABS_VOICE_ID to a voice from your ElevenLabs My Voices list.");
  }
  if (PROVIDER === "edge") {
    console.log(`Mimo Edge TTS voices: az=${EDGE_TTS_VOICE_AZ}, en=${EDGE_TTS_VOICE_EN}`);
  }
});
