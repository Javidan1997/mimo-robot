import shutil
from pathlib import Path

import pytest

from weekly_report.generate import generate

PROJECT = Path(__file__).resolve().parents[1]


@pytest.fixture
def workspace(tmp_path: Path) -> Path:
    """A copy of the config plus a small (scale=0.1) synthetic week, isolated per test."""
    shutil.copytree(PROJECT / "config", tmp_path / "config")
    generate(tmp_path, "2026-W40", seed=7, scale=0.1)
    return tmp_path
