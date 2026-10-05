# GitHub audit for Upwork conversion

Date: 2026-10-05. Account: `Javidan1997`. 26 repos found; 2 forks (`datacompy`,
`streamlit-sales-dashboard-with-userauthentication`) excluded from scoring, so 24 non-fork
repos were scored (under the cap of 40).

Method: repo metadata via the GitHub MCP (gh CLI token was invalid), file-tree stats on local
clones for every repo, and a keyword scan for employer names and secrets. Full files were opened
in 5 repos only (cap 8): Morphix, holy_water_task, Python-Scripts-for-Data-Analysis,
3D-Configurator-Website, mimo-robot. `pergola-configurator-app` (private) was not in this
session's access scope, so it is scored from metadata only.

**Nothing was deleted, archived, renamed or made private.** Those are recommendations for you.

## 🚨 Do these first (confidentiality and security)

| # | Repo (visibility) | Problem | Action for you |
|---|---|---|---|
| 1 | `SQL-Querries` (public, 1 fork) | 227 SQL files. Names and paths reference **Azercell** and **eManat** (e.g. `azercell_ferq.sql`, `a_cell/`, `millikart/emanatplus.sql`). Looks like employer code. | Make private now. It was already forked once, so ask yourself whether anything in it is sensitive. If so, tell the employer's security contact. |
| 2 | `dev_portfolio` (public) | Folders `Azercell/`, `AllProviderSum/`, `Azersu MPAY`, `EMDK`, and a reconciliation app. A file called `notepads/platform and passwords.txt`, plus DB-connection scripts that match password patterns. | Make private now. **Rotate every credential** that could be in those files. Scrub them from history (`git filter-repo`) before making anything public again. |
| 3 | `holy_water_task` (public) | A hardcoded weather-API key and a GCP project id in `Apache Airflow DAG/weather_dag.py`. | Revoke or rotate the key, then move it to an env var (see NEXT_PROMPTS #1). |
| 4 | `Python-Scripts-for-Data-Analysis` (public) | The script's file paths contain an **eMANAT** folder and a Windows username. | Make private, or replace it with a clean version that has no paths. |
| 5 | `mimo-robot` (public) | `Javidan-Abdullayev 2.pdf` (your CV, which likely contains your phone and email) is committed at the repo root. | Remove it from the repo and from history if you don't want it public. |
| 6 | `dev_portfolio` (public) | `Portfolio Javidan Abdullayev (1)_compressed.pdf` is committed. | Check it for contact details and employer content. |
| 7 | `Morphix` (public) | `src/assets/Pergolast Quote - ….pdf` looks like a real customer quote. | Confirm it isn't a client's document. If it is, remove it. `.env.production` only holds a Supabase anon key (intended to be public, RLS-limited). That's OK but worth double-checking. |
| 8 | `prod_app` (private) | `reconProd` reconciliation app with credential-like strings. The same app is copied publicly in `dev_portfolio`. | Keep private. Rotate the credentials. Treat it as employer code. |

## Ranked table

Scores are 0-3. **Effort** is inverted: 3 means little work to make it client-ready.
Total out of 15.

| Rank | Repo | Vis | Upwork rel. | Proof | Code | README | Effort | Total | Decision | Reason |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | holy_water_task | pub | 3 | 1 | 1 | 0 | 2 | 7 | **KEEP+POLISH** | Airflow → GCS → BigQuery DAG plus LTV and funnel SQL. This is the exact niche, but it has no README and a leaked key. |
| 2 | Morphix | pub | 2 | 3 | 2 | 0 | 2 | 9 | **KEEP+POLISH** | Live configurator site with CI, Supabase lead capture and an `api/erpnext-sync.js` CRM/ERP sync. That sync is real integration proof, but it has no README. |
| 3 | mimo-robot | pub | 1 | 3 | 2 | 1 | 2 | 9 | **KEEP+POLISH** | Polished R3F site, FastAPI/Docker TTS proxy and CI. Off-niche, but it shows you ship. Remove the CV PDF and add a root README. |
| 4 | 3D-Configurator-Website | pub | 1 | 2 | 1 | 1 | 1 | 6 | **MERGE** (into Morphix) | Overlaps Morphix. 10,988 `node_modules` files are committed. Fold it into Morphix's story, or untrack `node_modules` and archive it. |
| 5 | pergola-configurator-app | priv | 1 | ? | ? | ? | ? | – | **MERGE** (into Morphix) | Not inspected (outside access scope). The name suggests the same product as Morphix. Keep it private. |
| 6 | Python-Scripts-for-Data-Analysis | pub | 2 | 0 | 0 | 0 | 2 | 4 | **PRIVATE-REVIEW → REPLACE** | A one-file notebook export with an employer path. The new showcase replaces it. |
| 7 | SQL-Querries | pub | 2 | 0 | 1 | 0 | 0 | 3 | **PRIVATE-REVIEW** | Employer SQL. It can't be shown. The slow-query showcase (#3) replaces it. |
| 8 | dev_portfolio | pub | 2 | 1 | 1 | 2 | 0 | 6 | **PRIVATE-REVIEW** | Has a decent README, but it mixes employer SQL, a passwords file and bootcamp C#. Replace it with the profile README. |
| 9 | prod_app | priv | 2 | 1 | 1 | 0 | 0 | 4 | **PRIVATE-REVIEW** | Employer reconciliation app. Keep it private. A synthetic "file reconciliation" showcase could replace it later. |
| 10 | AI-asisstant | pub | 0 | 1 | 0 | 0 | 1 | 2 | **ARCHIVE-HIDE** | Three.js model viewer, not an AI assistant, so the name misleads. 1,789 `node_modules` files are committed. |
| 11 | -Dhot_ThreeJS | pub | 0 | 1 | 0 | 0 | 1 | 2 | **ARCHIVE-HIDE** (check client) | Three.js viewer with 1,605 `node_modules` files committed. If "Dhot" is a client, make it private. |
| 12 | three_js_tests | pub | 0 | 0 | 0 | 0 | 2 | 2 | **ARCHIVE-HIDE** | Scratch experiments. `public/` contains a "Dhot PDP" image. |
| 13 | digit_scroller_feature | pub | 0 | 1 | 1 | 0 | 2 | 4 | **ARCHIVE-HIDE** | A single HTML file. Fine as a snippet, but it's noise for data buyers. |
| 14 | CodeFinalProject | pub | 0 | 1 | 1 | 1 | 1 | 4 | **ARCHIVE-HIDE** | 2021 bootcamp React final project. |
| 15 | API---HttpClient-Sample | pub | 1 | 0 | 0 | 0 | 0 | 1 | **ARCHIVE-HIDE** | C# sample with committed DLLs and 1,600 SVGs. |
| 16 | ConsoleProject | pub | 0 | 0 | 1 | 0 | 1 | 2 | **ARCHIVE-HIDE** | Bootcamp C# console app with build outputs committed. |
| 17 | classWork | pub | 0 | 0 | 0 | 0 | 1 | 1 | **ARCHIVE-HIDE** | Bootcamp classwork. |
| 18 | homeWorks | pub | 0 | 0 | 0 | 0 | 1 | 1 | **ARCHIVE-HIDE** | Only PNGs. |
| 19 | 02-09-2021 | pub | 0 | 0 | 0 | 0 | 1 | 1 | **ARCHIVE-HIDE** | One-day HTML exercise. |
| 20 | B2C-BI-Request-Interface-Python- | pub | 2 | 0 | 0 | 0 | 0 | 2 | **ARCHIVE-HIDE** | Empty repo with a promising name. An empty repo hurts more than no repo. |
| 21 | SkaterBackend | pub | 0 | 0 | 0 | 0 | 0 | 0 | **ARCHIVE-HIDE** | Empty. |
| 22 | My-project | priv | 0 | 0 | 0 | 0 | 0 | 0 | **ARCHIVE-HIDE** | Empty, private. |
| 23 | portfolio | priv | 1 | 0 | 0 | 0 | 0 | 1 | **ARCHIVE-HIDE** | Older copy of the dev_portfolio content, including DB scripts. Keep it private. |
| 24 | parvizbagirov | priv | 0 | 1 | 1 | 0 | 0 | 2 | **ARCHIVE-HIDE** | Client website (C#). Keep it private. |

Forks (not scored): `datacompy` (upstream fork, untouched; archive or delete the fork),
`streamlit-sales-dashboard-with-userauthentication` (tutorial fork; archive, because it reads
like someone else's work).

## What this means for Upwork

- **No public repo today proves the core niche** (messy files → report, API/CRM sync, slow
  SQL) safely. The SQL and reconciliation work that exists is employer code and must go
  private. That is why Phase 3 builds a synthetic showcase from scratch.
- Best existing proof: `holy_water_task` (pipeline) and `Morphix` (ERPNext sync and a live
  site). Both need a README before they can be linked in proposals.
- After the cleanup, the public profile should show about 6 strong pinned repos and very
  little noise. See `MANUAL_CHECKLIST.md`.
