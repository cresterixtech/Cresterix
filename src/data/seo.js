/* ------------------------------------------------------------------
   Per-route search metadata.

   The site is a client-rendered SPA, so every route previously served
   the single <title> and description baked into index.html — ten pages
   that looked identical to a crawler and competed with each other.
   This file gives each route its own title, description and canonical
   URL; `Seo.jsx` applies them, and `scripts/generate-sitemap.mjs`
   reads the same list so the sitemap can never drift from the routes.

   Titles aim for <= 60 characters and descriptions for 140-160, which
   is roughly where Google truncates each. Copy is drawn from the real
   page content in site.js rather than written fresh, so what a search
   result promises is what the page actually says.
   ------------------------------------------------------------------ */

/* Explicit .js extensions: this module is imported by both Vite and by
   plain Node in scripts/generate-sitemap.mjs, and Node's ESM resolver
   does not guess extensions. */
import { BRAND } from "./site.js";
import { WORK } from "./work.js";
import { INSIGHTS } from "./insights.js";

export const SITE_URL = "https://cresterix.com";

/** Absolute, because crawlers and social scrapers do not resolve
 *  relative image paths. Square app icon for now — see README note on
 *  replacing this with a proper 1200x630 card. */
export const OG_IMAGE = `${SITE_URL}/icon-512.png`;

export const DEFAULT_SEO = {
  title: `${BRAND.name} — ${BRAND.tagline}`,
  description: BRAND.positioning,
};

/* Static routes. Order is the sitemap's order. */
export const ROUTE_SEO = {
  "/": {
    title: "Cresterix — Digital Product Engineering Company",
    description: BRAND.positioning,
  },
  "/solutions": {
    title: "Software Development Services — Web, Mobile, SaaS, AI | Cresterix",
    description:
      "Product engineering, web platforms, mobile apps, SaaS, AI and cloud services. We build production-ready digital products for businesses worldwide.",
  },
  "/industries": {
    title: "Industries We Serve — FinTech, Healthcare, Retail | Cresterix",
    description:
      "We build software for FinTech, retail, healthcare, education, logistics, real estate, media and startups — designed around each sector's real workflows.",
  },
  "/work": {
    title: "Our Work — Software Development Case Studies | Cresterix",
    description:
      "Case studies from Cresterix: real digital products we engineered end to end, the problems they solved and the technology behind each build.",
  },
  "/about": {
    title: "About Cresterix — Product Engineering Team in India",
    description:
      "Cresterix is a digital product engineering team based in Trivandrum, Kerala, India, delivering software for clients worldwide with clarity and craft.",
  },
  "/insights": {
    title: "Insights — Software Engineering & AI Articles | Cresterix",
    description:
      "Practical articles on software architecture, SaaS, AI automation, cloud and digital transformation from the Cresterix engineering team.",
  },
  "/contact": {
    title: "Contact Cresterix — Start a Software Project",
    description:
      "Tell us what you're trying to build, improve or solve. Reach the Cresterix team in Trivandrum, Kerala by phone or email — we reply to every enquiry.",
  },
  "/privacy": {
    title: "Privacy Policy | Cresterix",
    description:
      "How Cresterix collects, uses and protects personal information submitted through this website.",
  },
  "/terms": {
    title: "Terms of Service | Cresterix",
    description:
      "The terms governing use of the Cresterix website and the services we provide.",
  },
};

/** Routes that belong in the sitemap. Legal pages are indexable but
 *  deliberately last; the 404 route is excluded entirely. */
export const STATIC_ROUTES = Object.keys(ROUTE_SEO);

/** Case-study detail pages, from the same data that renders them.
 *  Only published entries — a draft has no content worth indexing. */
export const workRoutes = () =>
  WORK.filter((w) => w.status === "published").map((w) => `/work/${w.slug}`);

/** Published articles only — an unwritten piece has no page to index. */
export const insightRoutes = () =>
  INSIGHTS.filter((a) => a.status === "published").map((a) => `/insights/${a.slug}`);

/** Every URL that should appear in the sitemap. */
export const sitemapPaths = () => [
  ...STATIC_ROUTES,
  ...workRoutes(),
  ...insightRoutes(),
];

/**
 * Resolve the metadata for a pathname, including the dynamic
 * /work/:slug route. Unknown paths fall back to the 404 entry, which
 * is marked noindex so soft-404s never enter the index.
 */
export function seoFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;

  const stat = ROUTE_SEO[path];
  if (stat) return { ...stat, url: `${SITE_URL}${path}`, index: true };

  const url = `${SITE_URL}${path}`;

  const workSlug = path.startsWith("/work/") ? path.slice("/work/".length) : null;
  const study = workSlug && WORK.find((w) => w.slug === workSlug && w.status === "published");
  if (study) {
    return {
      title: `${study.name} — Case Study | ${BRAND.name}`,
      description: study.summary,
      url,
      index: true,
    };
  }

  const postSlug = path.startsWith("/insights/") ? path.slice("/insights/".length) : null;
  const post =
    postSlug && INSIGHTS.find((a) => a.slug === postSlug && a.status === "published");
  if (post) {
    return {
      title: `${post.title} | ${BRAND.name}`,
      description: post.excerpt,
      url,
      index: true,
      // Article schema, so the piece can surface with a date and author
      // rather than as an untyped page. `publisher` points at the
      // ProfessionalService node declared statically in index.html.
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.date,
        dateModified: post.updated ?? post.date,
        author: { "@type": "Organization", name: post.author },
        publisher: { "@id": `${SITE_URL}/#organization` },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: OG_IMAGE,
        articleSection: post.topic,
      },
    };
  }

  return {
    title: `Page Not Found | ${BRAND.name}`,
    description:
      "The page you're looking for doesn't exist. Browse our solutions, work and insights, or get in touch with the Cresterix team.",
    url,
    index: false,
  };
}
