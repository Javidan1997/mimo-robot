import pandas as pd
import pytest

from weekly_report.validate import validate

CATALOG = pd.DataFrame({"sku": ["ESP-001", "LAT-001"], "product": ["Espresso", "Latte"],
                        "category": ["Coffee", "Coffee"], "list_price": [2.8, 4.1]})
RULES = {"max_qty_per_line": 50, "max_discount": 0.5, "price_tolerance": 0.5}
GOOD = {"source": "s", "store": "S", "source_row": 2, "order_id": "A1", "order_date": pd.Timestamp("2026-09-29"),
        "sku": "ESP-001", "product": "Espresso", "qty": 2.0, "unit_price": 2.8, "discount": 0.0, "raw_date": "x"}


def check(**bad):
    df = pd.DataFrame([GOOD, {**GOOD, "order_id": "A2", **bad}])
    accepted, rejected = validate(df, CATALOG, "2026-09-28", "2026-10-05", RULES)
    assert len(accepted) == 1 and accepted.iloc[0]["order_id"] == "A1"
    return rejected.iloc[0]["reason_codes"]


@pytest.mark.parametrize("bad, code", [
    ({"order_date": pd.NaT}, "BAD_DATE"),
    ({"order_date": pd.Timestamp("2026-09-20")}, "DATE_OUTSIDE_WEEK"),
    ({"sku": None}, "MISSING_SKU"),
    ({"sku": "NOPE-1"}, "UNKNOWN_SKU"),
    ({"qty": float("nan")}, "MISSING_QTY"),
    ({"qty": -1.0}, "NON_POSITIVE_QTY"),
    ({"qty": 99.0}, "QTY_TOO_LARGE"),
    ({"unit_price": 28.0}, "PRICE_OUT_OF_RANGE"),
    ({"discount": 0.9}, "DISCOUNT_OUT_OF_RANGE"),
    ({"order_id": None}, "MISSING_ORDER_ID"),
])
def test_each_rule_has_a_reason_code(bad, code):
    assert check(**bad) == code


def test_duplicates_keep_first_and_multiple_reasons_are_listed():
    df = pd.DataFrame([GOOD, GOOD, {**GOOD, "order_id": "A3", "sku": None, "qty": -1.0}])
    accepted, rejected = validate(df, CATALOG, "2026-09-28", "2026-10-05", RULES)
    assert len(accepted) == 1
    assert sorted(rejected["reason_codes"]) == ["DUPLICATE", "MISSING_SKU|NON_POSITIVE_QTY"]
