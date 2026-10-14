# GTM & GA4 Setup

Google Tag Manager (GTM) is the **only** tag manager on this site. GA4 is
configured **inside** GTM — we never load the gtag snippet separately, so there
are no duplicate `page_view` events. Adding the GTM snippet (already done in code)
does **not** configure GA4; the GA4 and custom-dimension steps below are manual
and must be done in your Google accounts.

> **Code side (already done):**
> [`GoogleTagManager.astro`](../src/components/analytics/GoogleTagManager.astro)
> renders the official loader in `<head>` and the `<noscript>` iframe immediately
> after `<body>`, once per page. If `PUBLIC_GTM_ID` is empty it renders nothing
> and never errors. [`AffiliateTracking.astro`](../src/components/analytics/AffiliateTracking.astro)
> pushes the custom events. All pushes go through the guarded `pushEvent` in
> [`analytics.ts`](../src/lib/analytics.ts), which is a no-op without GTM and is
> wrapped in try/catch so tracking can never break the page.

---

## 1. Create the GTM container

1. Go to [tagmanager.google.com](https://tagmanager.google.com/) → **Create
   Account**. Account name = your brand; Container name = your domain; Platform =
   **Web**.
2. Copy the container ID — it looks like `GTM-XXXXXXX`.

## 2. Configure the environment variable

- **Locally:** copy `.env.example` to `.env` and set `PUBLIC_GTM_ID=GTM-XXXXXXX`.
- **On the host:** add `PUBLIC_GTM_ID` as a build environment variable (see
  `DEPLOYMENT_GUIDE.md`). **Never ship a fake ID to production**, and never commit
  a real `.env`.

The ID is referenced in exactly one place (the component), so there is no risk of
duplicate containers.

## 3. Create the GA4 property & data stream

1. [analytics.google.com](https://analytics.google.com/) → **Admin** → **Create
   Property**. Set time zone (US) and currency (USD).
2. Under the property → **Data Streams** → **Web** → enter your site URL →
   **Create stream**.
3. Copy the **Measurement ID** — it looks like `G-XXXXXXXXXX`.

## 4. Connect GA4 inside GTM (this is the step people skip)

In GTM:

1. **Tags → New → Google Tag** (the "Google tag" / GA4 configuration tag).
2. Set **Tag ID** = your GA4 Measurement ID (`G-XXXXXXXXXX`).
3. **Triggering** = **All Pages** (built-in **Initialization - All Pages** is
   fine).
4. Save.

This single tag sends the GA4 `page_view` on each page load. Because we do **not**
load gtag separately, there is no duplicate `page_view`.

> **View transitions note:** v1 uses normal browser navigation, so each page load
> is one real page view. If you later enable Astro view transitions, send virtual
> page views without duplication using GTM's **History Change** trigger together
> with Astro's `astro:page-load` event — and make sure the Google tag does not
> also auto-fire a second view.

---

## 5. The affiliate events

The site pushes three kinds of signals to the dataLayer. The naming convention:
**lowercase, snake_case event names; snake_case parameters.** Keep it consistent.

### `affiliate_click`

Pushed by a single delegated listener when any affiliate link is clicked. Payload:

```js
{
  event: "affiliate_click",
  affiliate_program: "amazon",
  link_url: "https://www.amazon.com/dp/B0...",
  link_text: "Check price on Amazon",
  article_path: "/blog/best-air-purifiers/",
  product_asin: "B0XXXXXXXX",
  link_position: "comparison_table" // hero | quick_picks | product_card |
                                    // comparison_table | inline | footer
}
```

`product_asin` and `link_position` are what make the data actionable — they tell
you **which component and which product** earns clicks.

### `view_product_card`

Pushed once when a product card scrolls into view (IntersectionObserver), giving
you a click-through rate per card rather than raw clicks:

```js
{ event: "view_product_card", product_asin: "B0...", article_path: "...", link_position: "product_card" }
```

### `scroll` depth

Handled entirely by **GTM's built-in Scroll Depth trigger** (25/50/75/90%) — no
code required. It tells you where readers stop before reaching the links.

---

## 6. Wire the events in GTM

For **`affiliate_click`** (repeat the pattern for `view_product_card`):

1. **Variables → User-Defined Variables → New** → **Data Layer Variable**, one
   for each parameter you want in reports:
   - `dlv_affiliate_program` → `affiliate_program`
   - `dlv_link_url` → `link_url`
   - `dlv_link_text` → `link_text`
   - `dlv_article_path` → `article_path`
   - `dlv_product_asin` → `product_asin`
   - `dlv_link_position` → `link_position`
2. **Triggers → New → Custom Event**; Event name = `affiliate_click`.
3. **Tags → New → Google Analytics: GA4 Event**; configure:
   - **Configuration tag** = your Google tag from step 4.
   - **Event Name** = `affiliate_click`.
   - **Event Parameters** = map each GA4 parameter to its Data Layer Variable
     (`affiliate_program` → `{{dlv_affiliate_program}}`, etc.).
   - **Triggering** = the `affiliate_click` Custom Event trigger.
4. Save.

For **scroll depth**: enable the built-in **Scroll Depth** trigger (vertical,
25/50/75/90%), add a GA4 Event tag named `scroll` fired by it.

`dataLayer.push()` happens in `AffiliateTracking.astro` (via `pushEvent`); GTM's
Custom Event trigger listens for the matching `event` value and fires the tag.

---

## 7. Register GA4 custom dimensions (REQUIRED — the most-missed step)

Collected parameters do **not** appear in any GA4 report until they are
registered as custom dimensions. In GA4:

**Admin → Custom definitions → Custom dimensions → Create**, scope = **Event**,
for each:

| Dimension name | Event parameter |
|---|---|
| Affiliate program | `affiliate_program` |
| Product ASIN | `product_asin` |
| Link position | `link_position` |

(You can also register `article_path`, though the built-in `page_path` usually
suffices.) Data only accrues **after** registration — it is not backfilled.

---

## 8. Verify everything

1. **GTM Preview (Tag Assistant):** in GTM click **Preview**, enter your URL.
   Load an article; confirm the Google tag fires on page load, then click a
   "Check price" button and confirm `affiliate_click` fires with all parameters
   populated, and that `view_product_card` fires as cards enter view.
2. **Tag Assistant** also confirms the container loads exactly once.
3. **GA4 DebugView** (Admin → DebugView, with Preview active): watch
   `page_view`, `affiliate_click`, `view_product_card`, and `scroll` arrive with
   their parameters.
4. **GA4 Realtime:** confirm live traffic and events.
5. Manually test the **no-GTM** case: build with `PUBLIC_GTM_ID=` empty and
   confirm no GTM script loads and the site still works.

### Manual test procedure for `affiliate_click`

1. Build/serve with a real `PUBLIC_GTM_ID`, open an article in GTM Preview.
2. Click each CTA type (quick pick, comparison row, product card).
3. In Tag Assistant's dataLayer, confirm each push has `product_asin` and the
   correct `link_position` for where you clicked.
4. Confirm navigation to Amazon still happens (tracking must not block it).

---

## 9. Consent (for non-US audiences)

The US audience (Section 0) does not legally require a consent banner, so none
ships. **If you target the EU/UK**, you must add a consent management platform
(CMP) that gates analytics tags before they fire:

- Add a CMP (e.g. a Google-certified one) and enable **Google Consent Mode v2**.
- In GTM, make analytics tags respect consent (set additional consent checks, or
  use the CMP's GTM template) so they do not fire before the user consents.
- Consent Mode adjusts tag behaviour based on consent state — it does **not**
  replace the banner.
- Test consent states in **GTM Preview**: verify tags are blocked before consent
  and fire after.

---

## 10. Core Web Vitals cost of GTM

GTM adds third-party JS. Mitigate:

- Keep the container lean — only the tags you actually use.
- Prefer GA4 + the events above; avoid piling in marketing pixels.
- The site itself ships almost no JS, so GTM is the main budget item; measure its
  impact in PageSpeed Insights after adding tags.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| No events in GA4 but they show in DebugView | Custom dimensions not registered (step 7), or you're looking before data accrued |
| `affiliate_click` fires but parameters are empty | Data Layer Variables not created/mapped (step 6) |
| Duplicate `page_view` | A gtag snippet added outside GTM, or a view-transition double-fire |
| GTM not loading | `PUBLIC_GTM_ID` not set on the host build, or left empty |
| Container loads twice | Two containers/IDs — there must be only one |
