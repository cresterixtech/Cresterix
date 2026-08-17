import { useState } from "react";
import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup } from "../components/Reveal";
import { INSIGHTS, INSIGHT_TOPICS } from "../data/site";
import "./Insights.css";

/* §12 — Insights page. Article titles are the three named in the
   blueprint; each is marked as planned until the piece is written. */

export default function Insights() {
  const [topic, setTopic] = useState("All");
  const shown =
    topic === "All" ? INSIGHTS : INSIGHTS.filter((a) => a.topic === topic);

  return (
    <>
      <PageHero
        eyebrow="Insights"
        lines={["Cresterix Insights."]}
        lede="Ideas, engineering perspectives and practical technology insights for businesses building what's next."
      />

      <div className="ground">
        <section className="section">
          <div className="shell">
            <Reveal className="topics" delay={60}>
              <div className="topics__row" role="group" aria-label="Filter by topic">
                {["All", ...INSIGHT_TOPICS].map((t) => (
                  <button
                    key={t}
                    className={`topic ${topic === t ? "is-active" : ""}`}
                    onClick={() => setTopic(t)}
                    aria-pressed={topic === t}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </Reveal>

            <RevealGroup className="articles" step={70}>
              {shown.map((a, i) => (
                <article className="article" key={a.slug}>
                  <span className="article__num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="article__main">
                    <span className="article__topic">{a.topic}</span>
                    <h2 className="article__title">{a.title}</h2>
                  </div>
                  <span className="article__status">Planned</span>
                </article>
              ))}
            </RevealGroup>

            {shown.length === 0 && (
              <Reveal className="articles__empty">
                <p>No articles under this topic yet.</p>
              </Reveal>
            )}

            <Reveal className="notice insights__notice" delay={140}>
              <span className="notice__key">Content</span>
              <p>
                These are the three launch titles named in the content blueprint. Each
                becomes a full article page as it is written—the topic taxonomy above is
                already wired to filter them.
              </p>
            </Reveal>
          </div>
        </section>

        <section className="section">
          <div className="shell-narrow insights__cta">
            <Reveal>
              <h2 className="insights__ctaTitle">
                Have a digital challenge worth thinking through?
              </h2>
            </Reveal>
            <Reveal className="lead" delay={110}>
              Tell us what you're trying to build, improve or solve.
            </Reveal>
            <Reveal delay={190}>
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
