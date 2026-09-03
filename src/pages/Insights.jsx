import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import PageHero from "../components/PageHero";
import Reveal, { RevealGroup } from "../components/Reveal";
import {
  INSIGHT_TOPICS,
  sortedInsights,
  isPublished,
  formatDate,
} from "../data/insights";
import "./Insights.css";

/* §12 — Insights index. Published pieces link through to the article;
   anything still unwritten stays listed as planned rather than being
   hidden, so the taxonomy above reads honestly. */

export default function Insights() {
  const [topic, setTopic] = useState("All");
  const all = sortedInsights();
  const shown = topic === "All" ? all : all.filter((a) => a.topic === topic);

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
              {shown.map((a, i) => {
                const live = isPublished(a);
                const inner = (
                  <>
                    <span className="article__num">{String(i + 1).padStart(2, "0")}</span>
                    <div className="article__main">
                      <span className="article__topic">{a.topic}</span>
                      <h2 className="article__title">{a.title}</h2>
                      {live && <p className="article__excerpt">{a.excerpt}</p>}
                    </div>
                    <span className="article__status">
                      {live ? (
                        <>
                          <time dateTime={a.date}>{formatDate(a.date)}</time>
                          <span className="article__read">{a.readingTime} min read</span>
                        </>
                      ) : (
                        "Planned"
                      )}
                    </span>
                  </>
                );

                return live ? (
                  <Link
                    key={a.slug}
                    to={`/insights/${a.slug}`}
                    className="article article--live"
                  >
                    {inner}
                  </Link>
                ) : (
                  <article className="article" key={a.slug}>
                    {inner}
                  </article>
                );
              })}
            </RevealGroup>

            {shown.length === 0 && (
              <Reveal className="articles__empty">
                <p>No articles under this topic yet.</p>
              </Reveal>
            )}

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
