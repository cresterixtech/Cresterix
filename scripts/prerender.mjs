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

/* React renders the Suspense boundary around <Routes> out of order,
   even through the static prerender API: the visible <main> gets the
   "Loading" fallback, and the finished page is appended near the end
   of the document as

     <div hidden id="S:0">…page…</div>
     <script>…$RC("B:0","S:0")</script>

   for that inline script to swap into place. Fine in a browser, and
   worthless to a crawler that does not run JavaScript — which is the
   entire audience this prerender exists for. Measured on /solutions
   before this ran: drop the hidden blocks and 953 characters remained,
   all of it nav and footer.

   So do the swap here, at build time: move each boundary's content
   into the slot its fallback occupies, then drop the hidden block and
   its reveal script. The client re-renders from scratch anyway
   (createRoot, not hydrateRoot), so nothing downstream depends on
   these markers surviving. */
function inlineSuspendedContent(html) {
  let out = html;

  for (let guard = 0; guard < 50; guard++) {
    const open = out.match(/<div hidden id="S:(\d+)">/);
    if (!open) break;

    const id = open[1];
    const start = open.index;
    const script = out.slice(start).match(/<script(?:\s[^>]*)?>/);
    if (!script) throw new Error(`boundary S:${id}: no reveal script found`);

    const scriptStart = start + script.index;
    const scriptEnd = out.indexOf("</script>", scriptStart);
    if (scriptEnd < 0) throw new Error(`boundary S:${id}: unterminated script`);

    // The hidden wrapper closes immediately before its script.
    const content = out
      .slice(start + open[0].length, scriptStart)
      .replace(/<\/div>\s*$/, "");

    out = out.slice(0, start) + out.slice(scriptEnd + "</script>".length);

    const fallback = new RegExp(
      `<!--\\$\\?--><template id="B:${id}"></template>[\\s\\S]*?<!--/\\$-->`
    );
    if (!fallback.test(out)) throw new Error(`boundary B:${id}: no fallback slot`);
    out = out.replace(fallback, content);
  }

  if (out.includes("<div hidden id=\"S:")) {
    throw new Error("a suspended boundary was left hidden");
  }
  return out;
}

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
  const appHtml = inlineSuspendedContent(await render(path));

  const out =
    path === "/" ? join(dist, "index.html") : join(dist, path, "index.html");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, buildPage(path, appHtml), "utf8");

  // The loading fallback must never survive into a shipped page — if it
  // does, the boundary swap above silently failed and the page is empty
  // to anything that does not run JavaScript.
  if (appHtml.includes("pagefall")) {
    console.error(`\nERROR: ${path} still contains the Suspense fallback.`);
    process.exit(1);
  }

  const text = appHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  if (text.length < shortest.chars) shortest = { path, chars: text.length };
  written++;
}

/* ---- 404.html ----------------------------------------------------
   The site is served by Render, which has no _redirects convention —
   its rewrite rules live in the dashboard. With the old SPA catch-all
   (/* -> /index.html) removed, unknown paths now 404 properly instead
   of answering 200 with the homepage, which is what we want: a soft
   404 teaches crawlers that every wrong URL is a real page.

   Render serves 404.html for those, so prerender the NotFound route
   into it. seoFor() already marks unknown paths noindex. */
writeFileSync(
  join(dist, "404.html"),
  buildPage("/404", inlineSuspendedContent(await render("/404"))),
  "utf8"
);

console.log(`prerendered ${written} routes + 404.html`);
console.log(`thinnest page: ${shortest.path} (${shortest.chars} chars of text)`);

// A page that renders almost nothing means a Suspense boundary was
// serialised as its fallback — fail loudly rather than shipping empty
// HTML that looks fine until a crawler reads it.
if (shortest.chars < 500) {
  console.error(`\nERROR: ${shortest.path} prerendered with almost no text.`);
  process.exit(1);
}
