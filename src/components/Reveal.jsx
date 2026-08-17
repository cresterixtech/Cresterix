import { Children } from "react";
import { useReveal } from "../lib/useReveal";

/* ------------------------------------------------------------------
   Scroll reveal.

   Short staggered reveals — the blueprint explicitly warns against
   word-by-word animation, so this reveals whole lines and blocks and
   nothing finer. Reduced motion skips straight to the resting state.
   ------------------------------------------------------------------ */

export default function Reveal({
  as: Tag = "div",
  delay = 0,
  y = 18,
  className = "",
  children,
  ...rest
}) {
  const [ref, shown] = useReveal();
  return (
    <Tag
      ref={ref}
      className={`reveal ${shown ? "is-in" : ""} ${className}`}
      style={{ "--reveal-delay": `${delay}ms`, "--reveal-y": `${y}px` }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Staggers its direct children. Used for lists and grids. */
export function RevealGroup({
  as: Tag = "div",
  step = 70,
  start = 0,
  y = 18,
  className = "",
  children,
  ...rest
}) {
  const [ref, shown] = useReveal();
  return (
    <Tag ref={ref} className={`reveal-group ${shown ? "is-in" : ""} ${className}`} {...rest}>
      {Children.map(children, (child, i) =>
        child ? (
          <div
            className="reveal-item"
            style={{ "--reveal-delay": `${start + i * step}ms`, "--reveal-y": `${y}px` }}
          >
            {child}
          </div>
        ) : null
      )}
    </Tag>
  );
}

/** Splits a headline into lines that rise behind a mask. */
export function RevealLines({ lines, as: Tag = "h2", className = "", step = 90, start = 0 }) {
  const [ref, shown] = useReveal();
  return (
    <Tag ref={ref} className={`reveal-lines ${shown ? "is-in" : ""} ${className}`}>
      {lines.map((line, i) => (
        <span className="reveal-lines__mask" key={i}>
          <span
            className="reveal-lines__line"
            style={{ "--reveal-delay": `${start + i * step}ms` }}
          >
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
