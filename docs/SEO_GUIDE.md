# SEO Guide

How technical SEO is implemented in this codebase, and how to keep it correct as
you publish. Pairs with `CONTENT_STRATEGY.md` (what to write) — this is how the
pages are made crawlable, indexable, and rich-result-eligible.

---

## Where SEO lives

- **Metadata + JSON-LD builders:** [`src/lib/seo.ts`](../src/lib/seo.ts)
- **The `<head>`:** [`src/components/seo/BaseHead.astro`](../src/components/seo/BaseHead.astro)
- **Structured-data output:** [`src/components/seo/JsonLd.astro`](../src/components/seo/JsonLd.astro)
- **Sitemap:** `@astrojs/sitemap` (configured in `astro.config.mjs`)
- **robots.txt:** `src/pages/robots.txt.ts`
- **RSS:** `src/pages/rss.xml.ts`

---

## Metadata

Every page passes a `PageMeta` object to `BaseHead`, which produces:

- a unique `<title>` and `<meta name="description">`;
- an **absolute canonical** URL derived from `site` (or `canonicalURL` frontmatter
  override);
- `robots` = `index, follow` unless `noindex` is set;
- Open Graph + Twitter card tags (and `article:*` tags on posts);
- `lang="en"` / `og:locale=en_US`.

The build **fails** (`check-content.mjs`) if a published article's title exceeds
60 characters or its description exceeds 160 — the lengths Google tends to
truncate. The Zod schema hard-caps them slightly higher (70/170) as a backstop.

**No duplicate metadata:** titles/descriptions are derived from per-page content,
never shared.

---

## Canonicals & trailing slashes

- `trailingSlash: 'always'` + `build.format: 'directory'` in `astro.config.mjs`,
  so URLs are directory-style (`/blog/post/`). Canonicals are built to match.
- Most static hosts (Netlify, Cloudflare Pages, Vercel) serve directory URLs;
  if you change hosts, keep this setting aligned with the host's behaviour to
  avoid canonical mismatches.
- Set `canonicalURL` in frontmatter only to point at a different canonical (e.g.
  syndicated content). Leave it unset otherwise.

---

## Indexing control

- `noindex: true` in an article's frontmatter emits `noindex, nofollow` and keeps
  the page out of the sitemap.
- Pagination pages (`/blog/page/N/`) are `noindex` by design — they add little
  unique value — but remain crawlable so bots reach the articles.
- The sitemap (`sitemap-0.xml`, indexed by `sitemap-index.xml`) **excludes** the
  404 page, pagination duplicates, and any draft. Drafts are also excluded from
  the production build entirely.
- **Preview deploys must not be indexed.** robots.txt alone is not enough — set
  `X-Robots-Tag: noindex` at the host for non-production branches. See
  `DEPLOYMENT_GUIDE.md`.

---

## Technical checklist (built in)

- Semantic HTML, exactly one `<h1>` per page.
- Real `<a href>` internal links — no JS-only navigation; the site is fully
  navigable with JavaScript disabled.
- Clean, keyword-derived slugs (the filename is the slug).
- Visible breadcrumbs on articles/category/author/tag pages, matching the
  `BreadcrumbList` schema (same array feeds both).
- Images via Astro's pipeline with explicit width/height; the cover/LCP image is
  eager-loaded, below-the-fold images lazy-loaded.
- Every image requires alt text (the schema requires `coverImageAlt` /
  `imageAlt`; the content gate re-checks cover images).
- Custom 404 linking back into every cluster.
- Minimal third-party JS (just GTM + three tiny first-party scripts).

---

## Structured data (JSON-LD)

Emitted by `JsonLd.astro`, built in `seo.ts`:

| Page | Schema |
|---|---|
| Home | `WebSite`, `Organization` |
| Article | `BlogPosting` (author, datePublished, dateModified), `BreadcrumbList`, and `FAQPage` **only when** the article has a rendered FAQ |
| Category / tag / author | `BreadcrumbList` (+ `Person` on author) |

**Rules enforced by design:**

- Structured data reflects **visible** content only. `FAQPage` is emitted solely
  when `faq` is populated and therefore rendered by `FaqSection`.
- We do **not** emit `Product` or `Review` schema, or any rating/price/review-count
  markup. For a roundup of products we have assessed but not formally lab-tested,
  `Product`/`Review` rich-result requirements are not met, and inventing those
  fields violates both Google's and Amazon's policies. If you later run genuine,
  documented testing, add `Review`/`Product` carefully and validate it.

**Validate** every structured-data change in Google's
[Rich Results Test](https://search.google.com/test/rich-results) and the
[Schema Markup Validator](https://validator.schema.org/).

---

## Search Console setup (manual, do once)

1. Add the property for your production domain and verify it (DNS TXT is most
   robust).
2. Submit `https://<your-domain>/sitemap-index.xml` under **Sitemaps**.
3. Use **URL Inspection** to request indexing of your pillar pages.
4. Monitor **Pages** (indexing status), **Core Web Vitals**, and the
   **Performance** report for queries and CTR.

---

## Avoiding thin / duplicate affiliate content

- The content gate blocks: missing keyword/intent; review/comparison/roundup with
  no products; products with no verdict; and **< ~800 words on any page carrying
  affiliate links** (the thin-page guard).
- Pros/cons must both be populated (the product schema enforces at least one of
  each) — an empty con column is the clearest signal of a thin affiliate page.
- Related posts, category pages, and tag pages (only for tags used on 3+ articles)
  prevent thin index pages.
- Keep each page's primary keyword distinct to avoid self-competition
  (keyword cannibalization).

---

## Core Web Vitals

- Static HTML + near-zero JS keeps LCP/INP/CLS healthy by default.
- The cover image is eager-loaded with `fetchpriority="high"` to protect LCP;
  everything below the fold is lazy.
- GTM is the main third-party cost — see `GTM_GA4_SETUP.md` for mitigation.
- Fonts load with `display=swap` and preconnect to avoid blocking render.
