import Reveal, { RevealLines } from "./Reveal";
import "./PageHero.css";

/* Inner pages retain the same visual language with lighter motion so
   users can focus on information (§3). */

export default function PageHero({ eyebrow, lines, lede, aside, children }) {
  return (
    <header className="phero">
      <div className="shell phero__inner scrim">
        {eyebrow && <Reveal className="eyebrow">{eyebrow}</Reveal>}
        <RevealLines as="h1" className="phero__title" start={80} step={100} lines={lines} />
        {lede && (
          <Reveal className="lead phero__lede" delay={320}>
            {lede}
          </Reveal>
        )}
        {aside && (
          <Reveal className="phero__aside" delay={420}>
            {aside}
          </Reveal>
        )}
        {children}
      </div>
    </header>
  );
}
