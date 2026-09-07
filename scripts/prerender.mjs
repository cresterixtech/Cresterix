/* ------------------------------------------------------------------
   Writes real HTML for every route into dist/.

   Why this exists: the site is a client-rendered SPA, so without this
   every URL returns the same ~5.7 kB shell with an empty <body>.
   Googlebot renders JavaScript and copes, but most AI crawlers
   (GPTBot, PerplexityBot, ClaudeBot) do not execute JS at all — to
   them every page looked identical and empty, which made the site
   impossible to cite.

   The client still boots normally on top of this; main.jsx uses
   createRoot, which replaces the prerendered markup rather than
   hydrating it. That is deliberate: this site's reveal animations and
   capability detection legitimately differ between server and browser,
   and hydration mismatches on a WebGL-heavy page are not worth the
   marginal paint win. Crawlers get the HTML, users get what they
   already had.

   Per-route <title>/description/canonical also have to be written in
   here, because the Seo component applies them from an effect that no
   crawler runs. Both read the same seoFor(), so they cannot disagree.
   ------------------------------------------------------------------ */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";

import { sitemapPaths, seoFor, OG_IMAGE } from "../src/data/seo.js";
import { render } from "../dist-ssr/entry-server.js";

const here = dirname(fileURLToPath(import.meta.url));
const dist = resolve(here, "..", "dist");

const template = readFileSync(join(dist, "index.html"), "utf8");

/** Replace the content of a meta tag matched on one attribute. */
const setMeta = (html, attr, key, value) =>
  html.replace(
    new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`),
    `$1${escapeAttr(value)}$2`
  );

const escapeAttr = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function buildPage(path, appHtml) {
  const { title, description, url, index, jsonLd } = seoFor(path);
  let html = template;

  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`);
  html = setMeta(html, "name", "description", description);
  html = setMeta(html, "name", "robots", index ? "index, follow" : "noindex, follow");
  html = html.replace(
    /(<link rel="canonical" href=")[^"]*(")/,
    `$1${escapeAttr(url)}$2`
  );

  html = setMeta(html, "property", "og:title", title);
  html = setMeta(html, "property", "og:description", description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", OG_IMAGE);
  html = setMeta(html, "property", "og:type", path === "/" ? "website" : "article");
  html = setMeta(html, "name", "twitter:title", title);
  html = setMeta(html, "name", "twitter:description", description);

  // Same id the Seo component uses, so the client replaces this node
  // rather than appending a second copy alongside it.
  if (jsonLd) {
    html = html.replace(
      "</head>",
      `  <script type="application/ld+json" id="route-schema">${JSON.stringify(jsonLd)}</script>\n  </head>`
    );
  }

  return html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`);
}

const paths = sitemapPaths();
let written = 0;
let shortest = { path: null, chars: Infinity };

for (const path of paths) {
  const appHtml = await render(path);

  const out =
    path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buildPage(path, appHtml), "utf8");

  const text = appHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < shortest.chars) shortest = { path, chars: text.length };
  written++;
}

console.log(`prerendered ${written} routes`);
console.log(`thinnest page: ${shortest.path} (${shortest.chars} chars of text)`);

// A page that renders almost nothing means a Suspense boundary was
// serialised as its fallback — fail loudly rather than shipping empty
// HTML that looks fine until a crawler reads it.
if (shortest.chars < 500) {
  console.error(`\nERROR: ${shortest.path} prerendered with almost no text.`);
  process.exit(1);
}
