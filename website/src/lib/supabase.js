import { createClient } from "@supabase/supabase-js";

// Public, browser-safe values. The anon key is meant to be exposed; all access
// is gated by Row-Level Security policies in Supabase (see website/supabase/schema.sql).
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// The admin login accepts a username; Supabase Auth needs an email, so we map
// "mimoadmin" -> "mimoadmin@<this domain>". Override with VITE_ADMIN_EMAIL_DOMAIN.
export const ADMIN_EMAIL_DOMAIN =
  import.meta.env.VITE_ADMIN_EMAIL_DOMAIN || "mimorobot.online";

export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase = isSupabaseConfigured
  ? createClient(url, anonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null;

export function usernameToEmail(username) {
  const name = String(username || "").trim().toLowerCase();
  if (!name) return "";
  return name.includes("@") ? name : `${name}@${ADMIN_EMAIL_DOMAIN}`;
}
