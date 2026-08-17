/* ------------------------------------------------------------------
   Case studies.

   Blueprint §7 is explicit: use real project details, technologies and
   measurable outcomes, and do not invent metrics. If a result is not
   yet measurable, describe the delivered capability instead of
   creating a number.

   This entry is drawn from the delivered project's Software Requirements
   Specification (v1.0, July 2026). Deliberately excluded from this public
   page: the client's name and the station's identifying details (call
   sign, frequency, home town), plus all credentials, server addresses,
   API endpoint paths, repository URLs and database schema. A case study
   describes what was built and why — never who the client is or how to
   get into their system, unless the client has agreed to be named.

   To publish a study: fill every field with real copy and set
   `status: "published"`.
   ------------------------------------------------------------------ */

export const WORK = [
  {
    slug: "fm-android-app",
    name: "FM Android App",
    subtitle: "Community Radio Streaming Platform",
    industry: "Media & Broadcasting",
    market: "India",
    capability: "Mobile & Backend Engineering",
    year: "2026",

    summary:
      "A community radio station reaching only as far as its transmitter, now reaching listeners anywhere with an internet connection.",

    challenge:
      "The station serves its community over the air, but an FM signal stops at the edge of its transmission radius — leaving listeners who had moved away, and a diaspora spread across the Gulf and beyond, cut off from their station. The station needed to reach them without a broadcast engineer on staff, without a recurring SMS gateway bill for account verification, and without asking presenters to learn anything more complicated than the studio equipment already in front of them.",

    solution:
      "We delivered an Android application and the backend platform behind it as a single system. Listeners stream the live broadcast in real time, browse the weekly programme schedule, and talk to each other in live chat while a show is on air. The audio path runs independently of the application API, so a fault in one never silences the other — the app plays directly from a self-hosted streaming server while the API supplies only the surrounding metadata, such as the current show title and presenter. Station staff manage live programmes, schedules and accounts from an admin panel that requires no technical knowledge, with limited-permission logins for day-to-day operators.",

    approach: [
      {
        title: "Streaming that survives the studio",
        body:
          "The live audio path runs from the studio mixer through encoder software to a self-hosted Icecast2 server, entirely separate from the application API. Listeners keep hearing the broadcast even if the metadata service is interrupted.",
      },
      {
        title: "Schedule-aware live status",
        body:
          "A scheduler compares the current time against the weekly programme grid every minute, and the live-status service also performs its own real-time check on each request. The station is never reported as on air when it isn't, and never shows a stale programme between scheduler runs.",
      },
      {
        title: "Account recovery without an SMS bill",
        body:
          "Registration and sign-in use a phone number, but password recovery runs on a three-step security-question flow instead of OTP delivery. That removed an ongoing per-message cost and a common point of failure for listeners on overseas numbers.",
      },
      {
        title: "Real-time chat, offloaded",
        body:
          "Live chat runs on a managed real-time database accessed directly by the app rather than being built in-house, keeping conversation instant during broadcasts without adding load or maintenance burden to the station's own server.",
      },
      {
        title: "Built for a listener base that left",
        body:
          "Phone-number validation covers 17 countries with per-country rules, so listeners in the Gulf, Europe, North America and across Asia can register with the number they actually use.",
      },
    ],

    /* Verified from the SRS "Issues Identified and Resolved" log. These
       are real engineering problems from this build, not illustrations. */
    engineering: [
      {
        problem: "Presenter's microphone was inaudible online — listeners heard only the music.",
        fix: "Traced to studio wiring rather than software: corrected the mixer's combined output routing so the encoder captured microphone and music together.",
      },
      {
        problem: "Five to fifteen seconds of lag between live speech and what listeners heard.",
        fix: "Tuned the streaming server's buffering strategy and added seek-to-live behaviour on resume, so rejoining a stream returns to the present moment rather than replaying the buffer.",
      },
      {
        problem: "Play and pause took around five seconds to respond.",
        fix: "The player now preloads on screen open, shows a buffering state, and stays initialised across pause and resume instead of tearing down and rebuilding the connection.",
      },
      {
        problem: "Programme status lagged behind the actual clock.",
        fix: "Replaced the in-process scheduler with a system-level scheduled task plus a real-time check performed on every live-status request.",
      },
      {
        problem: "Thursday to Sunday were missing from the published schedule.",
        fix: "Default result pagination was silently truncating the weekly grid. Removed it so the full seven days are always returned.",
      },
      {
        problem: "Server clock defaulted to a European timezone.",
        fix: "Set the server explicitly to Indian Standard Time, aligning every schedule comparison with the station's actual broadcast day.",
      },
    ],

    technology: [
      "Flutter",
      "Dart",
      "Android",
      "Python",
      "Django",
      "Django REST Framework",
      "PostgreSQL",
      "Icecast2",
      "Firebase Firestore",
      "Nginx",
      "Gunicorn",
      "Ubuntu LTS",
      "Let's Encrypt SSL",
    ],

    result:
      "The app is live on the Google Play Store, carrying the station's broadcast beyond its FM radius to listeners across 17 supported countries. Live programme information stays accurate to the minute, chat runs in real time during shows, and station staff manage the entire weekly schedule themselves through the admin panel. The platform was delivered with full documentation and handed over to the client, with every service configured to restart automatically and SSL certificates renewing without intervention.",

    /* Delivered capabilities, not invented metrics (§7).
       Kept to a similar length each so the strip reads as one even row
       rather than a ragged mix of one- and two-line cells. */
    facts: [
      { k: "Platform", v: "Android (Flutter)" },
      { k: "Broadcast", v: "Live FM Radio" },
      { k: "Stream", v: "MP3 128 kbps" },
      { k: "Reach", v: "17 countries" },
      { k: "Status", v: "Live on Google Play" },
    ],

    /* Privacy posture is a genuine selling point on this build. */
    assurance: [
      "No camera, microphone, location, contacts or storage permissions requested.",
      "Passwords hashed before storage and never transmitted or stored in plain text.",
      "All API traffic served over HTTPS; session tokens held in the device keystore.",
      "Only a name and phone number collected, encrypted in transit and at rest.",
    ],

    media: [
      {
        src: "/work/fm-android-app/app-showcase.webp",
        width: 1536,
        height: 1024,
        alt:
          "Four screens from the FM Android app: the live player with today's line-up, the weekly programme schedule, the phone-number login screen, and the live chat awaiting the next broadcast.",
        caption: "Live player, weekly schedule, account access and live chat.",
      },
    ],

    status: "published",
  },
];

export const WORK_INTRO = {
  headline: "Built by Cresterix.",
  body:
    "We build digital products that solve real business problems. Explore selected projects across web platforms, business applications, mobile experiences, SaaS products and intelligent systems.",
};

/** The structure every published study must fill (§7). */
export const CASE_STUDY_FIELDS = [
  "Project Name",
  "Industry",
  "Market / Country",
  "The Challenge",
  "The Solution",
  "Technology",
  "Result",
];

export const findWork = (slug) => WORK.find((w) => w.slug === slug);

export const isPublished = (w) => w.status === "published";
