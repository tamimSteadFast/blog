/**
 * Affiliate link building.
 *
 * The affiliate URL is built HERE at render time from an ASIN + marketplace +
 * the tracking tag in the environment — never hardcoded in content. That is
 * what lets an ASIN or tag change in one product file instead of across every
 * article, and what makes a future PA-API adapter a drop-in (see Section 8 /
 * the `buildProductData` note at the bottom).
 *
 * Environment:
 *   PUBLIC_AMAZON_TAG              — default Associates tag (e.g. "caliperair-20")
 *   PUBLIC_AMAZON_TAGS_BY_CLUSTER  — optional "cluster:tag,cluster:tag" overrides
 */

const MARKETPLACE_HOSTS = {
  'amazon.com': 'www.amazon.com',
} as const;

export type Marketplace = keyof typeof MARKETPLACE_HOSTS;

/**
 * Where on the page an affiliate link sits. This is the single most important
 * field for optimization (Section 7 / 16): it tells you which component earns
 * clicks. Keep this union in sync with the GA4 custom dimension.
 */
export type LinkPosition =
  | 'hero'
  | 'quick_picks'
  | 'product_card'
  | 'comparison_table'
  | 'inline'
  | 'footer';

const DEFAULT_TAG = import.meta.env.PUBLIC_AMAZON_TAG || '';

/** Parse "cluster:tag,cluster:tag" into a lookup. */
function parseClusterTags(): Record<string, string> {
  const raw = import.meta.env.PUBLIC_AMAZON_TAGS_BY_CLUSTER || '';
  const map: Record<string, string> = {};
  for (const pair of raw.split(',')) {
    const [cluster, tag] = pair.split(':').map((s) => s.trim());
    if (cluster && tag) map[cluster] = tag;
  }
  return map;
}

const CLUSTER_TAGS = parseClusterTags();

/**
 * Resolve the Associates tracking tag to use. A per-cluster tag (if configured)
 * lets the Associates earnings report be read by content group. Falls back to
 * the default tag.
 */
export function resolveTag(cluster?: string): string {
  if (cluster && CLUSTER_TAGS[cluster]) return CLUSTER_TAGS[cluster];
  return DEFAULT_TAG;
}

/** True when a usable Associates tag is configured. */
export function hasAffiliateTag(): boolean {
  return DEFAULT_TAG.length > 0;
}

export interface BuildAmazonUrlOptions {
  asin: string;
  marketplace?: Marketplace;
  /** Cluster slug, used to pick a per-cluster tracking tag if configured. */
  cluster?: string;
}

/**
 * Build a canonical Amazon product URL with the Associates tag appended.
 * Uses the /dp/<ASIN> short form, which is the stable, permitted deep link.
 *
 * NOTE: Do not append extra URL parameters beyond the tag without checking the
 * current Associates Operating Agreement for the marketplace — what is
 * permitted varies and changes over time (Section 7).
 */
export function buildAmazonUrl({
  asin,
  marketplace = 'amazon.com',
  cluster,
}: BuildAmazonUrlOptions): string {
  const host = MARKETPLACE_HOSTS[marketplace] ?? MARKETPLACE_HOSTS['amazon.com'];
  const url = new URL(`https://${host}/dp/${encodeURIComponent(asin)}/`);
  const tag = resolveTag(cluster);
  if (tag) url.searchParams.set('tag', tag);
  return url.toString();
}

/**
 * The standard, non-negotiable rel value for a monetized link. `sponsored` is
 * required by Google for paid links; omitting it is a policy issue, not style.
 */
export const AFFILIATE_REL = 'sponsored nofollow noopener';
