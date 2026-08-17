import Button from "../components/Button";
import Reveal, { RevealLines } from "../components/Reveal";
import { Mark } from "../components/Logo";
import "./NotFound.css";

export default function NotFound() {
  return (
    <section className="nf">
      <div className="shell-narrow nf__inner scrim">
        <Reveal>
          <Mark className="nf__mark" />
        </Reveal>
        <Reveal className="eyebrow" delay={90}>
          Error 404
        </Reveal>
        <RevealLines
          as="h1"
          className="nf__title"
          start={160}
          lines={["This page isn't", "part of the journey."]}
        />
        <Reveal className="lead nf__body" delay={380}>
          The page you're looking for has moved or never existed. Everything else is
          still where you left it.
        </Reveal>
        <Reveal className="btn-row" delay={480}>
          <Button to="/" variant="primary">
            Back to Home
          </Button>
          <Button to="/contact" variant="ghost">
            Start a Project
          </Button>
        </Reveal>
      </div>
    </section>
  );
}
