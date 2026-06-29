# Mimo — forms, tracking & admin panel setup

The contact form, early-access waitlist, interaction tracking, and the admin
panel are all backed by **Supabase** (a free hosted Postgres + Auth). The static
site only holds the public, browser-safe anon key — every read is locked down by
Row-Level Security, so visitors can submit but never read other people's data.

Until the two keys below are set, the site still runs fine: the forms show a
"coming online soon" notice, tracking is a no-op, and `/#admin` shows a setup
message.

## 1. Create the Supabase project
1. Sign up at <https://supabase.com> and create a new (free) project.
2. Open **SQL Editor**, paste the contents of [`supabase/schema.sql`](./supabase/schema.sql),
   and click **Run**. This creates the `contact_submissions`, `waitlist`, and
   `events` tables plus the RLS policies.

## 2. Create the admin user
**Authentication → Users → Add user**:
- Email: `mimoadmin@mimorobot.online`  (the username `mimoadmin` + the domain)
- Password: `Ceyhun1968@`
- Tick **Auto Confirm User**

You log into the panel with username **mimoadmin** and that password — the app
maps the username to the email above automatically.

> To change the username/password later, edit the user in Supabase. To use a
> different email domain, set `VITE_ADMIN_EMAIL_DOMAIN`.

## 3. Get the two keys
**Project Settings → API**:
- **Project URL** → `VITE_SUPABASE_URL`
- **anon public** key → `VITE_SUPABASE_ANON_KEY`

## 4a. Local development
Copy `.env.example` to `.env.local` and fill in:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```
Then `npm run dev` and open <http://localhost:5173/#admin>.

## 4b. Production (GitHub Pages)
Vite injects `VITE_*` values **at build time**, so the deploy workflow needs
them. In the GitHub repo:

**Settings → Secrets and variables → Actions → Variables → New repository variable**
- `VITE_SUPABASE_URL` = your project URL
- `VITE_SUPABASE_ANON_KEY` = your anon public key

(Repository **Variables**, not Secrets — the anon key is meant to be public and
ships in the JS bundle either way. The deploy workflow already reads these.)

Re-run the **Deploy to GitHub Pages** action (or push any commit) and the live
site picks them up.

## Using the admin panel
- Visit `https://mimorobot.online/#admin` and sign in.
- **Overview** — unique visitors, page views, message/early-list counts, plus
  interactions by type, device split, and top referrers.
- **Contact / Early list / Interactions** — full tables with **Export CSV**.

## What gets tracked
Anonymous product events only (no cookies, no PII): `page_view`, `mood_select`,
`camera_open`, `cta_click`, `contact_submit`, `waitlist_join`. A random
per-browser id is stored in `localStorage` purely to roughly count unique
visitors. Real geo/IP would require a server-side function and is intentionally
out of scope for the static site.
