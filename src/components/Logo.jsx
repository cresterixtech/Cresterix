import markSvg from "../brand/mark.svg?raw";
import wordmarkSvg from "../brand/wordmark.svg?raw";

/* ------------------------------------------------------------------
   The mark and wordmark are true vectors traced from the supplied
   artwork (the shipped .svg files in the logo package were raster
   wrappers). Inlining them keeps `currentColor` working, so the logo
   inherits whatever colour its context sets.
   ------------------------------------------------------------------ */

export function Mark({ className = "", style }) {
  return (
    <span
      className={`mark ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: markSvg }}
    />
  );
}

export function Wordmark({ className = "", style }) {
  return (
    <span
      className={`wordmark ${className}`}
      style={style}
      dangerouslySetInnerHTML={{ __html: wordmarkSvg }}
    />
  );
}

export default function Logo({ compact = false, tagline = false }) {
  return (
    <span className={`logo ${compact ? "logo--compact" : ""}`}>
      <Mark className="logo__mark" />
      <span className="logo__type">
        <Wordmark className="logo__word" />
        {tagline && (
          <span className="logo__tagline">The Crest of Digital Solutions</span>
        )}
      </span>
      <span className="visually-hidden">Cresterix — The Crest of Digital Solutions</span>
    </span>
  );
}
