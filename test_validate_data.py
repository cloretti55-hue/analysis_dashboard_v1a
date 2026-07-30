from __future__ import annotations

import copy
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "validate-data.py"
SPEC = importlib.util.spec_from_file_location("validate_data", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Could not load {MODULE_PATH}")
VALIDATE_DATA = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATE_DATA)


class ValidateDataTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.universe = json.loads((ROOT / "data" / "etf-universe.json").read_text(encoding="utf-8"))
        cls.fixed_income = json.loads(
            (ROOT / "data" / "fixed-income-performance.json").read_text(encoding="utf-8")
        )
        cls.curve = json.loads((ROOT / "data" / "curve-us.json").read_text(encoding="utf-8"))

    def test_current_datasets_have_no_blocking_errors(self) -> None:
        manifest, error_count = VALIDATE_DATA.build_manifest()
        self.assertEqual(error_count, 0)
        self.assertEqual(manifest["summary"]["blockingErrorCount"], 0)

    def test_manifest_generation_is_deterministic(self) -> None:
        first, _ = VALIDATE_DATA.build_manifest()
        second, _ = VALIDATE_DATA.build_manifest()
        self.assertEqual(
            VALIDATE_DATA.serialized_manifest(first),
            VALIDATE_DATA.serialized_manifest(second),
        )

    def test_manifest_comparison_ignores_line_endings(self) -> None:
        manifest, _ = VALIDATE_DATA.build_manifest()
        windows_text = VALIDATE_DATA.serialized_manifest(manifest).replace("\n", "\r\n")
        with tempfile.TemporaryDirectory() as temporary_directory:
            path = Path(temporary_directory) / "manifest.json"
            path.write_bytes(windows_text.encode("utf-8"))
            self.assertTrue(VALIDATE_DATA.manifest_matches(path, manifest))

    def test_dataset_hash_ignores_json_formatting_and_line_endings(self) -> None:
        with tempfile.TemporaryDirectory() as temporary_directory:
            directory = Path(temporary_directory)
            windows_path = directory / "windows.json"
            linux_path = directory / "linux.json"
            windows_path.write_bytes(b'{\r\n  "b": 2,\r\n  "a": 1\r\n}\r\n')
            linux_path.write_bytes(b'{"a":1,"b":2}\n')
            self.assertEqual(
                VALIDATE_DATA.file_sha256(windows_path),
                VALIDATE_DATA.file_sha256(linux_path),
            )

    def test_scoped_error_does_not_block_unrelated_dataset(self) -> None:
        manifest = {
            "datasets": [
                {"id": "curve-us", "status": "ok"},
                {"id": "etf-performance", "status": "error"},
            ]
        }
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest, {"curve-us"}),
            0,
        )
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest, {"etf-performance"}),
            1,
        )
        self.assertEqual(
            VALIDATE_DATA.blocking_error_count(manifest),
            1,
        )

    def test_missing_curve_maturity_is_blocking(self) -> None:
        payload = copy.deepcopy(self.curve)
        del payload["curves"]["real"]["10Y"]
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_curve(payload, issues)
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "invalid_curve_value"
                for issue in issues
            )
        )

    def test_partial_fixed_income_fallback_is_blocking(self) -> None:
        payload = copy.deepcopy(self.fixed_income)
        payload["instruments"] = payload["instruments"][:-1]
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_performance(
            payload,
            issues,
            self.universe,
            fixed_only=True,
        )
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "missing_tickers"
                for issue in issues
            )
        )

    def test_duplicate_universe_ticker_is_blocking(self) -> None:
        payload = copy.deepcopy(self.universe)
        payload["instruments"].append(copy.deepcopy(payload["instruments"][0]))
        issues: list[dict[str, str]] = []
        VALIDATE_DATA.validate_etf_universe(payload, issues)
        self.assertTrue(
            any(
                issue["severity"] == "error"
                and issue["code"] == "duplicate_ticker"
                for issue in issues
            )
        )


if __name__ == "__main__":
    unittest.main()
