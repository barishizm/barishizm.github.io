#!/usr/bin/env python3
"""Prints the ROWS constant used by js/dust.js: the portrait's silhouette extents (as fractions of its
width) for each row of the dissolve band. Re-run it and paste the output into dust.js if the portrait
image, BAND_START or SAMPLE_W ever change.   python3 _tools/portrait-silhouette.py  (needs Pillow)"""
from PIL import Image
import json

BAND_START = 0.80     # keep in sync with dust.js and the mask in css/main.css
SAMPLE_W = 108
im = Image.open("assets/images/PP-remove-bg-io-clean.png").convert("RGBA")
sh = round(SAMPLE_W * im.height / im.width)
a = im.resize((SAMPLE_W, sh), Image.BOX).getchannel("A")
rows = []
for y in range(int(BAND_START * sh), sh):
    xs = [x for x in range(SAMPLE_W) if a.getpixel((x, y)) > 40]
    rows.append([round(xs[0] / SAMPLE_W, 3), round((xs[-1] + 1) / SAMPLE_W, 3)] if xs else None)
print("var ROWS = " + json.dumps(rows, separators=(",", ":")) + ";  /* " + f"{len(rows)} rows, {SAMPLE_W}px sample, band from {BAND_START} */")
