import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
DATA_CLIENT_JS = (ROOT / "assets" / "js" / "core" / "data-client.js").read_text(encoding="utf-8")
CURVES_FED_JS = (ROOT / "assets" / "js" / "modules" / "curves-fed.js").read_text(encoding="utf-8")
VALUATION_JS = (ROOT / "assets" / "js" / "modules" / "valuation.js").read_text(encoding="utf-8")
RUNTIME_JS = APP_JS + CURVES_FED_JS + VALUATION_JS + DATA_CLIENT_JS


class FrontendDataClientTests(unittest.TestCase):
    def test_runtime_does_not_depend_on_github_raw(self):
        self.assertNotIn("raw.githubusercontent.com", RUNTIME_JS)

    def test_fetch_is_centralized_in_data_client(self):
        fetch_calls = [match.start() for match in re.finditer(r"\bfetch\(", DATA_CLIENT_JS)]
        self.assertEqual(len(fetch_calls), 1)
        client_start = DATA_CLIENT_JS.index("const DataClient")
        self.assertGreater(fetch_calls[0], client_start)
        self.assertNotIn("const DataClient", APP_JS)

    def test_all_runtime_datasets_have_contracts(self):
        expected = {
            "curve-us",
            "fed-policy",
            "equity-valuation",
            "sp500-valuation",
            "sp500-pe-history",
            "mag7-valuation",
            "etf-performance",
            "fixed-income-performance",
            "etf-geography",
        }
        definitions = DATA_CLIENT_JS[
            DATA_CLIENT_JS.index("const DATASET_DEFINITIONS"):DATA_CLIENT_JS.index("const DataClient")
        ]
        for dataset_id in expected:
            self.assertIn(f'"{dataset_id}"', definitions)

    def test_modules_use_isolated_results_instead_of_throwing_batch(self):
        self.assertIn('DataClient.loadMany(["etf-performance", "fixed-income-performance"])', APP_JS)
        self.assertIn('DataClient.load("curve-us")', CURVES_FED_JS)
        self.assertIn('DataClient.load("fed-policy")', CURVES_FED_JS)
        self.assertIn('DataClient.loadMany([', VALUATION_JS)
        self.assertIn('DataClient.load("etf-geography")', APP_JS)
        self.assertIn("if (!mainResult.ok)", APP_JS)
        self.assertIn("if (!result.ok)", CURVES_FED_JS)

    def test_data_lab_exposes_provenance_and_freshness(self):
        for label in (
            "Proveniência do Data Lab",
            "Base principal",
            "Renda fixa de contingência",
            "Dados",
            "Status",
            "Fonte",
        ):
            self.assertIn(label, APP_JS)
        self.assertIn('fallbackDataset: "fixed-income-performance"', APP_JS)
        self.assertIn("dataStatus: fixedResult.meta.status", APP_JS)

    def test_newer_dataset_supersedes_stale_manifest_warnings(self):
        self.assertIn("function payloadIsNewerThanManifest", DATA_CLIENT_JS)
        self.assertIn("function deriveDatasetStatus", DATA_CLIENT_JS)
        self.assertIn("const newerThanManifest = payloadIsNewerThanManifest(data, manifestEntry)", DATA_CLIENT_JS)
        self.assertIn("status: newerThanManifest", DATA_CLIENT_JS)
        self.assertRegex(DATA_CLIENT_JS, r"issues:\s*newerThanManifest\s*\?\s*\[\]")

    def test_raw_dataset_errors_are_not_rendered_publicly(self):
        self.assertNotIn("Falha no arquivo local:", RUNTIME_JS)
        self.assertNotIn("${fedPolicy._datasetMeta.error}", RUNTIME_JS)


if __name__ == "__main__":
    unittest.main()
