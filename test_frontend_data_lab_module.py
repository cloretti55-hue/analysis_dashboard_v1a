from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
DATA_LAB_JS = (ROOT / "assets" / "js" / "modules" / "data-lab.js").read_text(encoding="utf-8")
INSTRUMENT_REGISTRY_JS = (ROOT / "assets" / "js" / "core" / "instrument-registry.js").read_text(encoding="utf-8")


class FrontendDataLabModuleTests(unittest.TestCase):
    def test_module_uses_an_explicit_namespace(self):
        self.assertIn("window.GCDataLab = {", DATA_LAB_JS)
        self.assertIn("} = window.GCDataLab;", APP_JS)

    def test_data_lab_components_live_outside_app(self):
        for component in ("DataLabLineChart", "DataLabModule"):
            self.assertIn(f"function {component}", DATA_LAB_JS)
            self.assertNotIn(f"function {component}", APP_JS)

    def test_data_loading_and_fallback_are_owned_by_module(self):
        self.assertIn('DataClient.loadMany(["etf-universe", "etf-performance", "fixed-income-performance"])', DATA_LAB_JS)
        self.assertIn("InstrumentRegistry.createCatalog", DATA_LAB_JS)
        self.assertIn('fallbackDataset: "fixed-income-performance"', DATA_LAB_JS)
        self.assertNotIn("category.includes", DATA_LAB_JS)
        self.assertNotIn('"etf-performance"', APP_JS)
        self.assertNotIn('"fixed-income-performance"', APP_JS)

    def test_filters_metrics_and_provenance_are_preserved(self):
        for label in (
            "Fixed Income",
            "Core Equities",
            "Sectors",
            "US Satellites",
            "European Themes",
            "China / China+1",
            "Hedge",
            "Data Lab provenance",
            "Primary dataset",
            "Fixed-income contingency",
        ):
            self.assertIn(label, DATA_LAB_JS + INSTRUMENT_REGISTRY_JS)
        for metric in (
            "returnYtdPct",
            "return1yPct",
            "return3yAnnPct",
            "return5yAnnPct",
            "vol1yAnnPct",
            "maxDrawdown1yPct",
            "beta1yVsSp500",
        ):
            self.assertIn(metric, INSTRUMENT_REGISTRY_JS)


if __name__ == "__main__":
    unittest.main()
