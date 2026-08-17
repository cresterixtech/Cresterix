import { useEffect, useState } from "react";
import { Mark } from "./Logo";
import { stage, prefersReducedMotion } from "../lib/stage";
import "./Boot.css";

/* ------------------------------------------------------------------
   The opening frame appears before any heavy 3D asset resolves, then
   hands over. Short by design — a loader is not a chapter.
   ------------------------------------------------------------------ */

export default function Boot() {
  // Under reduced motion the loader never exists — seeded during
  // render so there is no flash and no cascading state update.
  const [done, setDone] = useState(prefersReducedMotion);
  const [gone, setGone] = useState(prefersReducedMotion);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    stage.lenis?.stop();
    document.body.style.overflow = "hidden";

    const start = performance.now();
    const finish = () => {
      // Hold a minimum beat so the crest reads, but never stall.
      const elapsed = performance.now() - start;
      const wait = Math.max(0, 900 - elapsed);
      setTimeout(() => setDone(true), wait);
    };

    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });

    // Hard ceiling — the site must never be held hostage by an asset.
    const bail = setTimeout(() => setDone(true), 2600);

    return () => {
      clearTimeout(bail);
      window.removeEventListener("load", finish);
    };
  }, []);

  useEffect(() => {
    if (!done) return;
    document.body.style.overflow = "";
    stage.lenis?.start();
    const t = setTimeout(() => setGone(true), 900);
    return () => clearTimeout(t);
  }, [done]);

  if (gone) return null;

  return (
    <div className={`boot ${done ? "is-done" : ""}`} aria-hidden="true">
      <div className="boot__center">
        <Mark className="boot__mark" />
        <div className="boot__line">
          <span />
        </div>
        <p className="boot__label">The Crest of Digital Solutions</p>
      </div>
    </div>
  );
}
