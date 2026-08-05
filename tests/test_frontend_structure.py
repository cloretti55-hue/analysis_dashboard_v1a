from pathlib import Path
import unittest


ROOT = Path(__file__).resolve().parents[1]
INDEX = (ROOT / "index.html").read_text(encoding="utf-8")
APP_CSS = ROOT / "assets" / "css" / "app.css"
APP_JS = ROOT / "assets" / "js" / "app.js"
DATA_CLIENT_JS = ROOT / "assets" / "js" / "core" / "data-client.js"


class FrontendStructureTests(unittest.TestCase):
    def test_global_styles_are_loaded_from_local_stylesheet(self):
        self.assertIn('href="assets/css/app.css"', INDEX)
        self.assertNotIn("<style>", INDEX)
        self.assertTrue(APP_CSS.is_file())
        self.assertGreater(APP_CSS.stat().st_size, 1_000)
        css = APP_CSS.read_text(encoding="utf-8")
        self.assertNotIn("home-market-background.png", css)

    def test_application_script_is_loaded_from_local_file(self):
        self.assertIn('src="assets/js/app.js"', INDEX)
        self.assertIn('src="assets/js/core/data-client.js"', INDEX)
        self.assertNotIn("<script>", INDEX)
        self.assertTrue(APP_JS.is_file())
        self.assertTrue(DATA_CLIENT_JS.is_file())
        self.assertGreater(APP_JS.stat().st_size, 1_000)
        self.assertGreater(DATA_CLIENT_JS.stat().st_size, 1_000)
        self.assertLess(
            INDEX.index('src="assets/js/core/data-client.js"'),
            INDEX.index('src="assets/js/app.js"'),
        )


if __name__ == "__main__":
    unittest.main()
