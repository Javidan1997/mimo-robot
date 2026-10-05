"""Alert hook. Console by default; Slack and email are stubs you switch on with env vars.

The stubs never touch the network. To go live, replace the marked lines with a real call
(requests.post to the Slack webhook, smtplib for email).
"""
from __future__ import annotations

import os


def send_alerts(alerts: list[dict], env: dict | None = None) -> list[str]:
    """alerts: [{"level": "WARN"|"ERROR", "message": str}]. Returns the channels used."""
    env = os.environ if env is None else env
    if not alerts:
        return []
    channels = ["console"]
    for a in alerts:
        print(f"[ALERT][{a['level']}] {a['message']}")
    text = "\n".join(f"{a['level']}: {a['message']}" for a in alerts)
    if env.get("SLACK_WEBHOOK_URL"):
        print(f"[ALERT] Slack stub: would POST {len(text)} chars to the configured webhook")
        # requests.post(env["SLACK_WEBHOOK_URL"], json={"text": text}, timeout=10)
        channels.append("slack-stub")
    if env.get("ALERT_EMAIL_TO") and env.get("SMTP_HOST"):
        print(f"[ALERT] Email stub: would send to {env['ALERT_EMAIL_TO']} via {env['SMTP_HOST']}")
        # smtplib.SMTP(env["SMTP_HOST"]).sendmail(..., env["ALERT_EMAIL_TO"], text)
        channels.append("email-stub")
    return channels
