import { useParams, Link, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Reveal, { RevealLines, RevealGroup } from "../components/Reveal";
import { findWork, isPublished } from "../data/work";
import "./CaseStudy.css";

/* §7 — Case-study detail.

   A field renders only when it holds verified content. Anything not
   yet supplied is shown as a labelled gap, because the blueprint
   forbids inventing results. */

function Field({ label, value, children }) {
  const empty = !value && !children;
  return (
    <div className={`csfield ${empty ? "is-empty" : ""}`}>
      <h2 className="csfield__label">{label}</h2>
      {empty ? (
        <p className="csfield__pending">
          Awaiting verified content
          <span className="csfield__hint">
            Supplied by Cresterix before this study is published.
          </span>
        </p>
      ) : (
        children ?? <p className="csfield__value">{value}</p>
      )}
    </div>
  );
}

export default function CaseStudy() {
  const { slug } = useParams();
  const w = findWork(slug);

  if (!w) return <Navigate to="/work" replace />;

  const live = isPublished(w);
  const shot = w.media?.[0];

  return (
    <article className="cs">
      <header className="cs__hero">
        <div className="shell cs__heroInner scrim">
          <Reveal className="cs__back">
            <Link to="/work" className="textlink">
              <span>All work</span>
            </Link>
          </Reveal>

          <Reveal className="eyebrow" delay={60}>
            {w.industry}
          </Reveal>

          <RevealLines as="h1" className="cs__title" start={120} lines={[w.name]} />

          <Reveal className="cs__sub" delay={260}>
            {w.subtitle}
          </Reveal>

          {w.summary && (
            <Reveal className="lead cs__summary" delay={320}>
              {w.summary}
            </Reveal>
          )}

          {!live && (
            <Reveal className="notice cs__notice" delay={340}>
              <span className="notice__key">Draft</span>
              <p>
                This case study is structured and awaiting verified content. Real
                project details, technologies and measurable outcomes will be published
                here—no placeholder metrics are shown in the meantime.
              </p>
            </Reveal>
          )}
        </div>
      </header>

      <div className="ground">
        {shot && (
          <section className="section section--tight">
            <div className="shell">
              <Reveal className="csshot">
                <figure className="csshot__fig">
                  <img
                    className="csshot__img"
                    src={shot.src}
                    width={shot.width}
                    height={shot.height}
                    alt={shot.alt}
                    loading="eager"
                    decoding="async"
                  />
                  {shot.caption && (
                    <figcaption className="csshot__cap">{shot.caption}</figcaption>
                  )}
                </figure>
              </Reveal>
            </div>
          </section>
        )}

        {w.facts?.length > 0 && (
          <section className="section section--tight">
            <div className="shell">
              <RevealGroup className="csfacts" step={60}>
                {w.facts.map((f) => (
                  <div className="csfact" key={f.k}>
                    <span className="csfact__k">{f.k}</span>
                    <span className="csfact__v">{f.v}</span>
                  </div>
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        <section className="section">
          <div className="shell cs__body">
            <div className="cs__fields">
              <Field label="The Challenge" value={w.challenge} />
              <Field label="The Solution" value={w.solution} />
              <Field label="Technology">
                {w.technology?.length ? (
                  <div className="tag-row">
                    {w.technology.map((t) => (
                      <span className="tag" key={t}>
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Field>
              <Field label="Result" value={w.result} />
            </div>

            <aside className="cs__side">
              <div className="spec">
                <div className="spec__row">
                  <span className="spec__key">Project</span>
                  <span className="spec__val">{w.name}</span>
                </div>
                <div className="spec__row">
                  <span className="spec__key">Industry</span>
                  <span className="spec__val">{w.industry}</span>
                </div>
                {w.market && (
                  <div className="spec__row">
                    <span className="spec__key">Market</span>
                    <span className="spec__val">{w.market}</span>
                  </div>
                )}
                <div className="spec__row">
                  <span className="spec__key">Capability</span>
                  <span className="spec__val">{w.capability}</span>
                </div>
                {w.year && (
                  <div className="spec__row">
                    <span className="spec__key">Year</span>
                    <span className="spec__val">{w.year}</span>
                  </div>
                )}
              </div>

              {w.assurance?.length > 0 && (
                <div className="csassure">
                  <span className="csassure__label">Privacy &amp; security</span>
                  <ul className="csassure__list">
                    {w.assurance.map((a) => (
                      <li key={a}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </section>

        {w.approach?.length > 0 && (
          <section className="section">
            <div className="shell">
              <div className="sechead sechead--split">
                <div>
                  <Reveal className="eyebrow">Approach</Reveal>
                  <Reveal delay={80}>
                    <h2 className="sechead__title">How it was built.</h2>
                  </Reveal>
                </div>
                <Reveal className="sechead__aside lead" delay={180}>
                  The decisions that shaped the system, and the reasoning behind each
                  one.
                </Reveal>
              </div>

              <RevealGroup className="csapproach" step={70}>
                {w.approach.map((a, i) => (
                  <div className="csstep" key={a.title}>
                    <span className="csstep__num">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="csstep__title">{a.title}</h3>
                    <p className="csstep__body">{a.body}</p>
                  </div>
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        {w.engineering?.length > 0 && (
          <section className="section">
            <div className="shell">
              <div className="sechead sechead--split">
                <div>
                  <Reveal className="eyebrow">Engineering log</Reveal>
                  <Reveal delay={80}>
                    <h2 className="sechead__title">Problems solved on the way.</h2>
                  </Reveal>
                </div>
                <Reveal className="sechead__aside lead" delay={180}>
                  Real issues found during development and testing, and how each was
                  resolved before handover.
                </Reveal>
              </div>

              <RevealGroup className="cslog" step={55}>
                {w.engineering.map((e) => (
                  <div className="cslog__row" key={e.problem}>
                    <p className="cslog__problem">{e.problem}</p>
                    <p className="cslog__fix">{e.fix}</p>
                  </div>
                ))}
              </RevealGroup>
            </div>
          </section>
        )}

        <section className="section">
          <div className="shell-narrow cs__cta">
            <Reveal>
              <h2 className="cs__ctaTitle">Reach Your Digital Crest.</h2>
            </Reveal>
            <Reveal className="lead" delay={110}>
              Let's turn your next idea into a digital product built for growth.
            </Reveal>
            <Reveal delay={190}>
              <Button to="/contact" variant="primary">
                Let's Build What's Next
              </Button>
            </Reveal>
          </div>
        </section>
      </div>
    </article>
  );
}
