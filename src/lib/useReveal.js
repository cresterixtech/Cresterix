import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "./stage";

/* ------------------------------------------------------------------
   Shared IntersectionObserver for every reveal on the page. One
   observer beats one-per-element when a long page has hundreds.
   ------------------------------------------------------------------ */

const io = {
  instance: null,
  callbacks: new WeakMap(),
};

function observer() {
  if (io.instance) return io.instance;
  io.instance = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const cb = io.callbacks.get(entry.target);
        if (cb) {
          cb();
          io.instance.unobserve(entry.target);
          io.callbacks.delete(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
  );
  return io.instance;
}

export function useReveal() {
  const ref = useRef(null);
  // Seeded during render: under reduced motion the element starts in
  // its resting state rather than being flipped there by an effect.
  const [shown, setShown] = useState(prefersReducedMotion);

  useEffect(() => {
    const el = ref.current;
    if (!el || shown) return;

    // Anything already on screen at mount reveals straight away. The
    // observer's negative bottom margin exists to hold a reveal back
    // until it is comfortably in view *while scrolling*; applied to
    // above-the-fold content it does the opposite, leaving the hero's
    // buttons at opacity 0 on short viewports until the visitor
    // scrolls. The CSS transition still runs, so this animates in.
    const box = el.getBoundingClientRect();
    if (box.top < window.innerHeight && box.bottom > 0) {
      setShown(true);
      return;
    }

    const ob = observer();
    io.callbacks.set(el, () => setShown(true));
    ob.observe(el);
    return () => {
      ob.unobserve(el);
      io.callbacks.delete(el);
    };
  }, [shown]);

  return [ref, shown];
}
