/**
 * Content collections — current Astro Content Layer API.
 *
 * Verified against the live Astro docs (Astro 7):
 *   - collections live in `src/content.config.ts` (NOT the legacy
 *     `src/content/config.ts` folder-magic location);
 *   - the `glob()` loader comes from `astro/loaders`;
 *   - `reference()` validates cross-collection links at build time;
 *   - `image()` (from the schema context) validates and optimizes local images;
 *   - rendering uses `render(entry)` from `astro:content` (see src/lib/content.ts),
 *     and the identifier is `entry.id` — both handled in the lib layer.
 *
 * Three collections: blog (articles), products (affiliate product data), and
 * authors (E-E-A-T). Affiliate product data lives in `products`, never inline
 * in article prose, so an ASIN or tag changes in one file instead of twenty.
 */
import { defineCollection, reference } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { CLUSTER_SLUGS } from './lib/clusters';

// Single marketplace for v1 (Section 0: amazon.com / US). Multi-marketplace is
// intentionally out of scope — see docs/PROJECT_ARCHITECTURE.md.
const MARKETPLACES = ['amazon.com'] as const;

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      // --- Core SEO metadata ---
      title: z.string().min(1).max(70), // 50–60 recommended; hard-capped so a
      // build check can warn before Google truncates it.
      description: z.string().min(1).max(170), // 120–160 recommended.
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),

      // --- Authorship / taxonomy ---
      author: reference('authors'),
      category: z.enum(CLUSTER_SLUGS), // the cluster this article belongs to
      tags: z.array(z.string()).default([]),
      draft: z.boolean().default(true),

      // --- Images ---
      coverImage: image().optional(),
      coverImageAlt: z.string().optional(),

      // --- Indexing / canonical ---
      canonicalURL: z.url().optional(),
      noindex: z.boolean().default(false),

      // --- Search-intent / content model (v2) ---
      contentType: z.enum(['review', 'comparison', 'roundup', 'guide', 'news']),
      searchIntent: z.enum(['informational', 'commercial', 'transactional']),
      primaryKeyword: z.string().min(1),
      secondaryKeywords: z.array(z.string()).default([]),
      cluster: z.enum(CLUSTER_SLUGS), // which pillar group this supports
      isPillar: z.boolean().default(false),

      // --- Affiliate / conversion ---
      products: z.array(reference('products')).default([]),
      // The overall "our pick" — gets the yellow marker in quick picks, the
      // tinted row in the comparison table, and the level-two shadow card.
      recommendedProduct: reference('products').optional(),
      // Editorial quick-pick roles for the "If you're in a hurry" box. The role
      // label (e.g. "Best for large rooms") is what ready-to-buy readers scan.
      picks: z
        .array(
          z.object({
            role: z.string(),
            product: reference('products'),
            note: z.string().optional(),
          })
        )
        .default([]),
      verdict: z.string().optional(),
      faq: z
        .array(z.object({ question: z.string(), answer: z.string() }))
        .default([]),
      lastReviewed: z.coerce.date().optional(),
    })
    // coverImageAlt is required whenever a coverImage is present.
    .refine((d) => !d.coverImage || (d.coverImageAlt && d.coverImageAlt.length > 0), {
      message: 'coverImageAlt is required when coverImage is set.',
      path: ['coverImageAlt'],
    }),
});

const products = defineCollection({
  loader: glob({ base: './src/content/products', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      brand: z.string().min(1),
      asin: z.string().regex(/^[A-Z0-9]{10}$/, 'ASIN must be 10 uppercase alphanumerics.'),
      marketplace: z.enum(MARKETPLACES),
      image: image().optional(),
      imageAlt: z.string().min(1),
      pros: z.array(z.string()).min(1, 'List at least one pro.'),
      cons: z.array(z.string()).min(1, 'List at least one con — an empty con column reads as an ad.'),
      keySpecs: z.array(z.object({ label: z.string(), value: z.string() })).default([]),
      bestFor: z.string().min(1),
      ourRating: z.number().min(1).max(5).optional(), // only if genuinely assessed
      discontinued: z.boolean().default(false),
      // Deliberately NOT in the schema: price, scraped star rating, reviewCount,
      // availability. These go stale and their display is restricted by the
      // Associates program agreement. See docs + Section 8 of the brief.
    }),
});

const authors = defineCollection({
  loader: glob({ base: './src/content/authors', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
    z.object({
      name: z.string().min(1),
      bio: z.string().min(1),
      avatar: image().optional(),
      credentials: z.string().optional(),
      socialLinks: z
        .array(z.object({ label: z.string(), url: z.url() }))
        .default([]),
      expertise: z.array(z.enum(CLUSTER_SLUGS)).default([]),
    }),
});

export const collections = { blog, products, authors };
