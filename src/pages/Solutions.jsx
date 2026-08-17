import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup } from "../components/Reveal";
import { CAPABILITIES, TECH } from "../data/site";
import { stage } from "../lib/stage";
import "./Solutions.css";

/* §8 — Solutions page, exact content. */

export default function Solutions() {
  return (
    <>
      <PageHero
        eyebrow="Solutions"
        lines={["Digital Products", "Engineered for", "What's Next."]}
        lede="We design, build and evolve digital products that help businesses solve complex problems, operate more efficiently and create better experiences."
      />

      <div className="ground">
        {CAPABILITIES.map((c, i) => (
          <section className="sol" id={c.id} key={c.id}>
            <div className="shell sol__inner">
              <div className="sol__aside">
                <span className="sol__index">{c.index}</span>
                <span className="sol__rule" aria-hidden="true" />
              </div>

              <div className="sol__main">
                <Reveal>
                  <h2 className="sol__title">{c.solutionsTitle ?? c.title}</h2>
                </Reveal>
                <Reveal delay={90}>
                  <p className="sol__lede">{c.solutionsLede}</p>
                </Reveal>
                <Reveal delay={160}>
                  <p className="sol__body lead">{c.solutionsBody}</p>
                </Reveal>

                <RevealGroup
                  className="sol__services"
                  step={35}
                  start={220}
                  onPointerEnter={() => (stage.focusLayer = c.layer)}
                  onPointerLeave={() => (stage.focusLayer = -1)}
                >
                  {c.services.map((s) => (
                    <span className="sol__service" key={s}>
                      {s}
                    </span>
                  ))}
                </RevealGroup>
              </div>
            </div>
            {i < CAPABILITIES.length - 1 && <hr className="rule sol__divider" />}
          </section>
        ))}

        {/* §11 — Built With Modern Technology */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">Technology</Reveal>
                <Reveal delay={90}>
                  <h2 className="sechead__title">Built With Modern Technology.</h2>
                </Reveal>
              </div>
              <Reveal className="sechead__aside lead" delay={200}>
                We select technology based on the product, business requirements and
                long-term goals—not simply because it is popular.
              </Reveal>
            </div>

            <RevealGroup className="grid grid--3 grid--ruled" step={55}>
              {TECH.map((t) => (
                <div className="techcard" key={t.key}>
                  <span className="techcard__key">{t.key}</span>
                  <ul className="techcard__list">
                    {t.items.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section">
          <div className="shell-narrow sol__cta">
            <Reveal>
              <h2 className="sol__ctaTitle">Reach Your Digital Crest.</h2>
            </Reveal>
            <Reveal className="lead" delay={120}>
              Let's turn your next idea into a digital product built for growth.
            </Reveal>
            <Reveal delay={220}>
              <Button to="/contact" variant="primary">
                Let's Build What's Next
              </Button>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
