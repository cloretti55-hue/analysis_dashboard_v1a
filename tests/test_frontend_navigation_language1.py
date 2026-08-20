from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
COMMON_JS = (ROOT / "assets" / "js" / "components" / "common.js").read_text(encoding="utf-8")
APP_JS = (ROOT / "assets" / "js" / "app.js").read_text(encoding="utf-8")
CURVES_JS = (ROOT / "assets" / "js" / "modules" / "curves-fed.js").read_text(encoding="utf-8")
VALUATION_JS = (ROOT / "assets" / "js" / "modules" / "valuation.js").read_text(encoding="utf-8")
ETFS_JS = (ROOT / "assets" / "js" / "modules" / "etfs.js").read_text(encoding="utf-8")
DATA_LAB_JS = (ROOT / "assets" / "js" / "modules" / "data-lab.js").read_text(encoding="utf-8")


class FrontendNavigationLanguageTests(unittest.TestCase):
    def test_primary_navigation_uses_the_phase_four_hierarchy(self):
        expected = (
            '["home", "Visão geral"]',
            '["curve", "Macro"]',
            '["equity", "Valuation"]',
            '["etfs", "Instrumentos"]',
            '["dataLab", "Data Lab"]',
            '["tech", "Temas"]',
        )
        positions = [COMMON_JS.index(item) for item in expected]
        self.assertEqual(positions, sorted(positions))

    def test_existing_hash_routes_are_preserved(self):
        for key in ("home", "curve", "equity", "etfs", "dataLab", "tech"):
            self.assertIn(f'["{key}",', COMMON_JS)
        self.assertIn("function moduleFromHash()", COMMON_JS)

    def test_analysis_guide_is_shared_on_desktop_and_mobile(self):
        for label in ("Fato", "Cálculo", "Interpretação", "Limitação"):
            self.assertIn(f'"{label}"', COMMON_JS)
        self.assertGreaterEqual(APP_JS.count("React.createElement(AnalysisGuide"), 2)

    def test_instruments_link_to_data_lab(self):
        self.assertIn("function EtfsModule({ onOpenDataLab } = {})", ETFS_JS)
        self.assertIn('"Abrir Data Lab"', ETFS_JS)
        self.assertIn('onOpenDataLab: () => setActiveModule("dataLab")', APP_JS)

    def test_public_copy_avoids_prescriptive_phrases(self):
        public_copy = "\n".join((COMMON_JS, CURVES_JS, VALUATION_JS, ETFS_JS, DATA_LAB_JS))
        for phrase in (
            "Implicações para alocação",
            '"Conclusão"',
            "Comprar S&P 500",
            "as melhores teses",
            "Boa escolha",
            "Melhor vocação",
            "Bom para",
            "Útil para",
            "Comprar China",
            "compra o setor",
        ):
            self.assertNotIn(phrase, public_copy)

    def test_data_lab_groups_are_presented_in_portuguese(self):
        self.assertIn('"Renda fixa"', DATA_LAB_JS)
        self.assertIn('"Ações amplas"', DATA_LAB_JS)
        self.assertNotIn('useState("Fixed Income")', DATA_LAB_JS)


if __name__ == "__main__":
    unittest.main()
