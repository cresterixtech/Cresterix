import { Link } from "react-router-dom";
import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup } from "../components/Reveal";
import { WORK, WORK_INTRO, CASE_STUDY_FIELDS, isPublished } from "../data/work";
import "./Work.css";

/* §7 — Work / Case Studies.

   Every study renders from data. Unverified fields are shown as an
   explicit gap, never filled with invented copy or metrics. */

export default function Work() {
  const published = WORK.filter(isPublished);
  const pending = WORK.filter((w) => !isPublished(w));

  return (
    <>
      <PageHero eyebrow="Work" lines={[WORK_INTRO.headline]} lede={WORK_INTRO.body} />

      <div className="ground">
        <section className="section">
          <div className="shell">
            <RevealGroup className="cases" step={80}>
              {WORK.map((w, i) => (
                <Link className="case" to={`/work/${w.slug}`} key={w.slug}>
                  <div className="case__frame">
                    <span className="case__grid" aria-hidden="true" />
                    {w.media?.[0] ? (
                      /* Decorative here — the card's heading already
                         names the project, so alt would just repeat it. */
                      <img
                        className="case__shot"
                        src={w.media[0].src}
                        alt=""
                        /* The first card is above the fold — lazy-loading
                           it would only delay the largest paint. */
                        loading={i === 0 ? "eager" : "lazy"}
                        decoding="async"
                      />
                    ) : (
                      <span className="case__mark" aria-hidden="true">
                        {w.name.charAt(0)}
                      </span>
                    )}
                    <span
                      className={`case__status ${
                        isPublished(w) ? "is-live" : "is-pending"
                      }`}
                    >
                      {isPublished(w) ? "Case study" : "In preparation"}
                    </span>
                  </div>
                  <div className="case__meta">
                    <h2 className="case__name">{w.name}</h2>
                    <p className="case__sub">{w.subtitle}</p>
                    <div className="tag-row case__tags">
                      <span className="tag">{w.industry}</span>
                      {w.market && <span className="tag">{w.market}</span>}
                      <span className="tag">{w.capability}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </RevealGroup>

            {pending.length > 0 && (
              <Reveal className="notice work__notice" delay={120}>
                <span className="notice__key">Content</span>
                <p>
                  {published.length === 0
                    ? "Case studies are structured and ready to publish. "
                    : `${pending.length} further ${
                        pending.length === 1 ? "study is" : "studies are"
                      } structured and ready to publish. `}
                  Supply the verified challenge, solution, technology and outcome for
                  each project and it appears here automatically. Per the content
                  blueprint, no metrics are shown until they are real—where an outcome
                  isn't yet measurable, the delivered capability is described instead.
                </p>
              </Reveal>
            )}
          </div>
        </section>

        {/* The structure every study fills — useful to the reader and
            to whoever writes the next one. */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">Method</Reveal>
                <Reveal delay={80}>
                  <h2 className="sechead__title">How we document a project.</h2>
                </Reveal>
              </div>
              <Reveal className="sechead__aside lead" delay={180}>
                Each case study follows the same structure, so results can be compared
                honestly across very different products.
              </Reveal>
            </div>

            <RevealGroup className="fields" step={40}>
              {CASE_STUDY_FIELDS.map((f, i) => (
                <div className="field" key={f}>
                  <span className="field__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="field__label">{f}</span>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section">
          <div className="shell-narrow work__cta">
            <Reveal>
              <h2 className="work__ctaTitle">Have a project worth building?</h2>
            </Reveal>
            <Reveal className="lead" delay={110}>
              Let's turn your next idea into a digital product built for growth.
            </Reveal>
            <Reveal delay={190}>
              <Button to="/contact" variant="primary">
                Start a Project
              </Button>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
