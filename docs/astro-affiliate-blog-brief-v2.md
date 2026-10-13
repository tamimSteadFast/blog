# Project: SEO-First Astro Amazon Affiliate Blog — Build Brief v2

> **What changed from v1 (audit summary)**
>
> v1 was a strong technical-SEO and analytics checklist. It did not define
> *who the site is for*, *what search intent each page serves*, or *how
> products are modeled*. v2 adds:
>
> - Section 0: audience, marketplace, and niche definition (must be filled in first)
> - Section 3B: a separate `products` collection, referenced by articles
> - Section 3C: search-intent fields and the pillar/cluster content model
> - Section 3D: an `authors` collection and E-E-A-T requirements
> - Section 7: `rel="sponsored"`, link position tracking, GA4 custom dimensions
> - Section 8: concrete Amazon price/image compliance rules
> - Section 10B: conversion components (comparison table, pros/cons, quick picks)
> - Section 11B: build-time content quality gates (anti thin-affiliate)
> - Section 16: the measurement loop that connects GA4 to actual Associates earnings
> - Explicit current-API notes so no deprecated Astro or Tailwind patterns are used

Act as a senior Astro developer, technical SEO specialist, web analytics
engineer, and software architect.

Help me build a modern, fast, SEO-friendly Amazon affiliate blog using Astro.

I am a web developer, but I want the architecture to remain simple,
maintainable, beginner-friendly, and scalable.

**IMPORTANT**

- Use the latest stable, mutually compatible versions of dependencies.
- Check the current Astro documentation before choosing APIs. Do not rely on
  memory of older versions.
- Do not use deprecated Astro Content Collections APIs. Specifically:
  - Use the content layer `glob()` loader from `astro/loaders` in
    `src/content.config.ts`. Do not use the legacy `src/content/config.ts`
    folder-magic collection definition.
  - Use `render(entry)` imported from `astro:content`. Do not use the
    deprecated `entry.render()` method.
  - Use `entry.id` for the slug. `entry.slug` is legacy.
  - For Tailwind, use the Vite plugin (`@tailwindcss/vite`) with
    `@import "tailwindcss";` in the global stylesheet. The old
    `@astrojs/tailwind` integration is deprecated.
  - Verify each of these against the current docs before writing code and tell
    me if the current recommended approach differs from the above.
- Explain important implementation decisions.
- Write complete, working code rather than pseudocode.
- Do not overwrite existing project files without inspecting them.
- If the project already exists, inspect its structure first. If no project
  exists yet, say so and scaffold a new one.
- If something is unclear, state your assumptions explicitly before coding.

==================================================
0. AUDIENCE, MARKETPLACE, AND NICHE (FILL IN FIRST)
==================================================

Nothing else in this brief can be targeted until these are decided. Ask me for
any that are blank before starting implementation, and record the final answers
in `docs/PROJECT_ARCHITECTURE.md`.

**Target reader**

- Country / primary traffic geography: ______
- Language and spelling variant (en-US / en-GB / other): ______
- Buyer segment (be specific — "beginners buying their first X under $200",
  not "people who like X"): ______
- The problem they are trying to solve when they search: ______
- Their buying stage when they reach the site (researching / comparing /
  ready to buy): ______

**Amazon program**

- Amazon marketplace: amazon.com / amazon.co.uk / amazon.in / other: ______
- Associates store ID / tracking tag (placeholder until approved): ______
- Will multiple marketplaces be targeted? If yes, note that OneLink or
  per-marketplace tags are required and that this changes the link component.
  Do not implement multi-marketplace in v1.

**Niche**

- Core topic (narrow enough that 30 articles can cover it well): ______
- 3–5 content clusters inside that topic: ______
- Average product price range (this determines whether the site needs volume
  traffic or converts on fewer, higher-value sessions): ______

**Why this matters architecturally**

- Geography decides whether a consent banner is legally required (Section 9).
- Marketplace decides the affiliate tag, currency handling, and disclosure
  wording.
- Buyer stage decides which page templates matter most — a site serving
  ready-to-buy readers needs comparison tables and quick-pick boxes above the
  fold; a site serving researchers needs depth and internal links to money pages.

**Targeting rules to follow throughout the build**

- Every published article must name one primary keyword and one buyer stage in
  its frontmatter. No article ships without them.
- Do not build generic "blog" pages that serve no search intent.
- Prefer 30 deeply-targeted articles over 200 shallow ones.

==================================================
1. TECHNOLOGY STACK
==================================================

Use:

- Astro (latest stable)
- TypeScript for configuration and type safety
- Markdown / MDX for articles
- Tailwind CSS (via the current Vite plugin approach)
- Astro Content Collections using the current content layer loader API
- Zod for content validation
- `@astrojs/sitemap`
- `@astrojs/rss`
- Google Tag Manager (GTM)
- Google Analytics 4 (GA4), configured through GTM only
- Static site generation by default
- GitHub for version control
- A static host (Netlify, Vercel, or Cloudflare Pages — recommend one and
  explain the trade-off)

Avoid unnecessary client-side JavaScript. Use Astro components for reusable UI.

Do not introduce React or another UI framework unless there is a clear
technical reason, and state that reason if you do.

Any client-side behaviour that is genuinely needed (affiliate click tracking,
table of contents highlighting, FAQ accordions) must be implemented with small
vanilla scripts or native HTML elements such as `<details>`.

==================================================
2. PROJECT ARCHITECTURE
==================================================

```
src/
├── components/
│   ├── layout/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── Navigation.astro
│   │   └── Breadcrumbs.astro
│   ├── blog/
│   │   ├── BlogCard.astro
│   │   ├── ArticleHeader.astro
│   │   ├── TableOfContents.astro
│   │   ├── RelatedPosts.astro
│   │   ├── AuthorBox.astro
│   │   └── FaqSection.astro
│   ├── affiliate/
│   │   ├── AffiliateLink.astro
│   │   ├── ProductCard.astro
│   │   ├── ComparisonTable.astro
│   │   ├── ProsCons.astro
│   │   ├── QuickPicks.astro
│   │   └── AffiliateDisclosure.astro
│   ├── seo/
│   │   ├── BaseHead.astro
│   │   └── JsonLd.astro
│   └── analytics/
│       └── GoogleTagManager.astro
├── content/
│   ├── blog/
│   │   └── example-article.md
│   ├── products/
│   │   └── example-product.md
│   └── authors/
│       └── example-author.md
├── layouts/
│   ├── BaseLayout.astro
│   └── BlogLayout.astro
├── lib/
│   ├── analytics.ts
│   ├── content.ts          // all content retrieval lives here
│   ├── affiliate.ts        // link building, tag handling
│   └── seo.ts              // metadata + JSON-LD builders
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── contact.astro
│   ├── editorial-policy.astro
│   ├── privacy-policy.astro
│   ├── affiliate-disclosure.astro
│   ├── terms.astro
│   ├── 404.astro
│   ├── rss.xml.ts
│   ├── robots.txt.ts
│   ├── authors/
│   │   └── [slug].astro
│   └── blog/
│       ├── index.astro         // paginated
│       ├── [...page].astro     // pagination
│       └── [...slug].astro
├── styles/
│   └── global.css
└── content.config.ts

public/
└── images/

docs/
├── PROJECT_ARCHITECTURE.md
├── CONTENT_STRATEGY.md
├── SEO_GUIDE.md
├── GTM_GA4_SETUP.md
├── CONTENT_PUBLISHING_GUIDE.md
├── MEASUREMENT_AND_OPTIMIZATION.md
└── DEPLOYMENT_GUIDE.md
```

Also configure the required root files, including `astro.config.mjs`,
`tsconfig.json`, `.env.example`, and `.gitignore`.

**Critical config requirement:** `site` must be set in `astro.config.mjs`.
Canonical URLs, the sitemap, and RSS all depend on it. Build must fail loudly
if it is missing or still set to a placeholder.

Adapt this structure when necessary, but explain every important change.

**Separation rule:** components receive data as props. They must never call
`getCollection()` themselves. All content retrieval goes through
`src/lib/content.ts`. This is what makes Section 13 (CMS migration) cheap.

==================================================
3. CONTENT SYSTEM
==================================================

--------------------------------------------------
3A. Blog collection
--------------------------------------------------

Articles are Markdown/MDX files validated with Zod via the current content
layer API.

Schema fields:

- `title` — string, 50–60 characters recommended for the SEO title
- `description` — string, 120–160 characters
- `pubDate` — date
- `updatedDate` — date, optional
- `author` — reference to the `authors` collection
- `category` — enum of the clusters defined in Section 0
- `tags` — array of strings
- `draft` — boolean, default true
- `coverImage` — image, optional
- `coverImageAlt` — string, required when `coverImage` is present
- `canonicalURL` — string URL, optional
- `noindex` — boolean, default false (for thin or legacy pages)
- **`contentType`** — enum: `"review" | "comparison" | "roundup" | "guide" | "news"`
- **`searchIntent`** — enum: `"informational" | "commercial" | "transactional"`
- **`primaryKeyword`** — string, required
- **`secondaryKeywords`** — array of strings, optional
- **`cluster`** — string, the pillar this article supports
- **`isPillar`** — boolean, default false
- **`products`** — array of references to the `products` collection, optional
- **`verdict`** — string, optional; the one-sentence recommendation
- **`faq`** — array of `{ question, answer }`, optional; powers FAQPage schema
- **`lastReviewed`** — date, optional; shown on product-bearing pages

Use `reference()` from `astro:content` for `author` and `products` so Astro
validates that the referenced entries actually exist at build time.

--------------------------------------------------
3B. Products collection (new in v2)
--------------------------------------------------

Affiliate product data must not live inside article prose. Define a `products`
collection so an ASIN, tag, or product name changes in one file instead of
twenty articles.

Fields:

- `name` — string
- `brand` — string
- `asin` — string
- `marketplace` — enum of the marketplaces from Section 0
- `image` — local image path, optional (see Section 8 for sourcing rules)
- `imageAlt` — string
- `pros` — array of strings
- `cons` — array of strings
- `keySpecs` — array of `{ label, value }`
- `bestFor` — string, short; which reader segment this product suits
- `ourRating` — number 1–5, optional; **only** if I have genuinely assessed it
- `discontinued` — boolean, default false

Deliberately **not** in the schema: `price`, `rating` scraped from Amazon,
`reviewCount`, `availability`. See Section 8.

The affiliate URL is **built at render time** in `src/lib/affiliate.ts` from
`asin` + `marketplace` + the tag in the environment — never hardcoded in content.

--------------------------------------------------
3C. Content model and internal linking
--------------------------------------------------

Implement a pillar/cluster model:

- One pillar guide per cluster (`isPillar: true`), broad and informational.
- Supporting articles: reviews, comparisons, and roundups within that cluster.
- Every supporting article links up to its pillar.
- Every pillar links down to its supporting articles.
- Related posts are selected by `cluster` first, then `tags` — not by date.

Build the internal linking logic in `src/lib/content.ts` so it is automatic,
not a manual job per article.

--------------------------------------------------
3D. Authors collection and E-E-A-T (new in v2)
--------------------------------------------------

Affiliate content competes on demonstrated expertise. Implement:

- `authors` collection: `name`, `bio`, `avatar`, `credentials`,
  `socialLinks`, `expertise` (array of clusters).
- An author page at `/authors/[slug]/` listing that author's articles.
- `AuthorBox.astro` rendered at the end of every article.
- `Person` JSON-LD on author pages, linked from `BlogPosting.author`.
- Visible "Last reviewed" date on any article with products.
- An `/editorial-policy` page explaining how products are selected and
  assessed, and that links are affiliate links.

Do not fabricate credentials, testing claims, or an author persona that does
not exist. If I am the only author, the page should say so honestly.

--------------------------------------------------
3E. Requirements
--------------------------------------------------

- Generate article pages dynamically from Markdown.
- Paginated blog listing (12 per page) with proper prev/next links.
- Exclude drafts from listings, sitemap, RSS, and production builds.
- Sort published articles by `pubDate` descending; show `updatedDate` when present.
- Category and tag pages only where they add value — generate category pages
  (they map to clusters), and generate tag pages only for tags used on 3+ articles
  to avoid thin index pages.
- Related article links driven by cluster.
- Table of contents generated from Markdown headings.
- Handle missing or invalid content gracefully with a clear build error naming
  the offending file.
- Include one complete example article with valid frontmatter, one example
  product, and one example author.

Content workflow:

Create Markdown article → validate → build static HTML → commit and push to
GitHub → host builds and deploys.

==================================================
4. TECHNICAL SEO
==================================================

**A. Metadata**

- Unique title and meta description per page, built in `src/lib/seo.ts`.
- Canonical URL on every page, absolute, derived from `site`.
- Open Graph and Twitter card metadata.
- Correct `lang` attribute matching Section 0.
- Correct robots directives; honour the `noindex` frontmatter flag.
- Warn at build time if a title exceeds 60 characters or a description exceeds
  160.
- No duplicate metadata across pages.

**B. Technical SEO**

- Semantic HTML and a single `<h1>` per page.
- Crawlable internal links (real `<a href>`, no JS-only navigation).
- Clean, descriptive slugs derived from the primary keyword.
- XML sitemap excluding drafts, `noindex` pages, and paginated duplicates
  where appropriate.
- `robots.txt` pointing at the production sitemap.
- Custom 404 page with links back into the main clusters.
- Consistent trailing slash configuration, matching the host's behaviour.
- No duplicate routes or duplicate content.
- Descriptive alt text on every image; build check for missing alt.
- Optimized images via Astro's image pipeline, with explicit width and height.
- Lazy-load below-the-fold images; eager-load the LCP image.
- Visible breadcrumbs on article pages, matching the BreadcrumbList schema.
- Minimal JavaScript and third-party scripts.
- Site must remain readable and navigable with JavaScript disabled.
- **Preview deployments must not be indexed.** Set `X-Robots-Tag: noindex` on
  non-production branch deploys and document how for the chosen host. This is a
  common and damaging oversight.

**C. Structured data**

- `WebSite` and `Organization` on the homepage.
- `BlogPosting` on articles, with `author`, `datePublished`, `dateModified`.
- `BreadcrumbList` where breadcrumbs are visible.
- `FAQPage` only when the `faq` frontmatter field is populated and the FAQ is
  visibly rendered on the page.
- `Person` on author pages.

Rules:

- Structured data must reflect visible page content.
- Do not invent ratings, reviews, prices, or availability.
- Do not add `Product` or `Review` schema unless the content genuinely meets
  Google's requirements — for a roundup of products I have not personally
  tested, it does not.
- Do not promise rich results or ranking improvements.

**D. SEO documentation** — `docs/SEO_GUIDE.md`, covering how SEO is
implemented, how to write SEO-friendly articles, canonical handling, structured
data validation, Search Console sitemap submission, indexing and Core Web
Vitals monitoring, and how to avoid duplicate content and thin affiliate pages.

==================================================
5. GOOGLE TAG MANAGER SETUP
==================================================

Integrate GTM using an environment variable:

```
PUBLIC_GTM_ID=GTM-XXXXXXX
```

Requirements:

- Never hardcode the real container ID in more than one place.
- Create a reusable `GoogleTagManager.astro` component.
- Include the official GTM script and `noscript` implementation per Google's
  current installation instructions.
- Place the script in the correct document location and the `noscript` iframe
  immediately after the opening `<body>` tag.
- Load GTM once, consistently, on all pages that should be tracked.
- No duplicate containers.
- If `PUBLIC_GTM_ID` is missing or empty, render nothing and do not error.
- Never ship a fake GTM ID to production.
- Keep the integration compatible with static rendering.
- Do not expose server-side secrets through `PUBLIC_` variables.

Document in `docs/GTM_GA4_SETUP.md`: creating the GTM account, creating a web
container, finding the container ID, configuring env vars locally and on the
host, publishing GTM changes, verifying with Tag Assistant, and debugging with
GTM Preview mode.

==================================================
6. GOOGLE ANALYTICS 4
==================================================

GTM is the only tag manager. Do not load the GA4 gtag snippet separately if
GA4 is configured through GTM.

Document: creating a GA4 property, creating a web data stream, configuring the
Google tag inside GTM, connecting it to the correct measurement ID, the
intended page-view behaviour, and verifying in Realtime and DebugView.

Avoid duplicate `page_view` events.

For v1, prefer normal browser navigation over client-side view transitions.
If view transitions are introduced later, document how to send virtual page
views without duplicating events (and note that GTM's History Change trigger
and Astro's `astro:page-load` event are the relevant hooks).

Adding the GTM snippet does not configure GA4. Document the GTM-side steps
separately and explicitly.

==================================================
7. AFFILIATE CLICK TRACKING
==================================================

**Link markup requirements (new in v2 — these were missing)**

Every affiliate link rendered by `AffiliateLink.astro` must carry:

- `rel="sponsored nofollow noopener"` — `sponsored` is Google's required
  attribute for monetized links. Omitting it is a policy issue, not a style
  choice.
- `target="_blank"`
- Visible, honest link text. No "click here".
- An accessible name that makes sense out of context.

**Event**

Track a GA4 custom event named `affiliate_click` with this payload:

```js
{
  event: "affiliate_click",
  affiliate_program: "amazon",
  link_url: "https://www.amazon.com/dp/...",
  link_text: "Check price on Amazon",
  article_path: "/blog/example-article/",
  product_asin: "B0XXXXXXXX",
  link_position: "comparison_table" // hero | quick_picks | product_card |
                                    // comparison_table | inline | footer
}
```

`link_position` and `product_asin` are new in v2 and are the two fields that
make the data actionable — they tell you *which component and which product*
earns clicks, which is the basis for every layout decision you will make later.

**Requirements**

- Consistent event naming convention; document it.
- GTM Custom Event trigger on `affiliate_click`.
- Corresponding GA4 event tag in GTM.
- Document every required Data Layer Variable.
- **Register `affiliate_program`, `product_asin`, and `link_position` as custom
  dimensions in GA4 Admin.** Without this step the parameters are collected but
  never appear in any report. Document it as a required manual step — this is
  the most commonly missed part of the whole setup.
- Collect no personal information: no emails, names, phone numbers, auth data.
- Tracking must not modify the destination URL or delay navigation.
- Tracking must be a no-op when GTM is not configured.
- No inline `onclick` handlers. Use a single delegated event listener that
  reads `data-` attributes from the link.
- Explain exactly where `dataLayer.push()` happens and how the GTM Custom Event
  trigger receives it.
- Include a manual test procedure for `affiliate_click`.

**Also track (new in v2)**

- `scroll` depth at 25/50/75/90% (GTM built-in trigger) — tells you where
  readers stop before reaching the links.
- `view_product_card` when a product card enters the viewport, via
  IntersectionObserver — gives you a click-through rate per card rather than
  raw clicks.

Keep both behind the same "GTM not configured = no-op" guard.

**Attribution warning**

Client-side click counts are not commissions. Real attribution comes from
Amazon's side: create separate Associates **tracking IDs** per cluster (or per
high-value article) and use them in the links built by `src/lib/affiliate.ts`,
so the Associates earnings report can be read by content group. Document this,
and verify current rules in the Associates Operating Agreement before adding
any extra URL parameters, since what is permitted varies by marketplace and
changes over time.

==================================================
8. AMAZON AFFILIATE COMPLIANCE
==================================================

Create a reusable `AffiliateDisclosure.astro` component.

**Placement rule:** the disclosure must appear *above* the first affiliate link
and be visible without scrolling or clicking. `BlogLayout.astro` should render
it automatically whenever `products.length > 0` or the article contains
affiliate links, so it can never be forgotten.

Editable example wording:

> As an Amazon Associate I earn from qualifying purchases.

Explain that exact wording and placement must comply with the current policies
of the relevant Amazon Associates marketplace, and that the requirement is
proximity and clarity, not just the presence of a footer link.

**Price and image rules (expanded in v2)**

- Do not display prices, star ratings, review counts, or stock status pulled
  from Amazon by scraping or typed in by hand. These go stale and their display
  is restricted by the program agreement.
- The compliant source for live price and image data is the Product
  Advertising API, access to which generally requires qualifying sales first —
  so it is not available at launch.
- **v1 decision: show no prices.** Use "Check current price on Amazon" CTAs
  instead. This is both compliant and better for conversion, because the reader
  clicks through to find out.
- Product images must come from an approved source (SiteStripe or PA-API) or be
  my own photographs. Do not hotlink or scrape Amazon product images.
- Document how a PA-API adapter would slot into `src/lib/affiliate.ts` later
  without touching components. Do not build it now.

Also explain: why disclosures matter; why original content and honest
assessment matter; why invented prices and availability are harmful; how Amazon
trademarks and images may be used; why links must not be cloaked or modified in
prohibited ways; and why click counts are not purchases or commissions.

Do not guarantee Associates acceptance or revenue. Note the practical
constraint that new Associates accounts must generate qualifying sales within
the program's initial window or the account is closed — which is a reason to
launch with a small number of strong, high-intent articles rather than a large
number of weak ones.

==================================================
9. PRIVACY AND CONSENT
==================================================

Create a privacy policy starter page and document its limitations.

Tracking and consent requirements depend on the audience geography defined in
Section 0, applicable law, and the tools in use. A generic privacy policy does
not guarantee compliance.

- If the audience is primarily EU/UK, a consent management platform is required
  before analytics tags fire. Document how a CMP integrates with GTM.
- Explain Google Consent Mode and its role, and that it does not replace a
  consent banner.
- Do not assume all analytics tags may fire before consent.
- Explain how to test consent states in GTM Preview.

Keep v1 simple and privacy-conscious. Do not invent legal advice.

==================================================
10. PERFORMANCE, ACCESSIBILITY, AND CONVERSION UI
==================================================

**A. Performance and security**

- Static rendering by default.
- Minimal client-side JavaScript; no framework runtime unless justified.
- Optimized images through Astro's image pipeline.
- Few third-party dependencies and external scripts.
- Accessible HTML: keyboard navigable, sufficient contrast, real landmarks.
- No environment-specific configuration leaking into the build output.
- Site stays fully functional when analytics is blocked or fails.
- Tracking errors must never break navigation or rendering — wrap tracking in
  try/catch.
- Explain the Core Web Vitals cost of GTM and how to mitigate it.

**B. Conversion components (new in v2)**

These are what turn targeted traffic into clicks. Build them as reusable
components, all accessible without JavaScript where possible:

- `QuickPicks.astro` — "Best overall / Best budget / Best for X" box rendered
  near the top of roundup articles, so ready-to-buy readers do not have to
  scroll.
- `ComparisonTable.astro` — responsive, scrollable on mobile, built from the
  referenced `products`. Must be a real `<table>` with proper headers.
- `ProsCons.astro` — honest, specific, and never empty on one side.
- `ProductCard.astro` — image, `bestFor`, key specs, pros/cons, CTA.
- `FaqSection.astro` — native `<details>`/`<summary>`, matching FAQPage schema.

Every CTA in these components routes through `AffiliateLink.astro` so the
`rel` attributes and tracking are consistent and impossible to forget.

==================================================
11. TESTING AND QUALITY ASSURANCE
==================================================

**A. Manual checklist**

- Production build succeeds.
- Markdown content validates.
- Drafts are excluded from build, sitemap, and RSS.
- Every article has unique title and description.
- Canonical URLs are correct and absolute.
- Sitemap contains only public canonical pages.
- `robots.txt` points to the production sitemap.
- Structured data matches visible content and validates in the Rich Results Test.
- GTM appears exactly once with the correct container ID.
- GA4 `page_view` is not duplicated.
- `affiliate_click` fires with all parameters populated.
- Custom dimensions are registered in GA4 Admin and appear in reports.
- Every affiliate link has `rel="sponsored"`.
- Disclosure appears above the first affiliate link on every monetized page.
- Internal links resolve; no 404s.
- Images have descriptive alt text and explicit dimensions.
- Site is usable with analytics blocked and with JavaScript disabled.
- Site works on mobile and desktop.
- Preview deployments return `X-Robots-Tag: noindex`.

**B. Automated content gates (new in v2)**

Add a `npm run check:content` script that fails the build when an article:

- has no `primaryKeyword` or `searchIntent`
- has `contentType: "review" | "comparison" | "roundup"` but no `products`
- has products but no `verdict`
- has a title over 60 or description over 160 characters
- has fewer than ~800 words while carrying affiliate links (thin-page guard)
- has a `coverImage` with no `coverImageAlt`
- references a product or author ID that does not exist

Also add a link checker for internal links in CI.

Do not claim any check passed unless it was actually run and the output shown.

==================================================
12. REQUIRED DOCUMENTATION FILES
==================================================

1. `docs/PROJECT_ARCHITECTURE.md` — structure, component responsibilities,
   content flow, static rendering, the Section 0 answers, how to add features
   without refactoring.
2. `docs/CONTENT_STRATEGY.md` *(new)* — the audience definition, clusters,
   intent model, how to choose a primary keyword, the pillar/cluster linking
   rules, and the publishing cadence.
3. `docs/SEO_GUIDE.md` — technical SEO, metadata, sitemap, robots, canonicals,
   structured data, Search Console, content quality, internal linking.
4. `docs/GTM_GA4_SETUP.md` — GTM install, env vars, GA4 config, page views,
   affiliate events, custom dimension registration, Preview, Tag Assistant,
   DebugView, troubleshooting, consent.
5. `docs/CONTENT_PUBLISHING_GUIDE.md` — creating a post, every frontmatter
   field explained, adding a product entry, writing useful affiliate content,
   image optimization, draft workflow, internal links, disclosures, publishing
   via GitHub.
6. `docs/MEASUREMENT_AND_OPTIMIZATION.md` *(new)* — see Section 16.
7. `docs/DEPLOYMENT_GUIDE.md` — local dev, production build, GitHub workflow,
   host configuration, env vars, custom domain and HTTPS, preview noindex,
   production verification, troubleshooting.

All documentation in Markdown, understandable to a developer learning the
architecture, with real commands and code examples.

==================================================
13. FUTURE CMS MIGRATION
==================================================

v1 uses Markdown files. The architecture must allow migration to a headless CMS
later.

- Keep article rendering separate from content retrieval.
- All content loading goes through `src/lib/content.ts`. Components never call
  `getCollection()`.
- Define the article and product data shapes as TypeScript types that the rest
  of the app depends on, not the raw collection entry types.
- Document how a CMS adapter would replace the loader behind `content.ts`.
- Do not install or configure a CMS now, and do not add speculative abstractions.

Explain exactly what changes (the loader, the schema definition, image
handling, the build trigger) and what does not (components, layouts, SEO,
tracking, routing).

==================================================
14. IMPLEMENTATION WORKFLOW
==================================================

Step 1: Inspect the existing project and report the current structure. If no
project exists, say so.
Step 2: Confirm the Section 0 answers, then explain the proposed architecture
and important decisions.
Step 3: Astro configuration and the three content collections.
Step 4: Base layout, header, footer, breadcrumbs, global styles.
Step 5: Blog listing with pagination and dynamic article pages.
Step 6: SEO metadata, sitemap, robots.txt, RSS, structured data.
Step 7: GTM integration.
Step 8: Affiliate link component, click tracking, GA4 documentation.
Step 9: Affiliate and conversion components, disclosure, author pages.
Step 10: Content quality gate script.
Step 11: Documentation files in `docs/`.
Step 12: Run the available checks and the production build, and show real output.
Step 13: Report completed work, remaining manual setup, and exact run commands.

Do not skip steps silently. If you cannot finish in one response, complete a
coherent step and clearly state the next one.

==================================================
15. FINAL DELIVERABLES
==================================================

- Working Astro source code
- SEO-friendly static pages
- Markdown publishing system with product and author collections
- GTM integration
- GA4 setup documentation
- Affiliate click tracking with position and product attribution
- Disclosure and conversion components
- All required documentation files
- Local development and deployment instructions
- Testing checklist and automated content gates
- CMS migration plan

Clearly distinguish:

- **A.** Code implemented automatically
- **B.** Configuration I must complete in Google accounts (GTM container, GA4
  property, custom dimensions, Search Console)
- **C.** Configuration required on the hosting provider (env vars, domain,
  preview noindex, build command)
- **D.** Items requiring legal, privacy, or affiliate-program review (privacy
  policy, consent banner, disclosure wording, Associates application)

Never fabricate account IDs, analytics data, test results, affiliate approval,
or earnings.

==================================================
16. MEASUREMENT AND OPTIMIZATION LOOP (new in v2)
==================================================

The site is not finished when it deploys. Document in
`docs/MEASUREMENT_AND_OPTIMIZATION.md` how to close the loop between traffic
and earnings.

**Per-article metrics to review monthly**

- Sessions (GA4)
- Affiliate click-through rate = `affiliate_click` / sessions
- Click distribution by `link_position` — which component actually converts
- Click distribution by `product_asin` — which product readers want
- Scroll depth before first affiliate click
- Associates ordered items and earnings, by tracking ID

**Decisions this data drives**

- If sessions are high and CTR is low: the page serves the wrong intent, or the
  CTA is too far down. Move `QuickPicks` higher.
- If CTR is high and earnings are low: the products are wrong for the reader,
  or the price point is too low. Reconsider the Section 0 price range.
- If one `link_position` dominates: rebuild other articles around that layout.
- If one cluster earns disproportionately: write more supporting articles in it
  and strengthen internal links to its pillar.

**Reporting**

- Build a simple Looker Studio report on the GA4 data source with article path,
  sessions, affiliate clicks, and CTR.
- Keep a manual monthly sheet joining that to Associates earnings per tracking
  ID, since GA4 cannot see commissions.
- Track revenue per 1,000 sessions (RPM) per cluster. This is the one number
  that tells you where to spend writing time.

Set expectations honestly: a new affiliate site typically sees little search
traffic for several months, and no analytics configuration changes that.
