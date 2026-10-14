# Caliper Air

An SEO-first, static **Amazon-affiliate review site for home air purifiers**,
built with Astro 7, TypeScript, and Tailwind CSS v4. Measurement-first reviews,
honest disclosures, and affiliate click tracking with per-component and
per-product attribution — implemented to the "Caliper" design system.

> **Measure first. Then recommend.**

## Quick start

```bash
cp .env.example .env          # set PUBLIC_SITE_URL, PUBLIC_AMAZON_TAG, PUBLIC_GTM_ID
npm install
npm run dev                   # http://localhost:4321
```

Production build (fails loudly if `PUBLIC_SITE_URL` is missing):

```bash
PUBLIC_SITE_URL=https://your-domain.com PUBLIC_AMAZON_TAG=yourtag-20 npm run build
npm run check:links
```

## What's inside

- **Content Layer** collections (`blog`, `products`, `authors`) with Zod
  validation — the current Astro API (`glob()` loader, `render(entry)`, `entry.id`).
- **Conversion components** (quick picks, comparison table, product cards,
  pros/cons, scale bars, verdict) all routing CTAs through one `AffiliateLink`
  with `rel="sponsored nofollow noopener"` and tracking.
- **SEO**: per-page metadata, canonicals, sitemap, RSS, robots, and JSON-LD
  (`WebSite`, `Organization`, `BlogPosting`, `BreadcrumbList`, `FAQPage`,
  `Person`) that reflects visible content only.
- **GTM → GA4** with `affiliate_click` (incl. `link_position` + `product_asin`),
  `view_product_card`, and scroll depth — a no-op when GTM isn't configured.
- **Quality gates**: `npm run check:content` (anti-thin-affiliate) and
  `npm run check:links`.

## Documentation

Start with **[docs/PROJECT_ARCHITECTURE.md](docs/PROJECT_ARCHITECTURE.md)**, then:

- [CONTENT_STRATEGY.md](docs/CONTENT_STRATEGY.md) — audience, clusters, intent model
- [CONTENT_PUBLISHING_GUIDE.md](docs/CONTENT_PUBLISHING_GUIDE.md) — how to publish
- [SEO_GUIDE.md](docs/SEO_GUIDE.md) — technical SEO & structured data
- [GTM_GA4_SETUP.md](docs/GTM_GA4_SETUP.md) — analytics & event wiring
- [MEASUREMENT_AND_OPTIMIZATION.md](docs/MEASUREMENT_AND_OPTIMIZATION.md) — the earnings loop
- [DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — hosting & preview noindex

The original build brief and the Caliper design-system spec are also in `docs/`.

## Compliance notes

No prices or scraped ratings are shown (Amazon program + staleness). Disclosures
render automatically above the first affiliate link on any page with products.
Nothing here is legal advice — review the privacy policy, disclosure wording, and
consent requirements for your audience before launch (see the docs).
