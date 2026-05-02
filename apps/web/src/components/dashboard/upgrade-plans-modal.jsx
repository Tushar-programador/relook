import { Check, Minus, X, Zap } from "lucide-react";
import { useState } from "react";
import { api } from "../../lib/api";

/* ── plan data ─────────────────────────────────── */

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "forever",
    tagline: "Get started with zero risk",
    badge: null,
    cta: "Current plan",
    ctaDisabled: true,
    accentBg: "bg-slate-50",
    accentBorder: "border-slate-200",
    accentText: "text-slate-700",
    bullets: [
      "1 project",
      "50 responses / month",
      "Video up to 30 sec",
      "Basic iframe widget",
      "500 MB storage",
      "FeedSpace branding",
    ],
  },
  {
    key: "pro",
    name: "Pro",
    price: "₹499",
    priceSuffix: "– ₹999",
    period: "/ month",
    tagline: "No-brainer upgrade for growing brands",
    badge: "Most popular",
    cta: "Upgrade to Pro",
    ctaDisabled: false,
    accentBg: "bg-primary/5",
    accentBorder: "border-primary/30",
    accentText: "text-primary",
    bullets: [
      "3–5 projects",
      "Unlimited responses",
      "Video up to 60 sec",
      "Remove FeedSpace branding",
      "Custom colours & logo",
      "Advanced filters & search",
      "Carousel, Grid & auto-refresh widget",
      "10–20 GB storage",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: "₹1,999",
    priceSuffix: "– ₹3,999",
    period: "/ month",
    tagline: "Power users, agencies & SaaS",
    badge: null,
    cta: "Upgrade to Business",
    ctaDisabled: false,
    accentBg: "bg-violet-50",
    accentBorder: "border-violet-200",
    accentText: "text-violet-700",
    bullets: [
      "Unlimited projects",
      "Unlimited responses",
      "Video up to 120 sec",
      "AI auto-summary & sentiment analysis",
      "Highlight best testimonials",
      "Floating widget + Wall of Love page",
      "Custom CSS",
      "Full REST API access",
      "Team member seats",
      "High storage",
    ],
  },
];

const TABLE = [
  { label: "Projects",           free: "1",     pro: "3–5",      biz: "Unlimited" },
  { label: "Responses / month",  free: "50",    pro: "Unlimited",biz: "Unlimited" },
  { label: "Video length",       free: "30 s",  pro: "60 s",     biz: "120 s"     },
  { label: "Storage",            free: "500 MB",pro: "15 GB",    biz: "High"      },
  { label: "Branding removal",   free: false,   pro: true,       biz: true        },
  { label: "Widget layouts",     free: "Basic", pro: "Advanced", biz: "Advanced+" },
  { label: "Analytics",          free: false,   pro: "Basic",    biz: "Advanced"  },
  { label: "AI features",        free: false,   pro: false,      biz: true        },
  { label: "API access",         free: false,   pro: false,      biz: true        },
  { label: "Team members",       free: false,   pro: false,      biz: true        },
];

function Cell({ val }) {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (val === false) return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  return <span className="text-sm text-slate-700">{val}</span>;
}

/* ── modal ─────────────────────────────────────── */

export function UpgradePlansModal({ currentPlan = "free", onClose }) {
  const [loading, setLoading] = useState("");
  const [error, setError] = useState("");

  async function handleUpgrade(planKey) {
    setError("");
    setLoading(planKey);
    try {
      const { url } = await api.createCheckoutSession({
        plan: planKey,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/dashboard`
      });
      window.location.href = url;
    } catch (err) {
      setError(err.message);
      setLoading("");
    }
  }

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      {/* blur backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* sheet */}
      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[32px] bg-white shadow-2xl">
        {/* header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-[32px] bg-white/95 px-8 py-5 backdrop-blur border-b border-slate-100">
          <div>
            <h2 className="font-serif text-3xl">Choose your plan</h2>
            <p className="mt-0.5 text-sm text-slate-500">Start free. Upgrade when you need more.</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-8 space-y-8">
          {error && <p className="text-sm text-rose-600 -mb-4">{error}</p>}
          {/* plan cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative rounded-[24px] border p-6 ${plan.accentBg} ${plan.accentBorder} ${plan.key === "pro" ? "ring-2 ring-primary/40" : ""}`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-0.5 text-xs font-semibold text-white shadow">
                    {plan.badge}
                  </div>
                )}
                {currentPlan === plan.key && (
                  <div className="absolute -top-3 right-4 rounded-full bg-slate-800 px-3 py-0.5 text-xs font-semibold text-white">
                    Current
                  </div>
                )}

                <p className={`text-xs font-semibold uppercase tracking-[0.2em] ${plan.accentText}`}>{plan.name}</p>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="font-serif text-4xl font-semibold text-slate-900">{plan.price}</span>
                  {plan.priceSuffix && <span className="text-sm text-slate-500">{plan.priceSuffix}</span>}
                  <span className="text-xs text-slate-400 ml-1">{plan.period}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">{plan.tagline}</p>

                <ul className="mt-5 space-y-2.5">
                  {plan.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.accentText}`} />
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {plan.ctaDisabled ? (
                    <div className="rounded-full border border-slate-200 py-2 text-center text-xs text-slate-400">
                      {plan.cta}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUpgrade(plan.key)}
                      disabled={loading === plan.key}
                      className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold transition disabled:opacity-60
                        ${plan.key === "pro"
                          ? "bg-primary text-white hover:bg-primary/90"
                          : "bg-violet-600 text-white hover:bg-violet-700"
                        }`}
                    >
                      <Zap className="h-3.5 w-3.5" />
                      {loading === plan.key ? "Redirecting…" : plan.cta}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* comparison table */}
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-slate-400">Full feature comparison</p>
            <div className="overflow-x-auto rounded-[20px] border border-slate-100">
              <table className="w-full min-w-[480px] text-center">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="py-3 pl-6 pr-4 text-left text-xs font-semibold text-slate-500 w-[40%]">Feature</th>
                    <th className="py-3 px-3 text-xs font-semibold text-slate-500">Free</th>
                    <th className="py-3 px-3 text-xs font-semibold text-primary bg-primary/5">Pro</th>
                    <th className="py-3 px-3 text-xs font-semibold text-violet-700">Business</th>
                  </tr>
                </thead>
                <tbody>
                  {TABLE.map((row, i) => (
                    <tr key={row.label} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "bg-slate-50/50" : ""}`}>
                      <td className="py-3 pl-6 pr-4 text-left text-sm text-slate-600">{row.label}</td>
                      <td className="py-3 px-3"><Cell val={row.free} /></td>
                      <td className="py-3 px-3 bg-primary/5"><Cell val={row.pro} /></td>
                      <td className="py-3 px-3"><Cell val={row.biz} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* trial nudge */}
          <div className="rounded-[20px] bg-slate-950 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-white">7-day Pro trial — no card required.</p>
              <p className="text-sm text-slate-400 mt-0.5">Try every Pro feature free for a week. Cancel any time.</p>
            </div>
            <button
              type="button"
              onClick={() => handleUpgrade("pro")}
              disabled={loading === "pro"}
              className="flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition disabled:opacity-60"
            >
              <Zap className="h-4 w-4" />
              {loading === "pro" ? "Redirecting…" : "Start free trial"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
