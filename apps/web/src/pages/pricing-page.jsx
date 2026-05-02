import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, HelpCircle, Minus, Sparkles, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { api } from "../lib/api";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────── data ── */
const plans = [
  {
    name: "Free",
    monthly: 0,
    yearly: 0,
    badge: null,
    description: "For early-stage brands validating the workflow.",
    cta: "Get started free",
    features: [
      "50 feedback submissions / month",
      "Basic moderation dashboard",
      "Iframe embed widget",
      "Text, audio & video capture",
      "Public collection page",
      null,
      null
    ]
  },
  {
    name: "Pro",
    monthly: 29,
    yearly: 19,
    badge: "Most popular",
    description: "For teams that want unlimited proof collection and brand control.",
    cta: "Start Pro trial",
    features: [
      "Unlimited submissions",
      "Advanced moderation inbox",
      "Custom branding & domain",
      "Priority support",
      "Advanced widget options",
      "Link & response analytics",
      null
    ]
  },
  {
    name: "Business",
    monthly: 99,
    yearly: 69,
    badge: "Best value",
    description: "For larger brands and agencies managing multiple proof channels.",
    cta: "Talk to sales",
    features: [
      "Everything in Pro",
      "API access",
      "Multi-brand workspaces",
      "White-label portal",
      "Dedicated onboarding",
      "SLA & uptime guarantee",
      "Custom limits"
    ]
  }
];

const comparison = [
  { label: "Submissions / month",        free: "50",       pro: "Unlimited",  biz: "Unlimited" },
  { label: "Video & audio capture",      free: true,       pro: true,         biz: true },
  { label: "Moderation inbox",           free: "Basic",    pro: "Advanced",   biz: "Advanced" },
  { label: "Custom branding",            free: false,      pro: true,         biz: true },
  { label: "Analytics",                  free: false,      pro: true,         biz: true },
  { label: "API access",                 free: false,      pro: false,        biz: true },
  { label: "Multi-brand workspaces",     free: false,      pro: false,        biz: true },
  { label: "White-label portal",         free: false,      pro: false,        biz: true },
  { label: "Priority / dedicated support", free: false,   pro: "Priority",   biz: "Dedicated" },
];

const faqs = [
  { q: "Is there a free trial on paid plans?",  a: "Yes — Pro comes with a 14-day free trial, no credit card required." },
  { q: "Can I switch plans at any time?",       a: "Absolutely. Upgrades are immediate; downgrades apply at the next billing cycle." },
  { q: "What happens if I exceed my limit?",    a: "We'll notify you before we pause collection — you'll never lose submitted data." },
  { q: "Do you offer refunds?",                 a: "Yes, within 7 days of payment for any paid plan, no questions asked." },
  { q: "Is there a startup discount?",          a: "Yes — email us and mention your early-stage status. We'll sort you out." }
];

/* ─────────────────────────────── helpers ── */
function CellVal({ val }) {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (val === false) return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  return <span className="text-sm text-slate-700">{val}</span>;
}

/* ─────────────────────────────── cursor glow ── */
function CursorGlow() {
  const glowRef = useRef(null);

  useEffect(() => {
    const el = glowRef.current;
    if (!el) return;

    const move = (e) => {
      gsap.to(el, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.55,
        ease: "power2.out"
      });
    };

    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div id="cursor-glow" ref={glowRef} />;
}

/* ─────────────────────────── 3-D tilt card ── */
function TiltCard({ children, className = "", dark = false }) {
  const wrapRef = useRef(null);
  const cardRef = useRef(null);

  function onMove(e) {
    const rect = wrapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    gsap.to(cardRef.current, {
      rotateY:  x * 12,
      rotateX: -y * 12,
      duration: 0.25,
      ease: "power1.out"
    });
  }

  function onLeave() {
    gsap.to(cardRef.current, { rotateY: 0, rotateX: 0, duration: 0.6, ease: "elastic.out(1,0.6)" });
  }

  return (
    <div ref={wrapRef} className="pricing-card-wrap" onMouseMove={onMove} onMouseLeave={onLeave}>
      <div ref={cardRef} className={`pricing-card-inner ${className}`}>
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────── reveal hook ── */
function useGsapReveal(stagger = 0.12) {
  const ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current.children,
        { opacity: 0, y: 48 },
        {
          opacity: 1,
          y: 0,
          stagger,
          duration: 0.75,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ref.current,
            start: "top 88%",
            once: true
          }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, [stagger]);

  return ref;
}

/* ─────────────────────────────── page ── */
export function PricingPage() {
  const [yearly, setYearly] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function handlePlanCta(planKey) {
    if (planKey === "free") {
      navigate(user ? "/dashboard" : "/register");
      return;
    }
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    setCheckoutError("");
    setCheckoutLoading(planKey);
    try {
      const { url } = await api.createCheckoutSession({
        plan: planKey,
        successUrl: `${window.location.origin}/dashboard?checkout=success`,
        cancelUrl: `${window.location.origin}/pricing`
      });
      window.location.href = url;
    } catch (err) {
      setCheckoutError(err.message);
      setCheckoutLoading("");
    }
  }

  const heroRef    = useRef(null);
  const cardsRef   = useGsapReveal(0.15);
  const tableRef   = useGsapReveal(0.06);
  const faqRef     = useGsapReveal(0.1);
  const ctaRef     = useRef(null);

  /* hero entrance */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-el"),
        { opacity: 0, y: 36 },
        { opacity: 1, y: 0, stagger: 0.14, duration: 0.85, ease: "power3.out", delay: 0.1 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* CTA pulse */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1, scale: 1, duration: 0.8, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", once: true }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SiteShell>
      <CursorGlow />

      <div className="space-y-12">

        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-[36px] border border-border/70 bg-white/80 px-6 py-16 text-center md:px-12 md:py-20"
        >
          {/* decorative orbs */}
          <div className="orb orb-1 pointer-events-none" style={{ top: "-120px", left: "-80px", opacity: 0.6 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-100px", right: "-60px", opacity: 0.5 }} />

          <div className="hero-el inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
            <Sparkles className="h-3.5 w-3.5" />
            Simple, honest pricing
          </div>

          <h1 className="hero-el mt-5 font-serif text-5xl leading-tight md:text-6xl">
            Pricing shaped around<br />
            <span className="gradient-text">collection volume.</span>
          </h1>

          <p className="hero-el mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Start free and prove demand. Move up only when you need more capacity, branding control, or analytics.
            No per-seat nonsense.
          </p>

          {/* billing toggle */}
          <div className="hero-el mt-8 inline-flex items-center gap-4 rounded-full border border-border/70 bg-white/90 px-5 py-3 shadow-sm">
            <span className={`text-sm font-medium transition ${!yearly ? "text-foreground" : "text-slate-400"}`}>Monthly</span>
            <button
              type="button"
              aria-label="Toggle billing cycle"
              onClick={() => setYearly((v) => !v)}
              className={`relative h-6 w-11 rounded-full transition-colors duration-300 focus:outline-none ${yearly ? "bg-primary" : "bg-slate-200"}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${yearly ? "translate-x-5" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium transition ${yearly ? "text-foreground" : "text-slate-400"}`}>
              Yearly
              <span className="ml-1.5 rounded-full bg-accent/15 px-2 py-0.5 text-xs font-semibold text-accent">–35%</span>
            </span>
          </div>
        </section>

        {/* ── Plan cards ── */}
        {checkoutError && (
          <p className="text-center text-sm text-rose-600">{checkoutError}</p>
        )}
        <div ref={cardsRef} className="grid gap-6 xl:grid-cols-3">
          {plans.map((plan, i) => {
            const dark = i === 1;
            const price = yearly ? plan.yearly : plan.monthly;
            const planKey = plan.name.toLowerCase();

            return (
              <TiltCard
                key={plan.name}
                className={`relative flex flex-col rounded-[28px] border p-8 shadow-panel ${
                  dark
                    ? "border-transparent bg-slate-950 text-white"
                    : "border-border/70 bg-white/90"
                }`}
              >
                {plan.badge && (
                  <span className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-xs font-semibold shadow ${
                    dark ? "bg-accent text-white" : "bg-primary text-white"
                  }`}>
                    {plan.badge}
                  </span>
                )}

                <div>
                  <p className={`text-xs font-semibold uppercase tracking-[0.22em] ${dark ? "text-slate-400" : "text-slate-500"}`}>
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-end gap-1">
                    <span className={`font-serif text-5xl font-bold ${dark ? "text-white" : "text-foreground"}`}>
                      ${price}
                    </span>
                    <span className={`mb-2 text-sm ${dark ? "text-slate-400" : "text-slate-500"}`}>/mo</span>
                    {yearly && plan.monthly > 0 && (
                      <span className={`mb-2 ml-2 text-sm line-through ${dark ? "text-slate-600" : "text-slate-400"}`}>
                        ${plan.monthly}
                      </span>
                    )}
                  </div>
                  <p className={`mt-3 text-sm leading-relaxed ${dark ? "text-slate-300" : "text-slate-600"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feat, j) =>
                    feat ? (
                      <li key={j} className="flex items-start gap-3 text-sm">
                        <span className={`mt-0.5 shrink-0 rounded-full p-1 ${dark ? "bg-white/10 text-white" : "bg-primary/10 text-primary"}`}>
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className={dark ? "text-slate-200" : "text-slate-700"}>{feat}</span>
                      </li>
                    ) : (
                      <li key={j} className="h-[1.375rem]" />
                    )
                  )}
                </ul>

                <div className="mt-8">
                  <Button
                    className={`w-full ${dark ? "bg-white text-slate-950 hover:bg-white/90" : ""}`}
                    variant={dark ? "primary" : "secondary"}
                    onClick={() => handlePlanCta(planKey)}
                    disabled={checkoutLoading === planKey}
                  >
                    {checkoutLoading === planKey ? "Redirecting…" : plan.cta}
                  </Button>
                </div>
              </TiltCard>
            );
          })}
        </div>

        {/* ── Comparison table ── */}
        <section>
          <div className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Compare plans</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Everything, side by side.</h2>
          </div>

          <div ref={tableRef} className="overflow-x-auto rounded-[28px] border border-border/70 bg-white/90 shadow-panel">
            <table className="w-full min-w-[640px] text-center">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="py-5 pl-8 pr-4 text-left text-sm font-semibold text-slate-500 w-[40%]">Feature</th>
                  {plans.map((p) => (
                    <th key={p.name} className="py-5 px-4 text-sm font-semibold text-foreground">{p.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.label} className={`border-b border-border/40 last:border-0 ${i % 2 === 0 ? "bg-slate-50/60" : ""}`}>
                    <td className="py-4 pl-8 pr-4 text-left text-sm text-slate-700">{row.label}</td>
                    <td className="py-4 px-4"><CellVal val={row.free} /></td>
                    <td className="py-4 px-4 bg-primary/5"><CellVal val={row.pro} /></td>
                    <td className="py-4 px-4"><CellVal val={row.biz} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-[36px] border border-border/70 bg-white/80 p-10">
            <HelpCircle className="h-8 w-8 text-primary" />
            <h2 className="mt-4 font-serif text-4xl">Common questions.</h2>
            <p className="mt-3 text-slate-600">
              Something else on your mind?{" "}
              <Link to="/contact" className="font-semibold text-primary hover:underline">Reach out →</Link>
            </p>
          </div>

          <div ref={faqRef} className="space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-[24px] border border-border/70 bg-white/80"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-base font-semibold">
                  {item.q}
                  <span className="ml-4 shrink-0 text-xl text-primary transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section
          ref={ctaRef}
          className="relative overflow-hidden rounded-[36px] bg-slate-950 px-6 py-16 text-center text-white md:px-12"
        >
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-60px", opacity: 0.25 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-80px", right: "-40px", opacity: 0.2 }} />

          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-300">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Live in 5 minutes
            </div>
            <h2 className="font-serif text-4xl md:text-5xl">
              Ready to collect proof<br />that actually converts?
            </h2>
            <p className="text-slate-400">
              Start with the free plan — no credit card, no time limit. Upgrade when you're ready.
            </p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild className="bg-white text-slate-950 hover:bg-white/90 text-base gap-2">
                <Link to="/register">
                  <Sparkles className="h-4 w-4" />
                  Start for free
                </Link>
              </Button>
              <Button asChild variant="secondary" className="border-white/20 bg-white/10 text-white hover:bg-white/20 text-base">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </SiteShell>
  );
}
