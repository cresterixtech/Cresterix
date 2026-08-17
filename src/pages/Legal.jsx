import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { TextLink } from "../components/Button";
import "./Legal.css";

/* Privacy Policy and Terms of Service are listed in the footer (§14)
   but no copy was supplied. Legal text is not something to improvise,
   so these pages ship as a correct structure with the sections a
   policy needs, clearly marked for counsel-reviewed copy. */

const DOCS = {
  privacy: {
    eyebrow: "Legal",
    title: ["Privacy Policy"],
    lede: "How Cresterix collects, uses, stores and protects information gathered through this website and our engagements.",
    sections: [
      "Who we are and how to contact us",
      "Information we collect",
      "How we use information",
      "Legal basis for processing",
      "Cookies and analytics",
      "Sharing with processors and third parties",
      "International transfers",
      "Data retention",
      "Your rights",
      "Security measures",
      "Changes to this policy",
    ],
  },
  terms: {
    eyebrow: "Legal",
    title: ["Terms of Service"],
    lede: "The terms governing use of this website and the basis on which Cresterix provides digital product engineering services.",
    sections: [
      "Acceptance of terms",
      "Use of this website",
      "Scope of services",
      "Engagement models and contracts",
      "Intellectual property",
      "Client responsibilities",
      "Fees, invoicing and payment",
      "Confidentiality",
      "Warranties and disclaimers",
      "Limitation of liability",
      "Termination",
      "Governing law and jurisdiction",
    ],
  },
};

export default function Legal({ kind = "privacy" }) {
  const doc = DOCS[kind] ?? DOCS.privacy;

  return (
    <>
      <PageHero eyebrow={doc.eyebrow} lines={doc.title} lede={doc.lede} />

      <div className="ground">
        <section className="section">
          <div className="shell-narrow legal">
            <Reveal className="notice legal__notice">
              <span className="notice__key">Pending</span>
              <p>
                This policy has not been drafted yet. The section structure below is in
                place; the operative wording should be written and reviewed by qualified
                counsel before launch. Nothing on this page should be relied upon as a
                statement of Cresterix's legal position.
              </p>
            </Reveal>

            <ol className="legal__toc">
              {doc.sections.map((s, i) => (
                <li key={s}>
                  <span className="legal__num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="legal__section">{s}</span>
                  <span className="legal__state">Not drafted</span>
                </li>
              ))}
            </ol>

            <Reveal className="legal__foot" delay={120}>
              <p>
                Questions about how we handle information in the meantime?
              </p>
              <TextLink to="/contact">Contact us</TextLink>
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}
