# Project Architecture

_Caliper Air — an SEO-first Astro Amazon-affiliate blog for home air purifiers._

This document records the finalized Section 0 decisions, the structure of the
codebase, who-does-what, how content flows to a static page, and how to extend
the site without refactoring. Read it first.

---

## 0. Audience, marketplace, and niche (the decisions everything else serves)

These were agreed before any code was written. Changing them is a product
decision, not a code change.

| Field | Decision |
|---|---|
| **Primary geography** | United States |
| **Language / spelling** | en-US (`<html lang="en">`, `og:locale` `en_US`) |
| **Buyer segment** | First-time buyers choosing an air purifier for a bedroom, nursery, or small-to-mid apartment, typically under ~$300, who care most about **noise** and **running cost** |
| **Problem they search** | "Which purifier works for my room size without being loud or expensive to run?" |
| **Buying stage** | Comparing → ready to buy. Quick picks and comparison tables sit **above the fold**. |
| **Amazon marketplace** | amazon.com |
| **Associates tag** | `caliperair-20` _(placeholder — replace once approved)_ |
| **Core topic** | Home air purifiers |
| **Clusters (4)** | `air-purifiers` (money pages), `air-quality` (informational), `filters-maintenance`, `use-cases` |
| **Price range** | ~$80–$400, average ~$200 |

**Why these matter architecturally**

- **Geography (US)** → no consent banner is legally required for v1, so none
  ships. The privacy policy is still privacy-conscious and the analytics layer is
  built to accept a consent-management platform later (see `GTM_GA4_SETUP.md`).
- **Marketplace (amazon.com)** → fixes the affiliate tag format, USD framing, and
  the disclosure wording. Multi-marketplace is intentionally **out of scope** for
  v1 (it would change `AffiliateLink` to use OneLink/per-market tags).
- **Buyer stage (ready-to-buy)** → the article template (`BlogLayout.astro`)
  leads with the verdict, quick picks, and comparison table.

The clusters live in [`src/lib/clusters.ts`](../src/lib/clusters.ts) and are the
single source of truth for the category taxonomy and the content schema enums.

---

## 1. Technology stack

- **Astro 7** (static output) — verified against current docs; no deprecated APIs.
- **TypeScript** throughout (`astro/tsconfigs/strict`).
- **Content Layer** collections via the `glob()` loader from `astro/loaders` in
  `src/content.config.ts` (the current API — not the legacy `src/content/config.ts`).
- **Zod** (`astro/zod`) for content validation.
- **Tailwind CSS v4** via the official `@tailwindcss/vite` plugin and
  `@import "tailwindcss"` in `src/styles/global.css` (the `@astrojs/tailwind`
  integration is legacy Tailwind 3 and is **not** used).
- **@astrojs/sitemap**, **@astrojs/rss**, **@astrojs/mdx**.
- **Google Tag Manager** → **GA4** (GA4 configured _inside_ GTM only).
- No UI framework (React/Vue/etc.). The only client JS is three tiny vanilla
  scripts: affiliate tracking, the mobile menu uses native `<details>`, and the
  table-of-contents scrollspy.

---

## 2. Directory structure

```
src/
├── components/
│   ├── layout/      Header, Navigation, Footer, Breadcrumbs
│   ├── blog/        BlogCard, ArticleHeader, TableOfContents, RelatedPosts,
│   │                AuthorBox, FaqSection, ArticleGrid, Pager
│   ├── affiliate/   AffiliateLink, ProductCard, ComparisonTable, ProsCons,
│   │                QuickPicks, AffiliateDisclosure, Verdict, ScaleBar
│   ├── seo/         BaseHead, JsonLd
│   └── analytics/   GoogleTagManager, AffiliateTracking
├── content/
│   ├── blog/        articles (.md / .mdx)
│   ├── products/    affiliate product data (one file per product)
│   └── authors/     author profiles (E-E-A-T)
├── layouts/         BaseLayout, BlogLayout
├── lib/
│   ├── clusters.ts  cluster definitions (taxonomy source of truth)
│   ├── site.ts      brand, nav, disclosure copy
│   ├── content.ts   ALL content retrieval + domain types (the CMS seam)
│   ├── affiliate.ts Amazon URL building + tag resolution
│   ├── seo.ts       metadata + JSON-LD builders
│   └── analytics.ts dataLayer event contracts + guarded pushEvent
├── pages/           routes (see below)
├── styles/global.css  Caliper design tokens + prose
└── content.config.ts  the three collections

scripts/
├── check-content.mjs  content quality gate (runs before build)
└── check-links.mjs    internal link checker (runs after build)

public/favicon.svg
```

### Routes

| Route | File | Notes |
|---|---|---|
| `/` | `pages/index.astro` | WebSite + Organization JSON-LD |
| `/blog/` | `pages/blog/index.astro` | listing page 1 |
| `/blog/page/N/` | `pages/blog/page/[page].astro` | listing pages 2+ (noindex) |
| `/blog/<slug>/` | `pages/blog/[...slug].astro` | article |
| `/category/<cluster>/` | `pages/category/[slug].astro` | one per cluster |
| `/tags/<tag>/` | `pages/tags/[tag].astro` | only tags on 3+ articles |
| `/authors/<id>/` | `pages/authors/[slug].astro` | Person JSON-LD |
| `/rss.xml` | `pages/rss.xml.ts` | |
| `/robots.txt` | `pages/robots.txt.ts` | points at sitemap index |
| static pages | `about`, `contact`, `editorial-policy`, `privacy-policy`, `affiliate-disclosure`, `terms`, `404` | |

---

## 3. The separation rule (why this scales)

**Components receive data as props. They never call `getCollection()`.** All
content retrieval goes through [`src/lib/content.ts`](../src/lib/content.ts),
which maps raw collection entries into plain domain types (`Article`, `Product`,
`Author`). This is the seam that makes a future CMS migration cheap — see
[FUTURE CMS MIGRATION](#13-future-cms-migration).

Likewise:

- **Affiliate URLs** are built only in `src/lib/affiliate.ts`, at render time,
  from `asin + marketplace + tag`. No URL is ever hardcoded in content.
- **Every affiliate CTA** routes through `AffiliateLink.astro`, so
  `rel="sponsored nofollow noopener"`, the tracking attributes, and the 44px tap
  target can never be forgotten.
- **Metadata and JSON-LD** are built only in `src/lib/seo.ts`.

---

## 4. Content flow (Markdown → static page)

1. You write `src/content/blog/<slug>.md` with validated frontmatter.
2. `astro build` runs the Content Layer loader; Zod validates every file and
   fails the build naming any offending file.
3. `src/lib/content.ts` resolves references (author, products, picks) and maps
   entries to domain types.
4. `pages/blog/[...slug].astro` renders the body with `render(entry)` and passes
   the resolved `Article` + headings to `BlogLayout.astro`.
5. `BlogLayout` lays out the Caliper article anatomy and auto-renders the
   compliance/E-E-A-T pieces (disclosure, author box, FAQ, related).
6. Static HTML is emitted to `dist/`.

---

## 5. Deliberate adaptations to the brief's file plan

Each of these is a change from the brief's literal structure, with its reason:

- **`src/lib/clusters.ts` and `src/lib/site.ts`** were added so the taxonomy and
  brand constants have a single source of truth shared by the content schema and
  the UI. The brief anticipated `lib/` holding this kind of config.
- **Pagination lives at `/blog/page/N/`** rather than a single `[...page].astro`.
  Two rest routes (`[...slug]` and `[...page]`) at the same path would collide in
  Astro's router, so pagination is nested under `/blog/page/`. Page 1 is `/blog/`.
- **Two extra frontmatter fields, `recommendedProduct` and `picks`**, power the
  "our pick" highlight and the Quick Picks box with editorial role labels. They
  directly serve the ready-to-buy audience and keep that editorial data out of
  prose.
- **`ScaleBar.astro` and `Verdict.astro`** were added to realise two Caliper
  components the brief's structure implied but did not list.
- **The `site` guard runs in an `astro:build:start` hook**, so it fails the
  _build_ loudly when `PUBLIC_SITE_URL` is missing/placeholder, without blocking
  `astro dev` or `astro check`.

---

## 6. How to add things without refactoring

- **A new article** → add a Markdown file; see `CONTENT_PUBLISHING_GUIDE.md`.
- **A new product** → add `src/content/products/<id>.md`; reference it from an
  article. The affiliate URL builds itself.
- **A new cluster** → add an entry to `src/lib/clusters.ts`. The enum, nav,
  category page, and related-post logic all pick it up. Update example content
  and `CONTENT_STRATEGY.md`.
- **A new author** → add `src/content/authors/<id>.md`; reference by id.
- **A new conversion component** → build it under `components/affiliate/` and
  route its CTA through `AffiliateLink` with a new `LinkPosition` value (add the
  value to the union in `affiliate.ts` and register it as a GA4 custom dimension
  value — see `GTM_GA4_SETUP.md`).

---

## 13. Future CMS migration

v1 stores content in Markdown. To move to a headless CMS later, you change only:

- **the loader** — replace the `glob()` loaders in `content.config.ts` (or the
  functions in `content.ts`) with CMS fetches;
- **the schema definition** — mirror the CMS's shapes into the same Zod schemas;
- **image handling** — swap `image()` for remote image URLs;
- **the build trigger** — add a deploy webhook from the CMS.

What does **not** change: every component, layout, the SEO layer, the tracking
layer, and all routing — because they depend on the `Article`/`Product`/`Author`
domain types in `content.ts`, not on raw collection entries. Do not install a CMS
now and do not add speculative abstractions for one.

---

## Deliverable categories (what's done vs. what you must do)

- **A. Implemented in code:** everything in this repo — content system, SEO,
  GTM wiring, affiliate tracking with position/product attribution, conversion +
  disclosure components, content gate, link checker, all docs.
- **B. You configure in Google:** GTM container, GA4 property + data stream, the
  GA4 custom dimensions, Search Console. See `GTM_GA4_SETUP.md` and `SEO_GUIDE.md`.
- **C. You configure on the host:** env vars (`PUBLIC_SITE_URL`,
  `PUBLIC_AMAZON_TAG`, `PUBLIC_GTM_ID`), custom domain + HTTPS, and
  `X-Robots-Tag: noindex` on preview deploys. See `DEPLOYMENT_GUIDE.md`.
- **D. Needs legal/program review:** privacy policy, whether a consent banner is
  required for your actual audience, exact disclosure wording, and your Amazon
  Associates application. Nothing here is legal advice.
