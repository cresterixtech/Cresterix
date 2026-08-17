import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Nav from "./components/Nav";
import Footer from "./components/Footer";
import Boot from "./components/Boot";
import Home from "./pages/Home";
import { useStageDriver, setJourneyElement } from "./lib/useStageDriver";
import { stage } from "./lib/stage";
import "./App.css";

/* The 3D stack is ~250 kB gzipped. It must never block the opening
   frame, so it is fetched only once the document has painted and the
   browser is idle (§17, progressive loading). A CSS-only gradient
   stands in until it arrives, so the page is never visibly empty. */
const CinematicCanvas = lazy(() => import("./three/CinematicCanvas"));

/* Inner pages load on demand so the opening frame appears before any
   secondary route code is fetched (§17, progressive loading). */
const Solutions = lazy(() => import("./pages/Solutions"));
const Industries = lazy(() => import("./pages/Industries"));
const Work = lazy(() => import("./pages/Work"));
const CaseStudy = lazy(() => import("./pages/CaseStudy"));
const About = lazy(() => import("./pages/About"));
const Insights = lazy(() => import("./pages/Insights"));
const Contact = lazy(() => import("./pages/Contact"));
const Legal = lazy(() => import("./pages/Legal"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteEffects() {
  const { pathname, hash } = useLocation();
  const first = useRef(true);

  useEffect(() => {
    // Leaving Home tears down the journey; the field falls back to
    // its calm ambient state.
    if (pathname !== "/") setJourneyElement(null);

    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        requestAnimationFrame(() =>
          el.scrollIntoView({ behavior: first.current ? "auto" : "smooth", block: "start" })
        );
        first.current = false;
        return;
      }
    }
    if (stage.lenis) stage.lenis.scrollTo(0, { immediate: true });
    else window.scrollTo(0, 0);
    first.current = false;
  }, [pathname, hash]);

  return null;
}

function PageFallback() {
  return (
    <div className="pagefall" role="status" aria-live="polite">
      <span className="pagefall__bar" />
      <span className="visually-hidden">Loading</span>
    </div>
  );
}

/** Defers the WebGL bundle until the page has painted and gone idle. */
function useDeferredCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => !cancelled && setReady(true);

    // Two frames guarantees the first paint has landed, then wait for
    // an idle slot so fonts and content win the race for bandwidth.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        if ("requestIdleCallback" in window) {
          window.requestIdleCallback(go, { timeout: 1200 });
        } else {
          setTimeout(go, 220);
        }
      })
    );

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, []);

  return ready;
}

export default function App() {
  useStageDriver();
  const { pathname } = useLocation();
  const canvasReady = useDeferredCanvas();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      {canvasReady ? (
        <Suspense fallback={<div className="cine cine--fallback" aria-hidden="true" />}>
          <CinematicCanvas />
        </Suspense>
      ) : (
        <div className="cine cine--fallback" aria-hidden="true" />
      )}
      <Boot />

      <div className="app">
        <Nav />
        <main id="main" key={pathname} className="page">
          <Suspense fallback={<PageFallback />}>
            <RouteEffects />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/solutions" element={<Solutions />} />
              <Route path="/industries" element={<Industries />} />
              <Route path="/work" element={<Work />} />
              <Route path="/work/:slug" element={<CaseStudy />} />
              <Route path="/about" element={<About />} />
              <Route path="/insights" element={<Insights />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy" element={<Legal kind="privacy" />} />
              <Route path="/terms" element={<Legal kind="terms" />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
