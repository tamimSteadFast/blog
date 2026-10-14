#!/usr/bin/env node
/**
 * Content quality gate (Section 11B). Runs before `astro build` (see the build
 * script) and FAILS the build when a publishable article breaks a rule. These
 * are the anti-thin-affiliate guards that frontmatter/Zod validation can't
 * express on its own.
 *
 * Only non-draft articles are checked — drafts are work-in-progress and never
 * ship to production.
 *
 * Checked per article:
 *   - missing primaryKeyword or searchIntent
 *   - contentType review|comparison|roundup with no products
 *   - has products but no verdict
 *   - title > 60 chars or description > 160 chars
 *   - carries affiliate links (products) but < ~800 words (thin-page guard)
 *   - coverImage set without coverImageAlt
 *   - references a product/author id that does not exist
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, basename } from 'node:path';
import matter from 'gray-matter';

const ROOT = process.cwd();
const BLOG_DIR = join(ROOT, 'src/content/blog');
const PRODUCTS_DIR = join(ROOT, 'src/content/products');
const AUTHORS_DIR = join(ROOT, 'src/content/authors');

const TITLE_MAX = 60;
const DESC_MAX = 160;
const MIN_WORDS_WITH_LINKS = 800;
const NEEDS_PRODUCTS = new Set(['review', 'comparison', 'roundup']);

async function idsIn(dir) {
  if (!existsSync(dir)) return new Set();
  const files = await readdir(dir);
  return new Set(
    files
      .filter((f) => ['.md', '.mdx'].includes(extname(f)))
      .map((f) => basename(f, extname(f)))
  );
}

function wordCount(body) {
  return body.trim().split(/\s+/).filter(Boolean).length;
}

/** Normalize a reference that may be a string id or a { id } object. */
function refId(ref) {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref.id ?? ref.slug;
}

async function main() {
  if (!existsSync(BLOG_DIR)) {
    console.error(`✖ No blog directory at ${BLOG_DIR}`);
    process.exit(1);
  }

  const productIds = await idsIn(PRODUCTS_DIR);
  const authorIds = await idsIn(AUTHORS_DIR);

  const files = (await readdir(BLOG_DIR)).filter((f) =>
    ['.md', '.mdx'].includes(extname(f))
  );

  const errors = [];
  let checked = 0;

  for (const file of files) {
    const path = join(BLOG_DIR, file);
    const raw = await readFile(path, 'utf8');
    const { data, content } = matter(raw);

    // Skip drafts — they are not shipped.
    if (data.draft !== false) continue;
    checked++;

    const where = `src/content/blog/${file}`;
    const fail = (msg) => errors.push(`${where}: ${msg}`);

    if (!data.primaryKeyword) fail('missing primaryKeyword');
    if (!data.searchIntent) fail('missing searchIntent');

    const products = Array.isArray(data.products) ? data.products : [];
    const hasProducts = products.length > 0;

    if (NEEDS_PRODUCTS.has(data.contentType) && !hasProducts) {
      fail(`contentType "${data.contentType}" requires at least one product`);
    }
    if (hasProducts && !data.verdict) {
      fail('has products but no verdict');
    }

    if (typeof data.title === 'string' && data.title.length > TITLE_MAX) {
      fail(`title is ${data.title.length} chars (max ${TITLE_MAX})`);
    }
    if (typeof data.description === 'string' && data.description.length > DESC_MAX) {
      fail(`description is ${data.description.length} chars (max ${DESC_MAX})`);
    }

    if (hasProducts) {
      const words = wordCount(content);
      if (words < MIN_WORDS_WITH_LINKS) {
        fail(`${words} words but carries affiliate links (min ~${MIN_WORDS_WITH_LINKS})`);
      }
    }

    if (data.coverImage && !data.coverImageAlt) {
      fail('coverImage set without coverImageAlt');
    }

    // Reference integrity.
    const authorId = refId(data.author);
    if (!authorId) fail('missing author reference');
    else if (!authorIds.has(authorId)) fail(`author "${authorId}" does not exist`);

    for (const p of products) {
      const id = refId(p);
      if (id && !productIds.has(id)) fail(`product "${id}" does not exist`);
    }
    const recId = refId(data.recommendedProduct);
    if (recId && !productIds.has(recId)) fail(`recommendedProduct "${recId}" does not exist`);
    for (const pick of data.picks ?? []) {
      const id = refId(pick.product);
      if (id && !productIds.has(id)) fail(`pick product "${id}" does not exist`);
    }
  }

  if (errors.length) {
    console.error(`\n✖ Content check failed (${errors.length} issue(s)):\n`);
    for (const e of errors) console.error('  - ' + e);
    console.error('');
    process.exit(1);
  }

  console.log(`✓ Content check passed (${checked} published article(s)).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
