// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

/**
 * The production site URL. Canonical URLs, the sitemap, and RSS all derive from
 * this value, so the build must fail loudly if it is missing or still a
 * placeholder (see the guard below). Override per-environment with the
 * PUBLIC_SITE_URL environment variable (set it on the host for production).
 */
const PLACEHOLDER_SITE = 'https://example.com';
const site = process.env.PUBLIC_SITE_URL || PLACEHOLDER_SITE;

/**
 * Fail the BUILD loudly (but not dev/check) when `site` is missing or still the
 * placeholder. Canonical URLs, the sitemap, and RSS all depend on a real origin.
 * Runs in astro:build:start so local `astro dev` and `astro check` are unaffected.
 */
const requireRealSite = {
  name: 'caliper:require-real-site',
  hooks: {
    'astro:build:start': () => {
      if (!process.env.PUBLIC_SITE_URL || site === PLACEHOLDER_SITE) {
        throw new Error(
          '[astro.config] `site` is not configured. Set PUBLIC_SITE_URL to the ' +
            'production origin (e.g. https://purifierpicks.com) before building ' +
            'for production. Canonical URLs, the sitemap, and RSS depend on it.'
        );
      }
    },
  },
};

// https://astro.build/config
export default defineConfig({
  site,
  // Static site generation by default (no adapter = fully static output).
  output: 'static',
  // Match the host's trailing-slash behaviour. Most static hosts (Netlify,
  // Cloudflare Pages, Vercel) serve directory-style URLs, so we emit a trailing
  // slash consistently and build canonical URLs to match (see src/lib/seo.ts).
  trailingSlash: 'always',
  build: {
    // Emit /blog/post/index.html so URLs carry a trailing slash on any host.
    format: 'directory',
  },
  integrations: [
    requireRealSite,
    mdx(),
    sitemap({
      // Drafts, noindex pages, and paginated duplicates are filtered out.
      // See the filter in astro.config — we exclude them by predicate.
      filter: (page) =>
        !page.includes('/draft/') &&
        !page.endsWith('/404/') &&
        !/\/\d+\/$/.test(page), // drop /blog/2/, /blog/3/ pagination duplicates
    }),
  ],
  vite: {
    // Tailwind CSS v4 via the official Vite plugin (the @astrojs/tailwind
    // integration is legacy Tailwind 3 only and is intentionally not used).
    plugins: [tailwindcss()],
  },
});
