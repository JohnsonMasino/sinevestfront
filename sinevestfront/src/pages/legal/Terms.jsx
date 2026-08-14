import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Sinevest — TermsConditions
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1/Faq/PrivacyPolicy). Same
 *            design system: font-display (Poppins) / font-body
 *            (Inter), navy gradient + amber accent, hand-drawn SVG
 *            icon style. Structurally mirrors PrivacyPolicy.jsx.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * IMPORTANT — READ BEFORE SHIPPING TO PRODUCTION
 * ------------------------------------------------------------------
 * This file is a structural + copy TEMPLATE covering the sections a
 * Terms & Conditions document for an investment platform typically
 * needs (eligibility, account security, investment risk disclosures,
 * fees, KYC/AML, prohibited activity, liability, dispute resolution,
 * termination, governing law, etc.). It is NOT legal advice and is
 * not tailored to your actual business structure, licensing,
 * jurisdiction(s), or applicable financial regulation.
 * Have qualified legal counsel review and localize this — especially
 * the risk disclosures, liability, and governing-law sections —
 * before it goes live. Same caution as CREDIBILITY_STATS /
 * SAMPLE_REVIEWS in Homecontent1.jsx: don't publish invented or
 * unreviewed claims dressed up as binding legal terms.
 *
 * Sections:
 *   1. TermsHeader  — intro banner + "Last updated" date badge.
 *   2. TermsBody    — quick in-page jump nav (horizontal pills on
 *                     mobile, sticky sidebar on desktop) + the
 *                     numbered terms sections, each revealed on
 *                     scroll with a staggered fade/slide, with the
 *                     active section highlighted as you scroll.
 *   3. TermsContact — closing card pointing to the Contact page.
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
function TermsHeader() {
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
                d="M4 7a2 2 0 0 1 2-2h8l4 4v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
              <path d="M14 5v4h4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M8 13h8M8 17h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Legal
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Terms &amp; Conditions
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            These Terms govern your access to and use of Sinevest. Please
            read them carefully — by creating an account or using our
            Services, you agree to be bound by them.
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
   2. Terms content — nav + numbered sections
   ================================================================ */

const TERMS_SECTIONS = [
  {
    id: "acceptance",
    title: "1. Acceptance of Terms",
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
      "These Terms & Conditions (\"Terms\") form a binding agreement between you and Sinevest (\"Sinevest\", \"we\", \"us\", or \"our\") governing your access to and use of our website, applications, and investment services (collectively, the \"Services\").",
      "By creating an account, clicking to accept, or otherwise accessing or using the Services, you confirm that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, you must not access or use the Services.",
    ],
  },
  {
    id: "eligibility",
    title: "2. Eligibility",
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
      "To use the Services, you must be at least 18 years old, have the legal capacity to enter into a binding contract, and not be barred from using the Services under the laws of your jurisdiction or any applicable sanctions or watch lists. We may request information to verify your eligibility and may refuse, suspend, or terminate access if eligibility requirements are not met.",
    ],
  },
  {
    id: "account",
    title: "3. Account Registration & Security",
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
    body: [
      "You agree to provide accurate, current, and complete information when creating an account, and to keep that information up to date. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.",
    ],
    list: [
      "Notify us immediately at support@sinevest.com if you suspect unauthorized access to your account.",
      "Do not share your password, verification codes, or account access with anyone else.",
      "We are not liable for losses arising from your failure to safeguard your account credentials.",
    ],
  },
  {
    id: "kyc",
    title: "4. Identity Verification & Compliance",
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
      "Use of the Services requires completion of identity verification (KYC) and may be subject to ongoing anti-money-laundering (AML) and counter-terrorist-financing (CTF) checks, in line with applicable regulation. We may request additional documentation at any time, restrict functionality until verification is complete, and report information to competent authorities where legally required.",
    ],
  },
  {
    id: "services",
    title: "5. Description of Services",
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
      "Sinevest provides a platform through which you can access, hold, and manage a range of digital assets. We may add, modify, suspend, or discontinue any feature, asset offering, or part of the Services at any time, with or without notice, for reasons including regulatory requirements, security, or operational need.",
    ],
  },
  {
    id: "risk",
    title: "6. Investment Risk Disclosure",
    icon: (
      <path
        d="M12 9v4m0 4h.01M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "Digital asset investing carries significant risk, including price volatility, potential loss of some or all of your invested capital, regulatory changes, and technology risk. Past performance of any asset is not indicative of future results.",
      "Sinevest does not provide investment, financial, tax, or legal advice, and nothing on the platform should be interpreted as a recommendation or guarantee of returns. You are solely responsible for evaluating the merits and risks of any investment decision, and you should seek independent professional advice where appropriate.",
    ],
  },
  {
    id: "fees",
    title: "7. Fees, Deposits & Withdrawals",
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
    body: [
      "Applicable fees for deposits, withdrawals, and transactions are disclosed within the platform before you confirm any action, and may change from time to time. Withdrawal requests are subject to review, standard processing times, and may be delayed or declined where required for security, compliance, or verification purposes. You are responsible for ensuring withdrawal details you provide are accurate — Sinevest is not liable for funds sent to an incorrect destination you supplied.",
    ],
  },
  {
    id: "prohibited",
    title: "8. Prohibited Activities",
    icon: (
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM4.9 4.9l14.2 14.2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
    ),
    body: ["When using the Services, you agree not to:"],
    list: [
      "Provide false, misleading, or fraudulent information during registration or verification.",
      "Use the Services for money laundering, terrorist financing, or any other illegal activity.",
      "Attempt to gain unauthorized access to any account, system, or network related to the Services.",
      "Interfere with, disrupt, or place undue load on the platform's infrastructure.",
      "Use automated tools (bots, scrapers) to access the Services without our written permission.",
      "Circumvent, disable, or otherwise interfere with security-related features of the Services.",
    ],
  },
  {
    id: "ip",
    title: "9. Intellectual Property",
    icon: (
      <path
        d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "The Services, including all content, branding, software, and design, are owned by Sinevest or our licensors and are protected by intellectual property laws. We grant you a limited, non-exclusive, non-transferable license to access and use the Services for their intended purpose. You may not copy, modify, distribute, or create derivative works from any part of the Services without our prior written consent.",
    ],
  },
  {
    id: "third-party-links",
    title: "10. Third-Party Links & Services",
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
      "The Services may link to or integrate with third-party websites, tools, or services that we do not control. We are not responsible for the content, accuracy, or practices of any third party, and your use of third-party services is at your own risk and subject to their own terms.",
    ],
  },
  {
    id: "liability",
    title: "11. Limitation of Liability",
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
      "To the maximum extent permitted by applicable law, Sinevest and its officers, employees, and affiliates will not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or investment value, arising from your use of, or inability to use, the Services — including losses resulting from market volatility, third-party actions, or events outside our reasonable control.",
      "Nothing in these Terms excludes or limits liability that cannot be excluded or limited under applicable law.",
    ],
  },
  {
    id: "indemnification",
    title: "12. Indemnification",
    icon: (
      <path
        d="M12 21s7-6.1 7-11a7 7 0 1 0-14 0c0 4.9 7 11 7 11Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    body: [
      "You agree to indemnify and hold harmless Sinevest, its officers, employees, and affiliates from any claims, damages, liabilities, and expenses (including reasonable legal fees) arising from your use of the Services, your violation of these Terms, or your violation of any rights of a third party.",
    ],
  },
  {
    id: "termination",
    title: "13. Suspension & Termination",
    icon: (
      <path
        d="M6 6l12 12M18 6 6 18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
    ),
    body: [
      "We may suspend or terminate your access to the Services at any time, with or without notice, where we reasonably believe you have violated these Terms, engaged in prohibited activity, or where required by law or regulatory direction. You may close your account at any time by contacting support, subject to completion of any pending transactions, verification, or regulatory obligations.",
    ],
  },
  {
    id: "disputes",
    title: "14. Dispute Resolution & Governing Law",
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
      "We encourage you to contact our support team first to resolve any dispute informally. These Terms are governed by the laws of the jurisdiction in which Sinevest is registered, without regard to conflict-of-law principles, and any disputes not resolved informally will be subject to the courts or arbitration mechanism specified by that governing law.",
      "TODO: Insert your actual governing jurisdiction and, if applicable, arbitration body/rules once confirmed with legal counsel.",
    ],
  },
  {
    id: "changes",
    title: "15. Changes to These Terms",
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
      "We may update these Terms from time to time to reflect changes in our Services, legal requirements, or business practices. We will post the revised Terms on this page with an updated \"Last updated\" date and, where required, provide additional notice. Your continued use of the Services after changes take effect constitutes acceptance of the revised Terms.",
    ],
  },
  {
    id: "contact",
    title: "16. Contact Us",
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
      "If you have questions about these Terms, reach out to our support team via the live chat widget in the bottom-right corner of any page, email us at support@sinevest.com, or use the Contact page.",
    ],
  },
];

function TermsNav({ activeId }) {
  return (
    <>
      {/* Mobile: horizontal scroll pill nav */}
      <div className="lg:hidden">
        <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-2">
          {TERMS_SECTIONS.map((s) => (
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
        aria-label="Terms & conditions sections"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] shrink-0 overflow-y-auto lg:block lg:w-64"
      >
        <p className="px-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
          On this page
        </p>
        <ul className="mt-3 space-y-0.5 border-l border-slate-200">
          {TERMS_SECTIONS.map((s) => (
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

function TermsSection({ section, index }) {
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

function TermsBody() {
  const [activeId, setActiveId] = useState(TERMS_SECTIONS[0].id);

  useEffect(() => {
    const elements = TERMS_SECTIONS
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
          <TermsNav activeId={activeId} />
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
          <div className="hidden lg:block">
            <TermsNav activeId={activeId} />
          </div>

          <div className="min-w-0 flex-1 space-y-5">
            {TERMS_SECTIONS.map((section, i) => (
              <TermsSection key={section.id} section={section} index={i} />
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
function TermsContact() {
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
            Questions about these Terms?
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
   Export — TermsConditions
   ================================================================ */

export default function TermsConditions() {
  return (
    <>
      <TermsHeader />
      <TermsBody />
      <TermsContact />
    </>
  );
}