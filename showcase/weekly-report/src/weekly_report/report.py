"""Client-facing Excel files: the weekly report and the exceptions report."""
from __future__ import annotations

import os
from pathlib import Path

import pandas as pd
from openpyxl.chart import BarChart, Reference
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

from .validate import REASONS

HEADER_FILL = PatternFill("solid", fgColor="1F3A5F")
HEADER_FONT = Font(bold=True, color="FFFFFF")
STATUS_FILL = {"OK": "C6EFCE", "LATE": "FFEB9C", "MISSING": "FFC7CE", "ERROR": "FFC7CE"}
MONEY_COLS = {"revenue", "avg_order_value", "unit_price", "Net revenue", "Average order value"}


def _style(ws, df: pd.DataFrame, start_row: int = 1):
    for c in range(1, len(df.columns) + 1):
        cell = ws.cell(row=start_row, column=c)
        cell.fill, cell.font = HEADER_FILL, HEADER_FONT
        cell.alignment = Alignment(horizontal="center")
    for i, col in enumerate(df.columns, 1):
        width = max([len(str(col))] + [len(str(v)) for v in df[col].head(200)]) + 2
        ws.column_dimensions[get_column_letter(i)].width = min(width, 60)
        fmt = ("#,##0.00" if col in MONEY_COLS else "0.0%" if col.endswith(("share", "rate"))
               else "yyyy-mm-dd" if col == "order_date" else None)
        if fmt:
            for r in range(start_row + 1, start_row + len(df) + 1):
                ws.cell(row=r, column=i).number_format = fmt
    ws.freeze_panes = ws.cell(row=start_row + 1, column=1)


def _atomic(path: Path, write):
    """Write to a temp file then rename, so a crash never leaves a half-written report."""
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp = path.with_name(f".{path.stem}.tmp.xlsx")
    write(tmp)
    os.replace(tmp, path)


def write_report(path: Path, title: str, headline: dict, tables: dict, sources: pd.DataFrame):
    def write(tmp):
        with pd.ExcelWriter(tmp, engine="openpyxl") as xw:
            summary = pd.DataFrame({"Metric": list(headline), "Value": list(headline.values())})
            summary.to_excel(xw, sheet_name="Summary", index=False, startrow=2)
            sources.to_excel(xw, sheet_name="Summary", index=False, startrow=len(summary) + 6)
            for name, df in tables.items():
                df.to_excel(xw, sheet_name=name, index=False)
            ws = xw.sheets["Summary"]
            ws["A1"] = title
            ws["A1"].font = Font(bold=True, size=14)
            _style(ws, summary, start_row=3)
            for r in range(4, 4 + len(summary)):
                if summary.iloc[r - 4, 0] in MONEY_COLS:
                    ws.cell(row=r, column=2).number_format = "#,##0.00"
            src_row = len(summary) + 6
            ws.cell(row=src_row, column=1, value="Source files this week").font = Font(bold=True)
            _style(ws, sources, start_row=src_row + 1)
            status_col = list(sources.columns).index("status") + 1
            for r in range(src_row + 2, src_row + 2 + len(sources)):
                cell = ws.cell(row=r, column=status_col)
                cell.fill = PatternFill("solid", fgColor=STATUS_FILL.get(cell.value, "FFFFFF"))
            ws.freeze_panes = None
            ws.column_dimensions["A"].width = 24
            for name, df in tables.items():
                _style(xw.sheets[name], df)
            store_ws, n = xw.sheets["By store"], len(tables["By store"])
            chart = BarChart()
            chart.title, chart.y_axis.title, chart.legend = "Net revenue by store", "Revenue", None
            chart.add_data(Reference(store_ws, min_col=2, min_row=1, max_row=n + 1), titles_from_data=True)
            chart.set_categories(Reference(store_ws, min_col=1, min_row=2, max_row=n + 1))
            chart.height, chart.width = 8, 16
            store_ws.add_chart(chart, "I2")
    _atomic(path, write)


def write_exceptions(path: Path, rejected: pd.DataFrame):
    cols = ["source", "store", "source_row", "reason_codes", "reason", "order_id", "raw_date", "order_date",
            "sku", "product", "qty", "unit_price", "discount"]
    rows = rejected[cols].sort_values(["source", "source_row"]).reset_index(drop=True)
    by_reason = (rows.assign(code=rows["reason_codes"].str.split("|")).explode("code")
                 .groupby(["code", "source"]).size().rename("rows").reset_index()
                 .sort_values(["rows"], ascending=False))
    glossary = pd.DataFrame({"code": list(REASONS), "meaning": list(REASONS.values())})

    def write(tmp):
        with pd.ExcelWriter(tmp, engine="openpyxl") as xw:
            for name, df in (("Exceptions", rows), ("By reason", by_reason), ("Reason codes", glossary)):
                df.to_excel(xw, sheet_name=name, index=False)
                _style(xw.sheets[name], df)
    _atomic(path, write)
