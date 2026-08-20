from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
ETFS_JS = (ROOT / "assets" / "js" / "modules" / "etfs.js").read_text(encoding="utf-8")


class FrontendEtfsModuleTests(unittest.TestCase):
    def test_module_uses_an_explicit_namespace(self):
        self.assertIn("window.GCEtfs = {", ETFS_JS)
        self.assertIn("} = window.GCEtfs;", APP_JS)

    def test_etf_components_live_outside_app(self):
        for component in (
            "SatelliteModule",
            "EuropeModule",
            "ChinaModule",
            "HedgeModule",
            "CoreModule",
            "FixedIncomeModule",
            "SectorGicsModule",
            "EtfsModule",
        ):
            self.assertIn(f"function {component}", ETFS_JS)
            self.assertNotIn(f"function {component}", APP_JS)

    def test_geography_loading_is_owned_by_etfs_module(self):
        self.assertIn('DataClient.load("etf-geography")', ETFS_JS)
        self.assertNotIn('DataClient.load("etf-geography")', APP_JS)

    def test_all_seven_etf_areas_are_preserved(self):
        for label in (
            "Renda fixa",
            "Ações amplas",
            "Setoriais",
            "Satélites EUA",
            "Temas Europeus",
            "China / China+1",
            "Hedge",
        ):
            self.assertIn(label, ETFS_JS)


if __name__ == "__main__":
    unittest.main()
