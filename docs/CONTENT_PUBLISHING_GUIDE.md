# Content Publishing Guide

How to add a product, write an article, and publish it. No code changes required.

---

## The workflow at a glance

```
Add/confirm product + author files
   → write src/content/blog/<slug>.md (draft: true while writing)
   → npm run dev to preview (drafts show in dev)
   → set draft: false
   → npm run build  (content gate + astro check + build must pass)
   → commit + push to GitHub
   → host builds and deploys
```

The **filename is the slug and the URL**: `src/content/blog/best-quiet-air-purifier.md`
→ `/blog/best-quiet-air-purifier/`. Make it a clean, keyword-derived slug.

---

## Step 1 — Add the products you'll reference

Affiliate product data lives in `src/content/products/<id>.md`, **never inline in
prose**, so an ASIN or tag changes in one place. Example:

```md
---
name: Coway Airmega 200M
brand: Coway
asin: B0XXXXXXXX            # 10 chars, UPPERCASE letters/digits. Replace placeholders.
marketplace: amazon.com
imageAlt: Coway Airmega 200M, square white unit with a front intake grille
bestFor: Bedrooms up to 40 m² where noise matters more than speed.
pros:                        # at least one; be specific
  - Second-quietest unit on its highest setting
cons:                        # at least one — never ship an empty con column
  - Struggles in rooms larger than 40 m²
keySpecs:                    # label/value pairs; used by cards + comparison table
  - { label: 'Room size', value: 'up to 40 m²' }
  - { label: 'Noise, max', value: '48 dB' }
ourRating: 4.5               # OPTIONAL — only if you genuinely assessed it
---
Optional notes about the product.
```

The affiliate URL is built automatically from `asin + marketplace + tag` — do not
write Amazon URLs by hand. **Prices, scraped star ratings, review counts, and
availability are deliberately not in the schema** (see `AMAZON_COMPLIANCE` notes
in the build brief and `MEASUREMENT_AND_OPTIMIZATION.md`).

---

## Step 2 — Confirm an author exists

`src/content/authors/<id>.md`:

```md
---
name: Tamim Hossain
bio: Tests and writes every review on this site…   # true claims only
credentials: Founder & lead reviewer               # optional
expertise: [air-purifiers, air-quality]            # cluster slugs
socialLinks:
  - { label: Email, url: 'mailto:hello@example.com' }
---
Longer bio paragraph (optional).
```

Reference it from an article by its id (the filename). **Do not invent
credentials or testing claims.** If you are the only author, say so honestly.

---

## Step 3 — Write the article

```md
---
title: The best air purifiers we've tested         # ≤ 60 chars (build enforces)
description: "One sentence, 120–160 chars. Quote it if it contains a colon."
pubDate: 2026-10-02
updatedDate: 2026-10-10                             # optional
author: tamim                                       # author id
category: air-purifiers                             # cluster slug
cluster: air-purifiers                              # pillar group (usually same)
isPillar: false                                     # true for the cluster's hub
draft: false                                        # true hides it from prod
contentType: roundup                                # review|comparison|roundup|guide|news
searchIntent: commercial                            # informational|commercial|transactional
primaryKeyword: best air purifier                   # REQUIRED
secondaryKeywords: [quietest air purifier]          # optional
tags: [roundup, bedroom, hepa]                      # tag pages need 3+ articles
verdict: >-                                          # REQUIRED if products present
  One paragraph, one recommendation, one condition under which it changes.
lastReviewed: 2026-10-10                            # shown on product pages
recommendedProduct: coway-airmega-200m             # the "our pick" (yellow)
products: [coway-airmega-200m, winix-5500-2]       # product ids
picks:                                              # powers the Quick Picks box
  - { role: Best overall, product: coway-airmega-200m, note: Quietest at the price. }
  - { role: Best on a budget, product: winix-5500-2, note: Same filtration for less. }
faq:                                                # powers FAQ + FAQPage schema
  - question: Do air purifiers help with dust?
    answer: Yes, for airborne dust…
---

Intro paragraph.

## How we tested
…prose with ## / ### headings (these build the table of contents)…
```

### What renders automatically

You write **prose**; `BlogLayout` assembles the Caliper anatomy around it:
breadcrumb, title/byline, **disclosure** (whenever products are present), verdict,
quick picks, comparison table (when 2+ products), the product cards (under "The
units we tested"), FAQ, author box, and related posts. You never hand-place the
disclosure, author box, FAQ, or related links.

### Every frontmatter field

| Field | Required | Notes |
|---|---|---|
| `title` | ✔ | ≤ 60 chars for the SEO title |
| `description` | ✔ | 120–160 chars; quote if it contains `: ` |
| `pubDate` | ✔ | listing sort key (desc) |
| `updatedDate` | | shown when present |
| `author` | ✔ | author id |
| `category` / `cluster` | ✔ | cluster slugs |
| `isPillar` | | one pillar per cluster |
| `draft` | | defaults `true`; set `false` to publish |
| `contentType` | ✔ | review/comparison/roundup require ≥1 product |
| `searchIntent` | ✔ | |
| `primaryKeyword` | ✔ | |
| `secondaryKeywords` | | |
| `tags` | | tag page generated at 3+ uses |
| `coverImage` / `coverImageAlt` | | alt required if image set |
| `canonicalURL` | | override only |
| `noindex` | | thin/legacy pages |
| `verdict` | ✔ if products | one-sentence recommendation |
| `lastReviewed` | | shown on product-bearing pages |
| `recommendedProduct` | | the yellow "our pick" |
| `products` / `picks` | | affiliate references |
| `faq` | | enables FAQPage schema |

---

## Step 4 — Images (optional but recommended)

- Put images in `src/assets/…` and reference them from frontmatter
  (`coverImage: ../../assets/foo.jpg`) so Astro optimizes them with explicit
  width/height. Always provide `coverImageAlt` / `imageAlt`.
- **Product images must come from an approved source** — SiteStripe or the
  Product Advertising API, or your own photographs. **Do not hotlink or scrape
  Amazon images.** The shipped examples omit images (the components render tidy
  placeholders) precisely to avoid unapproved sourcing.

---

## Step 5 — Preview, check, publish

```bash
npm run dev            # drafts are visible here
npm run build          # runs: content gate → astro check → build
npm run check:links    # after build: verifies internal links
```

The content gate (`check:content`) **fails the build** if a published article is
missing a keyword/intent, is a review/comparison/roundup with no products, has
products but no verdict, exceeds title/description limits, is under ~800 words
while carrying affiliate links, has a cover image without alt text, or references a
product/author id that doesn't exist. Fix what it names, then:

```bash
git add .
git commit -m "Add: <article title>"
git push
```

Your host rebuilds and deploys (see `DEPLOYMENT_GUIDE.md`).

---

## Writing useful affiliate content (so it isn't thin)

- Lead with the verdict; a ready-to-buy reader shouldn't scroll past 2,000 words
  to act.
- Show measurements, not stars. Only put a `ScaleBar` on a number you measured or
  cited.
- Populate **both** pros and cons honestly — an empty con column reads as an ad.
- Don't print prices; the "Check price on Amazon" button is the price check.
- Link up to the cluster pillar and down to supporting articles.
