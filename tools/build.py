"""Build index.html (the GitHub Pages page) from heat-lab.html (the source).

heat-lab.html has no <html>/<head> wrapper. This script wraps it in a document with a charset,
viewport, description and an inline favicon.

Usage, from the repo root:  python3 tools/build.py
"""
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "heat-lab.html")
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(ROOT, "index.html")

HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='3' y='6' width='26' height='20' rx='3' fill='none' stroke='%2317212c' stroke-width='2'/%3E%3Cpath d='M8 21c3-8 5 2 8-6s5 2 8-6' fill='none' stroke='%23a51c30' stroke-width='2.4' stroke-linecap='round'/%3E%3C/svg%3E">
<meta name="description" content="Interactive heat-flow models for ES 192, Harvard SEAS: a chip heat sink, steady versus changing heat flow through a wall, the laser-flash test, and a conductivity-diffusivity selection chart.">
<style>html{color-scheme:light}</style>
'''

s = open(src, encoding="utf-8").read()
i = s.index('<header class="bar">')   # everything before the top bar belongs in <head>
open(out, "w", encoding="utf-8").write(HEAD + s[:i] + "</head>\n<body>\n" + s[i:] + "\n</body>\n</html>\n")
print("wrote", os.path.relpath(out, ROOT))
