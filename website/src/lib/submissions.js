import { supabase, isSupabaseConfigured } from "./supabase.js";
import { trackEvent } from "./tracking.js";

function meta() {
  if (typeof navigator === "undefined") return {};
  return {
    language: navigator.language || null,
    referrer: typeof document !== "undefined" ? document.referrer || null : null,
    path: typeof location !== "undefined" ? location.pathname + location.hash : null,
  };
}

// Insert a contact message. Returns { ok, error }.
export async function submitContact({ name, email, message }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: "not_configured" };
  }
  const { error } = await supabase
    .from("contact_submissions")
    .insert({ name, email, message, meta: meta() });
  if (error) return { ok: false, error: error.message };
  trackEvent("contact_submit", {});
  return { ok: true };
}

// Add an email to the early-access / waitlist. Returns { ok, error }.
export async function joinWaitlist({ email }) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, error: "not_configured" };
  }
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, meta: meta() });
  // Treat duplicate email as success - they're already on the list.
  if (error && !/duplicate|unique/i.test(error.message)) {
    return { ok: false, error: error.message };
  }
  trackEvent("waitlist_join", {});
  return { ok: true };
}
