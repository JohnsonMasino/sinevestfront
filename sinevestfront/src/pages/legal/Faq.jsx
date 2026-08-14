import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useRef, useEffect } from "react";

/**
 * Sinevest — Faq
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1). Same design system: font-display
 *            (Poppins) / font-body (Inter), navy gradient + amber
 *            accent, hand-drawn SVG icon style — no icon library.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * Sections:
 *   1. FaqHeader   — intro banner, same badge/heading pattern as the
 *                    other sections.
 *   2. FaqList     — accordion of 10 common questions. Only one panel
 *                    open at a time, height/opacity animated on
 *                    expand/collapse.
 *   3. FaqSupport  — "still need help?" card pointing to the live
 *                    chat widget (bottom-right of the page) plus a
 *                    Contact Us button (-> /contact) and a Back to
 *                    Home button (-> /).
 *
 * NOTE: Answers below are intentionally neutral and avoid implying
 * guaranteed returns or specific payout figures — keep it that way
 * when you edit copy, for the same reason CREDIBILITY_STATS in
 * Homecontent1.jsx is flagged as placeholder data to verify.
 * ------------------------------------------------------------------
 */

/* ================================================================
   Shared: reveal-on-scroll wrapper (same as Homecontent1.jsx)
   ================================================================ */
function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
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
function FaqHeader() {
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
                d="M9.5 9a2.5 2.5 0 1 1 3.4 2.33c-.7.27-1.4.9-1.4 1.67v.5M12 17h.01"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            Frequently Asked Questions
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Answers to what investors
            <br className="hidden sm:block" /> ask us most
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Everything about your account, investments, and security — in
            one place. Can't find what you need? Support is a click away.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   2. FAQ data + accordion
   ================================================================ */

const FAQ_ITEMS = [
  {
    id: "what-is-sinevest",
    question: "What is Sinevest and how does it work?",
    answer:
      "Sinevest is an investment platform that gives you access to a curated range of digital assets from a single dashboard. You fund your account, choose the assets you want exposure to, and track everything — positions, transactions, and performance — in real time.",
  },
  {
    id: "is-it-safe",
    question: "Is my investment safe with Sinevest?",
    answer:
      "We use multi-layer encryption, cold storage for the majority of assets, and continuous account monitoring. That said, all investing carries risk and asset values can go up or down — we don't promise fixed or guaranteed returns, and you should only invest what you're comfortable with.",
  },
  {
    id: "open-account",
    question: "How do I open an account?",
    answer:
      "Click 'Create Your Account' on the homepage, enter your details, and verify your identity. The process takes a few minutes, and you can start exploring assets as soon as verification is confirmed.",
  },
  {
    id: "premium-migration",
    question:
      "What is Sinevest Premium, and how is it different from my old account?",
    answer:
      "Sinevest Premium is our upgraded platform — sharper tools, tighter security, and clearer reporting. If you were an existing investor, your portfolio, history, and settings were carried over automatically. You just log in with your same details; there's nothing to redo.",
  },
  {
    id: "assets",
    question: "What assets can I invest in on the platform?",
    answer:
      "You get access to a diversified selection of digital assets rather than a single coin, so you can spread exposure instead of concentrating it in one place. The full list of currently available assets is shown in your dashboard once you're logged in.",
  },
  {
    id: "withdrawals",
    question: "How do withdrawals work, and how long do they take?",
    answer:
      "Submit a withdrawal request from your dashboard and our team reviews it promptly. You'll see a clear status update at every stage, from submission to completion, so you always know where your request stands.",
  },
  {
    id: "fees",
    question: "What fees does Sinevest charge?",
    answer:
      "Fees vary by asset and transaction type and are shown up front before you confirm any action — there are no hidden charges. You can review the current fee schedule from your account settings at any time.",
  },
  {
    id: "regulated",
    question: "Is Sinevest licensed and regulated?",
    answer:
      "Yes. Sinevest operates under applicable financial regulations, with compliance built into our processes. You can view our regulatory certificate on the homepage, or reach out to support for verification details.",
  },
  {
    id: "kyc",
    question: "How do I verify my identity (KYC)?",
    answer:
      "During sign-up you'll be guided through a short identity verification flow — typically a government-issued ID and a few personal details. It's a one-time process required to keep the platform secure and compliant.",
  },
  {
    id: "contact-support",
    question: "Who do I contact if I have a problem with my account?",
    answer:
      "Our support team is reachable 24/7. Use the live chat widget in the bottom-right corner of any page for the fastest response, or reach out through the Contact page and we'll get back to you as soon as possible.",
  },
];

function ChevronIcon({ open }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      className="h-5 w-5 shrink-0 text-blue-600"
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </motion.svg>
  );
}

function FaqAccordionItem({ item, isOpen, onToggle, index }) {
  return (
    <Reveal delay={index * 0.04}>
      <div
        className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
          isOpen ? "border-blue-200 shadow-md" : "border-slate-200 shadow-sm"
        }`}
      >
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={isOpen}
          aria-controls={`faq-panel-${item.id}`}
          className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6 sm:py-5"
        >
          <span
            className={`font-display text-sm font-bold sm:text-base ${
              isOpen ? "text-blue-700" : "text-slate-900"
            }`}
          >
            {item.question}
          </span>
          <ChevronIcon open={isOpen} />
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              key="content"
              id={`faq-panel-${item.id}`}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden"
            >
              <p className="px-5 pb-5 text-sm leading-relaxed text-slate-500 sm:px-6 sm:pb-6 sm:text-[15px]">
                {item.answer}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function FaqList() {
  const [openId, setOpenId] = useState(FAQ_ITEMS[0].id);

  const handleToggle = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative bg-white pb-16 md:pb-24">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <div className="space-y-4">
          {FAQ_ITEMS.map((item, i) => (
            <FaqAccordionItem
              key={item.id}
              item={item}
              index={i}
              isOpen={openId === item.id}
              onToggle={() => handleToggle(item.id)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. Support CTA — live chat pointer + Contact + Back to Home
   ================================================================ */

function FaqSupport() {
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
                d="M18 10a6 6 0 1 0-12 0v4a2 2 0 0 0 2 2h1v-6H6v-0a6 6 0 0 1 12 0v0h-3v6h1a2 2 0 0 0 2-2Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Still need help?
          </span>

          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
            Didn't find what you were looking for?
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/70 sm:text-base">
            Click the live support chat in the bottom-right corner of this
            page for a real-time answer, or reach our team directly and
            we'll follow up as soon as possible.
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
                Contact Support
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
   Export — Faq
   ================================================================ */

export default function Faq() {
  return (
    <>
      <FaqHeader />
      <FaqList />
      <FaqSupport />
    </>
  );
}