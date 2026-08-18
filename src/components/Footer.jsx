import { Link } from "react-router-dom";
import Logo from "./Logo";
import { CONTACT_INFO, phoneHref } from "../data/site";
import "./Footer.css";

const SITEMAP = [
  { to: "/solutions", label: "Solutions" },
  { to: "/industries", label: "Industries" },
  { to: "/work", label: "Work" },
  { to: "/about", label: "About" },
  { to: "/insights", label: "Insights" },
  { to: "/contact", label: "Contact" },
];

const CAPABILITIES = [
  { to: "/solutions#product-engineering", label: "Product Engineering" },
  { to: "/solutions#web-platforms", label: "Web Platforms" },
  { to: "/solutions#mobile-applications", label: "Mobile Applications" },
  { to: "/solutions#saas-development", label: "SaaS Development" },
  { to: "/solutions#ai-intelligent-systems", label: "AI & Intelligent Systems" },
  { to: "/solutions#cloud-backend", label: "Cloud & Backend" },
];

/* Social handles are placeholders until the real profiles are supplied. */
const SOCIAL = [
  { href: "https://www.linkedin.com/", label: "LinkedIn" },
  { href: "https://www.instagram.com/", label: "Instagram" },
  { href: "https://github.com/", label: "GitHub" },
];

export default function Footer() {
  return (
    <footer className="foot">
      <div className="foot__inner shell">
        <div className="foot__brand">
          <Logo tagline />
          <p className="foot__disc">
            Digital Product Engineering · Web · Mobile · SaaS · AI · Cloud
          </p>
          <p className="foot__loc">
            <span className="foot__dot" aria-hidden="true" />
            India · Global Delivery
          </p>
        </div>

        <div className="foot__cols">
          <nav className="foot__col" aria-label="Sitemap">
            <h2 className="foot__head">Company</h2>
            <ul>
              {SITEMAP.map((l) => (
                <li key={l.to}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="foot__col" aria-label="Capabilities">
            <h2 className="foot__head">Capabilities</h2>
            <ul>
              {CAPABILITIES.map((l) => (
                <li key={l.label}>
                  <Link to={l.to}>{l.label}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="foot__col" aria-label="Social">
            <h2 className="foot__head">Connect</h2>
            <ul>
              {SOCIAL.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noreferrer noopener">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="foot__col">
            <h2 className="foot__head">Contact</h2>
            <address className="foot__addr">
              {CONTACT_INFO.addressLines.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </address>
            <ul className="foot__contactLinks">
              {CONTACT_INFO.phones.map((p) => (
                <li key={p}>
                  <a href={phoneHref(p)}>{p}</a>
                </li>
              ))}
              {CONTACT_INFO.emails.map((e) => (
                <li key={e}>
                  <a href={`mailto:${e}`}>{e}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="foot__bar shell">
        <p>© {new Date().getFullYear()} Cresterix. All rights reserved.</p>
        <div className="foot__legal">
          <Link to="/privacy">Privacy Policy</Link>
          <span aria-hidden="true">·</span>
          <Link to="/terms">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
