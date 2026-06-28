import http from "node:http";
import crypto from "node:crypto";

const PORT = Number(process.env.TTS_PORT || 8787);
const REGION = process.env.AZURE_SPEECH_REGION;
const KEY = process.env.AZURE_SPEECH_KEY;
const cache = new Map();

const VOICES = {
  az: {
    locale: "az-AZ",
    voice: process.env.AZURE_SPEECH_VOICE_AZ || "az-AZ-BanuNeural",
    rate: "-6%",
    pitch: "+2%",
  },
  en: {
    locale: "en-US",
    voice: process.env.AZURE_SPEECH_VOICE_EN || "en-US-JennyNeural",
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
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, " ")
    .trim();

  return clean.slice(0, 420);
}

function buildSsml(text, language) {
  const profile = VOICES[language] || VOICES.en;
  return [
    `<speak version="1.0" xml:lang="${profile.locale}" xmlns="http://www.w3.org/2001/10/synthesis">`,
    `<voice name="${profile.voice}">`,
    `<prosody rate="${profile.rate}" pitch="${profile.pitch}">${escapeXml(text)}</prosody>`,
    "</voice>",
    "</speak>",
  ].join("");
}

async function synthesize(text, language) {
  if (!REGION || !KEY) {
    throw new Error("AZURE_SPEECH_REGION and AZURE_SPEECH_KEY are required.");
  }

  const profile = VOICES[language] || VOICES.en;
  const ssml = buildSsml(text, language);
  const response = await fetch(`https://${REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      "User-Agent": "mimo-website-tts",
    },
    body: ssml,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Azure TTS failed for ${profile.voice}: ${response.status} ${detail}`);
  }

  return Buffer.from(await response.arrayBuffer());
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

    const cacheKey = crypto.createHash("sha256").update(`${language}:${text}`).digest("hex");
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

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mimo TTS proxy listening on http://127.0.0.1:${PORT}/api/tts`);
  if (!REGION || !KEY) {
    console.warn("Set AZURE_SPEECH_REGION and AZURE_SPEECH_KEY to enable neural voice output.");
  }
});
