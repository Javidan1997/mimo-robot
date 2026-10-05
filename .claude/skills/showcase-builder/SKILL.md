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
