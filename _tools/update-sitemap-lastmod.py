#!/usr/bin/env python3
"""Keeps <lastmod> in sitemap.xml honest: a page's date moves to today only when its file's content
actually changed since the last run (sha256 of the file, remembered in _tools/lastmod-hashes.json).

  python3 _tools/update-sitemap-lastmod.py --init       record the current state, change nothing
  python3 _tools/update-sitemap-lastmod.py --dry-run    show which pages changed
  python3 _tools/update-sitemap-lastmod.py              bump those pages to today (or --date YYYY-MM-DD)

After a run it also warns when a page's JSON-LD "dateModified" differs from its sitemap date: keep the two equal.
"""
import argparse, datetime, hashlib, json, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STORE = ROOT / "_tools" / "lastmod-hashes.json"
HOST = "https://www.barishizm.eu"

def file_for(url):
    path = url[len(HOST):].strip("/")
    if path in ("", "tr"): return ROOT / ("tr/index.html" if path == "tr" else "index.html")
    return ROOT / (path + ".html")

ap = argparse.ArgumentParser()
ap.add_argument("--init", action="store_true"); ap.add_argument("--dry-run", action="store_true")
ap.add_argument("--date", default=datetime.date.today().isoformat())
a = ap.parse_args()

xml = (ROOT / "sitemap.xml").read_text(encoding="utf8")
old = json.loads(STORE.read_text()) if STORE.exists() else {}
new, changed, out = {}, [], xml
for m in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", xml):
    url, last = m.group(1), m.group(2)
    f = file_for(url)
    if not f.exists():
        print(f"MISSING FILE for {url}"); continue
    h = hashlib.sha256(f.read_bytes()).hexdigest()
    new[url] = h
    if not a.init and old.get(url) != h:
        changed.append((url, last))
        out = out.replace(m.group(0), m.group(0).replace(f"<lastmod>{last}</lastmod>", f"<lastmod>{a.date}</lastmod>"))
if a.init:
    STORE.write_text(json.dumps(new, indent=1) + "\n"); print(f"recorded {len(new)} pages"); sys.exit()
for url, last in changed: print(f"changed: {url}  ({last} -> {a.date})")
if not changed: print("no page changed")
if changed and not a.dry_run:
    (ROOT / "sitemap.xml").write_text(out, encoding="utf8"); STORE.write_text(json.dumps(new, indent=1) + "\n"); print("sitemap.xml updated")
# JSON-LD dateModified vs sitemap date
final = out if not a.dry_run else xml
for m in re.finditer(r"<loc>([^<]+)</loc>\s*<lastmod>([^<]+)</lastmod>", final):
    f = file_for(m.group(1))
    if f.exists():
        dm = re.findall(r'"dateModified":\s*"(\d{4}-\d{2}-\d{2})"', f.read_text(encoding="utf8"))
        if dm and dm[0] != m.group(2): print(f"WARNING: {m.group(1)} JSON-LD dateModified {dm[0]} != sitemap {m.group(2)}")
