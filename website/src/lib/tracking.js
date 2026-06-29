import { supabase, isSupabaseConfigured } from "./supabase.js";

// A lightweight, privacy-conscious interaction tracker. It records anonymous
// product events (page views, mood selections, camera opens, CTA clicks) into
// the `events` table. No cookies, no PII — only a random per-browser visitor id
// kept in localStorage so we can roughly count unique visitors.

const VISITOR_KEY = "mimo_visitor_id";

function getVisitorId() {
  if (typeof localStorage === "undefined") return null;
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    if (!id) {
      id =
        (crypto?.randomUUID && crypto.randomUUID()) ||
        `v_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(VISITOR_KEY, id);
    }
    return id;
  } catch {
    return null;
  }
}

// Per-tab session id (resets on full reload) for grouping a single visit.
const sessionId =
  (typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID()) ||
  `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;

function audienceMeta() {
  if (typeof navigator === "undefined") return {};
  const ua = navigator.userAgent || "";
  const device = /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop";
  return {
    device,
    language: navigator.language || null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    path: typeof location !== "undefined" ? location.pathname + location.hash : null,
  };
}

export function trackEvent(name, props = {}) {
  if (!isSupabaseConfigured || !supabase) return; // no-op until configured
  const payload = {
    name,
    props,
    visitor_id: getVisitorId(),
    session_id: sessionId,
    meta: audienceMeta(),
  };
  // Fire-and-forget; never block the UI or throw into the app.
  supabase
    .from("events")
    .insert(payload)
    .then(({ error }) => {
      if (error && import.meta.env.DEV) console.warn("trackEvent failed:", error.message);
    });
}

let pageViewSent = false;
export function trackPageView() {
  if (pageViewSent) return;
  pageViewSent = true;
  trackEvent("page_view", { title: typeof document !== "undefined" ? document.title : null });
}
