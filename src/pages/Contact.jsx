import { useState, useRef } from "react";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { PROJECT_TYPES, BUDGETS, TIMELINES, CONTACT_INFO, phoneHref } from "../data/site";
import "./Contact.css";

/* §13 — Contact page.

   Fields are exactly those specified in the blueprint. Submission
   posts to VITE_CONTACT_ENDPOINT when one is configured; until then
   the form validates fully and says plainly that it isn't connected,
   rather than pretending to send.

   The form is visually parked behind a "coming soon" overlay until
   there's somewhere for it to send its payload. Flip FORM_ENABLED once
   VITE_CONTACT_ENDPOINT is live — everything below already works, it's
   just gated off rather than deleted. */

const FORM_ENABLED = false;

const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT ?? "";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FIELDS = {
  name: { label: "Name", required: true, type: "text", autoComplete: "name" },
  company: { label: "Company", required: false, type: "text", autoComplete: "organization" },
  email: { label: "Work Email", required: true, type: "email", autoComplete: "email" },
  country: { label: "Country", required: false, type: "text", autoComplete: "country-name" },
};

export default function Contact() {
  const [values, setValues] = useState({
    name: "",
    company: "",
    email: "",
    country: "",
    projectType: "",
    budget: "",
    description: "",
    timeline: "",
  });
  const [errors, setErrors] = useState({});
  const [state, setState] = useState("idle"); // idle | sending | sent | unconfigured | error
  const errorSummary = useRef(null);

  const set = (k) => (e) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((x) => ({ ...x, [k]: undefined }));
  };

  function validate() {
    const e = {};
    if (!values.name.trim()) e.name = "Please enter your name.";
    if (!values.email.trim()) e.email = "Please enter your work email.";
    else if (!EMAIL_RE.test(values.email.trim()))
      e.email = "Please enter a valid email address.";
    if (!values.description.trim())
      e.description = "Please tell us a little about the project.";
    else if (values.description.trim().length < 20)
      e.description = "A sentence or two more would help us respond usefully.";
    return e;
  }

  async function onSubmit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      requestAnimationFrame(() => errorSummary.current?.focus());
      return;
    }

    if (!ENDPOINT) {
      setState("unconfigured");
      return;
    }

    setState("sending");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      setState(res.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  const invalid = Object.keys(errors).filter((k) => errors[k]);

  return (
    <>
      <PageHero
        eyebrow="Contact"
        lines={["Have a Digital Challenge?", "Let's Build What's Next."]}
        lede="Tell us what you're trying to build, improve or solve. Whether you have a product idea, an existing system that needs improvement or a business process that could be transformed through technology, we'd like to understand it."
      />

      <div className="ground">
        <section className="section">
          <div className="shell contact">
            <div className={`form__panel${FORM_ENABLED ? "" : " is-soon"}`}>
            <form className="form" onSubmit={onSubmit} noValidate>
              <fieldset className="form__fieldset" disabled={!FORM_ENABLED}>
              <legend className="visually-hidden">Project enquiry</legend>
              {invalid.length > 0 && (
                <div
                  className="form__summary"
                  role="alert"
                  tabIndex={-1}
                  ref={errorSummary}
                >
                  <p>Please check the following:</p>
                  <ul>
                    {invalid.map((k) => (
                      <li key={k}>
                        <a href={`#f-${k}`}>{errors[k]}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="form__grid">
                {Object.entries(FIELDS).map(([key, f]) => (
                  <div className="field-group" key={key}>
                    <label htmlFor={`f-${key}`}>
                      {f.label}
                      {f.required && <span aria-hidden="true"> *</span>}
                      {f.required && <span className="visually-hidden"> (required)</span>}
                    </label>
                    <input
                      id={`f-${key}`}
                      name={key}
                      type={f.type}
                      autoComplete={f.autoComplete}
                      value={values[key]}
                      onChange={set(key)}
                      aria-invalid={errors[key] ? "true" : undefined}
                      aria-describedby={errors[key] ? `e-${key}` : undefined}
                    />
                    {errors[key] && (
                      <p className="field-error" id={`e-${key}`}>
                        {errors[key]}
                      </p>
                    )}
                  </div>
                ))}

                <div className="field-group">
                  <label htmlFor="f-projectType">Project Type</label>
                  <div className="select-wrap">
                    <select
                      id="f-projectType"
                      value={values.projectType}
                      onChange={set("projectType")}
                    >
                      <option value="">Select…</option>
                      {PROJECT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group">
                  <label htmlFor="f-budget">Estimated Budget</label>
                  <div className="select-wrap">
                    <select id="f-budget" value={values.budget} onChange={set("budget")}>
                      <option value="">Select…</option>
                      {BUDGETS.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="field-group field-group--full">
                  <label htmlFor="f-description">
                    Project Description<span aria-hidden="true"> *</span>
                    <span className="visually-hidden"> (required)</span>
                  </label>
                  <textarea
                    id="f-description"
                    rows={6}
                    value={values.description}
                    onChange={set("description")}
                    aria-invalid={errors.description ? "true" : undefined}
                    aria-describedby={errors.description ? "e-description" : undefined}
                    placeholder="What are you trying to build, improve or solve?"
                  />
                  {errors.description && (
                    <p className="field-error" id="e-description">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div className="field-group">
                  <label htmlFor="f-timeline">Timeline</label>
                  <div className="select-wrap">
                    <select
                      id="f-timeline"
                      value={values.timeline}
                      onChange={set("timeline")}
                    >
                      <option value="">Select…</option>
                      {TIMELINES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="form__foot">
                <button
                  type="submit"
                  className="btn btn--primary form__submit"
                  disabled={state === "sending"}
                >
                  <span className="btn__label">
                    {state === "sending" ? "Sending…" : "Start a Conversation"}
                  </span>
                  <svg className="btn__arrow" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                  </svg>
                </button>

                <p className="form__note">
                  Fields marked * are required. We reply to every genuine enquiry.
                </p>
              </div>
              </fieldset>

              <div aria-live="polite">
                {state === "sent" && (
                  <div className="form__result is-good">
                    <strong>Thank you.</strong> Your message is with us—we'll be in touch
                    shortly.
                  </div>
                )}
                {state === "error" && (
                  <div className="form__result is-bad">
                    <strong>That didn't send.</strong> Please try again, or email us
                    directly.
                  </div>
                )}
                {state === "unconfigured" && (
                  <div className="notice form__result">
                    <span className="notice__key">Setup</span>
                    <p>
                      The form validated successfully, but no submission endpoint is
                      connected yet. Set <code>VITE_CONTACT_ENDPOINT</code> in your
                      environment to the URL that should receive the JSON payload, and
                      this form will post to it.
                    </p>
                  </div>
                )}
              </div>
            </form>

            {!FORM_ENABLED && (
              <div className="form__soon">
                <span className="notice__key">Coming Soon</span>
                <h2 className="form__soonTitle">The enquiry form is getting an upgrade.</h2>
                <p className="form__soonBody">
                  Reach us directly using the details alongside — we reply to every
                  genuine enquiry.
                </p>
                <a
                  className="btn btn--primary form__soonCta"
                  href={`mailto:${CONTACT_INFO.emails[0]}`}
                >
                  <span className="btn__label">Email Us</span>
                  <svg className="btn__arrow" viewBox="0 0 16 16" aria-hidden="true">
                    <path
                      d="M2 8h11M9 4l4 4-4 4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="square"
                    />
                  </svg>
                </a>
              </div>
            )}
            </div>

            <aside className="contact__aside">
              <Reveal className="contact__block contact__block--direct">
                <h2 className="contact__head">Reach us directly</h2>
                <ul className="contact__list">
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
                <address className="contact__addr">
                  {CONTACT_INFO.addressLines.join(", ")}
                </address>
                <p className="contact__meta">India · Global Delivery</p>
              </Reveal>

              <Reveal className="contact__block" delay={100}>
                <h2 className="contact__head">What happens next</h2>
                <ol className="contact__steps">
                  <li>
                    <span>01</span> We read your description and come back with
                    questions.
                  </li>
                  <li>
                    <span>02</span> A short call to understand the business and the
                    problem.
                  </li>
                  <li>
                    <span>03</span> A proposed direction, scope and engagement model.
                  </li>
                </ol>
              </Reveal>

              <Reveal className="contact__block" delay={180}>
                <h2 className="contact__head">Engagement models</h2>
                <ul className="contact__list">
                  <li>Project-Based</li>
                  <li>Dedicated Development</li>
                  <li>Product Partnership</li>
                </ul>
              </Reveal>
            </aside>
          </div>
        </section>
      </div>
    </>
  );
}
