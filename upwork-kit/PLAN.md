# Demand-led showcase plan

The audit found no safe public proof for the core niche, so the default order stands.

Scoring is 0-3 per criterion; higher is better (for **effort**, 3 = cheapest to build).

| # | Showcase | Job-post match | Visual proof | Build effort | CI-friendly | Total |
|---|---|---|---|---|---|---|
| 1 | **Messy files → validated weekly report** | 3 | 3 | 3 | 3 | **12** |
| 2 | **Idempotent webhook sync service** | 3 | 2 | 2 | 2 | **9** |
| 3 | **Slow-query case study** | 2 | 2 | 3 | 2 | **9** |
| later | dbt + DuckDB mini-warehouse | 2 | 2 | 2 | 3 | 9 |

## 1. Messy files → validated weekly report (build now)
- **Job posts it answers:** "clean and merge messy CSV/Excel files", "automate a weekly
  report", "Excel reporting automation", "data cleaning Python".
- **What it shows:** per-source YAML mappings, Pandera validation, an exceptions file with
  reason codes, KPIs, an Excel report, a run log, safe re-runs, an alert hook, and a cron
  example.
- **Visual proof:** a formatted Excel report and an exceptions sheet you can screenshot.
- **Why first:** it is the most common small fixed-price data job, it runs offline in
  seconds, and it needs no services in CI.

## 2. Idempotent webhook sync service (next)
- **Job posts:** "sync Shopify orders to CRM", "webhook integration", "API integration
  Python", "HubSpot/Pipedrive sync".
- **What it shows:** FastAPI receiver, HMAC signature check, an idempotency key table in
  Postgres, retries with backoff, a dead-letter table, and a nightly reconciliation report
  (source vs target counts and diffs). It uses a fake "Shopify-like" source and a fake CRM
  (both local).
- **CI:** Postgres as a GitHub Actions service container, or SQLite fallback for unit
  tests.
- **Effort:** medium (about 2x showcase 1).

## 3. Slow-query case study
- **Job posts:** "slow SQL query", "optimize PostgreSQL", "database performance".
- **What it shows:** about 50k synthetic rows, 3 bad queries, `EXPLAIN (ANALYZE, BUFFERS)`
  before and after, the indexes and rewrites used, and a timings table printed by the
  script (labelled synthetic).
- **CI:** Postgres service container, with a run under 30 s.
- **Risk:** at small row counts the timing gains look small. Lead with plan shape
  (Seq Scan → Index Scan, rows removed) over milliseconds.

## Later: dbt + DuckDB demo
A lightweight `dbt-duckdb` project (staging → marts, tests, docs site) on the same synthetic
company. It's cheap to run and good for "dbt developer" posts. Build it after #2 and #3.

## Skipped on purpose
Heavy Airflow, Spark and Iceberg demos. They need clusters or long runs, they are costly in CI,
and fewer small-business buyers post for them. Mention that experience in the overview
instead; it's CV-backed.
