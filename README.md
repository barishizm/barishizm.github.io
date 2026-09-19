# barishizm.eu

Personal website of M. Barış Akıntı — AI Systems student, showcasing projects, blog posts, and experience. Fully static (HTML5, CSS3, vanilla JS), hosted on GitHub Pages, served at [www.barishizm.eu](https://www.barishizm.eu).

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
_templates/post-template.html               template for new posts (not deployed: underscore folders are skipped by GitHub Pages).
_templates/og-image.html                    1200×630 Open Graph card template for posts (dev-only; usage in the file header).
css/main.css                                shared layout, components, EN/TR rules.
css/pages.css                               per-page styles.
js/main.js                                  nav, language toggle, contact form.
js/lang-init.js                             restores saved language before paint.
js/goatcounter.js                           analytics snippet.
assets/fonts, assets/icons, assets/images   static assets (assets/images/og/ holds one OG card per post).
assets/cv.pdf                               downloadable CV
CNAME, robots.txt, sitemap.xml, llms.txt    hosting / SEO / crawler metadata
feed.xml                                    RSS feed of the blog (linked from every page's <head>).
favicon.ico                                 legacy favicon for crawlers/browsers
```

## Localization

English and Turkish content live side by side in the same HTML, tagged with `lang="en"` / `lang="tr"`. CSS hides the inactive language ([css/main.css:506](css/main.css#L506)):

```css
html[lang="en"] [lang="tr"]{ display: none !important; }
html[lang="tr"] [lang="en"]{ display: none !important; }
```

Clicking `.lang-toggle` flips `<html lang>` and persists the choice to `localStorage` ([js/main.js](js/main.js)); [js/lang-init.js](js/lang-init.js) reapplies it synchronously in `<head>` on every subsequent load to avoid a flash of the wrong language.

## Writing a blog post

1. Copy [_templates/post-template.html](_templates/post-template.html) to `posts/your-slug.html`.
2. Fill in the `TODO` fields: `<title>`, meta description, date, article title, and the EN/TR body blocks.
3. Add a new `<li class="post-item">` entry at the top of the list in [blog.html](blog.html).
4. Add a matching `<url>` entry to [sitemap.xml](sitemap.xml). `<lastmod>` is the date the page's *content* last changed (not the build date); bump it only for real edits.
5. Add a new `<item>` at the top of [feed.xml](feed.xml) and update its `<lastBuildDate>`.
6. Generate the post's Open Graph card with [_templates/og-image.html](_templates/og-image.html) (instructions in the file header) and save it as `assets/images/og/your-slug.jpg`.
7. Uncomment and fill in the SEO block (`canonical`, Open Graph incl. `og:image:alt`, JSON-LD) in the post's `<head>`. Keep `dateModified` equal to the last real content edit.
8. Fill in the byline, the "Further reading" sources and the "Keep reading" links at the end of the post.

## Local development

No build tooling required — serve the directory root and open it in a browser:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## Deployment

Static hosting via GitHub Pages, custom domain pinned by [CNAME](CNAME). Pushing to `main` publishes automatically.
