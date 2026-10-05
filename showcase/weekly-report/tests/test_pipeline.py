import json

from openpyxl import load_workbook

from weekly_report.cli import run
from weekly_report.generate import generate


def test_end_to_end_report_exceptions_and_alerts(workspace, capsys):
    s = run(workspace, "2026-W40", env={"SLACK_WEBHOOK_URL": "https://example.invalid/hook"})
    status = {x["source"]: x["status"] for x in s["sources"]}
    assert status["mall"] == "MISSING" and status["station"] == "LATE" and status["downtown"] == "OK"
    assert s["accepted"] + s["rejected"] == s["rows_read"] > 0
    assert s["duplicates_removed"] > 0
    assert s["alert_channels"] == ["console", "slack-stub"]
    assert "[ALERT][ERROR]" in capsys.readouterr().out

    report = load_workbook(workspace / s["outputs"][0])
    assert report.sheetnames == ["Summary", "By store", "By day", "Top products", "By category"]
    exc = load_workbook(workspace / s["outputs"][1])["Exceptions"]
    assert exc.max_row - 1 == s["rejected"]


def test_rerun_is_safe_and_force_rebuilds(workspace):
    first = run(workspace, "2026-W40", env={})
    second = run(workspace, "2026-W40", env={})
    assert second["skipped"] and second["fingerprint"] == first["fingerprint"]
    generate(workspace, "2026-W40", seed=7, scale=0.1)          # same seed -> same data -> still a no-op
    assert run(workspace, "2026-W40", env={})["skipped"]
    assert not run(workspace, "2026-W40", force=True, env={})["skipped"]
    log = [json.loads(l) for l in (workspace / "output" / "run_log.jsonl").read_text().splitlines()]
    assert [e["skipped"] for e in log] == [False, True, True, False]


def test_changed_input_triggers_rebuild(workspace):
    first = run(workspace, "2026-W40", env={})
    generate(workspace, "2026-W40", seed=8, scale=0.1)
    second = run(workspace, "2026-W40", env={})
    assert not second["skipped"] and second["fingerprint"] != first["fingerprint"]
