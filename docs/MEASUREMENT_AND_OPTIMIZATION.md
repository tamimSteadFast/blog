# Measurement & Optimization Loop

The site is not finished when it deploys. This is how you close the loop between
traffic (GA4) and earnings (Amazon Associates) — two systems that do not talk to
each other.

---

## The honest baseline

A new affiliate site typically sees little search traffic for several months, and
no analytics configuration changes that. Amazon also closes new Associates
accounts that don't generate qualifying sales within the program's initial
window — which is the practical reason to launch with a few strong, high-intent
articles rather than many weak ones. **Client-side click counts are not
commissions**; real attribution comes from Amazon's side.

---

## Per-article metrics to review monthly

From **GA4** (powered by the events in `GTM_GA4_SETUP.md`):

- **Sessions** per article.
- **Affiliate CTR** = `affiliate_click` ÷ sessions.
- **Click distribution by `link_position`** — which component actually converts
  (hero / quick_picks / product_card / comparison_table / inline / footer).
- **Click distribution by `product_asin`** — which product readers want.
- **Scroll depth before the first affiliate click** — how far they read first.
- **Product-card CTR** = `affiliate_click` ÷ `view_product_card` for a card.

From **Amazon Associates** (GA4 cannot see this):

- **Ordered items and earnings, by tracking ID.**

---

## Attribution by tracking ID

GA4 shows clicks; only Amazon shows commissions. To read earnings **by content
group**, create separate Associates **tracking IDs** per cluster (or per
high-value article) and configure them in `.env`:

```
PUBLIC_AMAZON_TAG=caliperair-20
PUBLIC_AMAZON_TAGS_BY_CLUSTER=air-purifiers:caliperair-reviews-20,use-cases:caliperair-usecase-20
```

`src/lib/affiliate.ts` resolves the per-cluster tag automatically when building
links. The Associates earnings report can then be filtered by tracking ID to see
which cluster earns.

> Before adding **any** extra URL parameters beyond the tag, verify they are
> permitted in the current Associates Operating Agreement for your marketplace —
> what's allowed varies and changes.

---

## Decisions the data drives

| Observation | Action |
|---|---|
| High sessions, low CTR | Page serves the wrong intent, or the CTA is too far down → move `QuickPicks` higher / sharpen the verdict. |
| High CTR, low earnings | Wrong products for the reader, or price point too low → revisit the product set and the Section 0 price range. |
| One `link_position` dominates clicks | Rebuild other articles around that layout. |
| One cluster earns disproportionately | Write more supporting articles in it and strengthen internal links to its pillar. |
| Readers stop scrolling before the first link | Raise the conversion block; tighten the intro. |

---

## Reporting

1. Build a simple **Looker Studio** report on the GA4 data source with: article
   path, sessions, `affiliate_click` count, and CTR. Add `link_position` and
   `product_asin` as breakdown dimensions (they must be registered as GA4 custom
   dimensions first — see `GTM_GA4_SETUP.md` §7).
2. Keep a **manual monthly sheet** joining that GA4 data to Associates earnings
   per tracking ID, since GA4 cannot see commissions.
3. Track **revenue per 1,000 sessions (RPM) per cluster** — the one number that
   tells you where to spend writing time.

---

## The cadence

- **Monthly:** pull the metrics above; make one or two layout/content changes;
  note what you changed so next month's numbers are interpretable.
- **Quarterly:** re-review product-bearing pages, refresh `lastReviewed`, retire
  or `noindex` anything thin, and double down on the highest-RPM cluster.
