#!/usr/bin/env node
/**
 * Internal link checker (Section 11A/B). Run AFTER `astro build`:
 *   npm run build && npm run check:links
 *
 * Scans the built HTML in dist/ for internal <a href> links and verifies each
 * one resolves to a generated page (dist/<path>/index.html or a file). Reports
 * broken internal links and exits non-zero so it can gate CI. External links,
 * anchors, mailto:, and tel: are ignored.
 */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';

const DIST = join(process.cwd(), 'dist');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (extname(entry.name) === '.html') out.push(full);
  }
  return out;
}

function resolves(href) {
  // Strip query/hash, decode.
  let path = decodeURI(href.split('#')[0].split('?')[0]);
  if (!path || path === '/') return existsSync(join(DIST, 'index.html'));
  // A file with an extension maps directly (e.g. /rss.xml, /favicon.svg).
  if (extname(path)) return existsSync(join(DIST, path));
  // Directory-style URL -> <path>/index.html
  if (!path.endsWith('/')) path += '/';
  return existsSync(join(DIST, path, 'index.html')) || existsSync(join(DIST, path.replace(/\/$/, '.html')));
}

async function main() {
  if (!existsSync(DIST)) {
    console.error('✖ dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  const files = await walk(DIST);
  const hrefRe = /<a\b[^>]*\shref=["']([^"']+)["']/gi;
  const broken = [];
  let totalInternal = 0;

  for (const file of files) {
    const html = await readFile(file, 'utf8');
    let m;
    while ((m = hrefRe.exec(html))) {
      const href = m[1];
      if (/^(https?:)?\/\//i.test(href)) continue; // external / protocol-relative
      if (/^(mailto:|tel:|#)/i.test(href)) continue;
      if (!href.startsWith('/')) continue; // skip relative anchors we can't resolve safely
      totalInternal++;
      if (!resolves(href)) {
        broken.push(`${file.replace(DIST, 'dist')} → ${href}`);
      }
    }
  }

  if (broken.length) {
    console.error(`\n✖ Found ${broken.length} broken internal link(s):\n`);
    for (const b of broken) console.error('  - ' + b);
    console.error('');
    process.exit(1);
  }
  console.log(`✓ Link check passed (${totalInternal} internal links across ${files.length} pages).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
