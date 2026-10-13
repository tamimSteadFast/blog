/**
 * Content clusters (Section 0 of the build brief).
 *
 * These are the top-level taxonomy of the site. Each cluster has exactly one
 * pillar article (`isPillar: true` in frontmatter) and a set of supporting
 * articles (reviews, comparisons, roundups, guides). The pillar/cluster model
 * and internal-linking logic in `src/lib/content.ts` depend on these slugs.
 *
 * This is a plain module (no Astro imports) so it can be imported both by
 * `src/content.config.ts` (to build the Zod enum) and by the rest of the app.
 *
 * To re-niche the site: change these entries, update the example content, and
 * update docs/CONTENT_STRATEGY.md. Nothing else needs to move.
 */

export interface ClusterDef {
  /** URL-safe slug. Used in /category/<slug>/ routes and frontmatter. */
  slug: string;
  /** Human label shown in navigation and breadcrumbs. */
  label: string;
  /** One-line description for the category index page and meta description. */
  description: string;
}

export const CLUSTERS = [
  {
    slug: 'air-purifiers',
    label: 'Air Purifiers',
    description:
      'Hands-on reviews, head-to-head comparisons, and best-of roundups to help you pick the right air purifier for your room.',
  },
  {
    slug: 'air-quality',
    label: 'Air Quality Basics',
    description:
      'How air purifiers actually work — HEPA, CADR, ACH, and the numbers that matter — explained without the jargon.',
  },
  {
    slug: 'filters-maintenance',
    label: 'Filters & Maintenance',
    description:
      'Filter replacement schedules, cleaning, and the real running cost of owning an air purifier over three years.',
  },
  {
    slug: 'use-cases',
    label: 'By Use Case',
    description:
      'The best air purifier for allergies, pets, smoke, dust, mold, bedrooms, and large open-plan rooms.',
  },
] as const satisfies readonly ClusterDef[];

export type ClusterSlug = (typeof CLUSTERS)[number]['slug'];

/** Ordered list of cluster slugs — used to build the Zod enum. */
export const CLUSTER_SLUGS = CLUSTERS.map((c) => c.slug) as [
  ClusterSlug,
  ...ClusterSlug[],
];

export function getCluster(slug: string): ClusterDef | undefined {
  return CLUSTERS.find((c) => c.slug === slug);
}

export function clusterLabel(slug: string): string {
  return getCluster(slug)?.label ?? slug;
}
