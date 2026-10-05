"""Find, read and map each source file to one canonical table, driven by config/sources.yaml."""
from __future__ import annotations

import json
import re
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path

import numpy as np
import pandas as pd

CANONICAL = ["order_id", "order_date", "sku", "product", "qty", "unit_price", "discount"]


@dataclass
class SourceResult:
    name: str
    store: str
    status: str = "OK"            # OK | LATE | MISSING | ERROR
    file: str | None = None
    arrived_at: str | None = None
    encoding: str | None = None
    notes: list[str] = field(default_factory=list)
    frame: pd.DataFrame | None = None

    @property
    def rows(self) -> int:
        return 0 if self.frame is None else len(self.frame)


def fix_mojibake(text):
    """'CafÃ© CrÃ¨me' -> 'Café Crème'. Leaves already-correct text alone."""
    if not isinstance(text, str) or not re.search("[ÃÂâ]", text):
        return text
    try:
        return text.encode("cp1252").decode("utf-8")
    except (UnicodeEncodeError, UnicodeDecodeError):
        return text


def parse_number(values: pd.Series, decimal: str = ".") -> pd.Series:
    """Strip currency symbols and thousands separators; unparseable -> NaN."""
    s = values.astype("object").map(lambda v: v if isinstance(v, str) else (np.nan if pd.isna(v) else str(v)))
    s = s.str.replace(r"[^\d,.\-]", "", regex=True)
    if decimal == ",":
        s = s.str.replace(".", "", regex=False).str.replace(",", ".", regex=False)
    else:
        s = s.str.replace(",", "", regex=False)
    return pd.to_numeric(s, errors="coerce").astype("float64")


def parse_dates(values: pd.Series, formats: list[str]) -> pd.Series:
    """Try each configured format per value; real Excel dates pass through; failures -> NaT."""
    def one(v):
        if isinstance(v, datetime):
            return v.replace(tzinfo=None)
        if not isinstance(v, str) or not v.strip():
            return pd.NaT
        for fmt in formats:
            try:
                return datetime.strptime(v.strip(), fmt).replace(tzinfo=None)
            except ValueError:
                continue
        return pd.NaT
    return pd.to_datetime(values.map(one), errors="coerce")


def read_raw(path: Path, cfg: dict) -> tuple[pd.DataFrame, str, list[str]]:
    notes: list[str] = []
    if cfg["format"] == "xlsx":
        df = pd.read_excel(path, sheet_name=cfg.get("sheet", 0), header=cfg.get("header_row", 1) - 1, dtype=object)
        return df, "xlsx", notes
    enc = cfg.get("encoding", "utf-8")
    try:
        df = pd.read_csv(path, sep=cfg.get("delimiter", ","), encoding=enc, dtype=str, keep_default_na=False)
    except UnicodeDecodeError:
        notes.append(f"ENCODING_FALLBACK: not valid {enc}, read as cp1252")
        enc = "cp1252"
        df = pd.read_csv(path, sep=cfg.get("delimiter", ","), encoding=enc, dtype=str, keep_default_na=False)
    return df.astype(object).replace("", np.nan), enc, notes


def to_canonical(raw: pd.DataFrame, cfg: dict, source: str) -> pd.DataFrame:
    cols = cfg["columns"]
    missing = [h for h in cols.values() if h not in raw.columns]
    if missing:
        raise KeyError(f"missing columns {missing}; found {list(raw.columns)}")
    df = raw[list(cols.values())].copy()
    df.columns = list(cols.keys())
    header_line = cfg.get("header_row", 1)
    out = pd.DataFrame({
        "source": source,
        "store": cfg["store"],
        "source_row": np.arange(len(df)) + header_line + 1,   # row number as the client sees it
        "order_id": df["order_id"].map(lambda v: str(v).strip() if pd.notna(v) else None).astype(object),
        "order_date": parse_dates(df["order_date"], cfg.get("date_formats", [])),
        "sku": df["sku"].map(lambda v: str(v).strip().upper() if pd.notna(v) and str(v).strip() else None).astype(object),
        "product": df["product"].astype(object),
        "qty": parse_number(df["qty"], cfg.get("decimal", ".")),
        "unit_price": parse_number(df["unit_price"], cfg.get("decimal", ".")),
        "discount": parse_number(df["discount"], cfg.get("decimal", ".")).fillna(0.0),
        "raw_date": df["order_date"].astype(str),
    })
    if cfg.get("fix_mojibake"):
        out["product"] = out["product"].map(fix_mojibake)
    mode = cfg.get("discount", "fraction")
    if mode == "percent":
        out["discount"] = out["discount"] / 100
    elif mode == "amount":
        gross = out["qty"] * out["unit_price"]
        out["discount"] = (out["discount"] / gross.where(gross > 0)).fillna(0.0).round(4)
    return out


def load_sources(week_dir: Path, sources: dict, cutoff: datetime) -> list[SourceResult]:
    arrivals_file = week_dir / "_arrivals.json"
    arrivals = json.loads(arrivals_file.read_text()) if arrivals_file.exists() else {}
    results = []
    for name, cfg in sources.items():
        res = SourceResult(name=name, store=cfg["store"])
        matches = sorted(week_dir.glob(cfg["pattern"])) if week_dir.exists() else []
        if not matches:
            res.status = "MISSING"
            res.notes.append(f"no file matching '{cfg['pattern']}'")
            results.append(res)
            continue
        path = matches[-1]
        res.file = path.name
        arrived = arrivals.get(path.name) or datetime.fromtimestamp(path.stat().st_mtime).isoformat()
        res.arrived_at = arrived
        if datetime.fromisoformat(arrived) > cutoff:
            res.status = "LATE"
            res.notes.append(f"arrived {arrived}, cutoff {cutoff.isoformat()}")
        try:
            raw, res.encoding, notes = read_raw(path, cfg)
            res.notes += notes
            res.frame = to_canonical(raw, cfg, name)
        except Exception as exc:  # one bad file must not stop the other stores' report
            res.status = "ERROR"
            res.notes.append(f"{type(exc).__name__}: {exc}")
        results.append(res)
    return results
