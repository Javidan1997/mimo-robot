"""Row-level rules with Pandera. Every rejected row gets one or more reason codes."""
from __future__ import annotations

import pandas as pd
import pandera.pandas as pa
from pandera.errors import SchemaErrors

REASONS = {
    "DUPLICATE": "Same order line sent twice in one file; kept the first copy",
    "MISSING_ORDER_ID": "No order / receipt number",
    "BAD_DATE": "Date is blank or not in any expected format",
    "DATE_OUTSIDE_WEEK": "Date falls outside the reporting week",
    "MISSING_SKU": "No product code",
    "UNKNOWN_SKU": "Product code not in the catalog",
    "MISSING_QTY": "Quantity blank or not a number",
    "NON_POSITIVE_QTY": "Quantity is zero or negative (refund keyed as a sale?)",
    "QTY_TOO_LARGE": "Quantity above the per-line limit (typo?)",
    "MISSING_PRICE": "Unit price blank or not a number",
    "PRICE_OUT_OF_RANGE": "Unit price far from catalog list price (typo?)",
    "DISCOUNT_OUT_OF_RANGE": "Discount below 0 or above the allowed maximum",
}
NULL_CODES = {"order_id": "MISSING_ORDER_ID", "order_date": "BAD_DATE", "sku": "MISSING_SKU",
              "qty": "MISSING_QTY", "unit_price": "MISSING_PRICE"}


def build_schema(catalog: pd.DataFrame, week_start, week_end, rules: dict) -> pa.DataFrameSchema:
    skus = set(catalog["sku"])
    list_price = dict(zip(catalog["sku"], catalog["list_price"]))
    tol = rules["price_tolerance"]

    def price_ok(df: pd.DataFrame) -> pd.Series:
        ref = df["sku"].map(list_price)
        ok = (df["unit_price"] >= ref * (1 - tol)) & (df["unit_price"] <= ref * (1 + tol))
        return ok | ref.isna() | df["unit_price"].isna()   # unknown SKU / missing price are reported elsewhere

    return pa.DataFrameSchema(
        {
            "order_id": pa.Column(nullable=False),
            "order_date": pa.Column(nullable=False, checks=pa.Check(
                lambda s: (s >= pd.Timestamp(week_start)) & (s < pd.Timestamp(week_end)), name="DATE_OUTSIDE_WEEK")),
            "sku": pa.Column(nullable=False, checks=pa.Check(lambda s: s.isin(skus), name="UNKNOWN_SKU")),
            "qty": pa.Column(nullable=False, checks=[
                pa.Check(lambda s: s > 0, name="NON_POSITIVE_QTY"),
                pa.Check(lambda s: s <= rules["max_qty_per_line"], name="QTY_TOO_LARGE")]),
            "unit_price": pa.Column(nullable=False),
            "discount": pa.Column(checks=pa.Check(
                lambda s: (s >= 0) & (s <= rules["max_discount"]), name="DISCOUNT_OUT_OF_RANGE")),
        },
        checks=pa.Check(price_ok, name="PRICE_OUT_OF_RANGE"),
        strict=False,
    )


def validate(df: pd.DataFrame, catalog: pd.DataFrame, week_start, week_end, rules: dict):
    """Return (accepted, rejected). `rejected` has reason_codes ('A|B') and reason (first code, explained)."""
    df = df.reset_index(drop=True)
    reasons: dict[int, list[str]] = {}

    dup = df.duplicated(subset=["source", "order_id", "sku", "order_date", "qty", "unit_price"], keep="first")
    for i in df.index[dup]:
        reasons.setdefault(i, []).append("DUPLICATE")

    try:
        build_schema(catalog, week_start, week_end, rules).validate(df, lazy=True)
    except SchemaErrors as err:
        fc = err.failure_cases.dropna(subset=["index"])
        for _, f in fc.iterrows():
            check = str(f["check"])
            code = NULL_CODES.get(f["column"]) if check == "not_nullable" else check
            if code in REASONS:
                reasons.setdefault(int(f["index"]), []).append(code)

    order = list(REASONS)
    bad_idx = sorted(reasons)
    rejected = df.loc[bad_idx].copy()
    codes = [sorted(set(reasons[i]), key=order.index) for i in bad_idx]
    rejected["reason_codes"] = ["|".join(c) for c in codes]
    rejected["reason"] = [REASONS[c[0]] for c in codes]
    accepted = df.drop(index=bad_idx)
    return accepted, rejected
