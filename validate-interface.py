from __future__ import annotations

import re
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

from playwright.sync_api import Page, sync_playwright


PROJECT_ROOT = Path(__file__).resolve().parents[1]

VIEWPORTS = {
    "computador": {"width": 1440, "height": 900},
    "celular": {"width": 390, "height": 844},
}

MODULES = (
    (r"(Yield Curves|Rates)", "curve", "Yield Curves"),
    ("Equity Valuation", "equity", "Stock Market Valuation"),
    ("ETFs", "etfs", "Arquitetura de ETFs"),
    ("Data Lab", "dataLab", "Data Lab"),
    (r"(Páginas temáticas|Temas)", "tech", "Temas"),
)


class QuietHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(PROJECT_ROOT), **kwargs)

    def log_message(self, _format: str, *args) -> None:
        return


def assert_no_horizontal_overflow(page: Page, context: str) -> None:
    has_overflow = page.evaluate(
        "document.documentElement.scrollWidth > window.innerWidth + 1"
    )
    if has_overflow:
        raise AssertionError(f"Rolagem horizontal inesperada em {context}")


def wait_for_home(page: Page, base_url: str) -> None:
    page.goto(base_url, wait_until="domcontentloaded")
    page.get_by_text("Arquitetura Global", exact=True).wait_for(
        state="visible", timeout=30_000
    )


def check_viewport(browser, base_url: str, label: str, viewport: dict[str, int]) -> None:
    context = browser.new_context(viewport=viewport)
    page = context.new_page()
    runtime_errors: list[str] = []

    page.on("pageerror", lambda error: runtime_errors.append(str(error)))
    page.on(
        "console",
        lambda message: runtime_errors.append(f"console: {message.text}")
        if message.type == "error"
        else None,
    )

    try:
        wait_for_home(page, base_url)
        assert_no_horizontal_overflow(page, f"Home ({label})")

        theme_button = page.get_by_role(
            "button", name=re.compile(r"^(Claro|Escuro)$", re.IGNORECASE)
        ).first
        theme_before = theme_button.inner_text()
        theme_button.click()
        theme_after = theme_button.inner_text()
        if theme_before == theme_after:
            raise AssertionError(f"O seletor de tema não respondeu em {label}")

        for card_pattern, module_hash, module_title in MODULES:
            wait_for_home(page, base_url)
            page.get_by_role(
                "button", name=re.compile(card_pattern, re.IGNORECASE)
            ).first.click()
            page.wait_for_url(re.compile(rf"#{re.escape(module_hash)}$"), timeout=15_000)
            page.get_by_text(module_title, exact=True).first.wait_for(
                state="visible", timeout=15_000
            )
            assert_no_horizontal_overflow(page, f"{module_title} ({label})")

        if runtime_errors:
            details = "\n".join(f"- {error}" for error in runtime_errors)
            raise AssertionError(f"Erros no navegador em {label}:\n{details}")
    finally:
        context.close()


def main() -> None:
    server = ThreadingHTTPServer(("127.0.0.1", 0), QuietHandler)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    base_url = f"http://127.0.0.1:{server.server_port}/"

    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(headless=True)
            try:
                for label, viewport in VIEWPORTS.items():
                    check_viewport(browser, base_url, label, viewport)
            finally:
                browser.close()
    finally:
        server.shutdown()
        server.server_close()
        server_thread.join(timeout=5)

    print(
        "OK: Home, cinco áreas, temas e responsividade validados "
        "em computador e celular."
    )


if __name__ == "__main__":
    main()
