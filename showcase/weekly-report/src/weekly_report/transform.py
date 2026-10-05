"""Weekly KPIs from accepted rows."""
from __future__ import annotations

import pandas as pd


def kpis(accepted: pd.DataFrame, catalog: pd.DataFrame) -> tuple[dict, dict[str, pd.DataFrame]]:
    df = accepted.copy()
    df["revenue"] = (df["qty"] * df["unit_price"] * (1 - df["discount"])).round(2)
    df["order_key"] = df["store"] + ":" + df["order_id"]
    df = df.merge(catalog[["sku", "product", "category"]].rename(columns={"product": "catalog_product"}),
                  on="sku", how="left")

    revenue, orders = df["revenue"].sum(), df["order_key"].nunique()
    headline = {
        "Net revenue": round(revenue, 2),
        "Orders": int(orders),
        "Units sold": int(df["qty"].sum()),
        "Average order value": round(revenue / orders, 2) if orders else 0.0,
    }

    by_store = (df.groupby("store").agg(revenue=("revenue", "sum"), orders=("order_key", "nunique"),
                                        units=("qty", "sum"))
                .sort_values("revenue", ascending=False).reset_index())
    by_store["avg_order_value"] = (by_store["revenue"] / by_store["orders"]).round(2)
    by_store["revenue_share"] = (by_store["revenue"] / revenue).round(4) if revenue else 0.0

    df["day"] = df["order_date"].dt.strftime("%a %d %b")
    df["day_sort"] = df["order_date"].dt.normalize()
    by_day = (df.groupby(["day_sort", "day"]).agg(revenue=("revenue", "sum"), orders=("order_key", "nunique"))
              .reset_index().drop(columns="day_sort"))

    top_products = (df.groupby(["sku", "catalog_product", "category"])
                    .agg(revenue=("revenue", "sum"), units=("qty", "sum"))
                    .sort_values("revenue", ascending=False).head(10).reset_index()
                    .rename(columns={"catalog_product": "product"}))

    by_category = (df.groupby("category").agg(revenue=("revenue", "sum"), units=("qty", "sum"))
                   .sort_values("revenue", ascending=False).reset_index())

    for t in (by_store, by_day, top_products, by_category):
        t["revenue"] = t["revenue"].round(2)
        if "units" in t:
            t["units"] = t["units"].astype(int)
    return headline, {"By store": by_store, "By day": by_day, "Top products": top_products,
                      "By category": by_category}
