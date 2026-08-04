from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[1]
MODULE_PATH = ROOT / "scripts" / "update-fed-policy.py"
SPEC = importlib.util.spec_from_file_location("update_fed_policy", MODULE_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError(f"Could not load {MODULE_PATH}")
FED_POLICY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(FED_POLICY)


class Response:
    def __enter__(self):
        return self

    def __exit__(self, *_args):
        return False

    def read(self) -> bytes:
        return b"ok"


class UpdateFedPolicyTests(unittest.TestCase):
    def test_fetch_retries_transient_timeouts(self) -> None:
        attempts = [TimeoutError("timeout 1"), TimeoutError("timeout 2"), Response()]

        def fake_urlopen(*_args, **_kwargs):
            result = attempts.pop(0)
            if isinstance(result, Exception):
                raise result
            return result

        with patch.object(FED_POLICY.urllib.request, "urlopen", side_effect=fake_urlopen), patch.object(
            FED_POLICY.time, "sleep", return_value=None
        ):
            self.assertEqual(FED_POLICY.fetch_bytes("https://example.test", "teste"), b"ok")
        self.assertEqual(attempts, [])

    def test_fetch_fails_after_all_attempts(self) -> None:
        with patch.object(
            FED_POLICY.urllib.request, "urlopen", side_effect=TimeoutError("timeout final")
        ), patch.object(FED_POLICY.time, "sleep", return_value=None):
            with self.assertRaisesRegex(RuntimeError, "após 3 tentativas"):
                FED_POLICY.fetch_bytes("https://example.test", "teste")


if __name__ == "__main__":
    unittest.main()
