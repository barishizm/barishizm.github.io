#!/usr/bin/env python3
"""Builds the responsive variants of the project images used on the home page, /projects and the
project write-ups. Master = assets/images/projects/<slug>.jpg (1200x800). Requires Pillow >= 11.3
(native AVIF + WebP). Run from the repo root:  python3 _tools/build-project-images.py

Output, per slug:  <slug>-{600,900,1200}.{avif,webp}   <slug>-{600,900}.jpg   (the 1200 JPEG is the master)
                   assets/images/og/project-<slug>.jpg  (1200x630 centre crop for og:image)
"""
from pathlib import Path
from PIL import Image

SLUGS = ["ai-search-engine", "chest-xray", "age-detection"]
WIDTHS = [600, 900, 1200]
DIR = Path("assets/images/projects")
OG = Path("assets/images/og")

for slug in SLUGS:
    master = Image.open(DIR / f"{slug}.jpg").convert("RGB")
    assert master.size == (1200, 800), master.size
    for w in WIDTHS:
        im = master if w == 1200 else master.resize((w, round(w * 800 / 1200)), Image.LANCZOS)
        im.save(DIR / f"{slug}-{w}.avif", quality=52, speed=4)
        im.save(DIR / f"{slug}-{w}.webp", quality=80, method=6)
        if w != 1200:
            im.save(DIR / f"{slug}-{w}.jpg", quality=80, optimize=True, progressive=True)
    top = (800 - 630) // 2
    master.crop((0, top, 1200, top + 630)).save(OG / f"project-{slug}.jpg", quality=84, optimize=True, progressive=True)
    print("built", slug)
