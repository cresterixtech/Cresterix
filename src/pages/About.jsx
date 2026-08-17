import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup, RevealLines } from "../components/Reveal";
import { Mark } from "../components/Logo";
import { BRAND, ENGAGEMENT } from "../data/site";
import "./About.css";

/* §10 — About page, exact content. */

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About"
        lines={["We Believe", "Technology Should", "Create Momentum."]}
        lede="Cresterix was built around a simple belief: technology should do more than solve problems—it should create opportunities."
      />

      <div className="ground">
        <section className="section">
          <div className="shell about__intro">
            <Reveal className="about__para" delay={60}>
              We design and engineer digital solutions that help businesses operate
              smarter, serve customers better and build for what's next.
            </Reveal>
            <Reveal className="about__para" delay={140}>
              From digital products and web platforms to mobile applications, SaaS
              systems, AI-powered solutions and cloud infrastructure, we combine
              thoughtful product thinking with modern engineering to create technology
              that delivers meaningful business value.
            </Reveal>
          </div>
        </section>

        {/* Philosophy */}
        <section className="section">
          <div className="shell">
            <Reveal className="eyebrow">Philosophy</Reveal>
            <RevealGroup className="values" step={80}>
              {BRAND.philosophy.map((v, i) => (
                <div className="value" key={v}>
                  <span className="value__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="value__word">{v}</span>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* Brand story */}
        <section className="section story">
          <div className="shell story__inner">
            <div className="story__aside">
              <Reveal>
                <Mark className="story__mark" />
              </Reveal>
            </div>

            <div className="story__main">
              <Reveal className="eyebrow">Brand Story</Reveal>
              <RevealLines
                as="h2"
                className="story__title"
                start={80}
                lines={["The highest point.", "A mark of distinction."]}
              />
              <Reveal className="lead story__para" delay={240}>
                The name Cresterix is inspired by the idea of a crest—the highest point,
                a mark of distinction and a symbol of achievement. Cresterix represents
                the ambition to build digital solutions that help businesses reach their
                next level.
              </Reveal>
              <Reveal className="lead story__para" delay={320}>
                We see technology as more than a collection of tools. It is a way to
                create momentum. A way to turn ideas into products. A way to transform
                complex processes into simple experiences. And a way for businesses to
                build what's next.
              </Reveal>
              <Reveal className="story__sign" delay={420}>
                The Crest of Digital Solutions.
              </Reveal>
            </div>
          </div>
        </section>

        {/* Positioning */}
        <section className="section">
          <div className="shell-narrow about__promise scrim">
            <RevealLines
              as="p"
              className="about__promiseText"
              step={110}
              lines={["We don't just build software.", "We engineer digital products", "that move businesses forward."]}
            />
          </div>
        </section>

        {/* Engagement */}
        <section className="section">
          <div className="shell">
            <div className="sechead sechead--split">
              <div>
                <Reveal className="eyebrow">Engagement</Reveal>
                <Reveal delay={80}>
                  <h2 className="sechead__title">Built Around Your Business.</h2>
                </Reveal>
              </div>
              <Reveal className="sechead__aside lead" delay={180}>
                Different businesses need different ways to work with a technology
                partner. Choose an engagement model that matches your product,
                requirements and stage of growth.
              </Reveal>
            </div>

            <RevealGroup className="grid grid--3 grid--ruled" step={70}>
              {ENGAGEMENT.map((e) => (
                <div className="engagecard" key={e.index}>
                  <span className="card__index">{e.index}</span>
                  <h3 className="card__title">{e.title}</h3>
                  <p className="card__body">{e.body}</p>
                </div>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="section">
          <div className="shell-narrow about__cta">
            <Reveal>
              <h2 className="about__ctaTitle">Reach Your Digital Crest.</h2>
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
    </>
  );
}
