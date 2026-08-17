import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup } from "../components/Reveal";
import { INDUSTRIES } from "../data/site";
import "./Industries.css";

/* §9 — Industries page, exact content. */

export default function Industries() {
  return (
    <>
      <PageHero
        eyebrow="Industries"
        lines={["Technology That", "Understands", "Your Industry."]}
        lede="Every business has its own workflows, customers, challenges and opportunities. We design digital solutions around the way your business actually operates—combining technology with an understanding of your specific requirements."
      />

      <div className="ground">
        <section className="section">
          <div className="shell">
            <RevealGroup className="grid grid--3 grid--ruled inds" step={45} y={20}>
              {INDUSTRIES.map((ind, i) => (
                <article className="ind" key={ind.id} id={ind.id}>
                  <span className="ind__index">{String(i + 1).padStart(2, "0")}</span>
                  <h2 className="ind__title">{ind.title}</h2>
                  <p className="ind__body">{ind.body}</p>
                  <span className="ind__glow" aria-hidden="true" />
                </article>
              ))}
            </RevealGroup>

            <Reveal className="inds__closing" delay={140}>
              <p>Solutions designed around your industry's unique workflows.</p>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="shell-narrow inds__cta">
            <Reveal>
              <h2 className="inds__ctaTitle">
                Don't see your industry? We still want to hear about it.
              </h2>
            </Reveal>
            <Reveal className="lead" delay={120}>
              Tell us what you're trying to build, improve or solve—we design around the
              way your business actually operates.
            </Reveal>
            <Reveal delay={200}>
              <Button to="/contact" variant="primary">
                Start a Conversation
              </Button>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
