import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Sinevest — PrivacyPolicy
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1/Faq). Same design system:
 *            font-display (Poppins) / font-body (Inter), navy
 *            gradient + amber accent, hand-drawn SVG icon style.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * IMPORTANT — READ BEFORE SHIPPING TO PRODUCTION
 * ------------------------------------------------------------------
 * This file is a structural + copy TEMPLATE covering the sections a
 * privacy policy typically needs (what's collected, why, legal basis,
 * sharing, cookies, security, retention, user rights, transfers,
 * children's privacy, changes, contact). It is NOT legal advice and
 * is not tailored to your actual data practices, jurisdiction(s), or
 * applicable law (e.g. GDPR, CCPA/CPRA, NDPR, POPIA, etc.).
 * Have qualified legal counsel review and localize this before it
 * goes live — the same way CREDIBILITY_STATS / SAMPLE_REVIEWS in
 * Homecontent1.jsx are flagged as placeholders you must replace with
 * real, verified information.
 *
 * Sections:
 *   1. PolicyHeader  — intro banner + "Last updated" date badge.
 *   2. PolicyBody    — quick in-page jump nav (horizontal pills on
 *                      mobile, sticky sidebar on desktop) + the
 *                      numbered policy sections, each revealed on
 *                      scroll with a staggered fade/slide, with the
 *                      active section highlighted as you scroll.
 *   3. PolicyContact — closing card pointing to the Contact page.
 * ------------------------------------------------------------------
 */

const LAST_UPDATED = "August 14, 2026"; // TODO: keep in sync with real edits

/* ================================================================
   Shared: reveal-on-scroll wrapper (same pattern as other pages)
   ================================================================ */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, delay, ease: [0.4, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ================================================================
   1. Header
   ================================================================ */
function PolicyHeader() {
  return (
    <section className="relative overflow-hidden bg-white pt-16 pb-10 md:pt-24 md:pb-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-72 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(#123a91 1px, transparent 1px), linear-gradient(90deg, #123a91 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative mx-auto max-w-4xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path
                d="m9 12 2 2 4-4.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Legal
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            This policy explains what information Sinevest collects, why we
            collect it, how it's used and protected, and the choices and
            rights you have over your data.
          </p>

          <span className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-1.5 text-xs font-medium text-slate-500">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-blue-600">
              <path
                d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Last updated: {LAST_UPDATED}
          </span>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   2. Policy content — nav + numbered sections
   ================================================================ */

const POLICY_SECTIONS = [
  {
    id: "introduction",
    title: "1. Introduction",
    icon: (
      <path
        d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z M9 12l2 2 4-4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "Sinevest (\"Sinevest\", \"we\", \"us\", or \"our\") provides an investment platform that lets users access and manage a range of digital assets. This Privacy Policy describes how we collect, use, disclose, and safeguard information when you visit our website, create an account, or otherwise use our services (collectively, the \"Services\").",
      "By using the Services, you agree to the collection and use of information in accordance with this policy. If you do not agree with any part of this policy, please do not use the Services.",
    ],
  },
  {
    id: "information-we-collect",
    title: "2. Information We Collect",
    icon: (
      <path
        d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z M12 9v6M9 12h6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: ["We collect information in the following categories:"],
    list: [
      "Account information — name, email address, phone number, date of birth, password, and country of residence provided when you register.",
      "Identity verification (KYC) information — government-issued ID, proof of address, and other documentation required to verify your identity and comply with anti-money-laundering (AML) obligations.",
      "Financial information — deposit and withdrawal records, transaction history, and wallet or payment details necessary to process your investments.",
      "Usage and device information — IP address, browser type, device identifiers, operating system, pages viewed, and timestamps, collected automatically as you use the Services.",
      "Cookies and similar technologies — see the dedicated Cookies section below.",
      "Communications — records of correspondence when you contact support, live chat, or otherwise communicate with us.",
    ],
  },
  {
    id: "how-we-use",
    title: "3. How We Use Your Information",
    icon: (
      <path
        d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h1v-6H6v-0a6 6 0 0 1 12 0v0h-3v6h1a2 2 0 0 0 2-2Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: ["We use the information we collect to:"],
    list: [
      "Create, maintain, and secure your account.",
      "Verify your identity and screen for fraud, money laundering, or other prohibited activity.",
      "Process transactions, deposits, and withdrawals.",
      "Provide customer support and respond to your requests.",
      "Send important notices, security alerts, and service updates.",
      "Improve, personalize, and troubleshoot the Services.",
      "Comply with legal, regulatory, and reporting obligations.",
    ],
  },
  {
    id: "legal-basis",
    title: "4. Legal Basis for Processing",
    icon: (
      <path
        d="m12 2 8 3v6c0 5-3.4 8.6-8 11-4.6-2.4-8-6-8-11V5l8-3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "Where applicable law requires a legal basis for processing personal data, we rely on one or more of the following: performance of a contract with you (e.g. operating your account), compliance with a legal obligation (e.g. KYC/AML checks), our legitimate interests (e.g. platform security and fraud prevention), and, where required, your consent (e.g. certain marketing communications or non-essential cookies).",
    ],
  },
  {
    id: "sharing",
    title: "5. How We Share Information",
    icon: (
      <path
        d="M16 14a4 4 0 1 0-4-4 M8 21v-2a4 4 0 0 1 4-4h1 M17 21v-2a4 4 0 0 0-3-3.87 M12 7a4 4 0 1 1-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: ["We do not sell your personal information. We may share information with:"],
    list: [
      "Service providers — identity verification vendors, payment processors, cloud hosting, analytics, and customer support tools, bound by confidentiality and data-protection obligations.",
      "Regulators and authorities — where required to comply with law, respond to lawful requests, or meet AML/KYC and financial-reporting obligations.",
      "Professional advisors — auditors, lawyers, and insurers, as necessary.",
      "Business transfers — in connection with a merger, acquisition, or sale of assets, subject to continued protection of your information.",
      "With your consent — for any other purpose we disclose to you at the time of collection.",
    ],
  },
  {
    id: "cookies",
    title: "6. Cookies & Tracking Technologies",
    icon: (
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18M12 3c2.5 2.6 3.8 5.7 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.7-3.8-9S9.5 5.6 12 3Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "We use cookies and similar technologies to keep you signed in, remember preferences, understand how the Services are used, and improve performance. These generally fall into three categories: strictly necessary (required for core functionality), performance/analytics (help us understand usage), and preference cookies (remember your settings).",
      "You can control cookies through your browser settings. Disabling certain cookies may affect the functionality of the Services.",
    ],
  },
  {
    id: "security",
    title: "7. Data Security",
    icon: (
      <path
        d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z M9 12l2 2 4-4.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "We apply administrative, technical, and physical safeguards designed to protect your information, including encryption in transit and at rest, access controls, and continuous monitoring. However, no method of transmission or storage is 100% secure, and we cannot guarantee absolute security. You should also take steps to protect your account, such as using a strong, unique password and enabling any available multi-factor authentication.",
    ],
  },
  {
    id: "retention",
    title: "8. Data Retention",
    icon: (
      <path
        d="M7 3v3M17 3v3M4 8h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "We retain personal information for as long as your account is active or as needed to provide the Services, comply with legal and regulatory obligations (including AML/KYC record-keeping requirements), resolve disputes, and enforce our agreements. When information is no longer needed, we securely delete or anonymize it.",
    ],
  },
  {
    id: "your-rights",
    title: "9. Your Rights & Choices",
    icon: (
      <path
        d="m5 13 4 4L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "Depending on your location, you may have the right to access, correct, update, or request deletion of your personal information; object to or restrict certain processing; request a portable copy of your data; and withdraw consent where processing is based on consent. Some of these rights may be limited where we have an overriding legal or regulatory obligation to retain information (for example, AML/KYC records).",
      "To exercise any of these rights, contact us using the details in the Contact Us section below. We may need to verify your identity before fulfilling your request.",
    ],
  },
  {
    id: "transfers",
    title: "10. International Data Transfers",
    icon: (
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM3 12h18"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "Your information may be transferred to, stored, and processed in countries other than your own, including countries that may have different data-protection laws. Where we transfer information internationally, we take steps intended to ensure it receives an adequate level of protection, consistent with applicable law.",
    ],
  },
  {
    id: "children",
    title: "11. Children's Privacy",
    icon: (
      <path
        d="M16 14a4 4 0 1 0-4-4 M8 21v-2a4 4 0 0 1 4-4h1 M17 21v-2a4 4 0 0 0-3-3.87 M12 7a4 4 0 1 1-4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "The Services are not directed to, and are not intended for use by, anyone under the age of 18. We do not knowingly collect personal information from minors. If we become aware that we have collected information from a minor, we will take steps to delete it promptly. If you believe a minor has provided us with personal information, please contact us.",
    ],
  },
  {
    id: "third-party-links",
    title: "12. Third-Party Links",
    icon: (
      <path
        d="M4 19V10M10 19V5M16 19v-7M22 19H2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "The Services may contain links to third-party websites or services that we do not own or control. This Privacy Policy does not apply to those third parties, and we encourage you to review their privacy policies before providing any information to them.",
    ],
  },
  {
    id: "changes",
    title: "13. Changes to This Policy",
    icon: (
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    ),
    body: [
      "We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will post the revised policy on this page with an updated \"Last updated\" date, and, where required, provide additional notice (such as an in-app or email notification). Your continued use of the Services after changes take effect constitutes acceptance of the revised policy.",
    ],
  },
  {
    id: "contact",
    title: "14. Contact Us",
    icon: (
      <path
        d="M3 6h18v12H3z M3 7l9 6 9-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "If you have questions, concerns, or requests regarding this Privacy Policy or how we handle your information, reach out to our support team via the live chat widget in the bottom-right corner of any page, email us at support@sinevest.com, or use the Contact page.",
    ],
  },
];

function PolicyNav({ activeId }) {
  return (
    <>
      {/* Mobile: horizontal scroll pill nav */}
      <div className="lg:hidden">
        <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {POLICY_SECTIONS.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                activeId === s.id
                  ? "border-blue-600 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-white text-slate-500 hover:border-blue-200 hover:text-blue-700"
              }`}
            >
              {s.title}
            </a>
          ))}
        </div>
      </div>

      {/* Desktop: sticky sidebar nav */}
      <nav
        aria-label="Privacy policy sections"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] shrink-0 overflow-y-auto lg:block lg:w-64"
      >
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          On this page
        </p>
        <ul className="mt-3 space-y-0.5 border-l border-slate-200">
          {POLICY_SECTIONS.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`block border-l-2 px-4 py-1.5 text-sm transition-colors ${
                  activeId === s.id
                    ? "-ml-px border-blue-600 font-semibold text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}

function PolicySection({ section, index }) {
  return (
    <Reveal delay={Math.min(index * 0.04, 0.3)}>
      <div
        id={section.id}
        className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {section.icon}
            </svg>
          </span>
          <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
            {section.title}
          </h2>
        </div>

        <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-600 sm:text-[15px]">
          {section.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
          {section.list && (
            <ul className="space-y-2.5 pt-1">
              {section.list.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500">
                    <path
                      d="m5 13 4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Reveal>
  );
}

function PolicyBody() {
  const [activeId, setActiveId] = useState(POLICY_SECTIONS[0].id);

  useEffect(() => {
    const elements = POLICY_SECTIONS
      .map((s) => document.getElementById(s.id))
      .filter(Boolean);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="relative bg-slate-50 py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-5 md:px-8">
        <div className="mb-8">
          <PolicyNav activeId={activeId} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="hidden lg:block">
            <PolicyNav activeId={activeId} />
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            {POLICY_SECTIONS.map((section, i) => (
              <PolicySection key={section.id} section={section} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. Closing contact card
   ================================================================ */
function PolicyContact() {
  return (
    <section
      style={{
        background:
          "linear-gradient(175deg, #123a91 0%, #0f2557 45%, #0a1930 100%)",
      }}
      className="relative overflow-hidden py-16 text-blue-100 md:py-24"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-blue-500/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-amber-400/10 blur-3xl"
      />

      <div className="relative mx-auto max-w-2xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-100/70">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 text-amber-400">
              <path
                d="M3 6h18v12H3z M3 7l9 6 9-6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
            Questions about this policy?
          </span>

          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
            We're happy to walk you through it
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/70 sm:text-base">
            Reach our team directly, or use the live support chat in the
            bottom-right corner of this page for a quicker response.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link to="/contact" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-amber-400 px-7 py-3.5 text-sm font-bold text-slate-900 shadow-lg shadow-amber-400/25 transition-shadow hover:shadow-xl hover:shadow-amber-400/35 sm:w-auto"
              >
                Contact Us
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                  <path
                    d="M5 12h14M13 6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </motion.button>
            </Link>

            <Link to="/" className="w-full sm:w-auto">
              <motion.button
                type="button"
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/15 sm:w-auto"
              >
                Back to Homepage
              </motion.button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   Export — PrivacyPolicy
   ================================================================ */

export default function PrivacyPolicy() {
  return (
    <>
      <PolicyHeader />
      <PolicyBody />
      <PolicyContact />
    </>
  );
}