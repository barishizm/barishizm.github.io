import fs from 'node:fs/promises';
import path from 'node:path';

import * as cheerio from 'cheerio';
import * as esbuild from 'esbuild';
import * as sass from 'sass';
import sharp from 'sharp';

import {
  ASSET_ALIASES,
  BUILD_CSS_DIR,
  BUILD_DIR,
  BUILD_FONT_DIR,
  BUILD_IMG_DIR,
  BUILD_JS_DIR,
  CRITICAL_CSS,
  CSS_BUNDLES,
  ICON_SOURCES,
  IMAGE_MANIFEST_PATH,
  JS_BUNDLES,
  PAGE_IMAGE_HINTS,
  PAGES,
  ROOT_DIR,
  SITE_ORIGIN,
  SRC_DIR
} from './build-config.mjs';

const RASTER_PATTERN = /\.(png|jpe?g)$/i;
const FONT_STYLESHEET_PATTERN = /^https:\/\/fonts\.googleapis\.com\/css2/i;

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function stripOrigin(value) {
  if (!value) {
    return null;
  }

  if (value.startsWith(SITE_ORIGIN)) {
    return value.slice(SITE_ORIGIN.length).replace(/^\//, '');
  }

  return value;
}

function normalizeLocalPath(value) {
  if (!value) {
    return null;
  }

  const stripped = stripOrigin(value).split('#')[0].split('?')[0].replace(/^\//, '');

  if (!stripped || /^https?:\/\//i.test(stripped) || /^mailto:/i.test(stripped) || /^tel:/i.test(stripped) || stripped.startsWith('#')) {
    return null;
  }

  return stripped;
}

function isLocalRaster(value) {
  const localPath = normalizeLocalPath(value);
  return localPath && RASTER_PATTERN.test(localPath) ? localPath : null;
}

function resolveAssetAlias(assetPath) {
  return ASSET_ALIASES.get(assetPath) ?? assetPath;
}

function absoluteUrl(localPath) {
  return new URL(localPath, `${SITE_ORIGIN}/`).href;
}

function serializeAttributes(attributes) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${key}="${String(value).replace(/"/g, '&quot;')}"`)
    .join(' ');
}

function getPageConfig(sourceFile) {
  return PAGES.find((page) => page.source === sourceFile);
}

function getCriticalCss(page) {
  if (page.key === 'index') {
    return CRITICAL_CSS.index;
  }

  if (page.key === 'portfolio-details') {
    return CRITICAL_CSS.portfolioDetails;
  }

  if (page.key === 'digital-clock') {
    return CRITICAL_CSS.digitalClock;
  }

  return CRITICAL_CSS.content;
}

function getImageHint(page, rawSource) {
  return PAGE_IMAGE_HINTS[page.source]?.[rawSource] ?? {};
}

function getCandidateWidths(width, hint = {}) {
  const defaults = width > 700 ? [480, 768, 1200, 1600, width] : [width];
  return [...new Set([...(hint.widths ?? []), ...defaults])]
    .filter((candidate) => candidate > 0 && candidate <= width)
    .sort((a, b) => a - b);
}

async function ensureDirectories() {
  await Promise.all([
    fs.mkdir(BUILD_DIR, { recursive: true }),
    fs.mkdir(BUILD_CSS_DIR, { recursive: true }),
    fs.mkdir(BUILD_JS_DIR, { recursive: true }),
    fs.mkdir(BUILD_IMG_DIR, { recursive: true }),
    fs.mkdir(BUILD_FONT_DIR, { recursive: true })
  ]);
}

async function cleanBuildArtifacts() {
  await fs.rm(BUILD_DIR, { recursive: true, force: true });
  await ensureDirectories();
}

async function readText(filePath) {
  return fs.readFile(filePath, 'utf8');
}

async function writeText(filePath, content) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
}

async function buildCss() {
  await ensureDirectories();

  await Promise.all([
    fs.copyFile(
      path.join(ROOT_DIR, 'assets', 'vendor', 'bootstrap-icons', 'fonts', 'bootstrap-icons.woff2'),
      path.join(BUILD_FONT_DIR, 'bootstrap-icons.woff2')
    ),
    fs.copyFile(
      path.join(ROOT_DIR, 'assets', 'vendor', 'bootstrap-icons', 'fonts', 'bootstrap-icons.woff'),
      path.join(BUILD_FONT_DIR, 'bootstrap-icons.woff')
    )
  ]);

  for (const bundle of CSS_BUNDLES) {
    const parts = [];

    for (const vendorCssPath of bundle.vendorCss) {
      let css = await readText(path.join(ROOT_DIR, vendorCssPath));

      if (vendorCssPath.includes('bootstrap-icons.css')) {
        css = css
          .replace('font-display: block;', 'font-display: swap;')
          .replace(/url\("\.\/fonts\/bootstrap-icons\.woff2[^"]*"\)/g, 'url("../fonts/bootstrap-icons.woff2")')
          .replace(/url\("\.\/fonts\/bootstrap-icons\.woff[^"]*"\)/g, 'url("../fonts/bootstrap-icons.woff")');
      }

      parts.push(css);
    }

    if (bundle.rawCss) {
      parts.push(await readText(bundle.source));
    } else {
      const result = sass.compile(bundle.source, {
        style: 'expanded',
        silenceDeprecations: ['import']
      });
      parts.push(result.css);
    }

    const css = parts.join('\n');
    const transformed = await esbuild.transform(css, {
      loader: 'css',
      minify: true,
      legalComments: 'none'
    });

    await writeText(path.join(BUILD_CSS_DIR, bundle.name), transformed.code);
  }
}

async function buildJs() {
  await ensureDirectories();

  for (const bundle of JS_BUNDLES) {
    await esbuild.build({
      entryPoints: [bundle.source],
      outfile: path.join(BUILD_JS_DIR, bundle.name),
      bundle: true,
      minify: true,
      format: 'iife',
      platform: 'browser',
      target: ['es2018'],
      legalComments: 'none',
      logLevel: 'silent'
    });
  }
}

async function collectReferencedImages() {
  const references = new Set();

  for (const page of PAGES) {
    const html = await readText(path.join(SRC_DIR, page.source));
    const $ = cheerio.load(html);

    $('img[src]').each((_, element) => {
      const source = isLocalRaster($(element).attr('src'));
      if (source) {
        references.add(resolveAssetAlias(source));
      }
    });

    $('a[href]').each((_, element) => {
      const href = isLocalRaster($(element).attr('href'));
      if (href) {
        references.add(resolveAssetAlias(href));
      }
    });

    $('meta[property="og:image"], meta[name="twitter:image"]').each((_, element) => {
      const content = isLocalRaster($(element).attr('content'));
      if (content) {
        references.add(resolveAssetAlias(content));
      }
    });
  }

  return [...references];
}

async function processRasterImage(localPath, hintAccumulator) {
  const sourcePath = path.join(ROOT_DIR, localPath);
  const sourceDirectory = path.dirname(localPath).replace(/^assets\/img/, '');
  const outputDirectory = path.join(BUILD_IMG_DIR, sourceDirectory);
  const parsed = path.parse(localPath);
  const fallbackExtension = parsed.ext.toLowerCase() === '.jpeg' ? 'jpg' : parsed.ext.slice(1).toLowerCase();
  const metadata = await sharp(sourcePath).metadata();
  const widths = getCandidateWidths(metadata.width, hintAccumulator.get(localPath) ?? {});
  const manifest = {
    width: metadata.width,
    height: metadata.height,
    fallbackFormat: fallbackExtension,
    fallback: [],
    webp: []
  };

  await fs.mkdir(outputDirectory, { recursive: true });

  for (const width of widths) {
    const fallbackRelativePath = toPosix(path.join('assets', 'build', 'img', sourceDirectory, `${parsed.name}-${width}w.${fallbackExtension}`));
    const webpRelativePath = toPosix(path.join('assets', 'build', 'img', sourceDirectory, `${parsed.name}-${width}w.webp`));
    const fallbackAbsolutePath = path.join(ROOT_DIR, fallbackRelativePath);
    const webpAbsolutePath = path.join(ROOT_DIR, webpRelativePath);

    const image = sharp(sourcePath).rotate().resize({ width, withoutEnlargement: true });

    if (fallbackExtension === 'jpg') {
      await image.clone().jpeg({ quality: 82, mozjpeg: true }).toFile(fallbackAbsolutePath);
    } else {
      await image.clone().png({ compressionLevel: 9, adaptiveFiltering: true }).toFile(fallbackAbsolutePath);
    }

    await image.webp({ quality: 82 }).toFile(webpAbsolutePath);

    manifest.fallback.push({
      width,
      path: fallbackRelativePath
    });
    manifest.webp.push({
      width,
      path: webpRelativePath
    });
  }

  return manifest;
}

async function buildImages() {
  await ensureDirectories();

  const references = await collectReferencedImages();
  const hintAccumulator = new Map();

  for (const [pageName, pageHints] of Object.entries(PAGE_IMAGE_HINTS)) {
    for (const [rawSource, hint] of Object.entries(pageHints)) {
      const actualSource = resolveAssetAlias(rawSource);
      const current = hintAccumulator.get(actualSource) ?? {};
      hintAccumulator.set(actualSource, {
        widths: [...new Set([...(current.widths ?? []), ...(hint.widths ?? [])])]
      });
    }
  }

  const manifest = {};

  for (const reference of references) {
    manifest[reference] = await processRasterImage(reference, hintAccumulator);
  }

  const appleTouchOutput = path.join(BUILD_IMG_DIR, 'icons', 'apple-touch-icon.png');
  await fs.mkdir(path.dirname(appleTouchOutput), { recursive: true });
  await sharp(path.join(ROOT_DIR, ICON_SOURCES.appleTouch))
    .resize(180, 180)
    .png({ compressionLevel: 9 })
    .toFile(appleTouchOutput);

  await writeText(IMAGE_MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  return manifest;
}

async function loadImageManifest() {
  return JSON.parse(await readText(IMAGE_MANIFEST_PATH));
}

function createSrcset(variants) {
  return variants.map((variant) => `${variant.path} ${variant.width}w`).join(', ');
}

function updateFonts($) {
  const fontsLink = $('link[href]').filter((_, element) => {
    const href = $(element).attr('href');
    return href && FONT_STYLESHEET_PATTERN.test(href);
  }).first();

  if (!fontsLink.length) {
    return;
  }

  const fontsHref = fontsLink.attr('href');
  fontsLink.replaceWith(
    `<link rel="preload" as="style" href="${fontsHref}" onload="this.onload=null;this.rel='stylesheet'">` +
    `<noscript><link rel="stylesheet" href="${fontsHref}"></noscript>`
  );
}

function updateHeadAssets($, page) {
  $('link[rel="stylesheet"]').each((_, element) => {
    const href = $(element).attr('href');
    if (!href) {
      return;
    }

    if (href.startsWith('assets/vendor/') || href.startsWith('assets/css/') || href.startsWith('assets/build/css/')) {
      $(element).remove();
    }
  });

  $('link[rel="icon"], link[rel="apple-touch-icon"]').remove();

  $('head').append(
    `<link rel="icon" type="image/x-icon" href="${ICON_SOURCES.favicon}">` +
    '<link rel="apple-touch-icon" href="assets/build/img/icons/apple-touch-icon.png">'
  );

  updateFonts($);

  $('head').append(`<style data-critical="${page.key}">${getCriticalCss(page)}</style>`);

  const cssHref = `assets/build/css/${page.cssBundle}`;
  $('head').append(
    `<link rel="preload" href="${cssHref}" as="style" onload="this.onload=null;this.rel='stylesheet'">` +
    `<noscript><link rel="stylesheet" href="${cssHref}"></noscript>`
  );

  if (page.preloadIconsFont) {
    $('head').append('<link rel="preload" href="assets/build/fonts/bootstrap-icons.woff2" as="font" type="font/woff2" crossorigin>');
  }

  for (const prefetchTarget of page.prefetch) {
    $('head').append(`<link rel="prefetch" href="${prefetchTarget}">`);
  }
}

function removeLegacyScripts($) {
  $('script[src]').each((_, element) => {
    const src = $(element).attr('src');
    if (!src) {
      return;
    }

    if (src.startsWith('assets/vendor/') || src.startsWith('assets/js/') || src.startsWith('assets/build/js/')) {
      $(element).remove();
    }
  });

  $('body script').each((_, element) => {
    const type = ($(element).attr('type') || '').trim();
    const src = $(element).attr('src');
    if (src) {
      return;
    }

    if (type === 'application/json') {
      return;
    }

    $(element).remove();
  });
}

function rewriteImageElement($, element, page, manifest, preloadLinks) {
  const image = $(element);
  const rawSource = normalizeLocalPath(image.attr('src'));

  if (!rawSource || !RASTER_PATTERN.test(rawSource)) {
    return;
  }

  const actualSource = resolveAssetAlias(rawSource);
  const variants = manifest[actualSource];

  if (!variants) {
    return;
  }

  const hint = getImageHint(page, rawSource);
  const sizes = hint.sizes;
  const loading = hint.loading === 'eager' ? 'eager' : 'lazy';
  const imgAttributes = { ...element.attribs };
  delete imgAttributes.src;
  delete imgAttributes.srcset;
  delete imgAttributes.sizes;
  delete imgAttributes.loading;
  delete imgAttributes.decoding;
  delete imgAttributes.fetchpriority;

  imgAttributes.src = variants.fallback.at(-1).path;
  imgAttributes.width = variants.width;
  imgAttributes.height = variants.height;
  imgAttributes.decoding = 'async';
  imgAttributes.loading = loading;

  if (sizes) {
    imgAttributes.sizes = sizes;
  }

  if (variants.fallback.length > 1) {
    imgAttributes.srcset = createSrcset(variants.fallback);
  }

  if (hint.fetchpriority) {
    imgAttributes.fetchpriority = hint.fetchpriority;
  }

  const sourceAttributes = {
    type: 'image/webp',
    srcset: createSrcset(variants.webp)
  };

  if (sizes) {
    sourceAttributes.sizes = sizes;
  }

  image.replaceWith(
    `<picture><source ${serializeAttributes(sourceAttributes)}><img ${serializeAttributes(imgAttributes)}></picture>`
  );

  if (hint.preload) {
    const preloadAttributes = {
      rel: 'preload',
      as: 'image',
      href: variants.webp.at(-1).path,
      type: 'image/webp',
      fetchpriority: hint.fetchpriority ?? 'high'
    };

    if (sizes) {
      preloadAttributes.imagesizes = sizes;
      preloadAttributes.imagesrcset = createSrcset(variants.webp);
    }

    preloadLinks.push(`<link ${serializeAttributes(preloadAttributes)}>`);
  }
}

function rewriteLinkedImages($, manifest) {
  $('a[href]').each((_, element) => {
    const link = $(element);
    const href = isLocalRaster(link.attr('href'));
    if (!href) {
      return;
    }

    const actualSource = resolveAssetAlias(href);
    const variants = manifest[actualSource];

    if (variants) {
      link.attr('href', variants.webp.at(-1).path);
    }
  });
}

function rewriteSocialImages($, manifest) {
  $('meta[property="og:image"], meta[name="twitter:image"]').each((_, element) => {
    const meta = $(element);
    const content = isLocalRaster(meta.attr('content'));
    if (!content) {
      return;
    }

    const actualSource = resolveAssetAlias(content);
    const variants = manifest[actualSource];

    if (variants) {
      meta.attr('content', absoluteUrl(variants.fallback.at(-1).path));
    }
  });
}

function rewriteStructuredDataImages($, manifest) {
  function replaceImageUrls(value) {
    if (typeof value === 'string') {
      const localRaster = isLocalRaster(value);
      if (!localRaster) {
        return value;
      }

      const actualSource = resolveAssetAlias(localRaster);
      const variants = manifest[actualSource];
      return variants ? absoluteUrl(variants.fallback.at(-1).path) : value;
    }

    if (Array.isArray(value)) {
      return value.map(replaceImageUrls);
    }

    if (value && typeof value === 'object') {
      return Object.fromEntries(
        Object.entries(value).map(([key, item]) => [key, replaceImageUrls(item)])
      );
    }

    return value;
  }

  $('script[type="application/ld+json"]').each((_, element) => {
    const script = $(element);

    try {
      const parsed = JSON.parse(script.text());
      script.text(JSON.stringify(replaceImageUrls(parsed)));
    } catch {
      // Keep hand-written structured data untouched if it is not valid JSON.
    }
  });
}

function appendScripts($, page) {
  const scripts = [...page.vendorScripts, `assets/build/js/${page.jsBundle}`]
    .map((src) => `<script src="${src}" defer></script>`)
    .join('');

  $('body').append(scripts);
}

async function buildHtml() {
  await ensureDirectories();
  const manifest = await loadImageManifest();

  for (const page of PAGES) {
    const sourcePath = path.join(SRC_DIR, page.source);
    const outputPath = path.join(ROOT_DIR, page.output);
    const html = await readText(sourcePath);
    const $ = cheerio.load(html, {
      decodeEntities: false
    });
    const preloadLinks = [];

    updateHeadAssets($, page);
    removeLegacyScripts($);

    $('img[src]').each((_, element) => {
      rewriteImageElement($, element, page, manifest, preloadLinks);
    });

    rewriteLinkedImages($, manifest);
    rewriteSocialImages($, manifest);
    rewriteStructuredDataImages($, manifest);

    if (preloadLinks.length) {
      $('head').append(preloadLinks.join(''));
    }

    appendScripts($, page);

    await writeText(outputPath, $.html());
  }
}

async function main() {
  const target = process.argv[2] ?? 'all';

  if (target === 'all') {
    await cleanBuildArtifacts();
    await buildImages();
    await buildCss();
    await buildJs();
    await buildHtml();
    return;
  }

  if (target === 'images') {
    await buildImages();
    return;
  }

  if (target === 'css') {
    await buildCss();
    return;
  }

  if (target === 'js') {
    await buildJs();
    return;
  }

  if (target === 'html') {
    await buildImages();
    await buildCss();
    await buildJs();
    await buildHtml();
    return;
  }

  throw new Error(`Unknown build target: ${target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
