import fs from 'node:fs/promises';
import path from 'node:path';

import * as cheerio from 'cheerio';

import { PAGES, ROOT_DIR, SITE_ORIGIN } from './build-config.mjs';

const RASTER_PATTERN = /\.(png|jpe?g|webp)$/i;
const errors = [];

function normalizeLocalPath(value) {
  if (!value) {
    return null;
  }

  const stripped = value
    .replace(SITE_ORIGIN, '')
    .split('#')[0]
    .split('?')[0]
    .replace(/^\//, '');

  if (!stripped || /^https?:\/\//i.test(stripped) || /^mailto:/i.test(stripped) || /^tel:/i.test(stripped) || stripped.startsWith('#')) {
    return null;
  }

  return stripped;
}

async function exists(localPath) {
  try {
    await fs.access(path.join(ROOT_DIR, localPath));
    return true;
  } catch {
    return false;
  }
}

function addError(message) {
  errors.push(message);
}

async function verifyPage(page) {
  const filePath = path.join(ROOT_DIR, page.output);
  const html = await fs.readFile(filePath, 'utf8');
  const $ = cheerio.load(html);

  for (const selector of ['img[src]', 'source[srcset]', 'script[src]', 'link[href]', 'a[href]']) {
    const attribute = selector.includes('srcset') ? 'srcset' : selector.includes('href') ? 'href' : 'src';
    const elements = $(selector).toArray();

    for (const element of elements) {
      const value = $(element).attr(attribute);
      if (!value) {
        continue;
      }

      if (attribute === 'srcset') {
        for (const entry of value.split(',')) {
          const localPath = normalizeLocalPath(entry.trim().split(/\s+/)[0]);
          if (localPath && !(await exists(localPath))) {
            addError(`${page.output}: missing asset ${localPath}`);
          }
        }
        continue;
      }

      const localPath = normalizeLocalPath(value);
      if (localPath && !(await exists(localPath))) {
        addError(`${page.output}: missing asset ${localPath}`);
      }
    }
  }

  $('img').each((_, element) => {
    const image = $(element);
    if (!image.attr('width') || !image.attr('height')) {
      addError(`${page.output}: image is missing width/height`);
    }

    if (!image.attr('decoding')) {
      addError(`${page.output}: image is missing decoding attribute`);
    }

    const src = image.attr('src');
    if (src && RASTER_PATTERN.test(src) && image.parent('picture').length === 0) {
      addError(`${page.output}: rendered raster image is missing picture fallback wrapper`);
    }
  });

  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, element) => {
    const content = $(element).attr('content') || '';
    if (content.endsWith('.webp')) {
      addError(`${page.output}: social image should keep jpg/png fallback`);
    }
  });
}

async function main() {
  for (const page of PAGES) {
    await verifyPage(page);
  }

  if (errors.length) {
    console.error(errors.join('\n'));
    process.exitCode = 1;
    return;
  }

  console.log('Verification passed.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
