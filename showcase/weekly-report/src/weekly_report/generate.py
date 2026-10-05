"""Seeded generator for one week of messy store exports (synthetic, fictional company).

Every defect a real client sends is injected on purpose: renamed headers, mixed date
formats, a Windows-1252 file, decimal commas, currency symbols, duplicates, nulls,
mojibake, unknown SKUs, a missing file and a late file.
"""
from __future__ import annotations

import json
import random
from datetime import date, datetime, timedelta
from pathlib import Path

import pandas as pd
from openpyxl import Workbook

# rows per source at scale=1.0 (about 25k rows in total)
BASE_ROWS = {"downtown": 5200, "harbor": 4100, "uptown": 3000, "airport": 3800,
             "campus": 2200, "webshop": 3300, "station": 2600}
PREFIX = {"downtown": "DT", "harbor": "HB", "uptown": "UP", "airport": "AP",
          "campus": "CA", "webshop": "#", "station": "ST"}


def week_bounds(week: str) -> tuple[date, date]:
    """'2026-W40' -> (Monday, next Monday)."""
    year, wk = week.split("-W")
    start = date.fromisocalendar(int(year), int(wk), 1)
    return start, start + timedelta(days=7)


def _lines(rng: random.Random, catalog: pd.DataFrame, source: str, n: int, start: date) -> list[dict]:
    skus = catalog["sku"].tolist()
    weights = [6 if c == "Coffee" else 3 if c in ("Bakery", "Tea") else 1 for c in catalog["category"]]
    price = dict(zip(catalog["sku"], catalog["list_price"]))
    name = dict(zip(catalog["sku"], catalog["product"]))
    rows, order_no = [], 100000
    while len(rows) < n:
        order_no += 1
        ts = datetime.combine(start, datetime.min.time()) + timedelta(
            days=rng.randrange(7), hours=rng.randint(7, 20), minutes=rng.randrange(60))
        basket = {rng.choices(skus, weights)[0] for _ in range(rng.choice([1, 1, 1, 2, 2, 3]))}
        for sku in sorted(basket):  # one line per SKU per order, as a POS would print it
            rows.append({
                "order_id": f"{PREFIX[source]}{order_no}" if source != "webshop" else f"#{order_no}",
                "ts": ts, "sku": sku, "product": name[sku],
                "qty": rng.choice([1, 1, 1, 1, 2, 2, 3, 4]),
                "unit_price": price[sku],
                "discount": rng.choice([0.0] * 8 + [0.1, 0.2]),
            })
    return rows[:n]


def _pick(rng: random.Random, rows: list, rate: float) -> list[int]:
    return rng.sample(range(len(rows)), max(1, int(len(rows) * rate)))


def _write_xlsx(path: Path, header: list[str], records: list[list], title_rows: list[str] = (), sheet="Sheet1"):
    wb = Workbook()
    ws = wb.active
    ws.title = sheet
    for t in title_rows:
        ws.append([t])
    ws.append(header)
    for r in records:
        ws.append(r)
    wb.properties.creator = "synthetic-generator"
    wb.save(path)


def generate(root: Path, week: str = "2026-W40", seed: int = 42, scale: float = 1.0) -> Path:
    rng = random.Random(seed)
    catalog = pd.read_csv(root / "config" / "catalog.csv")
    start, end = week_bounds(week)
    out = root / "landing" / week
    out.mkdir(parents=True, exist_ok=True)
    for old in out.iterdir():
        old.unlink()
    n = {k: max(40, int(v * scale)) for k, v in BASE_ROWS.items()}
    tag = week.split("-")[1]

    # 1. Downtown: the clean baseline, apart from a few blank SKUs
    rows = _lines(rng, catalog, "downtown", n["downtown"], start)
    for i in _pick(rng, rows, 0.005):
        rows[i]["sku"] = ""
    pd.DataFrame([{"order_id": r["order_id"], "order_date": r["ts"].strftime("%Y-%m-%d"), "sku": r["sku"],
                   "product_name": r["product"], "qty": r["qty"], "unit_price": r["unit_price"],
                   "discount_pct": r["discount"]} for r in rows]).to_csv(out / f"downtown_pos_{week}.csv", index=False)

    # 2. Harbor: Excel with title rows, half real dates / half dd/mm/yyyy text, % discounts, price typos
    rows = _lines(rng, catalog, "harbor", n["harbor"], start)
    typos = set(_pick(rng, rows, 0.01))
    recs = []
    for i, r in enumerate(rows):
        d = r["ts"] if rng.random() < 0.5 else r["ts"].strftime("%d/%m/%Y")
        p = r["unit_price"] * (10 if i in typos else 1)
        recs.append([r["order_id"], d, r["sku"], r["product"], r["qty"], p, int(r["discount"] * 100)])
    _write_xlsx(out / f"Harbor Sales {tag}.xlsx", ["Order No", "Date", "Item Code", "Item", "Quantity", "Price", "Disc %"],
                recs, title_rows=["Harbor store - weekly export", f"Generated for {week}"], sheet="Export")

    # 3. Uptown: Windows-1252, semicolons, decimal commas, German headers, a few dates from last week
    rows = _lines(rng, catalog, "uptown", n["uptown"], start)
    for i in _pick(rng, rows, 0.01):
        rows[i]["ts"] -= timedelta(days=7)
    df = pd.DataFrame([{"Beleg": r["order_id"], "Datum": r["ts"].strftime("%d.%m.%Y"), "Artikel": r["sku"],
                        "Bezeichnung": r["product"], "Menge": r["qty"], "Preis": r["unit_price"],
                        "Rabatt": r["discount"]} for r in rows])
    df.to_csv(out / "uptown_export.csv", index=False, sep=";", decimal=",", encoding="cp1252")

    # 4. Airport: mixed date formats, "$" prices, unparseable dates, re-exported duplicate lines
    rows = _lines(rng, catalog, "airport", n["airport"], start)
    bad = set(_pick(rng, rows, 0.005))
    recs = []
    for i, r in enumerate(rows):
        d = "N/A" if i in bad else (r["ts"].strftime("%Y-%m-%d %H:%M") if rng.random() < 0.6 else r["ts"].strftime("%m/%d/%Y"))
        recs.append({"Txn #": r["order_id"], "Txn Date": d, "SKU": r["sku"], "Description": r["product"],
                     "Units": r["qty"], "Unit Price ($)": f"${r['unit_price']:.2f}", "Discount": r["discount"]})
    recs += [dict(recs[i]) for i in sorted(_pick(rng, recs, 0.03))]
    pd.DataFrame(recs).to_csv(out / f"AIRPORT_SALES_{tag}.csv", index=False)

    # 5. Campus: Excel with blank quantities, blank SKUs and negative quantities (refunds keyed as sales)
    rows = _lines(rng, catalog, "campus", n["campus"], start)
    for i in _pick(rng, rows, 0.03):
        rows[i]["qty"] = None
    for i in _pick(rng, rows, 0.01):
        rows[i]["sku"] = None
    for i in _pick(rng, rows, 0.01):
        rows[i]["qty"] = -abs(rows[i]["qty"] or 1)
    _write_xlsx(out / "campus.xlsx", ["Receipt", "Day", "Code", "Product", "Qty", "Unit", "Discount"],
                [[r["order_id"], r["ts"].strftime("%Y-%m-%d"), r["sku"], r["product"], r["qty"], r["unit_price"],
                  r["discount"]] for r in rows])

    # 6. Webshop: platform export with timezone timestamps, money-off discounts, mojibake names, bulk-qty typos
    rows = _lines(rng, catalog, "webshop", n["webshop"], start)
    for i in _pick(rng, rows, 0.01):
        rows[i]["qty"] = 99
    pd.DataFrame([{"Name": r["order_id"], "Created at": r["ts"].strftime("%Y-%m-%d %H:%M:%S +0400"),
                   "Lineitem sku": r["sku"],
                   "Lineitem name": r["product"].encode("utf-8").decode("cp1252", errors="replace"),
                   "Lineitem quantity": r["qty"], "Lineitem price": r["unit_price"],
                   "Discount Amount": round(r["qty"] * r["unit_price"] * r["discount"], 2)} for r in rows]
                 ).to_csv(out / f"webshop_orders_{week}.csv", index=False)

    # 7. Station: arrives late, with a handful of SKUs that are not in the catalog
    rows = _lines(rng, catalog, "station", n["station"], start)
    for i in _pick(rng, rows, 0.01):
        rows[i]["sku"] = "XMAS-999"
    pd.DataFrame([{"order_id": r["order_id"], "date": r["ts"].strftime("%Y-%m-%d"), "sku": r["sku"],
                   "item": r["product"], "qty": r["qty"], "price": r["unit_price"], "discount": r["discount"]}
                  for r in rows]).to_csv(out / "station_pos.csv", index=False)

    # 8. Mall: expected but never delivered (no file written)

    # Arrival times, as an SFTP/drive watcher would record them
    cutoff = datetime.combine(end, datetime.min.time())
    arrivals = {p.name: (cutoff - timedelta(hours=rng.randint(8, 30))).isoformat() for p in sorted(out.iterdir())}
    arrivals["station_pos.csv"] = (cutoff + timedelta(hours=9, minutes=40)).isoformat()
    (out / "_arrivals.json").write_text(json.dumps(arrivals, indent=2))
    return out
