/**
 * SEO helpers — page metadata and JSON-LD builders.
 *
 * All absolute URLs derive from the configured `site` (Astro.site), which the
 * build guarantees is set (see astro.config.mjs). JSON-LD is returned as plain
 * objects and serialized by `components/seo/JsonLd.astro`.
 *
 * Structured-data rules (Section 4C):
 *   - data must reflect VISIBLE page content;
 *   - never invent ratings, reviews, prices, or availability;
 *   - no Product/Review schema for products we have not genuinely tested;
 *   - FAQPage only when FAQ items are actually rendered on the page.
 */
import type { Article, Author } from './content';
import { SITE } from './site';

/** Build an absolute URL from a path, using the site origin. */
export function absoluteUrl(path: string, site: URL | undefined): string {
  if (!site) {
    // Should never happen in a correct build — site is required — but fail soft
    // in dev rather than throwing while editing.
    return path;
  }
  return new URL(path, site).toString();
}

export interface PageMeta {
  title: string;
  description: string;
  /** Path (e.g. "/blog/foo/") used to build the canonical URL. */
  path: string;
  /** Explicit canonical override (frontmatter canonicalURL). */
  canonicalOverride?: string;
  noindex?: boolean;
  /** Open Graph type; "website" for most pages, "article" for posts. */
  ogType?: 'website' | 'article';
  /** Absolute or site-relative image for OG/Twitter cards. */
  image?: string;
  imageAlt?: string;
  publishedTime?: Date;
  modifiedTime?: Date;
  author?: string;
}

export interface ResolvedMeta {
  title: string;
  description: string;
  canonical: string;
  robots: string;
  ogType: string;
  image?: string;
  imageAlt?: string;
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
}

/** Resolve a PageMeta into the concrete values BaseHead renders. */
export function resolveMeta(meta: PageMeta, site: URL | undefined): ResolvedMeta {
  const canonical = meta.canonicalOverride || absoluteUrl(meta.path, site);
  return {
    title: meta.title,
    description: meta.description,
    canonical,
    robots: meta.noindex ? 'noindex, nofollow' : 'index, follow',
    ogType: meta.ogType ?? 'website',
    image: meta.image ? absoluteUrl(meta.image, site) : undefined,
    imageAlt: meta.imageAlt,
    publishedTime: meta.publishedTime?.toISOString(),
    modifiedTime: meta.modifiedTime?.toISOString(),
    author: meta.author,
  };
}

// ---------------------------------------------------------------------------
// JSON-LD builders. Each returns a plain object (or null to render nothing).
// ---------------------------------------------------------------------------

export function websiteJsonLd(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: absoluteUrl('/', site),
    description: SITE.description,
    inLanguage: SITE.locale,
  };
}

export function organizationJsonLd(site: URL | undefined) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.name,
    url: absoluteUrl('/', site),
    description: SITE.description,
  };
}

export function blogPostingJsonLd(article: Article, site: URL | undefined) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    inLanguage: SITE.locale,
    mainEntityOfPage: { '@type': 'WebPage', '@id': absoluteUrl(article.href, site) },
    datePublished: article.pubDate.toISOString(),
    dateModified: (article.updatedDate ?? article.pubDate).toISOString(),
    author: {
      '@type': 'Person',
      name: article.author.name,
      url: absoluteUrl(article.author.href, site),
    },
    publisher: { '@type': 'Organization', name: SITE.name },
  };
  if (article.coverImage) {
    data.image = absoluteUrl(article.coverImage.src, site);
  }
  return data;
}

export function breadcrumbJsonLd(
  crumbs: { name: string; href: string }[],
  site: URL | undefined
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.href, site),
    })),
  };
}

export function personJsonLd(author: Author, site: URL | undefined) {
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    url: absoluteUrl(author.href, site),
  };
  if (author.credentials) data.jobTitle = author.credentials;
  if (author.socialLinks.length) data.sameAs = author.socialLinks.map((s) => s.url);
  return data;
}

/**
 * FAQPage — ONLY call this when the FAQ is visibly rendered on the page and the
 * faq array is non-empty. Returns null otherwise so callers can spread safely.
 */
export function faqPageJsonLd(faq: { question: string; answer: string }[]) {
  if (!faq.length) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}
