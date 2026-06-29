-- ───────────────────────────────────────────────────────────────────────────
-- Mimo — Supabase schema for forms + interaction tracking + admin panel
--
-- HOW TO USE
--   1. Create a free project at https://supabase.com
--   2. Open the project → SQL Editor → paste this whole file → Run
--   3. Create the admin user (Authentication → Users → Add user):
--        email:    mimoadmin@mimorobot.online   (username "mimoadmin" + domain)
--        password: Ceyhun1968@
--        ✅ tick "Auto Confirm User"
--   4. Project Settings → API → copy the Project URL and the anon public key
--      into website/.env.local (see .env.example), then redeploy.
--
-- SECURITY MODEL (Row-Level Security)
--   • anon (any visitor)  → may INSERT into contact_submissions, waitlist, events
--                           but may NOT read any row back.
--   • authenticated admin → may SELECT everything (read-only dashboards).
--   The public anon key is therefore safe to ship in the static site.
-- ───────────────────────────────────────────────────────────────────────────

create extension if not exists "pgcrypto";

-- ── Contact form submissions ───────────────────────────────────────────────
create table if not exists public.contact_submissions (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,
  email       text not null,
  message     text not null,
  meta        jsonb default '{}'::jsonb
);

-- ── Early-access / waitlist ─────────────────────────────────────────────────
create table if not exists public.waitlist (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  email       text not null unique,
  meta        jsonb default '{}'::jsonb
);

-- ── Interaction / audience events ───────────────────────────────────────────
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text not null,             -- page_view, mood_select, camera_open, cta_click, ...
  props       jsonb default '{}'::jsonb,
  visitor_id  text,                      -- random per-browser id (no PII)
  session_id  text,                      -- per-tab visit id
  meta        jsonb default '{}'::jsonb  -- device, language, referrer, path
);

create index if not exists events_created_at_idx on public.events (created_at desc);
create index if not exists events_name_idx        on public.events (name);
create index if not exists contact_created_at_idx on public.contact_submissions (created_at desc);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

-- ── Row-Level Security ──────────────────────────────────────────────────────
alter table public.contact_submissions enable row level security;
alter table public.waitlist            enable row level security;
alter table public.events              enable row level security;

-- Anonymous visitors can submit (INSERT) but never read.
drop policy if exists "anon insert contact" on public.contact_submissions;
create policy "anon insert contact"
  on public.contact_submissions for insert to anon with check (true);

drop policy if exists "anon insert waitlist" on public.waitlist;
create policy "anon insert waitlist"
  on public.waitlist for insert to anon with check (true);

drop policy if exists "anon insert events" on public.events;
create policy "anon insert events"
  on public.events for insert to anon with check (true);

-- Authenticated admin (the mimoadmin user) can read everything.
drop policy if exists "auth read contact" on public.contact_submissions;
create policy "auth read contact"
  on public.contact_submissions for select to authenticated using (true);

drop policy if exists "auth read waitlist" on public.waitlist;
create policy "auth read waitlist"
  on public.waitlist for select to authenticated using (true);

drop policy if exists "auth read events" on public.events;
create policy "auth read events"
  on public.events for select to authenticated using (true);

-- Data API grants. RLS still controls which rows each role can touch.
grant usage on schema public to anon, authenticated;

grant insert on public.contact_submissions to anon;
grant insert on public.waitlist to anon;
grant insert on public.events to anon;

grant select on public.contact_submissions to authenticated;
grant select on public.waitlist to authenticated;
grant select on public.events to authenticated;
