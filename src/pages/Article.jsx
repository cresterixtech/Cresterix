import { useParams, Link, Navigate } from "react-router-dom";
import Button from "../components/Button";
import Reveal, { RevealLines } from "../components/Reveal";
import { findInsight, isPublished, formatDate, sortedInsights } from "../data/insights";
import "./Article.css";

/* §12 — Insight article detail.

   Bodies are block arrays from src/data/insights.js, not HTML strings,
   so nothing here is injected — each block type maps to a known
   element. An unrecognised type renders nothing rather than throwing,
   which keeps a typo in the data from taking down the page. */

function Block({ block }) {
  switch (block.type) {
    case "p":
      return <p className="prose__p">{block.text}</p>;
    case "h2":
      return (
        <h2 className="prose__h2" id={slugify(block.text)}>
          {block.text}
        </h2>
      );
    case "ul":
      return (
        <ul className="prose__ul">
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="prose__ol">
          {block.items.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ol>
      );
    case "callout":
      return (
        <aside className="notice prose__callout">
          <span className="notice__key">{block.key}</span>
          <p>{block.text}</p>
        </aside>
      );
    default:
      return null;
  }
}

/** Heading ids for the contents list. Kept simple deliberately — these
 *  are our own headings, not arbitrary user input. */
function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function Article() {
  const { slug } = useParams();
  const a = findInsight(slug);

  // An unwritten or unknown article has nothing to show, and a thin
  // page is worse than no page — send both back to the index.
  if (!a || !isPublished(a)) return <Navigate to="/insights" replace />;

  const headings = a.body.filter((b) => b.type === "h2").map((b) => b.text);
  const more = sortedInsights()
    .filter((x) => x.slug !== a.slug && isPublished(x))
    .slice(0, 2);

  return (
    <article className="art">
      <header className="art__hero">
        <div className="shell-narrow art__heroInner scrim">
          <Reveal className="art__back">
            <Link to="/insights" className="textlink">
              <span>All insights</span>
            </Link>
          </Reveal>

          <Reveal className="eyebrow" delay={60}>
            {a.topic}
          </Reveal>

          <RevealLines as="h1" className="art__title" start={120} lines={[a.title]} />

          <Reveal className="art__meta" delay={280}>
            <time dateTime={a.date}>{formatDate(a.date)}</time>
            <span aria-hidden="true">·</span>
            <span>{a.readingTime} min read</span>
            <span aria-hidden="true">·</span>
            <span>{a.author}</span>
          </Reveal>

          <Reveal className="lead art__excerpt" delay={340}>
            {a.excerpt}
          </Reveal>
        </div>
      </header>

      <div className="ground">
        <section className="section">
          <div className="shell-narrow">
            {headings.length > 2 && (
              <Reveal className="art__toc" delay={60}>
                <h2 className="art__tocHead">Contents</h2>
                <ol className="art__tocList">
                  {headings.map((h) => (
                    <li key={h}>
                      <a href={`#${slugify(h)}`}>{h}</a>
                    </li>
                  ))}
                </ol>
              </Reveal>
            )}

            <div className="prose">
              {a.body.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </div>
        </section>

        {more.length > 0 && (
          <section className="section section--tight">
            <div className="shell-narrow">
              <h2 className="art__moreHead">More insights</h2>
              <div className="art__more">
                {more.map((m) => (
                  <Link key={m.slug} to={`/insights/${m.slug}`} className="artcard">
                    <span className="artcard__topic">{m.topic}</span>
                    <span className="artcard__title">{m.title}</span>
                    <span className="artcard__meta">{m.readingTime} min read</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="section">
          <div className="shell-narrow art__cta">
            <Reveal>
              <h2 className="art__ctaTitle">Have a digital challenge worth solving?</h2>
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
    </article>
  );
}
