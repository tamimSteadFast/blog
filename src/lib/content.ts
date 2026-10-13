/**
 * Content retrieval — the ONLY place in the app that calls getCollection().
 *
 * Components never touch `astro:content` directly; they receive the plain
 * domain types defined here (`Article`, `Product`, `Author`) as props. This is
 * the seam that makes a future headless-CMS migration cheap (Section 13): swap
 * the loader functions below for CMS calls and nothing in components, layouts,
 * SEO, or routing changes.
 *
 * API notes (verified against current Astro docs):
 *   - `getCollection` / `getEntry` / `getEntries` / `render` from astro:content
 *   - entries are identified by `entry.id` (not the legacy `entry.slug`)
 *   - `render(entry)` returns `{ Content, headings, remarkPluginFrontmatter }`
 */
import {
  getCollection,
  getEntry,
  getEntries,
  render,
  type CollectionEntry,
} from 'astro:content';
import type { ClusterSlug } from './clusters';
import type { Marketplace } from './affiliate';

const DEV = import.meta.env.DEV;

// ---------------------------------------------------------------------------
// Domain types (what the rest of the app depends on — NOT raw entry types)
// ---------------------------------------------------------------------------

export interface Author {
  id: string;
  name: string;
  bio: string;
  avatar?: ImageMetadata;
  credentials?: string;
  socialLinks: { label: string; url: string }[];
  expertise: ClusterSlug[];
  href: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  asin: string;
  marketplace: Marketplace;
  image?: ImageMetadata;
  imageAlt: string;
  pros: string[];
  cons: string[];
  keySpecs: { label: string; value: string }[];
  bestFor: string;
  ourRating?: number;
  discontinued: boolean;
}

export type ContentType = 'review' | 'comparison' | 'roundup' | 'guide' | 'news';
export type SearchIntent = 'informational' | 'commercial' | 'transactional';

export interface Article {
  id: string;
  /** Slug equals the content-layer id (clean, keyword-derived filename). */
  slug: string;
  href: string;
  title: string;
  description: string;
  pubDate: Date;
  updatedDate?: Date;
  author: Author;
  category: ClusterSlug;
  cluster: ClusterSlug;
  tags: string[];
  coverImage?: ImageMetadata;
  coverImageAlt?: string;
  canonicalURL?: string;
  noindex: boolean;
  contentType: ContentType;
  searchIntent: SearchIntent;
  primaryKeyword: string;
  secondaryKeywords: string[];
  isPillar: boolean;
  products: Product[];
  verdict?: string;
  faq: { question: string; answer: string }[];
  lastReviewed?: Date;
  draft: boolean;
}

// ---------------------------------------------------------------------------
// Mappers — raw CollectionEntry -> domain type
// ---------------------------------------------------------------------------

function mapAuthor(entry: CollectionEntry<'authors'>): Author {
  return {
    id: entry.id,
    href: `/authors/${entry.id}/`,
    name: entry.data.name,
    bio: entry.data.bio,
    avatar: entry.data.avatar,
    credentials: entry.data.credentials,
    socialLinks: entry.data.socialLinks,
    expertise: entry.data.expertise as ClusterSlug[],
  };
}

function mapProduct(entry: CollectionEntry<'products'>): Product {
  return {
    id: entry.id,
    name: entry.data.name,
    brand: entry.data.brand,
    asin: entry.data.asin,
    marketplace: entry.data.marketplace,
    image: entry.data.image,
    imageAlt: entry.data.imageAlt,
    pros: entry.data.pros,
    cons: entry.data.cons,
    keySpecs: entry.data.keySpecs,
    bestFor: entry.data.bestFor,
    ourRating: entry.data.ourRating,
    discontinued: entry.data.discontinued,
  };
}

async function mapArticle(entry: CollectionEntry<'blog'>): Promise<Article> {
  // Resolve references. `reference()` guaranteed these exist at build time.
  const authorEntry = await getEntry(entry.data.author);
  if (!authorEntry) {
    throw new Error(
      `[content] Article "${entry.id}" references a missing author "${entry.data.author.id}".`
    );
  }
  const productEntries = entry.data.products.length
    ? await getEntries(entry.data.products)
    : [];

  return {
    id: entry.id,
    slug: entry.id,
    href: `/blog/${entry.id}/`,
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.pubDate,
    updatedDate: entry.data.updatedDate,
    author: mapAuthor(authorEntry),
    category: entry.data.category as ClusterSlug,
    cluster: entry.data.cluster as ClusterSlug,
    tags: entry.data.tags,
    coverImage: entry.data.coverImage,
    coverImageAlt: entry.data.coverImageAlt,
    canonicalURL: entry.data.canonicalURL,
    noindex: entry.data.noindex,
    contentType: entry.data.contentType,
    searchIntent: entry.data.searchIntent,
    primaryKeyword: entry.data.primaryKeyword,
    secondaryKeywords: entry.data.secondaryKeywords,
    isPillar: entry.data.isPillar,
    products: productEntries.map(mapProduct),
    verdict: entry.data.verdict,
    faq: entry.data.faq,
    lastReviewed: entry.data.lastReviewed,
    draft: entry.data.draft,
  };
}

// ---------------------------------------------------------------------------
// Public loaders
// ---------------------------------------------------------------------------

/** Drafts are visible in `dev` for previewing, excluded from production. */
function isVisible(entry: CollectionEntry<'blog'>): boolean {
  return DEV || entry.data.draft === false;
}

/** All visible articles, newest first. */
export async function getAllArticles(): Promise<Article[]> {
  const entries = (await getCollection('blog')).filter(isVisible);
  const articles = await Promise.all(entries.map(mapArticle));
  return articles.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

/** Visible articles that are allowed in the sitemap/RSS (exclude noindex). */
export async function getIndexableArticles(): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => !a.noindex);
}

export async function getArticleById(id: string): Promise<Article | undefined> {
  const entry = await getEntry('blog', id);
  if (!entry || !isVisible(entry)) return undefined;
  return mapArticle(entry);
}

/** Render an article body. Returns the Astro Content component + headings. */
export async function renderArticle(id: string) {
  const entry = await getEntry('blog', id);
  if (!entry) throw new Error(`[content] No article with id "${id}".`);
  return render(entry);
}

export async function getArticlesByCategory(category: ClusterSlug): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.category === category);
}

export async function getArticlesByCluster(cluster: ClusterSlug): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.cluster === cluster);
}

export async function getArticlesByTag(tag: string): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.tags.includes(tag));
}

export async function getArticlesByAuthor(authorId: string): Promise<Article[]> {
  return (await getAllArticles()).filter((a) => a.author.id === authorId);
}

/** The pillar article for a cluster, if one has been published. */
export async function getPillarForCluster(cluster: ClusterSlug): Promise<Article | undefined> {
  return (await getArticlesByCluster(cluster)).find((a) => a.isPillar);
}

/**
 * Related articles — selected by CLUSTER first, then shared TAGS, never by date
 * (Section 3C). Excludes the current article and, by default, the pillar (which
 * is linked separately in the layout).
 */
export async function getRelatedArticles(
  article: Article,
  limit = 3
): Promise<Article[]> {
  const all = (await getAllArticles()).filter((a) => a.id !== article.id);

  const sameCluster = all.filter((a) => a.cluster === article.cluster && !a.isPillar);
  const scored = sameCluster
    .map((a) => ({
      a,
      score: a.tags.filter((t) => article.tags.includes(t)).length,
    }))
    .sort((x, y) => y.score - x.score || y.a.pubDate.getTime() - x.a.pubDate.getTime());

  const picks = scored.map((s) => s.a);

  // Backfill from other clusters by shared tags if the cluster is thin.
  if (picks.length < limit) {
    const byTag = all
      .filter((a) => !picks.includes(a) && a.tags.some((t) => article.tags.includes(t)));
    picks.push(...byTag);
  }
  return picks.slice(0, limit);
}

/** The author record for an id. */
export async function getAuthor(id: string): Promise<Author | undefined> {
  const entry = await getEntry('authors', id);
  return entry ? mapAuthor(entry) : undefined;
}

export async function getAllAuthors(): Promise<Author[]> {
  return (await getCollection('authors')).map(mapAuthor);
}

/**
 * Tags used on at least `min` visible articles. Thin tag index pages hurt SEO,
 * so tag pages are only generated for tags that clear this threshold (Section 3E).
 */
export async function getPopularTags(min = 3): Promise<{ tag: string; count: number }[]> {
  const articles = await getAllArticles();
  const counts = new Map<string, number>();
  for (const a of articles) {
    for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= min)
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
