import { useEffect } from "react";
import Lenis from "lenis";
import { stage, clamp, clamp01, damp, lerp, CHAPTERS } from "./stage";

/* ------------------------------------------------------------------
   Drives the shared stage from real scroll + pointer input.

   A single rAF loop owns everything. Nothing here touches React
   state, so a 60fps scroll costs zero renders.
   ------------------------------------------------------------------ */

/** Home registers the element that spans the cinematic journey. */
export function setJourneyElement(el) {
  stage.journeyEl = el;
  stage.chapters = null; // re-measured on the next frame
  if (!el) {
    stage.mode = "ambient";
    stage.progress = 0;
  } else {
    stage.mode = "journey";
  }
}

/** Measure each [data-chapter] section once per layout change. */
function measureChapters(root) {
  const out = [];
  for (const c of CHAPTERS) {
    const el = root.querySelector(`[data-chapter="${c.id}"]`);
    if (!el) continue;
    const top = el.getBoundingClientRect().top + window.scrollY;
    out.push({ ...c, top, height: el.offsetHeight });
  }
  return out.length ? out : null;
}

/**
 * Map scroll position to journey progress through the chapter anchors,
 * so each scene plays over the section it describes.
 */
function chapterProgress(chapters, anchor) {
  const first = chapters[0];
  const last = chapters[chapters.length - 1];
  if (anchor <= first.top) return 0;
  if (anchor >= last.top + last.height) return 1;

  for (let i = 0; i < chapters.length; i++) {
    const c = chapters[i];
    const end = c.top + c.height;
    if (anchor < end) {
      const t = clamp01((anchor - c.top) / Math.max(c.height, 1));
      return lerp(c.from, c.to, t);
    }
    // In the gap between two measured chapters, hold the boundary.
    const next = chapters[i + 1];
    if (next && anchor < next.top) return c.to;
  }
  return 1;
}

export function useStageDriver() {
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stage.reduced = reduced;

    let lenis = null;
    if (!reduced) {
      lenis = new Lenis({
        duration: 1.05,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        // Native momentum on touch feels better than emulated smoothing.
        smoothTouch: false,
        touchMultiplier: 1.6,
      });
      stage.lenis = lenis;
    }

    let raf = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();

    const onPointer = (e) => {
      stage.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      stage.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    };
    // Pointer parallax is a desktop affordance; skip it on touch.
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (fine) window.addEventListener("pointermove", onPointer, { passive: true });

    const tick = (time) => {
      raf = requestAnimationFrame(tick);
      if (lenis) lenis.raf(time);

      const now = performance.now();
      const dt = Math.min((now - lastT) / 1000, 0.05) || 0.016;
      lastT = now;

      const y = window.scrollY;
      const vh = window.innerHeight;

      // Normalised scroll velocity, clamped so a flick doesn't blow out.
      const raw = (y - lastY) / vh / Math.max(dt, 0.001);
      lastY = y;
      stage.velocity = damp(stage.velocity, clamp(raw * 0.09, -1, 1), 6, dt);

      const el = stage.journeyEl;
      if (el) {
        stage.mode = "journey";

        // Re-measure when the layout could have moved underneath us:
        // viewport resize, but also any change in document height from
        // a late web font swapping in or an image settling.
        const docH = document.documentElement.scrollHeight;
        if (
          !stage.chapters ||
          stage.chaptersW !== window.innerWidth ||
          stage.chaptersH !== docH
        ) {
          stage.chapters = measureChapters(el);
          stage.chaptersW = window.innerWidth;
          stage.chaptersH = docH;
        }

        if (stage.chapters) {
          // Anchor on the viewport's upper third: the scene should turn
          // over as a section's headline arrives, not once it has left.
          stage.progress = chapterProgress(stage.chapters, y + vh * 0.34);
        } else {
          const rect = el.getBoundingClientRect();
          const total = rect.height - vh;
          stage.progress = total > 0 ? clamp01(-rect.top / total) : 0;
        }
      } else {
        stage.mode = "ambient";
      }

      stage.eased = stage.reduced
        ? stage.progress
        : damp(stage.eased, stage.progress, 5.5, dt);

      stage.pointerEased.x = damp(stage.pointerEased.x, stage.pointer.x, 3.2, dt);
      stage.pointerEased.y = damp(stage.pointerEased.y, stage.pointer.y, 3.2, dt);

      // Expose progress to CSS for DOM-side scene cues.
      document.documentElement.style.setProperty("--journey", stage.eased.toFixed(4));
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (fine) window.removeEventListener("pointermove", onPointer);
      if (lenis) lenis.destroy();
      stage.lenis = null;
    };
  }, []);
}
