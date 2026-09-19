# Action Plan — barishizm.eu

Score today: **77/100**. Order reflects dependencies: fix trust and structure first, then content, then measure.

## Phase 1 — Fix now (Week 1)

| # | Sev | Action | Why (first principle) | Unblocks | How we'd know it failed | Leading indicator |
|---|---|---|---|---|---|---|
| 1 | High | Reconcile `widget.zelixai.ai` with `/privacy`: either disclose the widget (what it loads, whether it sets cookies/storage, what data it sends) in EN and TR, or remove it. Add a footer with a privacy link to `index.html` (currently none). | A privacy notice must match what the page does; the homepage is the page with the third-party script. | Trust; avoids GDPR exposure for a site with EU visitors | Notice still says "no third-party requests" while DevTools Network shows requests to the widget host | Network tab on `/` lists only hosts named in the notice |
| 2 | High | Give the homepage visible text: an accessible `<h1>` ("Barış Akıntı"), a 2–3 sentence intro (role, university, city, focus), and links to 2–3 projects and the latest post. Drop `aria-hidden` from the `<h1>`. Keep the giant styled name as decoration. | Crawlers and screen readers need a text anchor for the entity; today the page says almost nothing. | #7 (title/description rewrite), #12 (internal links) | Homepage still returns under ~50 words of visible text in "view rendered text" | Homepage snippet in Search Console shows your intro instead of a fallback |
| 3 | Medium | Take `posts/template.html` out of the deployed root (e.g. `_templates/template.html`) or add `<meta name="robots" content="noindex">` with a comment to remove it on copy. Also update the comment in `blog.html` that points to `posts/template.html`. | A placeholder page shouldn't be crawlable. | | `curl -I https://www.barishizm.eu/posts/template` still returns 200 | Returns 404 (or the page carries noindex) |
| 4 | Medium | Fix the identity facts: choose "student" vs "engineer" and use it in the homepage title, About, Experience and `Person.jobTitle`. Use one degree name everywhere. | Consistent entity facts are what Google and LLMs cross-check. | #6 | Two pages still describe you differently | Consistent wording across the 4 places |
| 5 | Low | Fix the Turkish typo "Deep Learnıng vs. Machıne Learnıng" in `posts/deep-learning.html`. | Visible defect. | | | |

## Phase 2 — Structural and on-page (Weeks 2–3)

| # | Sev | Action | Falsifier / indicator |
|---|---|---|---|
| 6 | Medium | **Schema:** add `alternateName: "Baris Akinti"`, `worksFor` (INTERIP NETWORKS B.V.), `knowsAbout`, `alumniOf` to `Person`. Add `dateModified`, `image`, `publisher` and an author `@id` (`https://www.barishizm.eu/#person`) to all four `BlogPosting`s. Add `blogPost` to `Blog`. Validate at validator.schema.org and Google's Rich Results Test. | Validator reports zero errors; a "Baris Akinti" query eventually shows the site |
| 7 | Medium | **Titles and descriptions** (see drafts below). | Snippet length in Search Console within limits; CTR on brand and topic queries rises |
| 8 | High | **Decide the Turkish strategy.** Option A (recommended if Turkish search matters): generate `/tr/...` pages from the existing Turkish text, add `hreflang` pairs (`en`, `tr`, `x-default`), give each a canonical, add them to the sitemap, and drop the CSS-hidden duplicate. Option B (EN only): keep the toggle, remove `og:locale:alternate`, remove `"tr"` from `inLanguage`, and accept that Turkish queries won't find you. | Option A: Search Console shows `/tr/` pages indexed and getting Turkish impressions. Option B: no schema/OG claims a Turkish version |
| 9 | Low | Update `llms.txt` (add `ai-project-gemini`); refresh `humans.txt` (date, remove Google Fonts/FormSubmit); align manifest `theme_color`; add `/favicon.ico`; delete or keep-noindex `thanks.html`. | |
| 10 | Low | Alt text: use "Portrait of Barış Akıntı" (or keep ASCII deliberately via `alternateName`); describe `deeplearning.png` specifically and translate it in the Turkish block. | |

### Title/description drafts (≤60 / ≤155 chars)

| Page | Title | Description |
|---|---|---|
| /about | About Barış Akıntı — AI Systems Student, Vilnius | AI Systems student at VILNIUS TECH in Vilnius building deep learning, computer vision and secure applications. Background, focus areas and skills. |
| /projects | AI & Machine Learning Projects — Barış Akıntı | Open-source projects: a Gemini RAG search engine, chest X-ray diagnosis with deep learning, OpenCV age detection, image super-resolution and more. |
| /experience | CV & Experience — Barış Akıntı, AI Engineer Intern | AI Engineer Intern (RAG, NLP, LLM chatbots), former AI training engineer (RLHF), BSc at VILNIUS TECH. Education, certificates, skills. Download the CV. |
| /blog | Blog — Notes on AI & Machine Learning | Barış Akıntı writes about artificial intelligence, machine learning, AI agents and the projects he builds. |
| /contact | Contact Barış Akıntı | Open to internships, collaborations and AI/ML projects. E-mail, GitHub, LinkedIn. Usually replies within a day or two. |
| posts/machine-learning | How Does Machine Learning Work? A Plain-English Intro | (keep the current description; it's 139 chars) |

## Phase 3 — Content and authority (Month 2)

| # | Sev | Action | Falsifier / indicator |
|---|---|---|---|
| 11 | Medium | Turn 2–3 projects into on-site case studies (Chest X-Ray Diagnosis and the RAG Search Engine first): problem, data, approach, metrics, screenshots, repo link. Link them from Projects and the homepage. Mark up with `SoftwareSourceCode` or `Article`. | Case-study pages get impressions for project-specific queries; fewer visitors leave for GitHub before reading anything |
| 12 | Medium | Add an author byline on each post ("By Barış Akıntı", linking to `/about`), related/next post links, and links from posts to relevant projects. Cite 2–3 primary sources per technical post (papers, docs). | Posts show byline in rich results; average pages per session up |
| 13 | Medium | Restart the blog with posts about your own work (first-hand experience) instead of generic explainers. One post per month is enough. Update `sitemap.xml` `lastmod` when you edit. | A new post is indexed within days; sitemap `lastmod` moves |

## Phase 4 — Monitor (ongoing)

- Verify the site in **Google Search Console** and Bing Webmaster Tools; submit the sitemap; watch indexation of the 11 pages and whether any `/posts/template` URL is indexed.
- Run PageSpeed Insights on `/`, `/blog`, `/posts/deep-learning` and record LCP/INP/CLS (the audit couldn't). Re-check after any widget change.
- Re-run `/seo audit` after Phases 1–2, or set a drift baseline with `/seo drift baseline https://www.barishizm.eu/`.
- To restore the full toolset (PDF report, Google/backlink/drift commands), install Python 3.10+ and run `/seo setup`.

## Not recommended

- New FAQPage/HowTo schema: no SERP benefit (FAQ rich results retired May 2026; HowTo deprecated).
- More sitemap `priority` tuning: Google ignores it.
