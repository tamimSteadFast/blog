# Content Strategy

How Caliper Air decides what to publish, for whom, and how pages link together.
This is the plan that the technical SEO in `SEO_GUIDE.md` serves.

---

## The one reader

Everything is written for a single person: someone **comparing air purifiers and
close to buying**, in the US, for a **bedroom, nursery, or small-to-mid room**,
on a budget **under ~$300**, who cares most about **noise** and **running cost**.

If a draft doesn't help that person make or confirm a decision, it doesn't ship.
We would rather publish 30 deeply-targeted articles than 200 shallow ones — and a
new Associates account must generate qualifying sales within its initial window,
which is another reason to launch with a few strong, high-intent pages.

---

## The four clusters

Defined in [`src/lib/clusters.ts`](../src/lib/clusters.ts):

| Cluster | Slug | Role | Intent |
|---|---|---|---|
| Air Purifiers | `air-purifiers` | **Money pages** — reviews, comparisons, roundups | commercial / transactional |
| Air Quality Basics | `air-quality` | Informational — how purifiers work | informational |
| Filters & Maintenance | `filters-maintenance` | Ownership cost, replacement, cleaning | informational / commercial |
| By Use Case | `use-cases` | Allergies, pets, smoke, dust, bedrooms, large rooms | commercial |

Each cluster has **one pillar** (`isPillar: true`) and several supporting
articles.

---

## The pillar/cluster model

- One **pillar** per cluster: broad, informational, the "hub".
- **Supporting** articles (reviews, comparisons, roundups) each link **up** to
  their pillar.
- The pillar links **down** to its supporting articles.
- **Related posts** are chosen by `cluster` first, then shared `tags` — never by
  date. This is automatic (`getRelatedArticles` in `content.ts`); you don't curate
  it per article.

Shipped examples:

- `air-purifiers` pillar → **The best air purifiers we've tested** (roundup),
  supported by the **Coway Airmega 200M review**.
- `air-quality` pillar → **How air purifiers actually work**, which links down to
  the roundup.

---

## The content model (frontmatter that targets intent)

Every article **must** declare, in frontmatter:

- `primaryKeyword` — the one phrase the page targets.
- `searchIntent` — `informational | commercial | transactional`.
- `contentType` — `review | comparison | roundup | guide | news`.
- `cluster` and `category` — which cluster it belongs to.
- a `buyer stage` is implicit in `searchIntent` + `contentType`.

The build fails (via `scripts/check-content.mjs`) if `primaryKeyword` or
`searchIntent` is missing, so no article ships untargeted. We do **not** build
generic "blog" pages that serve no search intent.

### Choosing a primary keyword

1. Start from the reader's actual words ("quietest air purifier for bedroom"),
   not category jargon.
2. Prefer phrases that signal buying stage: "best X for Y", "X vs Y", "X review".
3. One primary keyword per page. Secondary keywords go in `secondaryKeywords` and
   should be genuine variants, not stuffing.
4. Make the slug a clean, readable form of the keyword (the filename is the slug).

### Which content type for which intent

| Reader is… | contentType | Lead component |
|---|---|---|
| ready to buy, one product in mind | `review` | Verdict + single ProductCard |
| deciding between two | `comparison` | ComparisonTable |
| wants "the best of" | `roundup` | QuickPicks + ComparisonTable |
| learning | `guide` | prose + FAQ |

---

## Mapping the first 20–30 articles

A practical build-out for this niche (fill/adjust as you publish):

- **air-purifiers:** best overall roundup (pillar) · best for bedroom · best
  budget · best quiet · 3–5 single-model reviews · 2–3 head-to-head comparisons.
- **use-cases:** best for allergies · best for pets · best for smoke · best for
  dust · best for large rooms · best for nursery.
- **air-quality:** how purifiers work (pillar) · HEPA explained · CADR explained ·
  do air purifiers help with X.
- **filters-maintenance:** how often to replace filters · true cost of running a
  purifier · how to clean a pre-filter · are washable filters worth it.

Every money page links back to the air-quality pillar for readers who need the
basics, and every basics article links forward to the roundup.

---

## Publishing cadence

- Launch with the cluster pillars plus 2–3 strong money pages per cluster.
- Then publish steadily (e.g. 1–2 articles/week) rather than dumping volume.
- Revisit product-bearing pages on a schedule and update `lastReviewed`; stale
  "best of" pages lose both rankings and trust.

See `CONTENT_PUBLISHING_GUIDE.md` for the mechanics of writing and shipping one.
