# SEO Audit — https://www.barishizm.eu/

Audit date: 2026-09-19 · Business type: **Personal portfolio / professional profile with a small blog** (no local, e-commerce or SaaS signals)

## Scope and limits (read first)

- The bundled claude-seo Python runtime could not run (needs Python 3.10+; this machine's `python3` is 3.9.6). No global installs were made. The audit was done inline with `curl` against the live site plus the source in this repo. The live `index.html` matches the local file byte-for-byte (9,949 bytes).
- **Not measured:** Core Web Vitals (PageSpeed API returned 429 quota with no key; no CrUX/GSC/GA4), backlinks, SERP rankings/indexation, screenshots (no Playwright). Performance is judged from source only.
- Subagents were not spawned: the site is 11 indexable pages, so specialists would have re-read the same files.
- Pages reviewed: all 11 sitemap URLs plus `404`, `thanks`, `privacy_policy`, `posts/template`, robots.txt, sitemap.xml, llms.txt, humans.txt, manifest, JS/CSS.

## SEO Health Score: **77 / 100**

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 86 | 18.9 |
| Content Quality | 23% | 62 | 14.3 |
| On-Page SEO | 20% | 74 | 14.8 |
| Schema / Structured Data | 10% | 78 | 7.8 |
| Performance (CWV) — *estimated, unmeasured* | 10% | 90 | 9.0 |
| AI Search Readiness | 10% | 74 | 7.4 |
| Images | 5% | 88 | 4.4 |
| **Total** | | | **76.6 → 77** |

The technical foundation is strong. The gaps are content depth, the homepage, and a bilingual setup search engines can't use.

## Executive summary

**Critical issues: none.** Nothing blocks indexing.

### Top issues
1. **[High] Privacy notice contradicts the homepage.** `index.html` loads `https://widget.zelixai.ai/widget.js`, allows it in `script-src`, `frame-src` and `connect-src`, and has no footer or privacy link. `/privacy` says all scripts are self-hosted and no third-party requests are made except GoatCounter.
2. **[High] Homepage has almost no crawlable text.** The `<h1>` is `aria-hidden="true"` ("BARIS AKINTI"), and the only other copy is "Artificial Intelligence Systems Engineer".
3. **[High] The Turkish version can't be indexed.** Each page carries both languages in one document. Turkish text is hidden with `display:none !important`. There are no `/tr/` URLs and no hreflang, yet `og:locale:alternate=tr_TR` and `inLanguage:["en","tr"]` claim a Turkish version.
4. **[Medium] `posts/template.html` is live and indexable.** It returns 200 with placeholder title "Post Title", no canonical and no noindex.
5. **[Medium] The blog stalled and the site has little unique content.** 4 posts between Jul 1 and Jul 11, none in the 70 days since. Posts cover generic head terms with no sources or byline. The 8 projects are one-line cards that send visitors to GitHub.

### Quick wins (under an hour each)
1. Fix the privacy notice or the homepage widget, and add a footer with a privacy link to `index.html`.
2. Add a visible intro paragraph and an accessible `<h1>` to the homepage.
3. Move `posts/template.html` out of the deployed root (e.g. `_templates/`) or add `noindex`.
4. Rewrite the six thin titles and descriptions (drafts are in ACTION-PLAN.md).
5. Fix the schema inconsistencies: `jobTitle`, `alternateName`, `dateModified`/`image` on posts.

## What works

- HTTPS with HSTS. `http→https` and apex→`www` are single-hop 301s. Nonexistent URLs return a proper 404 page marked `noindex`.
- Every indexable page has a self-referencing canonical, a unique title and description, and complete OG/Twitter tags. The OG image is 1200×630 (60 KB).
- robots.txt allows everything and points to the sitemap. The sitemap lists exactly the 11 indexable pages and excludes `404`, `thanks` and the template.
- Clean extensionless URLs; `.html` duplicates are covered by canonicals.
- Images: AVIF/WebP with responsive `srcset`, explicit dimensions, lazy loading, LCP preload.
- The CSP hash for the inline script in `index.html` is correct (verified).
- Privacy-friendly analytics (GoatCounter, self-hosted script). The skip link and `aria-current` are in place.
- JSON-LD present on all page types. `llms.txt` present. All 8 GitHub repo links return 200.

## 1. Technical SEO — 86

| Sev | Finding | Evidence | Fix |
|---|---|---|---|
| Medium | Template page is public | `/posts/template` and `/posts/template.html` → 200; title "Post Title"; canonical commented out | Move to `_templates/` (Jekyll on GitHub Pages skips underscore folders) or add `noindex` and note in the template comment to remove it when copying |
| Low | Legacy `privacy_policy.html` uses meta refresh | Meta refresh plus canonical to `/privacy` | Acceptable (GitHub Pages can't 301). Keep |
| Low | Orphan `thanks.html` | Says "Your message has been sent", but the contact form uses `mailto:` and never reaches it | Delete it, or keep the `noindex` |
| Low | No `/favicon.ico` | 404 | Add a 48×48 `.ico` (or PNG) at the root for legacy crawlers |
| Low | Manifest `theme_color` `#E9B44C` differs from `<meta theme-color>` `#14110E` | | Align them |
| Info | Only HSTS is set as a response header | GitHub Pages can't set custom headers. CSP is delivered via `<meta>` (`frame-ancestors` isn't enforceable that way) | Only matters if you need X-Frame-Options; would require a CDN such as Cloudflare in front |
| Info | `/about/`, `/projects/` (trailing slash) → 404 | | Harmless; nothing links to them |

## 2. Content Quality — 62

- **Blog:** 4 posts, 327 / 695 / 1,514 / 1,896 words (EN). The writing is clear and has a personal voice. Deep-learning and agents posts are structured with useful H2s and a "one sentence version".
- **Cadence:** last post Jul 11; the sitemap's newest date is 2026-07-11.
- **Topic fit:** "What is deep learning?" and "How does machine learning?" compete with the biggest publishers on the web. A student's personal site is unlikely to rank for them. Posts about your own projects (Chest X-Ray, RAG search engine, Age Detection) are where you have first-hand experience, which is what E-E-A-T rewards.
- **E-E-A-T gaps:** no visible author byline on posts (only a date), no external sources or citations (0 external links across 4 posts), no "about the author" link.
- **Projects page:** 8 cards of one sentence each, all linking off-site. There are no on-site write-ups with results or screenshots.
- **Homepage:** thin (see High #2).
- **Inconsistent identity facts:** the homepage title says "Engineer", the About and Experience pages say "student". The degree is "BSc Artificial Intelligence Systems" on About but "BSc, Machine Learning & AI Systems" on Experience.
- **Turkish typo:** `deep-learning.html` heading "Deep Learnıng vs. Machıne Learnıng" (dotless ı).

## 3. On-Page SEO — 74

| Page | Title (chars) | Description (chars) | Note |
|---|---|---|---|
| / | 55 | 148 | Good |
| /about | 20 | 136 | Title has no keyword or location |
| /projects | 23 | 99 | Short |
| /blog | 19 | 80 | Short |
| /experience | 25 | 99 | Short |
| /contact | 22 | 95 | Short |
| posts/hello-world | 27 | 104 | |
| posts/machine-learning | 41 | 139 | "How Does Machine Learning?" is ungrammatical; the searched phrase is "how does machine learning work" |
| posts/deep-learning | 37 | 101 | |
| posts/agents | 36 | 126 | |

- Heading structure is one `<h1>` per page, followed by `<h2>`s. The exception is the homepage, whose `<h1>` is `aria-hidden`.
- Internal linking is good: consistent nav, and posts link to each other (8–10 internal links per post). There are no links from posts to projects and no related or next/previous posts.
- The Blog page `<h1>` is just "Blog". Fine, but a descriptive subheading helps.

## 4. Schema — 78

Present: `WebSite` + `Person` (home), `ProfilePage` (about), `Blog` (blog), `BlogPosting` (4 posts). No FAQPage or HowTo, which is correct.

- `jobTitle: "Artificial Intelligence Systems Engineer"` doesn't match the student framing elsewhere, so pick one.
- `Person` is missing `alternateName` ("Baris Akinti"), `worksFor` (INTERIP NETWORKS B.V., current internship) and `knowsAbout`. `affiliation` could be `alumniOf` or `student`-style markup.
- `BlogPosting`: `dateModified` and `image` exist only on hello-world; the other 3 lack both. There's no `publisher`, and `author` has no `@id` to tie it to the `Person` entity.
- `Blog` has no `blogPost` array.
- The Experience page has no structured data.

## 5. Performance (estimated from source; no lab or field data)

- About 30 KB of CSS in two render-blocking files, self-hosted woff2 fonts with the display face preloaded, and a preloaded AVIF hero (20 KB at the largest size). Analytics is one 9 KB async script. `width`/`height` are set on images, so layout shift risk is low.
- The homepage adds a third-party deferred script (`widget.zelixai.ai`) that I couldn't evaluate.
- The 316 KB PNG `<img src>` is only a fallback for browsers without AVIF/WebP.
- Cache is `max-age=600` (fixed by GitHub Pages).
- Recommendation: run PageSpeed Insights or a Lighthouse run on `/` and `/posts/deep-learning` and record LCP/INP/CLS. If the widget affects LCP or INP, load it on interaction.

## 6. Images — 88

- AVIF/WebP with a JPG fallback in posts; explicit dimensions; `loading="lazy"` below the fold.
- Homepage portrait alt "Portrait of Baris Akinti" is the ASCII spelling, unlike the rest of the site.
- `deeplearning.png` alt "deep learning illustration" is generic and not translated in the Turkish block. Describe what the diagram shows.
- `PP.jpg` (139 KB) is only referenced from schema, which is fine.

## 7. AI Search Readiness — 74

- Good: robots allow all crawlers, `llms.txt` present (a Google-ignored optional file), a clear `Person` entity with `sameAs` links, and quotable "one sentence version" summaries in posts.
- Gaps: hidden duplicate-language text, no cited sources, and little off-site corroboration of the entity beyond GitHub/LinkedIn/Instagram. `llms.txt` lists 7 projects and the site shows 8 (`ai-project-gemini` is missing). `humans.txt` is stale (says "Last update 2026/07/06" and lists Google Fonts and FormSubmit, neither of which is used now).

## Assumptions and uncertainties

- The widget at `widget.zelixai.ai` may be your own product. I could not see what it sets or collects, so item High #1 needs your check, not a change on my side.
- "Nobody can find the Turkish content" is inferred from the markup (hidden text, no URLs, no hreflang). I did not check Search Console to see what Google actually indexed.
- Scores for Performance are estimates and should be replaced by real measurements.
