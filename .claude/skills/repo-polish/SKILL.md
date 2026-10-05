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
