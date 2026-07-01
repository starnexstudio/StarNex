#!/usr/bin/env python3
"""Regenerate css/style.min.css from css/style.css.

style.css is the source of truth; style.min.css is what the HTML actually
references. Run this after every edit to style.css so the two never drift
out of sync (requires: pip install rcssmin).
"""
import pathlib
import rcssmin

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "css" / "style.css"
OUT = ROOT / "css" / "style.min.css"

def main():
    css = SRC.read_text(encoding="utf-8")
    minified = rcssmin.cssmin(css)
    OUT.write_text(minified, encoding="utf-8")
    print(f"Wrote {OUT} ({len(minified):,} bytes, from {len(css):,} bytes)")

if __name__ == "__main__":
    main()
