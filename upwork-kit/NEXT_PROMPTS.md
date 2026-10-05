# Next prompts (run in this order; don't run them from here)

Each prompt is paste-ready for a new Claude Code cloud session with that repo attached. They go best-first by Upwork value. The dollar figures are **estimates** I can't measure, so check `/usage` yourself.

Only 3 repos scored KEEP+POLISH in AUDIT.md, so there are 3 polish prompts plus showcase #2.

**Before prompt 1:** do the security items in MANUAL_CHECKLIST.md §0 (rotate the keys and make the employer-code repos private). The prompts don't do that for you.

## 1. holy_water_task: Airflow → BigQuery pipeline (best niche fit)
*Cost: estimate $5-7*

````text
Repo: Javidan1997/holy_water_task (branch: portfolio-polish)
Portfolio goal: Upwork proof for "ETL pipeline", "Airflow", "BigQuery", "SQL reporting" jobs. Pinned repo #3 and portfolio item 3.

First, create `.claude/skills/repo-polish/SKILL.md` in the repo with exactly this content, then follow it:

<<<SKILL
---
name: repo-polish
description: Make an existing GitHub repo client-ready as Upwork proof - README, license, .gitignore, tests, CI, runnable setup, description/topics, no secrets. Use when polishing a repo for a portfolio. No large refactors.
---

# Repo polish

Goal: a client lands on the repo and in 30 seconds sees the problem, the result and
that it runs. Stop when presentable. Don't rewrite working code.

## Order of work
1. **Safety scan first.** Grep for keys, passwords, tokens, `.env`, personal files
   (CVs, client PDFs), employer names. If found: stop, list them, recommend rotating
   the secret and removing it from history. Don't ship.
2. **README** (top to bottom):
   - One-line outcome in client language
   - Problem -> Solution (3-5 bullets)
   - Mermaid architecture diagram (`flowchart LR`)
   - Stack (one line)
   - Setup (copy-paste, <=5 commands)
   - Usage (one example command plus its output)
   - Results: only numbers printed by a real run, labelled synthetic where relevant
   - Screenshot or GIF if there is a UI
   - "Not included" / limitations
3. **LICENSE** (MIT unless the owner says otherwise).
4. **.gitignore** for the stack: untrack `node_modules/`, `dist/`, `__pycache__/`,
   `.env`, `*.pkl`, build outputs (`git rm -r --cached <path>`).
5. **Runnable setup:** `requirements.txt`/`pyproject.toml` or `package.json` scripts,
   `.env.example` with placeholder values, and a Makefile or npm scripts for
   `demo`/`test`.
6. **Tests:** at least 3 meaningful pytest/vitest tests on core logic. Fast (<30 s), no
   network.
7. **CI:** `.github/workflows/ci.yml` running lint plus tests on push/PR. Don't claim
   it passes until a run is green.
8. **Repo metadata (manual, list for owner):** description (<=120 chars, outcome
   first), 4-8 topics, website link if deployed.

## Rules
- PR on a branch only. Never push to main. No renames, deletes or visibility changes;
  recommend them instead.
- Max 2 attempts on a failing test, then log it in the PR body and move on.
- No fabricated metrics. No employer code or data. Synthetic data only.
- Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy,
  world-class, holistic.

## Done when
- [ ] README has outcome, diagram, setup, usage, results
- [ ] Fresh clone -> setup -> demo works with the documented commands
- [ ] Tests pass locally; CI file present
- [ ] No secrets or personal files tracked
- [ ] Suggested description/topics listed in PR body
SKILL>>>

Specific fixes from my audit:
1. SECURITY FIRST: `Apache Airflow DAG/weather_dag.py` hardcodes a weather API key and a GCP project id. Move both to environment variables / Airflow Variables (`OPENWEATHER_API_KEY`, `GCP_PROJECT_ID`) and add `.env.example`. In the PR body, tell me to revoke the old key (it stays in git history).
2. Replace hardcoded `/home/javidanja/...` paths with a configurable data dir.
3. `DummyOperator` → `EmptyOperator`; `python_operator` imports → `airflow.operators.python`. Don't change the DAG's behaviour.
4. Pull the pure transform (API JSON → rows / top-N) into a small module that doesn't import Airflow, and add 3-5 pytest tests on it using a saved sample JSON fixture (no network, no Airflow install in CI).
5. README: one-line outcome, Mermaid (API → DAG → GCS → BigQuery → LTV/funnel SQL), what each SQL file answers (LTV, conversion rate, funnel), setup for local Airflow (docker compose or `airflow standalone`, documented only, don't run), sample outputs = the CSVs already in the repo (label them "sample output from a 2022 run"), "Not included". Note it was a 2022 technical assessment.
6. Add LICENSE (MIT), .gitignore, requirements.txt (pin apache-airflow + google providers for docs; CI installs only test deps), CI running pytest + `python -m py_compile` on the DAG.
7. In the PR body, list the suggested description and topics: "Airflow DAG: weather API → GCS → BigQuery, plus LTV and conversion-funnel SQL." topics: airflow bigquery gcp etl sql data-engineering.
Folder names contain spaces; leave them (no renames).

HARD RULES (repeat from my master prompt):
- Credit: use ONLY the one-time promotional cloud-session credit. Nothing needing paid usage or purchases. Run /usage at the start and end and report exactly what it shows; if it doesn't show the promo balance, say so once; never guess numbers. Any dollar figure is labelled "estimate". Stop at once, commit what's done and tell me if you see paid usage, spend beyond my plan, or a nearly exhausted promo credit.
- Confidentiality: never use code, schemas, table names, data or internal names from GR8 Tech, SOCAR, Azercell or eManat. Synthetic data only, fictional company. Flag anything that looks like employer code.
- Git: branch + PR only, never push to main, 1 PR. Do NOT delete, archive, rename or change visibility of the repo. Don't delete personal or client files; list them in the PR body for me. Untracking generated folders (node_modules, dist, __pycache__) is fine.
- No fabrication: no clients or metrics beyond what a real run prints. Max 2 attempts on any failing test, then log it and move on. No large refactors. Stop when presentable.
- Writing: first person, plain, short. Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy, world-class, holistic. No email/phone in READMEs; link my Upwork profile https://www.upwork.com/freelancers/~01b44b432ab6741528 instead.
- Don't ask me questions; use TODO placeholders and continue.
````

## 2. Morphix: configurator site + ERPNext CRM sync
*Cost: estimate $6-8*

````text
Repo: Javidan1997/Morphix (branch: portfolio-polish)
Portfolio goal: Upwork proof for "CRM integration", "ERPNext/API integration", "lead sync" jobs. Pinned repo #2 and portfolio item 2.

First, create `.claude/skills/repo-polish/SKILL.md` in the repo with exactly this content, then follow it:

<<<SKILL
---
name: repo-polish
description: Make an existing GitHub repo client-ready as Upwork proof - README, license, .gitignore, tests, CI, runnable setup, description/topics, no secrets. Use when polishing a repo for a portfolio. No large refactors.
---

# Repo polish

Goal: a client lands on the repo and in 30 seconds sees the problem, the result and
that it runs. Stop when presentable. Don't rewrite working code.

## Order of work
1. **Safety scan first.** Grep for keys, passwords, tokens, `.env`, personal files
   (CVs, client PDFs), employer names. If found: stop, list them, recommend rotating
   the secret and removing it from history. Don't ship.
2. **README** (top to bottom):
   - One-line outcome in client language
   - Problem -> Solution (3-5 bullets)
   - Mermaid architecture diagram (`flowchart LR`)
   - Stack (one line)
   - Setup (copy-paste, <=5 commands)
   - Usage (one example command plus its output)
   - Results: only numbers printed by a real run, labelled synthetic where relevant
   - Screenshot or GIF if there is a UI
   - "Not included" / limitations
3. **LICENSE** (MIT unless the owner says otherwise).
4. **.gitignore** for the stack: untrack `node_modules/`, `dist/`, `__pycache__/`,
   `.env`, `*.pkl`, build outputs (`git rm -r --cached <path>`).
5. **Runnable setup:** `requirements.txt`/`pyproject.toml` or `package.json` scripts,
   `.env.example` with placeholder values, and a Makefile or npm scripts for
   `demo`/`test`.
6. **Tests:** at least 3 meaningful pytest/vitest tests on core logic. Fast (<30 s), no
   network.
7. **CI:** `.github/workflows/ci.yml` running lint plus tests on push/PR. Don't claim
   it passes until a run is green.
8. **Repo metadata (manual, list for owner):** description (<=120 chars, outcome
   first), 4-8 topics, website link if deployed.

## Rules
- PR on a branch only. Never push to main. No renames, deletes or visibility changes;
  recommend them instead.
- Max 2 attempts on a failing test, then log it in the PR body and move on.
- No fabricated metrics. No employer code or data. Synthetic data only.
- Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy,
  world-class, holistic.

## Done when
- [ ] README has outcome, diagram, setup, usage, results
- [ ] Fresh clone -> setup -> demo works with the documented commands
- [ ] Tests pass locally; CI file present
- [ ] No secrets or personal files tracked
- [ ] Suggested description/topics listed in PR body
SKILL>>>

Specific fixes from my audit:
1. There's no root README. Write one: a one-line outcome ("Website inquiries land in ERPNext as deduplicated leads, with optional draft quotations"), a Mermaid diagram (visitor → configurator → Supabase inquiries + admin inbox → `api/erpnext-sync.js` → ERPNext Lead (find-by-email, then create) → Quotation), the stack, setup (`npm ci`, `npm run dev`, required env vars from `.env.example`), deploy notes (GitHub Pages / Vercel, as already configured), screenshots placeholders (TODO), "Not included".
2. Tests: add 4-6 tests for `api/erpnext-sync.js` using `node --test` (no new heavy deps) with `fetch` mocked: lead payload mapping, existing-lead reuse (no duplicate create), missing-env error message, quotation-disabled path. Add an `npm test` script. Small, testability-only refactors (e.g. exporting helpers) are fine; don't change behaviour.
3. CI: add a test job (or step) to the existing workflow running `npm ci && npm test && npm run build`. Don't touch the deploy job.
4. Safety: `.env.production` contains a Supabase anon key (intended public, RLS-limited). Confirm that RLS migrations in `supabase/migrations` restrict anon to insert-only, and say what you found in the PR body. Don't delete `src/assets/Pergolast Quote - ….pdf`; flag it in the PR body as a possible customer document for me to review.
5. Clutter: the `CONFIGURO-*.md` planning docs at the root. Don't move them; suggest moving them to `docs/` in the PR body.
6. License: this may be commercial. Do NOT add an open-source license; add a TODO line in the README ("License: TODO, owner to decide").
7. In the PR body, list the description and topics: "3D product configurator site; inquiries sync to ERPNext as leads and quotations." topics: erpnext crm-integration threejs react supabase api-integration.

HARD RULES (repeat from my master prompt):
- Credit: use ONLY the one-time promotional cloud-session credit. Nothing needing paid usage or purchases. Run /usage at the start and end and report exactly what it shows; if it doesn't show the promo balance, say so once; never guess numbers. Any dollar figure is labelled "estimate". Stop at once, commit what's done and tell me if you see paid usage, spend beyond my plan, or a nearly exhausted promo credit.
- Confidentiality: never use code, schemas, table names, data or internal names from GR8 Tech, SOCAR, Azercell or eManat. Synthetic data only, fictional company. Flag anything that looks like employer code.
- Git: branch + PR only, never push to main, 1 PR. Do NOT delete, archive, rename or change visibility of the repo. Don't delete personal or client files; list them in the PR body for me. Untracking generated folders (node_modules, dist, __pycache__) is fine.
- No fabrication: no clients or metrics beyond what a real run prints. Max 2 attempts on any failing test, then log it and move on. No large refactors. Stop when presentable.
- Writing: first person, plain, short. Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy, world-class, holistic. No email/phone in READMEs; link my Upwork profile https://www.upwork.com/freelancers/~01b44b432ab6741528 instead.
- Don't ask me questions; use TODO placeholders and continue.
````

## 3. mimo-robot: 3D product website + FastAPI TTS
*Cost: estimate $5-7*

````text
Repo: Javidan1997/mimo-robot (branch: portfolio-polish, created from main after the upwork-portfolio-kit PR is merged or closed)
Portfolio goal: secondary proof that I ship polished front-end + API work (React Three Fiber site, FastAPI/Docker TTS proxy). Pinned repo #4. It's not a data project, so keep the effort small.

First, create `.claude/skills/repo-polish/SKILL.md` in the repo with exactly this content, then follow it:

<<<SKILL
---
name: repo-polish
description: Make an existing GitHub repo client-ready as Upwork proof - README, license, .gitignore, tests, CI, runnable setup, description/topics, no secrets. Use when polishing a repo for a portfolio. No large refactors.
---

# Repo polish

Goal: a client lands on the repo and in 30 seconds sees the problem, the result and
that it runs. Stop when presentable. Don't rewrite working code.

## Order of work
1. **Safety scan first.** Grep for keys, passwords, tokens, `.env`, personal files
   (CVs, client PDFs), employer names. If found: stop, list them, recommend rotating
   the secret and removing it from history. Don't ship.
2. **README** (top to bottom):
   - One-line outcome in client language
   - Problem -> Solution (3-5 bullets)
   - Mermaid architecture diagram (`flowchart LR`)
   - Stack (one line)
   - Setup (copy-paste, <=5 commands)
   - Usage (one example command plus its output)
   - Results: only numbers printed by a real run, labelled synthetic where relevant
   - Screenshot or GIF if there is a UI
   - "Not included" / limitations
3. **LICENSE** (MIT unless the owner says otherwise).
4. **.gitignore** for the stack: untrack `node_modules/`, `dist/`, `__pycache__/`,
   `.env`, `*.pkl`, build outputs (`git rm -r --cached <path>`).
5. **Runnable setup:** `requirements.txt`/`pyproject.toml` or `package.json` scripts,
   `.env.example` with placeholder values, and a Makefile or npm scripts for
   `demo`/`test`.
6. **Tests:** at least 3 meaningful pytest/vitest tests on core logic. Fast (<30 s), no
   network.
7. **CI:** `.github/workflows/ci.yml` running lint plus tests on push/PR. Don't claim
   it passes until a run is green.
8. **Repo metadata (manual, list for owner):** description (<=120 chars, outcome
   first), 4-8 topics, website link if deployed.

## Rules
- PR on a branch only. Never push to main. No renames, deletes or visibility changes;
  recommend them instead.
- Max 2 attempts on a failing test, then log it in the PR body and move on.
- No fabricated metrics. No employer code or data. Synthetic data only.
- Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy,
  world-class, holistic.

## Done when
- [ ] README has outcome, diagram, setup, usage, results
- [ ] Fresh clone -> setup -> demo works with the documented commands
- [ ] Tests pass locally; CI file present
- [ ] No secrets or personal files tracked
- [ ] Suggested description/topics listed in PR body
SKILL>>>

Specific fixes from my audit:
1. There's no root README (only `website/README.md`). Add a short root README: what Mimo is, the live link (TODO_LINK_LIVE_SITE), 2-3 screenshot placeholders, a Mermaid diagram of what exists today (Vite/R3F site → Edge TTS proxy on Render) and, clearly marked "planned", the hardware/backend architecture from CLAUDE.md. Be honest that the hardware is at the planning stage.
2. Don't delete `Javidan-Abdullayev 2.pdf` (my CV at the repo root); list it in the PR body as "remove if you don't want it public".
3. Tests: if `website/` has pure logic (mood config, helpers), add 3 vitest tests and an `npm test` script; otherwise skip and say so. Add a CI build check (`npm ci && npm run build` in `website/`) without touching the existing deploy workflow.
4. Add a LICENSE (MIT for code; state that the 3D models and concept images are all rights reserved, TODO owner to confirm).
5. If `showcase/` still exists, leave it alone (it gets extracted separately).
6. In the PR body, list the description and topics: "Interactive 3D website for a desktop AI pet robot, with a FastAPI TTS service." topics: react-three-fiber threejs fastapi docker vite.

HARD RULES (repeat from my master prompt):
- Credit: use ONLY the one-time promotional cloud-session credit. Nothing needing paid usage or purchases. Run /usage at the start and end and report exactly what it shows; if it doesn't show the promo balance, say so once; never guess numbers. Any dollar figure is labelled "estimate". Stop at once, commit what's done and tell me if you see paid usage, spend beyond my plan, or a nearly exhausted promo credit.
- Confidentiality: never use code, schemas, table names, data or internal names from GR8 Tech, SOCAR, Azercell or eManat. Synthetic data only, fictional company. Flag anything that looks like employer code.
- Git: branch + PR only, never push to main, 1 PR. Do NOT delete, archive, rename or change visibility of the repo. Don't delete personal or client files; list them in the PR body for me. Untracking generated folders (node_modules, dist, __pycache__) is fine.
- No fabrication: no clients or metrics beyond what a real run prints. Max 2 attempts on any failing test, then log it and move on. No large refactors. Stop when presentable.
- Writing: first person, plain, short. Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy, world-class, holistic. No email/phone in READMEs; link my Upwork profile https://www.upwork.com/freelancers/~01b44b432ab6741528 instead.
- Don't ask me questions; use TODO placeholders and continue.
````

## 4. Showcase #2: idempotent webhook sync service (new repo)
*Cost: estimate $8-12 (rough; it's a new build)*

````text
Before you paste this: create an EMPTY public repo `Javidan1997/idempotent-webhook-sync` with "Add a README" ticked, so `main` exists.

Repo: Javidan1997/idempotent-webhook-sync (branch: build-showcase)
Portfolio goal: Upwork proof for "sync Shopify orders to CRM", "webhook integration", "API integration Python". Pinned repo #5.

First, create `.claude/skills/showcase-builder/SKILL.md` in the repo with exactly this content, then follow it:

<<<SKILL
---
name: showcase-builder
description: Build a small, finished portfolio demo that mirrors a common Upwork job post - synthetic data, tests, Docker, CI, and a client-language README. Use when creating a new showcase project.
---

# Showcase builder

Goal: one small project a buyer can understand in 90 seconds and run in one command.
Finished beats big.

## Pick the job post first
Start from a phrase buyers actually post ("clean and merge messy CSV/Excel files",
"automate a weekly report", "sync Shopify/CRM data", "slow SQL query"). The README's
first line answers that post.

## Caps (budget control)
- <=15 source files, <=50k synthetic rows
- `make demo` under 60 s, `make test` under 30 s
- No external services, no paid APIs, no LLM calls, no network in tests
- Self-contained folder (`showcase/<name>/`) so it can be extracted with `git subtree`

## Required pieces
1. **Seeded synthetic data generator.** A fictional company, deterministic seed, and
   realistic mess (bad headers, mixed dates, duplicates, nulls, encodings, missing/late
   inputs).
2. **Config over code:** a YAML mapping per source.
3. **Validation** (Pandera or pydantic) with reason codes for rejected rows.
4. **Outputs a client can open:** an Excel report, an exceptions file, and a run log.
5. **Safe re-runs:** idempotent output paths; the same input gives the same output.
6. **Alert hook:** console by default; email/Slack stubs behind env vars.
7. **Makefile** (`demo`, `test`, `clean`), **Dockerfile**, **pytest**,
   **GitHub Actions CI**.
8. **Sample outputs committed** (report + exceptions) for screenshots.

## README layout
1. One-line outcome in client language
2. Mermaid architecture diagram
3. 90-second quickstart (`make demo` or `docker run`)
4. Results table copied from the real run, labelled **synthetic**
5. How your data would plug in
6. What I'd ask in discovery
7. Not included

## Rules
- Never claim CI passes unless a run went green. Say "tests pass locally" otherwise.
- Max 2 attempts on a failing test, then log it and move on.
- No employer code, schemas, names or data. No fabricated metrics.
- Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy,
  world-class, holistic.
SKILL>>>

Build (see upwork-kit/PLAN.md #2 in Javidan1997/mimo-robot for context):
- A fictional shop ("Fernhill Coffee Co.", the same fictional company as showcase #1) sends Shopify-like order webhooks. A FastAPI receiver verifies the HMAC signature, stores the event under an idempotency key (`event_id`) in Postgres (a unique constraint, so duplicates return 200 and do nothing), and upserts it into a fake local CRM table through a worker with retries and exponential backoff. Failures go to a dead-letter table.
- A replay script sends 2,000 synthetic events, including 10% duplicates, 5% out-of-order updates and 2% that fail the first time, then prints a reconciliation table (source vs CRM counts, missing, mismatched). That table goes in the README as **synthetic** results.
- A nightly reconciliation command plus a cron example; `docker compose up` (api + postgres); Makefile (`make demo`, `make test`); pytest with SQLite or a Postgres service container in GitHub Actions; tests under 30 s, demo under 60 s.
- README per the skill: one-line outcome, Mermaid, 90-second quickstart, Results (printed by the real run, labelled synthetic), how your data plugs in (real Shopify/HubSpot/Pipedrive webhooks), discovery questions, "Not included".
- Caps: ≤ 15 source files, no external services, no paid APIs, no LLM calls. Don't claim CI passes unless a run is green.

HARD RULES (repeat from my master prompt):
- Credit: use ONLY the one-time promotional cloud-session credit. Nothing needing paid usage or purchases. Run /usage at the start and end and report exactly what it shows; if it doesn't show the promo balance, say so once; never guess numbers. Any dollar figure is labelled "estimate". Stop at once, commit what's done and tell me if you see paid usage, spend beyond my plan, or a nearly exhausted promo credit.
- Confidentiality: never use code, schemas, table names, data or internal names from GR8 Tech, SOCAR, Azercell or eManat. Synthetic data only, fictional company. Flag anything that looks like employer code.
- Git: branch + PR only, never push to main, 1 PR. Do NOT delete, archive, rename or change visibility of the repo. Don't delete personal or client files; list them in the PR body for me. Untracking generated folders (node_modules, dist, __pycache__) is fine.
- No fabrication: no clients or metrics beyond what a real run prints. Max 2 attempts on any failing test, then log it and move on. No large refactors. Stop when presentable.
- Writing: first person, plain, short. Banned words: leverage, robust, seamless, cutting-edge, passionate, synergy, world-class, holistic. No email/phone in READMEs; link my Upwork profile https://www.upwork.com/freelancers/~01b44b432ab6741528 instead.
- Don't ask me questions; use TODO placeholders and continue.
````
