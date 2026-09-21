# barishizm.eu

Personal website of Barış Akıntı — AI Systems student, showcasing projects, blog posts, and experience. Fully static (HTML5, CSS3, vanilla JS), hosted on GitHub Pages, served at [www.barishizm.eu](https://www.barishizm.eu).

## Stack

- No build step, no framework, no dependencies — plain HTML/CSS/JS served as-is.
- Self-hosted fonts (Anton, Archivo) and icons in [assets/](assets/); no third-party requests except analytics (disclosed in [privacy.html](privacy.html)).
- [GoatCounter](https://www.goatcounter.com) for privacy-friendly analytics ([js/goatcounter.js](js/goatcounter.js)).
- Contact form builds a `mailto:` link (nothing is sent to a server).
- Strict per-page `Content-Security-Policy` meta tag (`default-src 'self'`).

## Structure

```
index.html, about.html, projects.html,      top-level pages.
blog.html, experience.html, contact.html,
privacy.html, 404.html
posts/                                      blog posts.
project/                                    project write-ups (chest-xray, ai-search-engine, age-detection), served at /project/… (singular: a projects/ folder would collide with projects.html on GitHub Pages).
tr/                                         Turkish version of every page above (tr/index.html, tr/about.html, tr/posts/…, tr/project/…), served at /tr/….
_templates/post-template.html               template for new English posts (not deployed: underscore folders are skipped by GitHub Pages).
_templates/post-template.tr.html            template for the matching Turkish post (goes to tr/posts/).
_templates/og-image.html                    1200×630 Open Graph card template for posts (dev-only; usage in the file header).
css/main.css                                shared layout, components, language switch.
css/pages.css                               per-page styles.
js/main.js                                  mobile nav, contact form.
js/dust.js                                  decorative dust canvas on the home hero (idle-started, ~30 fps, paused off-screen, respects reduced motion).
js/goatcounter.js                           analytics snippet.
assets/fonts, assets/icons, assets/images   static assets (assets/images/og/ holds one OG card per post).
assets/cv.pdf                               downloadable CV
_src/                                       original/source images (not deployed: underscore folders are skipped by GitHub Pages).
_tools/                                     small maintenance scripts (not deployed), see "Maintenance scripts".
CNAME, robots.txt, sitemap.xml, llms.txt    hosting / SEO / crawler metadata
feed.xml, tr/feed.xml                       RSS feeds of the blog, English and Turkish (linked from each page's <head>).
favicon.ico                                 legacy favicon for crawlers/browsers
```

## Localization

Each language has its own URLs, so both can be indexed: English lives at `/…` (e.g. `/about`), Turkish at `/tr/…` (e.g. `/tr/about`). Every page is a separate single-language file: `about.html` ⇄ `tr/about.html`, `posts/agents.html` ⇄ `tr/posts/agents.html`, and so on. Nothing is hidden with CSS and nothing is stored in the browser.

Every page pair is tied together in `<head>`:

```html
<link rel="canonical" href="https://www.barishizm.eu/tr/about">
<link rel="alternate" hreflang="en" href="https://www.barishizm.eu/about">
<link rel="alternate" hreflang="tr" href="https://www.barishizm.eu/tr/about">
<link rel="alternate" hreflang="x-default" href="https://www.barishizm.eu/about">
```

(canonical points at the page itself; hreflang links must be reciprocal, i.e. the English page lists the same three). `og:locale` / `og:locale:alternate` and `inLanguage` in the JSON-LD follow the page language. The `EN / TR` switch in the top bar (`.lang-toggle`) is a plain link to the same page in the other language; there is no automatic redirect by browser language. Each language has its own sitemap entries, RSS feed and Open Graph cards.

When you edit a page, edit both files. Root-absolute links are used inside `tr/` (`/css/main.css`, `/tr/about`), so pages can be copied between folders without breaking.

## Writing a blog post

Every post is two files with the same slug: English in `posts/`, Turkish in `tr/posts/`.

1. Copy [_templates/post-template.html](_templates/post-template.html) to `posts/your-slug.html` and [_templates/post-template.tr.html](_templates/post-template.tr.html) to `tr/posts/your-slug.html`.
2. Fill in the `TODO` fields in both: `<title>`, meta description, date, article title and body.
3. Add a new `<li class="post-item">` entry at the top of the list in [blog.html](blog.html) and [tr/blog.html](tr/blog.html).
4. Add two `<url>` entries to [sitemap.xml](sitemap.xml) (`/posts/your-slug` and `/tr/posts/your-slug`). `<lastmod>` is the date the page's *content* last changed (not the build date); bump it only for real edits.
5. Add a new `<item>` at the top of [feed.xml](feed.xml) and [tr/feed.xml](tr/feed.xml) and update their `<lastBuildDate>`.
6. Generate both Open Graph cards with [_templates/og-image.html](_templates/og-image.html) (instructions in the file header): `assets/images/og/your-slug.jpg` and `assets/images/og/your-slug-tr.jpg` (add `&lang=tr` for the Turkish card).
7. Uncomment and fill in the SEO block (`canonical`, hreflang pair, Open Graph incl. `og:image:alt`, JSON-LD) in each post's `<head>`. Keep `dateModified` equal to the last real content edit.
8. Fill in the byline, the "Further reading" sources and the "Keep reading" links at the end of each post; if a project write-up relates to the topic, add a "See it in practice" link to it.
9. Add the BreadcrumbList block from the template and keep the author name as `Barış Akıntı` (the formal `M. Barış Akıntı` lives only in `alternateName`).

## Project write-ups

`project/<slug>.html` and `tr/project/<slug>.html` are written from each repository's README and code, and only state facts found there (no invented metrics). When a repo changes, re-check the write-up. Their images come from `assets/images/projects/` (AVIF, WebP and JPEG at 600/900/1200 px) and their Open Graph cards from `assets/images/og/project-<slug>.jpg`.

## Maintenance scripts

Run from the repo root; none of them is needed to deploy.

- `python3 _tools/build-project-images.py`: rebuilds the responsive project images and OG crops from the 1200×800 JPEG masters (needs Pillow ≥ 11.3).
- `python3 _tools/portrait-silhouette.py`: prints the `ROWS` constant used by `js/dust.js`; re-run it if the portrait image changes.
- `python3 _tools/update-sitemap-lastmod.py`: sets `<lastmod>` in `sitemap.xml` to today for every page whose file changed since the last run (`--dry-run` to preview, `--init` to record the current state). Keep JSON-LD `dateModified` equal to the sitemap date; the script warns when they differ.

## Local development

No build tooling required — serve the directory root and open it in a browser:

```bash
npx serve .            # handles extensionless URLs like /about and /tr/about, as GitHub Pages does
# or
python3 -m http.server 8000   # only serves /index.html-style paths; use /about.html, /tr/about.html
```

## Deployment

Static hosting via GitHub Pages, custom domain pinned by [CNAME](CNAME). Pushing to `main` publishes automatically.
