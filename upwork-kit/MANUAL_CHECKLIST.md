# Manual checklist (things only you can do)

Work through it top to bottom. The security items come first because the rest is pointless
while employer code is public.

## 0. Security and confidentiality (today)
- [ ] Make **`SQL-Querries`** private (Azercell/eManat SQL). Settings → Danger Zone → Change visibility.
- [ ] Make **`dev_portfolio`** private (employer SQL, `platform and passwords.txt`, DB scripts).
- [ ] Make **`Python-Scripts-for-Data-Analysis`** private (eMANAT path).
- [ ] **Rotate** every credential that could appear in `dev_portfolio`, `portfolio` or
      `prod_app` (DB passwords and connection strings).
- [ ] Revoke the weather API key hardcoded in `holy_water_task/Apache Airflow DAG/weather_dag.py`.
- [ ] If anything should never have been public, scrub it from history before re-publishing:
      `pip install git-filter-repo && git filter-repo --path "<file>" --invert-paths`, then force-push.
      Do this on your own machine, after a backup.
- [ ] `mimo-robot`: remove `Javidan-Abdullayev 2.pdf` (your CV) if you don't want it public.
- [ ] `Morphix`: check `src/assets/Pergolast Quote - ….pdf` isn't a real customer's quote.
- [ ] `-Dhot_ThreeJS` / `three_js_tests`: if "Dhot" is a client, make them private.

## 1. Clean up the profile (archive, don't delete)
Archive these: Settings → Archive this repository. Then make them private if you don't want
them visible at all.
- [ ] `AI-asisstant`, `-Dhot_ThreeJS`, `three_js_tests`, `digit_scroller_feature`
- [ ] `CodeFinalProject`, `API---HttpClient-Sample`, `ConsoleProject`, `classWork`, `homeWorks`, `02-09-2021`
- [ ] `B2C-BI-Request-Interface-Python-`, `SkaterBackend` (both empty)
- [ ] Forks: `datacompy`, `streamlit-sales-dashboard-with-userauthentication`
- [ ] `3D-Configurator-Website`: merge its story into Morphix, or archive it

## 2. Extract the showcase into its own public repo
After the `upwork-portfolio-kit` PR is merged into `main` in `mimo-robot`:

```bash
# 1) On GitHub, create an EMPTY public repo, e.g. Javidan1997/messy-files-weekly-report
#    (no README, no license; the split brings the files).
# 2) Locally:
git clone https://github.com/Javidan1997/mimo-robot.git && cd mimo-robot
git subtree split --prefix=showcase/weekly-report -b weekly-report-export
git push https://github.com/Javidan1997/messy-files-weekly-report.git weekly-report-export:main
```
The folder's own `.github/workflows/ci.yml` becomes the new repo's CI. Then:
- [ ] Check the Actions tab shows a green run before you claim "CI passing" anywhere.
- [ ] Add an MIT `LICENSE` from GitHub's "Add file → Create new file → LICENSE" template.
- [ ] Optionally remove `showcase/` from `mimo-robot` afterwards; it doesn't belong there long-term.

## 3. Repo descriptions and topics (About ⚙ on each repo page)

| Repo | Description | Topics |
|---|---|---|
| messy-files-weekly-report | Messy CSV/Excel files → validated weekly Excel report with exceptions, alerts and safe re-runs. Synthetic demo. | `etl` `data-cleaning` `excel` `pandas` `pandera` `automation` `python` `reporting` |
| Morphix | 3D product configurator site; inquiries sync to ERPNext as leads and quotations. | `erpnext` `crm-integration` `threejs` `react` `supabase` `api-integration` |
| holy_water_task | Airflow DAG: weather API → GCS → BigQuery, plus LTV and conversion-funnel SQL. | `airflow` `bigquery` `gcp` `etl` `sql` `data-engineering` |
| mimo-robot | Interactive 3D website for a desktop AI pet robot, with a FastAPI TTS service. | `react-three-fiber` `threejs` `fastapi` `docker` `vite` |

## 4. Pin these 6 repos (Profile → Customize your pins)
1. `messy-files-weekly-report` (after extraction)
2. `Morphix`
3. `holy_water_task` (after the key is rotated and the polish PR is merged)
4. `mimo-robot`
5. TODO: webhook-sync showcase (#2) once built
6. TODO: slow-query case study (#3) once built. Until then, leave 5-6 empty rather than pin weak repos.

## 5. GitHub profile settings
- [ ] **Name:** Javidan Abdullayev
- [ ] **Bio (160 chars):** `Data engineer. I automate messy files, weekly reports, slow SQL and API/CRM syncs. Python · SQL · dbt · Airflow. Hire me on Upwork 👇`
- [ ] **Website:** your Upwork profile URL
- [ ] **Location:** TODO (city/country or just "UTC+4"; your choice)
- [ ] **Company:** leave blank, or "Freelance"
- [ ] **Photo:** the same photo as Upwork. Face fills most of the frame, plain background,
      good light, looking at the camera, no sunglasses. The same face on both sites builds trust.
- [ ] Create the public repo **`Javidan1997/Javidan1997`** and paste `README.draft.md` as `README.md`.

## 6. Upwork steps
- [ ] Paste the title (option A), overview and the 15 skills from `UPWORK_PROFILE_PACK.md`.
- [ ] Set availability ("Less than 30 hrs/week"), your rate (TODO) and time zone.
- [ ] Create the specialized profile "Data pipelines and automation".
- [ ] Record the 90-second video (script in the pack) and add it to portfolio item 1.
- [ ] Add portfolio items 1-3 with the screenshots listed. Blur any real customer data.
- [ ] Publish the two Project Catalog offers. Check the category and title limits in the form.
- [ ] Save the 4 proposal snippets as notes, and replace the TODO_LINK_* placeholders with real links.
- [ ] Each week, send about 10 targeted proposals to posts that match the snippets; don't spray.
- [ ] Don't put contact details or off-platform links anywhere on Upwork.
