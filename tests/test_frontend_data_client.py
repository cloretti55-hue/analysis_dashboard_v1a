import re
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")


class FrontendDataClientTests(unittest.TestCase):
    def test_runtime_does_not_depend_on_github_raw(self):
        self.assertNotIn("raw.githubusercontent.com", INDEX)

    def test_fetch_is_centralized_in_data_client(self):
        fetch_calls = [match.start() for match in re.finditer(r"\bfetch\(", INDEX)]
        self.assertEqual(len(fetch_calls), 1)
        client_start = INDEX.index("const DataClient")
        client_end = INDEX.index("const DATASET_STATUS_LABELS")
        self.assertGreater(fetch_calls[0], client_start)
        self.assertLess(fetch_calls[0], client_end)

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
        definitions = INDEX[INDEX.index("const DATASET_DEFINITIONS"):INDEX.index("const DataClient")]
        for dataset_id in expected:
            self.assertIn(f'"{dataset_id}"', definitions)

    def test_modules_use_isolated_results_instead_of_throwing_batch(self):
        self.assertIn('DataClient.loadMany(["etf-performance", "fixed-income-performance"])', INDEX)
        self.assertIn('DataClient.load("curve-us")', INDEX)
        self.assertIn('DataClient.load("fed-policy")', INDEX)
        self.assertIn('DataClient.load("etf-geography")', INDEX)
        self.assertIn("if (!mainResult.ok)", INDEX)
        self.assertIn("if (!result.ok)", INDEX)

    def test_data_lab_exposes_provenance_and_freshness(self):
        for label in (
            "Proveniência do Data Lab",
            "Base principal",
            "Renda fixa de contingência",
            "Dados",
            "Status",
            "Fonte",
        ):
            self.assertIn(label, INDEX)
        self.assertIn('fallbackDataset: "fixed-income-performance"', INDEX)
        self.assertIn("dataStatus: fixedResult.meta.status", INDEX)

    def test_newer_dataset_supersedes_stale_manifest_warnings(self):
        self.assertIn("function payloadIsNewerThanManifest", INDEX)
        self.assertIn("function deriveDatasetStatus", INDEX)
        self.assertIn("const newerThanManifest = payloadIsNewerThanManifest(data, manifestEntry)", INDEX)
        self.assertIn("status: newerThanManifest", INDEX)
        self.assertRegex(INDEX, r"issues:\s*newerThanManifest\s*\?\s*\[\]")

    def test_raw_dataset_errors_are_not_rendered_publicly(self):
        self.assertNotIn("Falha no arquivo local:", INDEX)
        self.assertNotIn("${fedPolicy._datasetMeta.error}", INDEX)


if __name__ == "__main__":
    unittest.main()
