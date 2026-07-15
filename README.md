# barishizm.eu

Personal website of M. Barış Akıntı — AI Systems student, showcasing projects, blog posts, and experience. Fully static (HTML5, CSS3, vanilla JS), hosted on GitHub Pages, served at [www.barishizm.eu](https://www.barishizm.eu).

## Stack

- No build step, no framework, no dependencies — plain HTML/CSS/JS served as-is.
- Self-hosted fonts (Anton, Archivo) and icons in [assets/](assets/); no third-party requests except analytics.
- [GoatCounter](https://www.goatcounter.com) for privacy-friendly analytics ([js/goatcounter.js](js/goatcounter.js)).
- [FormSubmit](https://formsubmit.co) / `mailto:` fallback for the contact form.
- Strict per-page `Content-Security-Policy` meta tag (`default-src 'self'`).

## Structure

```
index.html, about.html, projects.html,      top-level pages.
blog.html, experience.html, contact.html,
privacy.html, 404.html, thanks.html
posts/                                      blog posts + template.html for new ones
css/main.css                                shared layout, components, EN/TR rules
css/pages.css                               per-page styles
js/main.js                                  nav, language toggle, contact form
js/lang-init.js                             restores saved language before paint
js/goatcounter.js                           analytics snippet
assets/fonts, assets/icons, assets/images   static assets
assets/cv.pdf                               downloadable CV
CNAME, robots.txt, sitemap.xml, llms.txt    hosting / SEO / crawler metadata
```

## Localization

English and Turkish content live side by side in the same HTML, tagged with `lang="en"` / `lang="tr"`. CSS hides the inactive language ([css/main.css:506](css/main.css#L506)):

```css
html[lang="en"] [lang="tr"]{ display: none !important; }
html[lang="tr"] [lang="en"]{ display: none !important; }
```

Clicking `.lang-toggle` flips `<html lang>` and persists the choice to `localStorage` ([js/main.js](js/main.js)); [js/lang-init.js](js/lang-init.js) reapplies it synchronously in `<head>` on every subsequent load to avoid a flash of the wrong language.

## Writing a blog post

1. Copy [posts/template.html](posts/template.html) to `posts/your-slug.html`.
2. Fill in the `TODO` fields: `<title>`, meta description, date, article title, and the EN/TR body blocks.
3. Add a new `<li class="post-item">` entry at the top of the list in [blog.html](blog.html).
4. Add a matching `<url>` entry to [sitemap.xml](sitemap.xml).
5. Uncomment and fill in the SEO block (`canonical`, Open Graph, JSON-LD) in the post's `<head>`.

## Local development

No build tooling required — serve the directory root and open it in a browser:

```bash
python3 -m http.server 8000
# or
npx serve .
```

## Deployment

Static hosting via GitHub Pages, custom domain pinned by [CNAME](CNAME). Pushing to `main` publishes automatically.
