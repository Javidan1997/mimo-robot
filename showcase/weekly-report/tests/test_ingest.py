import pandas as pd

from weekly_report.ingest import fix_mojibake, parse_dates, parse_number, read_raw


def test_parse_number_handles_currency_and_decimal_comma():
    assert parse_number(pd.Series(["$4.50", "1,234.5", None, "abc"])).tolist()[:2] == [4.5, 1234.5]
    assert parse_number(pd.Series(["abc"])).isna().all()
    assert parse_number(pd.Series(["3,50", "1.234,00"]), decimal=",").tolist() == [3.5, 1234.0]


def test_parse_dates_tries_each_format_and_flags_garbage():
    out = parse_dates(pd.Series(["2026-09-28 14:33", "09/30/2026", "N/A", None]), ["%Y-%m-%d %H:%M", "%m/%d/%Y"])
    assert out.iloc[0] == pd.Timestamp("2026-09-28 14:33")
    assert out.iloc[1] == pd.Timestamp("2026-09-30")
    assert out.iloc[2:].isna().all()


def test_timezone_suffix_is_dropped():
    out = parse_dates(pd.Series(["2026-09-28 10:15:00 +0400"]), ["%Y-%m-%d %H:%M:%S %z"])
    assert out.iloc[0] == pd.Timestamp("2026-09-28 10:15")


def test_mojibake_is_repaired_and_clean_text_untouched():
    assert fix_mojibake("CafÃ© CrÃ¨me") == "Café Crème"
    assert fix_mojibake("Café Crème") == "Café Crème"
    assert fix_mojibake(None) is None


def test_wrong_encoding_falls_back_to_cp1252(tmp_path):
    p = tmp_path / "f.csv"
    p.write_bytes("a;b\nCafé;1\n".encode("cp1252"))
    df, enc, notes = read_raw(p, {"format": "csv", "encoding": "utf-8", "delimiter": ";"})
    assert enc == "cp1252" and df.iloc[0, 0] == "Café"
    assert notes and notes[0].startswith("ENCODING_FALLBACK")
