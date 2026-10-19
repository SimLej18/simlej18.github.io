"""Export the one-page resume as `static/Simon_Lejoly_resume.pdf`, with headless Chromium. With the dev server running
(`npm run dev`), from the repo root:

    uvx --with playwright python scripts/export_resume_pdf.py [base URL, default http://localhost:5173]

(once beforehand: `uvx playwright install chromium`). `?static` freezes the GP on its first frame."""

import sys
from pathlib import Path

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:5173"
OUT = Path(__file__).resolve().parent.parent / "static" / "Simon_Lejoly_resume.pdf"

with sync_playwright() as playwright:
	browser = playwright.chromium.launch()
	page = browser.new_page()
	page.goto(f"{BASE}/resume?static", wait_until="networkidle")
	page.wait_for_selector(".sheet[data-ready]")
	page.pdf(path=OUT, prefer_css_page_size=True, print_background=True)
	browser.close()
