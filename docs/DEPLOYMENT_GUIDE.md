# Deployment Guide

Local development, the production build, GitHub, and host configuration — with the
one setting most affiliate sites get wrong (preview `noindex`).

---

## Local development

```bash
cp .env.example .env     # then edit values
npm install
npm run dev              # http://localhost:4321  (drafts visible in dev)
```

Useful scripts:

| Command | Does |
|---|---|
| `npm run dev` | Dev server, drafts visible |
| `npm run check:content` | Content quality gate only |
| `npm run build` | `check:content` → `astro check` → `astro build` |
| `npm run check:links` | Internal link check (run after `build`) |
| `npm run preview` | Serve the built `dist/` locally |

### Required environment variables

| Variable | Required | Notes |
|---|---|---|
| `PUBLIC_SITE_URL` | **production** | Production origin, no trailing slash. The build **fails** if missing or left as `https://example.com`. |
| `PUBLIC_AMAZON_TAG` | for real links | Associates tag, e.g. `caliperair-20`. |
| `PUBLIC_AMAZON_TAGS_BY_CLUSTER` | optional | Per-cluster tracking IDs (see `MEASUREMENT_AND_OPTIMIZATION.md`). |
| `PUBLIC_GTM_ID` | for analytics | `GTM-XXXXXXX`. Empty = analytics off (no-op). Never ship a fake ID. |

`PUBLIC_`-prefixed vars are exposed to the browser bundle — correct for all of the
above, but **never** put a secret (e.g. PA-API keys) behind `PUBLIC_`.

---

## Production build

```bash
PUBLIC_SITE_URL=https://your-domain.com PUBLIC_AMAZON_TAG=yourtag-20 PUBLIC_GTM_ID=GTM-XXXXXXX npm run build
```

Output is static HTML in `dist/`. Then optionally `npm run check:links`.

---

## GitHub workflow

1. Create a repo and push:
   ```bash
   git init && git add . && git commit -m "Initial Caliper Air build"
   git branch -M main
   git remote add origin git@github.com:you/caliper-air.git
   git push -u origin main
   ```
2. `.env` is git-ignored — set real values on the host, not in the repo.
3. Publish by committing content and pushing; the host builds on push.

---

## Host: recommendation

**Recommended: Cloudflare Pages.** For a purely static Astro site it's free, fast
on a global edge network, and its `_headers` / branch rules make the preview
`noindex` step (below) straightforward. **Netlify** and **Vercel** are equally
fine and nearly identical to configure; pick whichever you know. The only
host-specific details are the env vars, the headers rule for previews, and the
trailing-slash behaviour (this site emits directory-style URLs with a trailing
slash — keep the host aligned).

### Build settings (all three hosts)

- **Build command:** `npm run build`
- **Output / publish directory:** `dist`
- **Environment variables:** set `PUBLIC_SITE_URL`, `PUBLIC_AMAZON_TAG`,
  `PUBLIC_GTM_ID` (and `PUBLIC_AMAZON_TAGS_BY_CLUSTER` if used) for the
  **Production** environment.

---

## Preview deployments must NOT be indexed (do not skip)

Branch/preview URLs getting indexed is a common and damaging SEO mistake.
`robots.txt` alone is not enough — set `X-Robots-Tag: noindex` on non-production
deploys.

**Cloudflare Pages** — add a `public/_headers` file applied only on previews, or
use a Pages Function / Transform Rule that adds the header when the hostname is a
`*.pages.dev` preview rather than your custom domain:

```
# Example _headers (applies to all; prefer a preview-only rule in production)
https://:project.pages.dev/*
  X-Robots-Tag: noindex
```

**Netlify** — in `netlify.toml`, scope a header to Deploy Previews / branch
deploys:

```toml
[[context.deploy-preview.headers]]
  for = "/*"
  [context.deploy-preview.headers.values]
    X-Robots-Tag = "noindex"

[[context.branch-deploy.headers]]
  for = "/*"
  [context.branch-deploy.headers.values]
    X-Robots-Tag = "noindex"
```

**Vercel** — add a header for preview via `vercel.json` headers plus a check on
`VERCEL_ENV=preview` (e.g. in a middleware or an edge config), so only production
is indexable.

Always confirm with `curl -I https://<preview-url>/` that production does **not**
carry the header and previews **do**.

---

## Custom domain & HTTPS

1. Add your custom domain in the host dashboard.
2. Point DNS as instructed (usually a CNAME, or Cloudflare's nameservers).
3. HTTPS certificates are provisioned automatically by all three hosts.
4. Set `PUBLIC_SITE_URL` to the final `https://` origin and redeploy so
   canonicals, the sitemap, and RSS use it.

---

## Production verification checklist

After the first production deploy:

- [ ] `https://your-domain.com/` loads over HTTPS.
- [ ] `view-source` shows the correct canonical and one GTM container.
- [ ] `/robots.txt` points at `https://your-domain.com/sitemap-index.xml`.
- [ ] The sitemap lists only public canonical pages (no drafts/404/pagination).
- [ ] Rich Results Test passes on an article and the homepage.
- [ ] GTM Preview shows `page_view` + `affiliate_click` with parameters.
- [ ] A preview/branch URL returns `X-Robots-Tag: noindex`; production does not.
- [ ] Submit the sitemap in Search Console.

---

## Troubleshooting

| Symptom | Fix |
|---|---|
| Build fails: "`site` is not configured" | Set `PUBLIC_SITE_URL` to your real origin (not `example.com`). |
| Links/canonicals point at the wrong origin | `PUBLIC_SITE_URL` not set on the host build. |
| Analytics missing in production | `PUBLIC_GTM_ID` not set on the host; see `GTM_GA4_SETUP.md`. |
| Preview pages appearing in Google | The `X-Robots-Tag: noindex` preview rule isn't applied. |
| 404s on refresh of nested URLs | Host trailing-slash setting differs from the site's directory format. |
