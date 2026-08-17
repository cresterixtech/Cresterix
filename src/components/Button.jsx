import { useRef, useCallback } from "react";
import { Link } from "react-router-dom";

/* ------------------------------------------------------------------
   Buttons respond subtly to pointer movement (blueprint §16,
   micro-interactions) but stay crisp and stable — the environment
   moves, the controls do not drift away from the cursor.
   ------------------------------------------------------------------ */

function useMagnetic(strength = 0.22) {
  const ref = useRef(null);

  const onMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      el.style.setProperty("--mx", `${dx * strength}px`);
      el.style.setProperty("--my", `${dy * strength * 0.6}px`);
    },
    [strength]
  );

  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--mx", "0px");
    el.style.setProperty("--my", "0px");
  }, []);

  return { ref, onPointerMove: onMove, onPointerLeave: onLeave };
}

const Arrow = () => (
  <svg className="btn__arrow" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
    <path
      d="M2 8h11M9 4l4 4-4 4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
    />
  </svg>
);

export default function Button({
  to,
  href,
  children,
  variant = "primary",
  arrow = true,
  className = "",
  ...rest
}) {
  const mag = useMagnetic(variant === "primary" ? 0.18 : 0.12);
  const cls = `btn btn--${variant} ${className}`;

  const inner = (
    <>
      <span className="btn__label">{children}</span>
      {arrow && <Arrow />}
      <span className="btn__sheen" aria-hidden="true" />
    </>
  );

  if (to) {
    return (
      <Link to={to} className={cls} {...mag} {...rest}>
        {inner}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={cls} {...mag} {...rest}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...mag} {...rest}>
      {inner}
    </button>
  );
}

/** Quiet inline link with an animated rule — used in lists and cards. */
export function TextLink({ to, href, children, className = "" }) {
  const inner = (
    <>
      <span>{children}</span>
      <Arrow />
    </>
  );
  const cls = `textlink ${className}`;
  if (to)
    return (
      <Link to={to} className={cls}>
        {inner}
      </Link>
    );
  return (
    <a href={href} className={cls}>
      {inner}
    </a>
  );
}
