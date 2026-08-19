import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import Logo, { Mark } from "./Logo";
import Button from "./Button";
import { stage } from "../lib/stage";
import { CONTACT_INFO, phoneHref } from "../data/site";
import "./Nav.css";

const LINKS = [
  { to: "/solutions", label: "Solutions" },
  { to: "/industries", label: "Industries" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/insights", label: "Insights" },
];

/* ------------------------------------------------------------------
   Navigation stays persistent and understandable even when the
   background is highly animated (§17). It gains a ground plane as
   soon as the visitor leaves the top of the page.
   ------------------------------------------------------------------ */

export default function Nav() {
  const [solid, setSolid] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);
  const lastY = useRef(0);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      // Hide on sustained downward scroll, reveal immediately on up.
      setHidden(y > 480 && y > lastY.current + 4);
      lastY.current = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation. Adjusted during render rather
  // than in an effect, so the menu never paints open on the new route.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    stage.lenis?.stop();
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      stage.lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header
        className={`nav ${solid || open ? "is-solid" : ""} ${hidden && !open ? "is-hidden" : ""}`}
      >
        <div className="nav__inner">
          <Link to="/" className="nav__logo" aria-label="Cresterix home">
            <Logo compact />
          </Link>

          <nav className="nav__links" aria-label="Primary">
            {LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) => `nav__link ${isActive ? "is-active" : ""}`}
              >
                <span>{l.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="nav__actions">
            <Button to="/contact" variant="primary" className="nav__cta">
              Contact
            </Button>
            <button
              className={`nav__burger ${open ? "is-open" : ""}`}
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="nav__rule" />
      </header>

      <div id="mobile-menu" className={`menu ${open ? "is-open" : ""}`} hidden={!open}>
        <Mark className="menu__watermark" aria-hidden="true" />

        <div className="menu__scroll">
          <div className="menu__body">
            <span className="eyebrow menu__eyebrow">Navigate</span>

            <nav className="menu__links" aria-label="Mobile">
              {LINKS.map((l, i) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  className={({ isActive }) => `menu__link ${isActive ? "is-active" : ""}`}
                  style={{ "--i": i }}
                  onClick={() => setOpen(false)}
                >
                  <span className="menu__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="menu__label">{l.label}</span>
                  <svg className="menu__arrow" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                  </svg>
                </NavLink>
              ))}
            </nav>

            <div className="menu__foot">
              <Button to="/contact" variant="primary" onClick={() => setOpen(false)}>
                Contact
              </Button>

              <div className="menu__footMeta">
                <p className="menu__loc">
                  <span className="menu__dot" aria-hidden="true" />
                  India · Global Delivery
                </p>
                <div className="menu__quick">
                  <a href={phoneHref(CONTACT_INFO.phones[0])}>{CONTACT_INFO.phones[0]}</a>
                  <a href={`mailto:${CONTACT_INFO.emails[0]}`}>{CONTACT_INFO.emails[0]}</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
