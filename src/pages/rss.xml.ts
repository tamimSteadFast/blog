/**
 * RSS feed at /rss.xml. Includes only indexable (published, non-noindex)
 * articles, newest first.
 */
import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getIndexableArticles } from '@lib/content';
import { SITE } from '@lib/site';

export async function GET(context: APIContext) {
  const articles = await getIndexableArticles();
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? 'https://example.com',
    items: articles.map((a) => ({
      title: a.title,
      description: a.description,
      pubDate: a.pubDate,
      link: a.href,
      categories: [a.category, ...a.tags],
    })),
    customData: `<language>${SITE.locale}</language>`,
  });
}
