# Mimo forms, tracking, and admin panel setup

The contact form, early-access waitlist, interaction tracking, and admin panel
are backed by Supabase. The static site ships only the public browser-safe
publishable key; database access is gated by Row-Level Security, so visitors can
submit data but cannot read other people's data.

## 1. Supabase project

Project dashboard:
<https://supabase.com/dashboard/project/czwzfpvfrgkccvschpbm>

Project API URL:
`https://czwzfpvfrgkccvschpbm.supabase.co`

Run [`supabase/schema.sql`](./supabase/schema.sql) in the Supabase SQL Editor.
This creates the `contact_submissions`, `waitlist`, and `events` tables plus
the RLS policies.

## 2. Admin user

In Supabase, open `Authentication -> Users -> Add user`:

- Email: `mimoadmin@mimorobot.online`
- Password: `Ceyhun1968@`
- Enable `Auto Confirm User`

The admin panel accepts username `mimoadmin`; the app maps it to
`mimoadmin@mimorobot.online` automatically.

## 3. Environment values

Local development uses `website/.env.local`:

```env
VITE_SUPABASE_URL=https://czwzfpvfrgkccvschpbm.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_zehg_r0RoB7rcBkFzG2Iug_tQjzwtyh
VITE_ADMIN_EMAIL_DOMAIN=mimorobot.online
```

Production uses the same values hardcoded in
[`../.github/workflows/deploy.yml`](../.github/workflows/deploy.yml), so no
GitHub repository variables are required for the admin panel.

## 4. Deploy

Push to `main` or run the `Deploy to GitHub Pages` workflow manually. The build
checks that the Supabase URL and publishable key are present before it uploads
the GitHub Pages artifact.

## Using the admin panel

- Visit `https://mimorobot.online/#admin` and sign in.
- `Overview` shows unique visitors, page views, message and early-list counts,
  interactions by type, device split, and top referrers.
- `Contact`, `Early list`, and `Interactions` show full tables with CSV export.

## What gets tracked

Anonymous product events only, with no cookies and no PII: `page_view`,
`mood_select`, `camera_open`, `cta_click`, `contact_submit`, and
`waitlist_join`. A random per-browser id is stored in `localStorage` only to
roughly count unique visitors.
