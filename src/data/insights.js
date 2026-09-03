/* ------------------------------------------------------------------
   Insights — long-form articles.

   Lives in its own file for the same reason work.js does: the article
   bodies are long, and keeping them out of site.js stops that file
   from becoming unreadable.

   Bodies are block arrays rather than HTML strings, so nothing is ever
   injected with dangerouslySetInnerHTML and the renderer stays in
   control of the markup. Block types in use:

     { type: "p",  text }              paragraph
     { type: "h2", text }              section heading (drives the TOC)
     { type: "ul" | "ol", items[] }    list
     { type: "callout", key, text }    boxed aside, keyed like .notice

   Every article carries a real `date` and `excerpt`; the excerpt is
   reused verbatim as the page's meta description, so what the search
   result promises is what the page opens with.
   ------------------------------------------------------------------ */

export const INSIGHT_TOPICS = [
  "AI",
  "Software Architecture",
  "SaaS",
  "Cybersecurity",
  "Cloud",
  "Business Automation",
  "Mobile Development",
  "Digital Transformation",
];

export const INSIGHTS = [
  {
    slug: "when-to-build-custom-software",
    title: "When Should a Business Build Custom Software?",
    topic: "Software Architecture",
    status: "published",
    date: "2026-08-12",
    author: "Cresterix Engineering",
    readingTime: 7,
    excerpt:
      "Most businesses should buy off-the-shelf software, not build it. Here are the four signals that genuinely justify building, and the four that don't.",
    body: [
      {
        type: "p",
        text: "Most software a business runs on should be bought, not built. Accounting, payroll, email, CRM, helpdesk — these are solved problems with mature products behind them, and a custom rebuild will almost always be slower, more expensive and worse. Any engineering firm that tells you otherwise is selling you something.",
      },
      {
        type: "p",
        text: "But there is a real category of work where buying fails, and businesses stuck in that category often spend years absorbing the cost quietly — in spreadsheets, in manual re-entry, in a process that only one person fully understands. The question is how to tell the two situations apart before committing budget.",
      },
      { type: "h2", text: "Four signals that justify building" },
      {
        type: "p",
        text: "In our experience these are the conditions where custom software genuinely pays back. You do not need all four, but one on its own is rarely enough.",
      },
      {
        type: "ol",
        items: [
          "The process is your competitive advantage. If how you price, route, schedule or manufacture is a differentiator, standard software will force you to operate like your competitors. That is the strongest argument for building there is — and it applies to a narrow slice of what any business does.",
          "The workflow spans tools that will not talk to each other. When staff spend their day copying data between three systems, the cost is not the licences. It is the re-entry time and the errors, and it compounds with headcount.",
          "You are paying per seat for software you use 10% of. Large platforms price for their full feature surface. If you use a fraction of it and the licence scales with staff, the arithmetic can flip surprisingly early.",
          "The constraint is regulatory or contractual. Data residency, audit trails, retention rules or a client contract that dictates how information is handled will sometimes rule out every off-the-shelf option outright.",
        ],
      },
      { type: "h2", text: "Four signals you should not build" },
      {
        type: "ul",
        items: [
          "\"The existing tool is 80% right.\" Closing that last 20% with custom software usually costs more than the whole product did. Configuration, an integration, or changing the process is nearly always cheaper.",
          "Nobody can describe the current process end to end. If the workflow only exists in people's heads, building software will force you to define it — expensively, mid-project, under deadline. Define it first, on paper.",
          "The driver is a single frustrated stakeholder. Software built to settle an internal argument gets used by one department and abandoned.",
          "There is no budget for year two. This is the one businesses most often miss, so it gets its own section.",
        ],
      },
      { type: "h2", text: "The cost nobody quotes for" },
      {
        type: "p",
        text: "A build quote covers getting to launch. It does not cover owning the result. Custom software is not a capital purchase that sits on a shelf — it is closer to hiring: there is an ongoing obligation, and if you stop meeting it the asset degrades.",
      },
      {
        type: "p",
        text: "Realistically, budget for infrastructure and third-party services, security patching of dependencies, operating-system and framework upgrades that arrive whether you want them or not, and a modest stream of changes as the business shifts. A common industry rule of thumb puts annual maintenance at roughly 15–20% of the original build cost. Treat that as a planning figure, not a quote — but a plan with a zero in that line is not finished.",
      },
      {
        type: "callout",
        key: "Rule",
        text: "If you cannot fund year two, do not start year one. Half-maintained custom software is worse than the spreadsheet it replaced, because people trust it more than they should.",
      },
      { type: "h2", text: "The middle path most businesses actually need" },
      {
        type: "p",
        text: "The choice is rarely build-everything or buy-everything. The most cost-effective answer is usually to keep the commodity systems you already pay for and build only the thin layer that is genuinely yours — the workflow that sits between them.",
      },
      {
        type: "p",
        text: "That might be an integration service that moves records between two platforms on a schedule, a small internal tool that replaces a shared spreadsheet, or a customer-facing portal that reads from the system of record you already own. These projects are smaller, they carry far less risk, and they can be delivered in weeks rather than quarters. They also fail cheaply, which matters more than it sounds.",
      },
      { type: "h2", text: "A test worth applying before you commit" },
      {
        type: "p",
        text: "Write down the process as it runs today, step by step, including the exceptions. Then estimate how many hours per week it consumes across everyone involved, and multiply by a year.",
      },
      {
        type: "p",
        text: "Two things fall out of that exercise. The first is a number to compare against a build cost. The second — more valuable, and free — is that roughly a third of the time the act of writing the process down reveals that the real fix is a policy change or a configuration setting, not software at all. That is a good outcome. It is considerably cheaper than the alternative.",
      },
      {
        type: "p",
        text: "If the number still justifies building after that, you have something worth quoting: a defined process, a measured cost, and a scope that stops somewhere.",
      },
    ],
  },

  {
    slug: "scalable-saas-architecture",
    title: "Building a Scalable SaaS Architecture",
    topic: "SaaS",
    status: "published",
    date: "2026-08-26",
    author: "Cresterix Engineering",
    readingTime: 9,
    excerpt:
      "Scaling a SaaS product is rarely about traffic. It is about tenant isolation, background work and the decisions that get expensive to reverse later.",
    body: [
      {
        type: "p",
        text: "When a SaaS product starts creaking, the instinct is to reach for more infrastructure. In practice, most early SaaS products are nowhere near a hardware limit. They are hitting a design limit — usually one taken in the first month, when the product had two customers and the decision felt inconsequential.",
      },
      {
        type: "p",
        text: "This is about the decisions that are expensive to reverse, and which ones can safely wait.",
      },
      { type: "h2", text: "Multi-tenancy: the one decision to get right early" },
      {
        type: "p",
        text: "How you separate one customer's data from another's is the hardest thing to change later, because changing it means migrating live customer data. There are three common approaches, and the trade-off is genuinely a trade-off — none of them is simply correct.",
      },
      {
        type: "ul",
        items: [
          "Shared schema, tenant ID column. Every table carries a tenant identifier and every query filters on it. Cheapest to operate, simplest to migrate, scales to large customer counts. The risk is that one missing filter leaks data across tenants — a serious class of bug that testing does not reliably catch.",
          "Schema per tenant. One database, separate schemas. Stronger isolation and per-tenant backup and restore become straightforward. Migrations now have to run across every schema, which becomes slow somewhere in the hundreds.",
          "Database per tenant. Strongest isolation, easiest story for data-residency and enterprise security review, and simple to bill by cost. Operationally the heaviest by a wide margin, and it makes cross-tenant reporting genuinely hard.",
        ],
      },
      {
        type: "p",
        text: "For most products the shared schema is the right default. But if you take it, take the safety measure that goes with it: enforce tenant scoping in one place — a base query layer, a repository, or row-level security in the database — rather than trusting every future developer to remember the filter on every query. This is the single highest-value hour of architecture work in a young SaaS product.",
      },
      {
        type: "callout",
        key: "Cost of delay",
        text: "Adding tenant isolation on day one costs about a day. Retrofitting it after a leak costs a rewrite of the data layer, plus the disclosure conversation.",
      },
      { type: "h2", text: "Where SaaS products actually break first" },
      {
        type: "p",
        text: "Almost never on the web tier. Stateless application servers are easy to add. The failures cluster in four less obvious places.",
      },
      {
        type: "ol",
        items: [
          "Background jobs. Report generation, imports, email batches and scheduled syncs are where one large customer starves everyone else. A single tenant uploading a 200,000-row file will hold the queue while every other customer waits. Separate queues by job class, and cap per-tenant concurrency.",
          "The database's slowest query under real data shapes. A query that is instant against 500 rows can be unusable at 5 million. The shape of the data matters more than the volume — one tenant with 90% of the rows breaks assumptions that averages hide.",
          "Anything that runs per tenant on a timer. A nightly job that takes 4 seconds per tenant is fine at 50 tenants and takes over six hours at 5,000. This one arrives suddenly.",
          "Third-party rate limits. Your payment, email or messaging provider limits you globally while your customers experience it individually. One tenant's bulk operation consumes the allowance everyone shares.",
        ],
      },
      { type: "h2", text: "What not to build early" },
      {
        type: "p",
        text: "Resist splitting into microservices before the domain boundaries are actually known. A well-structured single application — clear module boundaries, no cross-module database access — gives you most of the organisational benefit and none of the distributed-systems cost. You can extract a service later from a clean module; you cannot easily merge four services that were drawn in the wrong places.",
      },
      {
        type: "p",
        text: "The same applies to caching layers, custom orchestration and premature sharding. Every one of these adds a failure mode and an operational burden. Add them when a measurement demands it, not when a diagram suggests it.",
      },
      { type: "h2", text: "What is worth building in from the start" },
      {
        type: "p",
        text: "A short list, because each of these is cheap now and disproportionately expensive to add once you have customers depending on the current behaviour.",
      },
      {
        type: "ul",
        items: [
          "Tenant scoping enforced centrally, as above.",
          "Idempotency on anything that charges money or sends a message. Networks retry; without idempotency keys, so do your side effects.",
          "An audit trail of who changed what, when. Your first enterprise customer's security review will ask, and reconstructing history retrospectively is impossible.",
          "Database migrations under version control, applied the same way in every environment. Manual schema changes are the most common source of \"works in staging\" incidents.",
          "Per-tenant metrics, not just aggregate ones. Averages conceal the customer who is having a bad time, and that customer is the one who cancels.",
        ],
      },
      { type: "h2", text: "Scale is a measurement, not a feeling" },
      {
        type: "p",
        text: "The practical discipline is to instrument before optimising. Know your slowest endpoint at the 95th percentile, your longest-running background job, and your largest tenant by row count. Those three numbers tell you what will break next far more reliably than any architectural intuition.",
      },
      {
        type: "p",
        text: "Most SaaS products do not need a distributed system. They need one well-structured application, correct tenant isolation, background work that cannot be monopolised, and enough visibility to see trouble a month before it becomes an outage.",
      },
    ],
  },

  {
    slug: "automate-manual-workflows-with-ai",
    title: "How Businesses Can Automate Manual Workflows With AI",
    topic: "Business Automation",
    status: "published",
    date: "2026-09-02",
    author: "Cresterix Engineering",
    readingTime: 8,
    excerpt:
      "AI automation works on a narrower set of business tasks than the marketing suggests. Here is where it reliably pays back, and where it quietly fails.",
    body: [
      {
        type: "p",
        text: "There is a version of AI automation that works, and it looks considerably less impressive than the demos. It does not replace a department. It removes a specific, repetitive, well-bounded task that a person currently does forty times a day — and it does so with a human still checking the output.",
      },
      {
        type: "p",
        text: "The projects that fail usually fail for the same reason: they started from the technology rather than from the process.",
      },
      { type: "h2", text: "Start with the process, not the model" },
      {
        type: "p",
        text: "Before any tooling decision, the workflow has to be written down: what triggers it, what information it needs, what decision gets made, what happens to the output, and — crucially — what the exceptions are. Almost every manual business process is 70% routine and 30% exception, and the exceptions are where the value and the risk both sit.",
      },
      {
        type: "p",
        text: "This exercise regularly reveals that the bottleneck is not the task anyone assumed it was. It is worth doing even if the project stops there.",
      },
      { type: "h2", text: "Three categories that genuinely work" },
      {
        type: "p",
        text: "Language models are good at a narrower set of things than the marketing suggests, but within that set they are very good and getting cheaper.",
      },
      {
        type: "ol",
        items: [
          "Extraction from unstructured documents. Pulling line items from invoices, fields from application forms, terms from contracts. This used to require rigid templates per supplier; it no longer does. This is the highest-return category for most businesses by a distance.",
          "Classification and routing. Deciding which team an incoming email, ticket or enquiry belongs to, and how urgent it is. The task is bounded, the output is a label from a fixed list, and errors are cheap to correct.",
          "Drafting a first version. Reply drafts, summaries of long threads, first-pass report text. The output is explicitly a draft that a person edits — which is exactly the right framing, because it keeps a human accountable for what goes out.",
        ],
      },
      {
        type: "p",
        text: "Notice what these have in common. Each has a bounded input, a checkable output, and a person who remains responsible for the result.",
      },
      { type: "h2", text: "Where it fails" },
      {
        type: "p",
        text: "Language models are not deterministic. The same input can produce a different output, and the model will produce a confident answer when it does not know. That rules out certain categories regardless of how good the model gets.",
      },
      {
        type: "ul",
        items: [
          "Arithmetic and financial calculation. Do not ask a model to compute a total. Have it extract the figures and let ordinary code do the arithmetic, where the result is reproducible and testable.",
          "Anything requiring an identical answer every time. Compliance determinations, pricing rules, eligibility decisions. Encode these as rules; use the model only to read the inputs the rules consume.",
          "Irreversible actions without review. Sending payment, deleting records, dispatching customer communications. The step that commits should be a person or a deterministic rule, not a generated decision.",
        ],
      },
      {
        type: "callout",
        key: "Design rule",
        text: "Use the model to read and to draft. Use ordinary code to calculate and to decide. Most failed AI automation projects blur that line.",
      },
      { type: "h2", text: "Design the human step deliberately" },
      {
        type: "p",
        text: "\"Human in the loop\" becomes theatre if the human is shown fifty confident-looking outputs an hour and asked to approve them. Nobody reads the fiftieth one carefully. Review has to be designed, not just present.",
      },
      {
        type: "p",
        text: "In practice that means surfacing the model's uncertainty rather than hiding it, routing low-confidence cases to a person and letting high-confidence ones through, showing the source passage next to every extracted field so verification takes a glance rather than a search, and making corrections cheap to record — because those corrections are the measurement data for whether the system is improving.",
      },
      { type: "h2", text: "Measure it honestly" },
      {
        type: "p",
        text: "Before launch, record how long the task takes today and how often it is currently done wrong. Without that baseline there is no way to tell whether the automation helped, and the conversation defaults to impressions.",
      },
      {
        type: "p",
        text: "After launch, the number that matters is not model accuracy in isolation. It is end-to-end time and error rate for the whole process including the review step. A system that is 95% accurate but requires every output to be checked closely may save nothing at all. A system that is 85% accurate but flags its own uncertain cases reliably can save a great deal.",
      },
      { type: "h2", text: "On cost" },
      {
        type: "p",
        text: "Per-call model costs have fallen sharply and are rarely the deciding factor at business volumes. The real costs are integration with the systems the process already touches, the review interface, and ongoing evaluation as documents, formats and suppliers change. Budget for the third one specifically — an automation that was accurate at launch and unmonitored for a year is a liability, not an asset.",
      },
      {
        type: "p",
        text: "Start with one process. Pick the one that is high-volume, low-variety and currently annoying — extraction from a recurring document type is the usual best first candidate. Measure it, ship it with a review step, and expand only once it has held up in production for a month.",
      },
    ],
  },
];

export const findInsight = (slug) => INSIGHTS.find((a) => a.slug === slug);

export const isPublished = (a) => a?.status === "published";

/** Newest first — the order the Insights index renders in. */
export const sortedInsights = () =>
  [...INSIGHTS].sort((a, b) => (a.date < b.date ? 1 : -1));

/** Long-form display date, stable across locales. */
export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
