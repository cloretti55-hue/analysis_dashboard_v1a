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

    def test_data_lab_links_are_conditional_on_the_instrument_catalog(self):
        self.assertIn("function DataLabTickerLink", ETFS_JS)
        self.assertIn('DataClient.load("etf-universe")', ETFS_JS)
        self.assertIn("if (!availableTickers?.has(ticker)) return null", ETFS_JS)
        self.assertIn('href: `#dataLab/${encodeURIComponent(ticker)}`', ETFS_JS)

    def test_all_seven_etf_areas_are_preserved(self):
        for label in (
            "Fixed Income",
            "Core Equities",
            "Sectors",
            "US Satellites",
            "European Themes",
            "China / China+1",
            "Hedge",
        ):
            self.assertIn(label, ETFS_JS)


if __name__ == "__main__":
    unittest.main()
