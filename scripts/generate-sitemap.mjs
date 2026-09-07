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

import { SITE_URL, sitemapPaths, seoFor } from "../src/data/seo.js";
import { BRAND } from "../src/data/site.js";
import { INSIGHTS } from "../src/data/insights.js";
import { WORK } from "../src/data/work.js";

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

/* ---- llms.txt ----------------------------------------------------
   An emerging convention (llmstxt.org) for describing a site to
   language models in one plain-markdown file. Adoption is not
   universal and no major engine documents it as a ranking input, so
   treat this as cheap insurance rather than a lever — it costs one
   generated file and stays in sync with the routes automatically. */

const link = (path) => {
  const { title, description } = seoFor(path);
  return `- [${title.split(" | ")[0]}](${SITE_URL}${path}): ${description}`;
};

const pages = ["/solutions", "/industries", "/work", "/about", "/contact"];

const llms = `# ${BRAND.name}

> ${BRAND.positioning}

${BRAND.promise} Based in Trivandrum, Kerala, India, working with clients internationally.

## Pages

${pages.map(link).join("\n")}

## Articles

${INSIGHTS.filter((a) => a.status === "published")
  .map(
    (a) =>
      `- [${a.title}](${SITE_URL}/insights/${a.slug}): ${a.excerpt} (${a.topic}, by ${a.author})`
  )
  .join("\n")}

## Case studies

${WORK.filter((w) => w.status === "published")
  .map((w) => `- [${w.name}](${SITE_URL}/work/${w.slug}): ${w.summary}`)
  .join("\n")}

## Contact

- Email: hello@cresterix.com
- Site: ${SITE_URL}
`;

writeFileSync(resolve(here, "..", "public", "llms.txt"), llms, "utf8");
console.log("llms.txt written");
