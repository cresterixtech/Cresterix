import { useEffect, useRef, useState } from "react";
import { stage, SCENES } from "../lib/stage";
import "./ChapterHUD.css";

/* ------------------------------------------------------------------
   "Every scroll transition should answer the question: what part of
   the Cresterix story am I seeing now?" (§1)

   This rail answers it literally. It reads the stage every frame but
   only re-renders when the chapter actually changes — six possible
   values across the whole page.
   ------------------------------------------------------------------ */

const CHAPTERS = [
  { id: "crest", label: "Crest", scenes: ["void", "crest"] },
  { id: "idea", label: "Idea", scenes: ["open"] },
  { id: "architecture", label: "Architecture", scenes: ["architecture"] },
  { id: "engineering", label: "Engineering", scenes: ["engineering"] },
  { id: "product", label: "Product", scenes: ["product"] },
  { id: "growth", label: "Growth", scenes: ["horizon"] },
];

function chapterFor(p) {
  const scene = SCENES.find((s) => p >= s.start && p < s.end) ?? SCENES[SCENES.length - 1];
  const i = CHAPTERS.findIndex((c) => c.scenes.includes(scene.id));
  return i < 0 ? 0 : i;
}

export default function ChapterHUD() {
  const [active, setActive] = useState(0);
  const barRef = useRef(null);
  const activeRef = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (stage.mode !== "journey") return;

      const p = stage.eased;
      if (barRef.current) {
        barRef.current.style.transform = `scaleY(${p.toFixed(4)})`;
      }
      const next = chapterFor(p);
      if (next !== activeRef.current) {
        activeRef.current = next;
        setActive(next);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <aside className="hud" aria-hidden="true">
      <div className="hud__track">
        <span className="hud__fill" ref={barRef} />
      </div>
      <ol className="hud__list">
        {CHAPTERS.map((c, i) => (
          <li
            key={c.id}
            className={`hud__item ${i === active ? "is-active" : ""} ${
              i < active ? "is-past" : ""
            }`}
          >
            <span className="hud__num">{String(i + 1).padStart(2, "0")}</span>
            <span className="hud__label">{c.label}</span>
          </li>
        ))}
      </ol>
    </aside>
  );
}
