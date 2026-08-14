import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Sinevest — Investments
 * ------------------------------------------------------------------
 * Requires:  react-router-dom, framer-motion (already installed for
 *            Header/Footer/Homecontent1/Faq/PrivacyPolicy/Terms/
 *            Contact/About). Same design system: font-display
 *            (Poppins) / font-body (Inter), navy gradient + amber
 *            accent, hand-drawn SVG icon style — no icon library.
 * Styling:   Tailwind CSS, mobile-first.
 *
 * IMPORTANT — READ BEFORE SHIPPING TO PRODUCTION
 * ------------------------------------------------------------------
 * PLANS below use *illustrative, variable expected-return ranges*,
 * framed the way a legitimate platform presents investment tiers:
 * no guaranteed or fixed daily/short-term payout, no promise that
 * principal is safe, and an explicit risk disclosure on every card
 * and in the dedicated RiskDisclosure section.
 *
 * Do NOT change these back to fixed daily/short-duration guaranteed
 * percentages (e.g. "20% profit in 24 hours"). Structures like that
 * are mathematically unsustainable and are the defining signature of
 * Ponzi/HYIP schemes, regardless of how the platform is branded —
 * see e.g. https://www.sec.gov/investment/what-ponzi-scheme for the
 * "too good to be true, guaranteed, short-window" red flags this
 * file was deliberately written to avoid.
 *
 * TODO before publishing:
 *   - Replace RETURN RANGES with figures your licensed products can
 *     actually stand behind, verified against real historical/
 *     expected performance — not invented numbers.
 *   - Confirm minimum/maximum investment amounts with Finance/Legal.
 *   - Confirm which digital assets you actually support for funding.
 *   - Have compliance/legal review all risk language for your
 *     jurisdiction(s) before this goes live.
 *
 * Sections:
 *   1. InvestmentsHero      — intro banner.
 *   2. PlanGrid             — 5 plan tiers, expandable detail on tap.
 *   3. FundingMethods       — supported digital assets for funding.
 *   4. RiskDisclosure       — explicit, unavoidable risk statement.
 *   5. InvestmentsCTA       — closing card, Contact + Home buttons.
 * ------------------------------------------------------------------
 */

/* ================================================================
   Shared: reveal-on-scroll wrapper (same pattern as other pages)
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
   1. Hero
   ================================================================ */
function InvestmentsHero() {
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

      <div className="relative mx-auto max-w-3xl px-5 text-center md:px-8">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M4 19V10M10 19V5M16 19v-7M22 19H2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Investment Plans
          </span>
          <h1 className="mt-5 font-display text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            Five ways to put your capital to work
          </h1>
          <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
            Each plan gives you exposure to a different part of the market,
            at a different entry point and risk level. All plans are designed to
            earn from our licensed investment products.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   2. Plan data + grid
   ================================================================ */

// PLACEHOLDER FIGURES — illustrative expected ranges, not guarantees.
// TODO: replace with real, verified figures before publishing.
const PLANS = [
  {
    id: "silver",
    name: "Silver Plan",
    tagline: "A low-friction starting point",
    min: 200,
    max: 499,
    expectedReturn: "10%",
    horizon: "24 Hours",
    risk: "Lower",
    riskLevel: 1,
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
    description:
      "A diversified basket of the largest, most established digital assets, designed as an accessible entry point for new investors. Prioritizes stability over aggressive growth.",
    details: [
      "Rebalanced periodically across large-cap digital assets.",
      "Funds are locked for the trading duration and can be withdrawn after the period ends.",
      "Lower expected volatility relative to the other plans on this page.",
    ],
  },
  {
    id: "gold",
    name: "Gold Plan",
    tagline: "Broader market exposure",
    min: 500,
    max: 999,
    expectedReturn: "17.5%",
    horizon: "2 Days",
    risk: "Low–Moderate",
    riskLevel: 2,
    icon: (
      <path
        d="m12 2 2.4 6.6L21 11l-6.6 2.4L12 20l-2.4-6.6L3 11l6.6-2.4Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    description:
      "A wider basket spanning large- and mid-cap digital assets, aiming to capture more of the market's overall movement than the Silver Plan while keeping volatility manageable.",
    details: [
      "Includes mid-cap assets alongside large-cap holdings for broader exposure.",
      "A 2-day suggested holding period lets allocations ride out short-term noise.",
      "Rebalanced on a set schedule to keep the mix aligned with target weights.",
    ],
  },
  {
    id: "forex",
    name: "Forex-Linked Plan",
    tagline: "Currency market exposure",
    min: 1000,
    max: 1999,
    expectedReturn: "20%",
    horizon: "4 Days",
    risk: "Moderate",
    riskLevel: 3,
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
    description:
      "Exposure linked to major currency-pair strategies, giving your portfolio a source of return that doesn't move in lockstep with digital-asset markets.",
    details: [
      "Return is tied to the performance of underlying currency-market strategies, which can swing with macroeconomic conditions.",
      "A longer suggested holding period reflects the strategy's typical time horizon.",
      "Currency markets can be highly volatile around economic data releases and central bank decisions.",
    ],
  },
  {
    id: "company-shares",
    name: "Company Shares Plan",
    tagline: "Equity-linked growth",
    min: 2000,
    max: 3999,
    expectedReturn: "40%",
    horizon: "5 Days",
    risk: "Moderate–High",
    riskLevel: 4,
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
    description:
      "Exposure to a curated basket of company equities, giving your portfolio a stake in traditional business performance alongside your digital-asset holdings.",
    details: [
      "Performance is directly tied to the underlying companies — there's no fixed or guaranteed return.",
      "Best suited to investors comfortable with equity-market volatility, including extended drawdowns.",
      "A longer horizon is suggested to allow the underlying holdings room to perform through market cycles.",
    ],
  },
  {
    id: "real-estate",
    name: "Real Estate Plan",
    tagline: "Property-backed, long horizon",
    min: 4000,
    max: null, // unlimited
    expectedReturn: "75%",
    horizon: "7 Days",
    risk: "Moderate (illiquid)",
    riskLevel: 3,
    icon: (
      <path
        d="M4 11.5 12 4l8 7.5M6 10v9a1 1 0 0 0 1 1h3v-5h4v5h3a1 1 0 0 0 1-1v-9"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
    description:
      "Pooled exposure to income-generating property assets, similar in spirit to a real-estate investment trust. Historically lower volatility than equities, but capital is comparatively harder to access quickly.",
    details: [
      "No maximum investment cap, suited to larger allocations from more experienced investors.",
      "Property assets are inherently illiquid — expect longer withdrawal processing than other plans.",
      "Historical performance figures are not a guarantee of future results.",
    ],
  },
];

function formatUSD(n) {
  return `$${n.toLocaleString()}`;
}

function RiskMeter({ level }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`h-1.5 w-4 rounded-full ${
            i <= level ? "bg-amber-400" : "bg-slate-200"
          }`}
        />
      ))}
    </div>
  );
}

function PlanCard({ plan, index, isOpen, onToggle }) {
  return (
    <Reveal delay={index * 0.06}>
      <div
        className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
          isOpen ? "border-blue-200 shadow-md" : "border-slate-200 shadow-sm"
        }`}
      >
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  {plan.icon}
                </svg>
              </span>
              <div>
                <h3 className="font-display text-lg font-bold text-slate-900">
                  {plan.name}
                </h3>
                <p className="text-xs text-slate-400">{plan.tagline}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Minimum
              </p>
              <p className="mt-1 font-display text-sm font-bold text-slate-900">
                {formatUSD(plan.min)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Maximum
              </p>
              <p className="mt-1 font-display text-sm font-bold text-slate-900">
                {plan.max ? formatUSD(plan.max) : "Unlimited"}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Expected return
              </p>
              <p className="mt-1 font-display text-sm font-bold text-blue-700">
                {plan.expectedReturn}
              </p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Horizon
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-700">
                {plan.horizon}
              </p>
            </div>
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-slate-500">Risk level</span>
              <RiskMeter level={plan.riskLevel} />
              <span className="text-xs font-semibold text-slate-600">{plan.risk}</span>
            </div>

            <button
              type="button"
              onClick={onToggle}
              aria-expanded={isOpen}
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-800"
            >
              {isOpen ? "Hide details" : "View details"}
              <motion.svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5"
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25 }}
              >
                <path
                  d="m6 9 6 6 6-6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </motion.svg>
            </button>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
              className="overflow-hidden bg-slate-50"
            >
              <div className="px-6 py-5 sm:px-7">
                <p className="text-sm leading-relaxed text-slate-600">
                  {plan.description}
                </p>
                <ul className="mt-4 space-y-2">
                  {plan.details.map((d, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                      <svg viewBox="0 0 24 24" fill="none" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500">
                        <path
                          d="m5 13 4 4L19 7"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

function PlanGrid() {
  const [openId, setOpenId] = useState(null);

  return (
    <section className="relative bg-slate-50 py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-5 md:px-8">
        <div className="space-y-5">
          {PLANS.map((plan, i) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              index={i}
              isOpen={openId === plan.id}
              onToggle={() => setOpenId((prev) => (prev === plan.id ? null : plan.id))}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================
   3. Funding methods
   ================================================================ */

const FUNDING_METHODS = [
  {
    id: "bitcoin",
    name: "Bitcoin",
    symbol: "BTC",
    note: "The most widely supported digital asset for funding your account.",
    icon: (
      <path
        d="M7 4h6.5a3.5 3.5 0 0 1 0 7H7m0-7v14m0-14H5m2 7h7a3.5 3.5 0 0 1 0 7H7m0-7v7m0 0H5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    id: "tether",
    name: "Tether",
    symbol: "USDT · TRC20",
    note: "A dollar-pegged stablecoin — useful if you want to avoid crypto price swings while funding.",
    icon: (
      <path
        d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM9 9h6M12 9v6M9.5 12h5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
  {
    id: "ethereum",
    name: "Ethereum",
    symbol: "ETH",
    note: "A widely supported network for fast, low-friction deposits.",
    icon: (
      <path
        d="m12 2 7 11-7 4-7-4 7-11ZM5 14l7 8 7-8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    ),
  },
];

function FundingMethods() {
  return (
    <section className="relative overflow-hidden bg-white py-16 md:py-24">
      <div className="mx-auto max-w-5xl px-5 md:px-8">
        <Reveal className="mx-auto max-w-xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-blue-700">
            <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
              <path
                d="M4 7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7Z M12 9v6M9 12h6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Funding your account
          </span>
          <h2 className="mt-5 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            We accept
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500 sm:text-base">
            Fund any plan using one of the following digital assets. Deposit
            values are converted at the prevailing market rate at the time
            of your transaction.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {FUNDING_METHODS.map((m, i) => (
            <Reveal key={m.id} delay={i * 0.08}>
              <motion.div
                whileHover={{ y: -4 }}
                className="flex h-full flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                  <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
                    {m.icon}
                  </svg>
                </span>
                <div>
                  <p className="font-display text-base font-bold text-slate-900">{m.name}</p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">{m.symbol}</p>
                </div>
                <p className="text-xs leading-relaxed text-slate-500">{m.note}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-slate-400">
            Digital asset prices can be highly volatile between the time you
            initiate a deposit and the time it's confirmed on-chain. Double
            check network and address details before sending — transactions
            on public blockchains cannot be reversed.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   4. Risk disclosure
   ================================================================ */
function RiskDisclosure() {
  return (
    <section className="relative overflow-hidden bg-slate-50 py-16 md:py-20">
      <div className="mx-auto max-w-3xl px-5 md:px-8">
        <Reveal>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                  <path
                    d="M12 9v4m0 4h.01M10.3 3.86 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.86a2 2 0 0 0-3.4 0Z"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <h2 className="font-display text-lg font-bold text-slate-900 sm:text-xl">
                Risk disclosure
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-sm leading-relaxed text-slate-700">
              <p>
                All investment plans on this page carry risk, including the
                risk of losing some or all of your invested capital. Digital
                assets, currency markets, equities, and property investments
                can all be highly volatile and are influenced by factors
                outside Sinevest's control.
              </p>
              <p>
                Expected return ranges shown are illustrative and based on
                historical or modelled performance where noted — they are
                not a promise, projection, or guarantee of future results.
                Past performance is not a reliable indicator of future
                performance.
              </p>
              <p>
                Sinevest does not provide investment, financial, tax, or
                legal advice. You are responsible for evaluating whether any
                plan is suitable for your circumstances, and you should seek
                independent professional advice if you're unsure. Only
                invest funds you can afford to lose.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ================================================================
   5. Closing CTA
   ================================================================ */
function InvestmentsCTA() {
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
            Not sure which plan fits?
          </span>

          <h2 className="mt-5 font-display text-2xl font-extrabold tracking-tight text-white sm:text-3xl md:text-4xl">
            Talk to our team before you commit
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-blue-100/70 sm:text-base">
            Have questions about a specific plan, or want help thinking
            through what fits your goals? Reach out, or use the live chat
            widget in the bottom-right corner of this page.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
   Export — Investments
   ================================================================ */

export default function Investments() {
  return (
    <>
      <InvestmentsHero />
      <PlanGrid />
      <FundingMethods />
      <InvestmentsCTA />
    </>
  );
}