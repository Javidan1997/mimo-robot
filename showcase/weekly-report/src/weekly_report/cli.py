"""Entry point: `python -m weekly_report.cli generate|run`.

run = find files -> map -> validate -> KPIs -> Excel report + exceptions -> run log -> alerts.
Re-running a week with unchanged inputs is a no-op; changed inputs rebuild that week only.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import time
import uuid
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd
import yaml

from .alerts import send_alerts
from .generate import generate, week_bounds
from .ingest import load_sources
from .report import write_exceptions, write_report
from .transform import kpis
from .validate import validate


def last_week() -> str:
    y, w, _ = (date.today() - timedelta(days=7)).isocalendar()
    return f"{y}-W{w:02d}"


def fingerprint(root: Path, cfg: dict, results) -> str:
    h = hashlib.sha256()
    for p in ("config/pipeline.yaml", cfg["sources"], cfg["catalog"]):
        h.update((root / p).read_bytes())
    for r in results:
        h.update(f"{r.name}|{r.status}|{r.file}".encode())
        if r.frame is not None:
            h.update(pd.util.hash_pandas_object(r.frame.astype(str), index=False).values.tobytes())
    return h.hexdigest()[:16]


def run(root: Path, week: str, force: bool = False, env: dict | None = None) -> dict:
    t0 = time.perf_counter()
    cfg = yaml.safe_load((root / "config" / "pipeline.yaml").read_text())
    sources = yaml.safe_load((root / cfg["sources"]).read_text())
    catalog = pd.read_csv(root / cfg["catalog"])
    start, end = week_bounds(week)
    cutoff = datetime.combine(end, datetime.min.time()) + timedelta(hours=cfg["cutoff_hours_after_week_end"])
    out_dir = root / cfg["output_dir"] / week
    log_path = root / cfg["output_dir"] / "run_log.jsonl"

    results = load_sources(root / cfg["landing_dir"] / week, sources, cutoff)
    fp = fingerprint(root, cfg, results)
    manifest = out_dir / "manifest.json"
    report_path, exc_path = out_dir / f"weekly_report_{week}.xlsx", out_dir / f"exceptions_{week}.xlsx"
    if not force and manifest.exists() and report_path.exists() \
            and json.loads(manifest.read_text()).get("fingerprint") == fp:
        print(f"No changes since the last run for {week} (fingerprint {fp}). Skipping; use --force to rebuild.")
        summary = {**json.loads(manifest.read_text()), "skipped": True}
        _log(log_path, {"run_id": uuid.uuid4().hex[:8], "week": week, "skipped": True, "fingerprint": fp,
                        "finished_at": datetime.now().isoformat(timespec="seconds")})
        return summary

    frames = [r.frame for r in results if r.frame is not None]
    if not frames:
        send_alerts([{"level": "ERROR", "message": f"{week}: no usable source files, report not built"}], env)
        raise SystemExit(2)
    accepted, rejected = validate(pd.concat(frames, ignore_index=True), catalog, start, end, cfg["rules"])
    headline, tables = kpis(accepted, catalog)
    headline = {k: (float(v) if isinstance(v, float) else v) for k, v in headline.items()}

    rej_by_src = rejected["source"].value_counts()
    status = pd.DataFrame([{
        "source": r.name, "store": r.store, "status": r.status, "file": r.file or "-",
        "rows_read": r.rows, "accepted": r.rows - int(rej_by_src.get(r.name, 0)),
        "rejected": int(rej_by_src.get(r.name, 0)),
        "reject_rate": round(rej_by_src.get(r.name, 0) / r.rows, 4) if r.rows else 0.0,
        "notes": "; ".join(r.notes),
    } for r in results])

    title = f"{cfg['company']} - weekly sales report {week} ({start:%d %b} - {end - timedelta(days=1):%d %b %Y}). Synthetic data."
    write_report(report_path, title, headline, tables, status)
    write_exceptions(exc_path, rejected)

    rows_read = int(status["rows_read"].sum())
    reject_rate = len(rejected) / rows_read if rows_read else 0.0
    alerts = [{"level": "ERROR" if r.status in ("MISSING", "ERROR") else "WARN",
               "message": f"{week} {r.store}: {r.status} - {'; '.join(r.notes)}"}
              for r in results if r.status != "OK"]
    if reject_rate > cfg["alerts"]["reject_rate_threshold"]:
        alerts.append({"level": "WARN", "message": f"{week}: {reject_rate:.1%} of rows rejected"})
    channels = send_alerts(alerts, env)

    summary = {
        "week": week, "fingerprint": fp, "skipped": False, "rows_read": rows_read,
        "accepted": len(accepted), "rejected": len(rejected), "reject_rate": round(reject_rate, 4),
        "duplicates_removed": int(rejected["reason_codes"].str.contains("DUPLICATE").sum()),
        "sources": status[["source", "status", "rows_read", "accepted", "rejected"]].to_dict("records"),
        "headline": headline, "alerts": len(alerts), "alert_channels": channels,
        "outputs": [str(report_path.relative_to(root)), str(exc_path.relative_to(root))],
        "duration_s": round(time.perf_counter() - t0, 2),
    }
    out_dir.mkdir(parents=True, exist_ok=True)
    manifest.write_text(json.dumps(summary, indent=2))
    _log(log_path, {"run_id": uuid.uuid4().hex[:8], "finished_at": datetime.now().isoformat(timespec="seconds"),
                    **{k: summary[k] for k in ("week", "skipped", "fingerprint", "rows_read", "accepted",
                                               "rejected", "alerts", "duration_s")}})
    _print_results(summary, status)
    return summary


def _log(path: Path, entry: dict):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("a") as f:
        f.write(json.dumps(entry) + "\n")


def _print_results(s: dict, status: pd.DataFrame):
    print(f"\nResults for {s['week']} (synthetic data, fictional company)\n")
    print("| Source | Status | Rows read | Accepted | Rejected |\n|---|---|---:|---:|---:|")
    for r in status.itertuples():
        print(f"| {r.store} | {r.status} | {r.rows_read:,} | {r.accepted:,} | {r.rejected:,} |")
    print(f"| **Total** | | **{s['rows_read']:,}** | **{s['accepted']:,}** | **{s['rejected']:,}** |\n")
    print("| Metric | Value |\n|---|---:|")
    h = s["headline"]
    print(f"| Net revenue | {h['Net revenue']:,.2f} |\n| Orders | {h['Orders']:,} |\n"
          f"| Units sold | {h['Units sold']:,} |\n| Average order value | {h['Average order value']:,.2f} |\n"
          f"| Duplicate lines removed | {s['duplicates_removed']:,} |\n| Reject rate | {s['reject_rate']:.2%} |\n"
          f"| Alerts raised | {s['alerts']} |\n| Pipeline run time | {s['duration_s']} s |")
    print(f"\nReport:     {s['outputs'][0]}\nExceptions: {s['outputs'][1]}")


def main(argv=None):
    p = argparse.ArgumentParser(prog="weekly_report")
    sub = p.add_subparsers(dest="cmd", required=True)
    g = sub.add_parser("generate", help="create one week of messy synthetic input files")
    g.add_argument("--week", default="2026-W40")
    g.add_argument("--seed", type=int, default=42)
    g.add_argument("--scale", type=float, default=1.0)
    r = sub.add_parser("run", help="build the weekly report")
    r.add_argument("--week", default=None, help="ISO week like 2026-W40 (default: last week)")
    r.add_argument("--force", action="store_true", help="rebuild even if inputs are unchanged")
    for sp in (g, r):
        sp.add_argument("--root", default=".", type=Path)
    a = p.parse_args(argv)
    if a.cmd == "generate":
        print(f"Wrote synthetic files to {generate(a.root, a.week, a.seed, a.scale)}")
    else:
        run(a.root, a.week or last_week(), force=a.force)
    return 0


if __name__ == "__main__":
    sys.exit(main())
