import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import Button, { TextLink } from "../components/Button";
import Reveal, { RevealGroup, RevealLines } from "../components/Reveal";
import ChapterHUD from "../components/ChapterHUD";
import { setJourneyElement } from "../lib/useStageDriver";
import { stage } from "../lib/stage";
import { CAPABILITIES, PROCESS, TECH, SECURITY, ENGAGEMENT } from "../data/site";
import { WORK, isPublished } from "../data/work";
import "./Home.css";

/* ------------------------------------------------------------------
   The Home page carries the strongest cinematic journey (§3). Inner
   pages keep the same visual language with lighter motion.

   The whole page is the journey: scroll position across this element
   drives the seven scenes in the WebGL layer.
   ------------------------------------------------------------------ */

export default function Home() {
  const journey = useRef(null);

  useEffect(() => {
    setJourneyElement(journey.current);
    return () => setJourneyElement(null);
  }, []);

  return (
    <div className="home" ref={journey}>
      <ChapterHUD />

      {/* ---- Scene 01/02 — The Void, then the Crest Forms ---------
          Each [data-chapter] wrapper binds a slice of the journey to
          the copy it belongs to, so the crest resolves while the hero
          is still on screen rather than somewhere further down. */}
      <div data-chapter="hero">
      <section className="hero">
        <div className="shell hero__inner">
          <div className="hero__copy scrim">
            <Reveal className="eyebrow" delay={80}>
              The Crest of Digital Solutions
            </Reveal>

            <RevealLines
              as="h1"
              className="hero__title"
              start={160}
              step={110}
              lines={["We Build Digital", "Products That Move", "Businesses Forward."]}
            />

            <Reveal className="lead hero__lead" delay={620}>
              Cresterix engineers high-performance web platforms, mobile applications,
              SaaS products, AI-powered systems and custom software for ambitious
              businesses worldwide.
            </Reveal>

            <Reveal className="btn-row hero__cta" delay={760}>
              <Button to="/contact" variant="primary">
                Start a Project
              </Button>
              <Button to="/work" variant="ghost">
                Explore Our Work
              </Button>
            </Reveal>
          </div>
        </div>

        <Reveal className="hero__support" delay={900}>
          <div className="shell hero__supportInner">
            {["India", "Global Delivery", "Web", "Mobile", "Cloud", "AI"].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </Reveal>

        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scrollLabel">Scroll</span>
          <span className="hero__scrollLine" />
        </div>
      </section>

      {/* ---- What We Do ------------------------------------------- */}
      <section className="section">
        <div className="shell">
          <div className="sechead sechead--split scrim">
            <div>
              <Reveal className="eyebrow">Digital Product Engineering</Reveal>
              <RevealLines
                as="h2"
                className="sechead__title"
                start={90}
                lines={["Digital Engineering,", "Without Boundaries."]}
              />
            </div>
            <Reveal className="sechead__aside lead" delay={220}>
              We transform business ideas, operational challenges and opportunities into
              reliable digital products. From web platforms and mobile applications to
              SaaS products, AI-powered systems and cloud infrastructure, we combine
              product thinking, engineering and technology to build solutions designed
              for real-world use.
            </Reveal>
          </div>
        </div>
      </section>
      </div>

      {/* ---- Scene 03 — The Crest Opens into capability layers ---- */}
      <section className="section capabilities" id="capabilities" data-chapter="capabilities">
        <div className="shell">
          <Reveal className="eyebrow">Capabilities</Reveal>
          <RevealGroup className="grid grid--3 grid--ruled caps" step={60} y={22}>
            {CAPABILITIES.map((c) => (
              <article
                key={c.id}
                className="cap"
                onPointerEnter={() => (stage.focusLayer = c.layer)}
                onPointerLeave={() => (stage.focusLayer = -1)}
              >
                <span className="card__index">{c.index}</span>
                <h3 className="cap__title">{c.title}</h3>
                <p className="cap__lede">{c.lede}</p>
                <p className="cap__body">{c.body}</p>
                <TextLink to={`/solutions#${c.id}`}>Explore</TextLink>
              </article>
            ))}
          </RevealGroup>
        </div>
      </section>

      {/* ---- Scene 04 — The Architecture -------------------------- */}
      <div data-chapter="architecture">
      <section className="section">
        <div className="shell">
          <div className="sechead sechead--split scrim">
            <div>
              <Reveal className="eyebrow">Think Beyond Development</Reveal>
              <RevealLines
                as="h2"
                className="sechead__title"
                start={90}
                lines={["Your Idea Shouldn't Be", "Limited by Technology."]}
              />
            </div>
            <Reveal className="sechead__aside lead" delay={220}>
              Good software begins before the first line of code. We start by
              understanding the business, the people who use the product and the problem
              that needs to be solved. From there, we architect, engineer and
              continuously improve digital systems designed for long-term value.
            </Reveal>
          </div>
        </div>
      </section>

      {/* ---- Brand statement -------------------------------------- */}
      <section className="section statement">
        <div className="shell-narrow scrim">
          <RevealLines
            as="p"
            className="statement__text"
            step={120}
            lines={["Ideas Are Everywhere.", "Exceptional Digital", "Products Aren't."]}
          />
          <Reveal className="statement__body lead" delay={480}>
            We turn complex business ideas into elegant, scalable and reliable digital
            experiences.
          </Reveal>
        </div>
      </section>
      </div>

      {/* ---- Scene 05 — The Engineering Journey ------------------- */}
      <section className="section process" id="process" data-chapter="process">
        <div className="shell">
          <div className="sechead sechead--split scrim">
            <div>
              <Reveal className="eyebrow">How We Work</Reveal>
              <RevealLines
                as="h2"
                className="sechead__title"
                start={90}
                lines={["From Concept to", "Digital Reality."]}
              />
            </div>
            <Reveal className="sechead__aside lead" delay={220}>
              A clear process creates better products. We combine business
              understanding, product thinking and engineering discipline to move from an
              initial idea to a reliable digital product.
            </Reveal>
          </div>

          <ol className="steps">
            {PROCESS.map((s, i) => (
              <Reveal as="li" className="step" key={s.index} delay={i * 60}>
                <span className="step__index">{s.index}</span>
                <div className="step__main">
                  <h3 className="step__title">{s.title}</h3>
                  <p className="step__lede">{s.lede}</p>
                  <p className="step__body">{s.body}</p>
                </div>
                <span className="step__scene">{s.scene}</span>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---- Scene 06 — The Product Reveal ------------------------ */}
      <div data-chapter="work">
      <section className="section work" id="work">
        <div className="shell">
          <div className="sechead sechead--split scrim">
            <div>
              <Reveal className="eyebrow">Selected Work</Reveal>
              <RevealLines as="h2" className="sechead__title" start={90} lines={["Built by Cresterix."]} />
            </div>
            <Reveal className="sechead__aside lead" delay={220}>
              We build digital products that solve real business problems. Explore
              selected projects across web platforms, business applications, mobile
              experiences, SaaS products and intelligent systems.
            </Reveal>
          </div>

          <RevealGroup className="worklist" step={80}>
            {WORK.map((w) => (
              <Link to={`/work/${w.slug}`} className="workrow" key={w.slug}>
                <span className="workrow__name">{w.name}</span>
                <span className="workrow__sub">{w.subtitle}</span>
                <span className="workrow__meta">{w.industry}</span>
                <span className="workrow__go" aria-hidden="true">
                  {isPublished(w) ? "View case study" : "In preparation"}
                </span>
              </Link>
            ))}
          </RevealGroup>

          <Reveal className="work__more" delay={180}>
            <TextLink to="/work">All work</TextLink>
          </Reveal>
        </div>
      </section>

      {/* ---- Information band: dense copy on solid ground --------- */}
      <div className="ground">
        {/* International */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">International</Reveal>
                <RevealLines
                  as="h2"
                  className="sechead__title"
                  start={90}
                  lines={["Built in India.", "Designed for the World."]}
                />
              </div>
              <Reveal className="sechead__aside lead" delay={220}>
                Cresterix combines engineering excellence with transparent communication
                and flexible collaboration to help businesses build and evolve digital
                products.
              </Reveal>
            </div>

            <RevealGroup className="techgrid-list" step={50}>
              {TECH.map((t) => (
                <div className="techrow" key={t.key}>
                  <span className="techrow__key">{t.key}</span>
                  <div className="tag-row">
                    {t.items.map((i) => (
                      <span className="tag" key={i}>
                        {i}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Security */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">Security</Reveal>
                <RevealLines
                  as="h2"
                  className="sechead__title"
                  start={90}
                  lines={["Engineering With", "Security at the Core."]}
                />
              </div>
              <Reveal className="sechead__aside lead" delay={220}>
                Security isn't something added at the end of development. It is
                considered throughout the architecture, development and deployment of a
                digital product.
              </Reveal>
            </div>

            <RevealGroup className="grid grid--4 grid--ruled" step={45}>
              {SECURITY.map((s, i) => (
                <div className="secitem" key={s}>
                  <span className="card__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="secitem__label">{s}</span>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Engagement */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">Engagement</Reveal>
                <RevealLines
                  as="h2"
                  className="sechead__title"
                  start={90}
                  lines={["Built Around", "Your Business."]}
                />
              </div>
              <Reveal className="sechead__aside lead" delay={220}>
                Different businesses need different ways to work with a technology
                partner. Choose an engagement model that matches your product,
                requirements and stage of growth.
              </Reveal>
            </div>

            <RevealGroup className="grid grid--3 grid--ruled" step={70}>
              {ENGAGEMENT.map((e) => (
                <div className="card engage" key={e.index}>
                  <span className="card__index">{e.index}</span>
                  <h3 className="card__title">{e.title}</h3>
                  <p className="card__body">{e.body}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>
      </div>
      </div>

      {/* ---- Scene 07 — The Horizon ------------------------------- */}
      <section className="section finale" data-chapter="finale">
        <div className="shell-narrow finale__inner scrim">
          <Reveal className="eyebrow eyebrow--plain finale__eyebrow">
            {["Crest", "Idea", "Architecture", "Engineering", "Product", "Growth"].join(" → ")}
          </Reveal>
          <RevealLines
            as="h2"
            className="finale__title"
            step={120}
            lines={["Reach Your", "Digital Crest."]}
          />
          <Reveal className="lead finale__body" delay={420}>
            Let's turn your next idea into a digital product built for growth.
          </Reveal>
          <Reveal delay={560}>
            <Button to="/contact" variant="primary" className="finale__cta">
              Let's Build What's Next
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
