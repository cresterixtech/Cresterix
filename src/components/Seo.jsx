import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { seoFor, OG_IMAGE } from "../data/seo";

/* ------------------------------------------------------------------
   Applies per-route <title>, description, canonical and social tags.

   Mounted once beside RouteEffects rather than per page, so the ten
   page components stay purely presentational.

   Why imperative DOM writes instead of React 19's native metadata
   hoisting: React *appends* hoisted <title>/<meta> into <head>, so the
   static tags already in index.html would still come first in document
   order and win. Upserting mutates those tags in place, which is
   deterministic and keeps exactly one of each in the document — worth
   more than the tidier JSX here.
   ------------------------------------------------------------------ */

const ROUTE_SCHEMA_ID = "route-schema";

/** Find-or-create a head element keyed on one attribute, then set the rest. */
function upsert(tag, keyAttr, keyValue, attrs) {
  let el = document.head.querySelector(`${tag}[${keyAttr}="${keyValue}"]`);
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(keyAttr, keyValue);
    document.head.appendChild(el);
  }
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description, url, index, jsonLd } = seoFor(pathname);

    document.title = title;

    upsert("meta", "name", "description", { content: description });
    upsert("link", "rel", "canonical", { href: url });

    // Explicit on every route so the 404's noindex is always cleared
    // again on the next navigation rather than lingering.
    upsert("meta", "name", "robots", {
      content: index ? "index, follow" : "noindex, follow",
    });

    upsert("meta", "property", "og:title", { content: title });
    upsert("meta", "property", "og:description", { content: description });
    upsert("meta", "property", "og:url", { content: url });
    upsert("meta", "property", "og:image", { content: OG_IMAGE });
    upsert("meta", "property", "og:site_name", { content: "Cresterix" });
    upsert("meta", "property", "og:type", {
      content: pathname === "/" ? "website" : "article",
    });

    upsert("meta", "name", "twitter:card", { content: "summary_large_image" });
    upsert("meta", "name", "twitter:title", { content: title });
    upsert("meta", "name", "twitter:description", { content: description });
    upsert("meta", "name", "twitter:image", { content: OG_IMAGE });

    // Route-level schema (currently Article pages). Kept under its own
    // id so it is replaced or removed on navigation and never stacks up
    // alongside the organisation schema declared in index.html.
    const prev = document.getElementById(ROUTE_SCHEMA_ID);
    if (prev) prev.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = ROUTE_SCHEMA_ID;
      script.textContent = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [pathname]);

  return null;
}
