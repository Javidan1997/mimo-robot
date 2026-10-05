# Upwork profile pack: Javidan Abdullayev

Profile: https://www.upwork.com/freelancers/~01b44b432ab6741528

> **Form limits:** I couldn't open your logged-in Upwork form from this session, so these
> limits are **assumptions to verify** when you paste: title ≤ 70 chars (used here),
> overview ≤ 5,000 chars, ≤ 15 skills, portfolio title ≤ 70 chars, Project Catalog title
> ≤ 75 chars. Character counts below were measured.
>
> **TODO before pasting:** confirm availability (10-20 h/week), time zone (UTC+4), and your
> hourly rate. Every price here is a **suggestion**.

---

## 1. Profile title options (pick one)

| # | Title | Chars |
|---|---|---|
| A | Data Engineer: Python & SQL Automation, ETL, Excel Reports, API Sync | 68 |
| B | Python Data Automation: Clean Messy Files, Weekly Reports, Fast SQL | 67 |
| C | ETL & Data Pipelines: Python, SQL, dbt, Airflow, Shopify/CRM Sync | 65 |

I'd use **A** for the main profile. It covers the most search terms. Use **C** for the
specialized profile.

---

## 2. Overview

The first two lines show before "more", so they carry the whole pitch.

```
I turn messy CSV/Excel files, slow SQL and disconnected tools (Shopify, CRMs, APIs) into automated pipelines and reports that run on schedule, so you stop fixing data by hand.
Data engineer with 5+ years in Python, SQL, dbt and Airflow. I've done freelance API and CRM integration work since 2022.

What I can take off your plate:
• Clean and merge messy CSV/Excel files from many sources into one validated dataset
• Automate a weekly or monthly report (Excel, Google Sheets, dashboard), with a list of every bad row and why it was rejected
• Fix slow SQL queries and reports (PostgreSQL, MS SQL Server, Oracle): EXPLAIN plans, indexes, rewrites
• Sync data between Shopify, CRMs, ERPs and your database through REST APIs and webhooks, without duplicates
• Build ETL/ELT pipelines with Python, dbt and Airflow on AWS or GCP, plus Docker, CI and monitoring

What you get with every project:
• Working code in your repo or account, with tests
• A README: how to run it, how to change it, what to do when it alerts
• Scheduling (cron, GitHub Actions, Airflow) and alerts when files are missing, late or wrong
• Re-runs are safe: running a job twice doesn't double your numbers
• A short handover call or Loom video

From my full-time data engineering work:
• Cut query times by about 50% by restructuring a 145 TB clickstream dataset
• Reconciled 30M+ records across systems
• Ran Airflow on Kubernetes with Spark and dbt ELT
• Built self-service analytics apps in Streamlit and Django

How I work:
1. A short discovery call. I ask for 2-3 real sample files, including a bad week.
2. A fixed-price proposal with a clear scope and a list of what's not included.
3. Small milestones, a working demo early, then the handover.

Stack: Python, SQL, pandas, dbt, Airflow, Spark, PostgreSQL, MS SQL Server, Oracle, Trino, StarRocks, Iceberg, AWS (S3, Athena, Glue, EKS), GCP, Docker, Kubernetes, Terraform, FastAPI, Flask, Django, Streamlit, Grafana, Prometheus.

Also: PhD candidate in AI, IEEE MetroXRAINE 2023 paper, IELTS 7.5.

Availability: project-based, part-time, about 10-20 hours a week (TODO confirm), UTC+4 (TODO confirm). I reply to messages within one working day.

Demo projects (synthetic data) are on my GitHub; links are in the portfolio section.
```

(2,255 chars, well under the assumed 5,000 limit. There's no email, phone or
outside-contact line, which Upwork's rules require.)

---

## 3. Skill tags (priority order, 15)

1. Data Engineering
2. Python
3. SQL
4. ETL Pipeline
5. Data Cleaning
6. Microsoft Excel
7. Automation
8. API Integration
9. PostgreSQL
10. pandas
11. dbt
12. Apache Airflow
13. CRM Integration (verify the exact tag; "Shopify" can replace it if you want e-commerce jobs)
14. Google Cloud Platform
15. Amazon Web Services

Pick whatever Upwork's autocomplete offers that is closest to each of these.

---

## 4. Specialized profile: "Data pipelines and automation"

**Title (65):** `ETL & Data Pipelines: Python, SQL, dbt, Airflow, Shopify/CRM Sync`

**Overview:**
```
I build small, reliable data pipelines for teams that are tired of copy-pasting between files and tools.
Typical jobs: merge messy CSV/Excel exports into one clean table, automate a weekly report, sync Shopify or CRM data to a database, or speed up a slow SQL report.

How a project usually looks:
• Week 1: map your sources, agree on the rules for bad data, and deliver a first run on your real files
• Week 2: scheduling, alerts, tests and documentation, then hand over

Every pipeline I hand over:
• validates input and writes an exceptions file with a reason for each rejected row
• can be re-run safely (no double counting)
• alerts you when a file is missing or late
• comes with a README and tests, so another developer can maintain it

5+ years as a data engineer (Python, SQL, dbt, Airflow, Spark, PostgreSQL, AWS/GCP), plus freelance API and CRM integration since 2022.
Project-based, part-time.
```
**Skills:** ETL Pipeline, Data Cleaning, Python, SQL, Automation, Microsoft Excel, API
Integration, PostgreSQL, dbt, Apache Airflow.
**Portfolio:** items 1 and 2 below.
**Hourly rate:** TODO (suggestion: put it a little above your main profile rate, because the
scope is narrower).

---

## 5. Portfolio items

### Item 1: Messy store files → validated weekly Excel report
- **Outcome:** Eight stores' CSV/Excel exports, each with different headers, date formats and
  encodings, become one weekly Excel report every Monday. Every rejected row is listed with
  its reason, and missing or late files trigger an alert.
- **Stack:** Python, pandas, Pandera, openpyxl, YAML config, pytest, Docker, GitHub Actions, cron
- **My role:** Solo: design, build, tests, docs. Synthetic data for a fictional company.
- **Screenshots to capture:**
  1. The Excel "Summary" sheet with the KPIs and the colour-coded source status
     (MISSING in red, LATE in yellow)
  2. The "By store" sheet with the bar chart
  3. The exceptions file, "Exceptions" sheet, showing reason codes next to the original values
  4. A terminal after `make demo` showing the results table, with `make rerun` → "No changes … Skipping"
  5. The README's architecture diagram
- **Link:** TODO_LINK_SHOWCASE_REPO (after the subtree extraction in MANUAL_CHECKLIST.md)

### Item 2: Website inquiries → ERPNext CRM leads and quotations
- **Outcome:** A 3D product configurator site sends every inquiry into ERPNext as a Lead. It
  looks up the email first, so there are no duplicate leads, and it can create a draft
  Quotation automatically. The sales team stops re-typing web leads.
- **Stack:** JavaScript, serverless API function, ERPNext REST API, Supabase, React, Three.js,
  GitHub Actions
- **My role:** Solo: built the site, the leads inbox and the CRM sync.
- **Screenshots to capture:**
  1. The configurator page
  2. The admin leads inbox
  3. The created Lead in ERPNext (blur any real customer data)
  4. `api/erpnext-sync.js` in the editor, showing the find-or-create logic
- **Link:** TODO_LINK_MORPHIX (polish first; see NEXT_PROMPTS #2). First check the customer
  quote PDF flagged in AUDIT.md.

### Item 3: Weather API → BigQuery pipeline with Airflow, plus LTV and funnel SQL
- **Outcome:** A daily Airflow DAG pulls weather API data, lands it in Cloud Storage and loads
  it into BigQuery. A set of SQL queries works out customer LTV and conversion funnels.
- **Stack:** Python, Apache Airflow, Google Cloud Storage, BigQuery, SQL
- **My role:** Solo (a technical assessment I completed in 2022).
- **Screenshots to capture:**
  1. The Airflow graph view of the DAG
  2. A BigQuery result of the LTV query
  3. The README diagram after the polish
- **Link:** TODO_LINK_HOLY_WATER (**rotate the leaked API key first**; see AUDIT.md and
  NEXT_PROMPTS #1)

---

## 6. Project Catalog drafts

### Catalog A: "I will find and fix your slow SQL query or report" (49 chars)

**Category:** Data Analysis & Testing → Database / SQL (TODO: check the exact category)

| | Starter | Standard | Advanced |
|---|---|---|---|
| **Suggested price** | $150 (suggestion) | $400 (suggestion) | $900 (suggestion) |
| **Delivery** | 3 days | 5 days | 10 days |
| **Queries in scope** | 1 query or view | Up to 3 queries | Up to 8 queries or 1 report pipeline |
| **What you get** | EXPLAIN ANALYZE before/after, rewrite and/or index script, short write-up | Starter + index plan for the tables involved + a test that the results match | Standard + a refactor of the report pipeline, a monitoring query, a 30-min walkthrough call |
| **Revisions** | 1 | 2 | 2 |

**Hard scope limits:**
- PostgreSQL, MS SQL Server or Oracle. Other engines on request.
- You give me read access to a non-production copy, or a dump of no more than 50 GB.
- No schema redesign, no data migration, and no application code changes beyond the SQL itself.
- I recommend server and config changes, but I don't apply them on production.
- If the cause is hardware or locking rather than the query, I tell you within 24 h and you
  can stop at the Starter price.

**Requirements from the buyer:** the query text, the engine and version, the current runtime,
row counts for the tables involved, and read access or a dump.

### Catalog B: "I will turn your messy CSV/Excel files into an automated weekly report" (70 chars; if the limit turns out lower, use "I will automate a weekly report from your messy CSV/Excel files", which is 63)

| | Starter | Standard | Advanced |
|---|---|---|---|
| **Suggested price** | $250 (suggestion) | $600 (suggestion) | $1,400 (suggestion) |
| **Delivery** | 4 days | 7 days | 14 days |
| **Sources** | Up to 3 files with the same layout | Up to 6 sources, different layouts | Up to 12 sources, plus 1 API or database |
| **What you get** | Cleaning + merge script, one Excel output, a README | Starter + validation rules, an exceptions file with reasons, KPIs, scheduling (cron or Task Scheduler) | Standard + alerts (email or Slack), Docker, tests, CI, output to Google Sheets or a database, a handover call |
| **Revisions** | 1 | 2 | 3 |

**Hard scope limits:**
- Up to 1M rows a week in total. Above that, we scope it separately.
- One report layout. Extra layouts are extras.
- Runs on your machine, server or GitHub Actions. I don't host it.
- No dashboard build. Excel or Google Sheets output only (a dashboard is a separate project).
- Your source formats need to stay stable. A new source after delivery is an add-on.

**Requirements from the buyer:** 2-3 real example files for each source, including a bad
one; the report you make today (even a screenshot); who receives it and when.

---

## 7. Proposal proof snippets (≤ 60 words each)

**1. Messy files / weekly report (53 words)**
> You need several Excel exports merged into one clean weekly report. I built exactly that as
> a demo: 8 messy sources with different headers, dates and encodings, cleaned and validated,
> with an exceptions list explaining every rejected row: TODO_LINK_SHOWCASE_REPO. My first
> step would be mapping your files. Could you share two real examples?

**2. Slow SQL (54 words)**
> Slow reports are usually 1-2 queries doing far more work than they need to. I'd start with
> EXPLAIN ANALYZE on your slowest query and send you a short before/after note. In my
> full-time role I cut query times by about 50% by restructuring a 145 TB dataset. Which
> database and version are you on?

**3. Shopify / CRM sync (55 words)**
> The hard part of a sync is not the API calls. It's duplicates and missed updates. My
> ERPNext integration checks for an existing lead before creating one, and I make every sync
> safe to re-run: TODO_LINK_MORPHIX. I'd start by listing which fields move in which
> direction. Is Shopify or the CRM the source of truth?

**4. ETL pipeline (57 words)**
> I've built pipelines from a single Airflow DAG (API → Cloud Storage → BigQuery:
> TODO_LINK_HOLY_WATER) up to Airflow on Kubernetes with Spark and dbt at work. For your
> project I'd keep it as simple as your data allows, with tests, alerts and safe re-runs, and
> document it so you're not dependent on me. What runs it today?

---

## 8. 90-second screen-recording script (showcase #1)

Record at 1080p. Use a large terminal font, and have the Excel files closed until they're
needed.

| Time | Screen | Say |
|---|---|---|
| 0:00-0:10 | README top | "Lots of businesses get weekly CSV and Excel files from stores, suppliers or tools, and every file is different. This turns them into one clean weekly report automatically." |
| 0:10-0:25 | `landing/2026-W40/` in the file explorer. Open `uptown_export.csv` (semicolons, German headers) and `AIRPORT_SALES_W40.csv` (dollar signs, mixed dates) | "Here's a synthetic week from a fictional coffee chain. Different headers, date formats, encodings, duplicates. One store didn't send its file, and another sent it late." |
| 0:25-0:35 | `config/sources.yaml`, scroll to one block | "Each source gets a small mapping. A new store is a config change, not code." |
| 0:35-0:50 | Terminal: `make demo` | "One command. It reads everything, validates every row, and builds the report in a couple of seconds. You can see the alerts: Mall is missing, Station is late." |
| 0:50-1:05 | Excel: Summary sheet, then the By store chart | "This is what the manager opens on Monday: totals, revenue by store and by day, and the status of every input file." |
| 1:05-1:18 | Exceptions file | "And this is the part people like most: every rejected row, the row number in the original file, and why. Duplicates, unknown products, typo'd prices. Store managers can fix it at the source." |
| 1:18-1:25 | Terminal: `make rerun` | "Re-running is safe. No changes means no new report and no double counting." |
| 1:25-1:30 | README "How your data would plug in" | "If your reporting looks like this, send me two example files and I'll show you what this would look like for you." |

(No contact details are spoken or shown. The link lives in the Upwork portfolio item.)
