/* ------------------------------------------------------------------
   Writes public/sitemap.xml from the same route list the app renders,
   so the sitemap cannot drift out of sync with the routes.

   Runs before `vite build`; Vite then copies public/ into dist/.

   Deliberately no <lastmod>, <changefreq> or <priority>. Google ignores
   the latter two outright, and an invented lastmod is worse than none —
   it teaches the crawler to distrust the field. Add lastmod only when
   there is a real modification date to put in it.
   ------------------------------------------------------------------ */

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { SITE_URL, sitemapPaths } from "../src/data/seo.js";

const here = dirname(fileURLToPath(import.meta.url));
const out = resolve(here, "..", "public", "sitemap.xml");

const paths = sitemapPaths();

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((p) => `  <url><loc>${SITE_URL}${p === "/" ? "/" : p}</loc></url>`).join("\n")}
</urlset>
`;

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, xml, "utf8");

console.log(`sitemap.xml — ${paths.length} URLs`);
