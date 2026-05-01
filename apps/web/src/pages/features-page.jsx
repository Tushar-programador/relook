import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import {
  BarChart3, Bot, Brain, Camera, Check, Code2,
  Globe2, LayoutDashboard, Minus, Palette,
  ShieldCheck, Sparkles, UploadCloud, Users,
  Video, Waves, Zap
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════════════════════════ DATA ══ */

const pillars = [
  {
    icon: Camera,
    label: "Capture",
    color: "text-rose-600",
    bg: "bg-rose-50",
    ring: "ring-rose-200",
    title: "Media-first collection",
    desc: "Record video (up to 120 s on Business), audio, or text directly in the browser. No app download, no friction.",
    bullets: ["Browser recording — no plugin needed", "File upload for existing assets", "Mobile-optimised form", "Cloudinary CDN delivery"]
  },
  {
    icon: LayoutDashboard,
    label: "Moderate",
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    title: "One-inbox moderation",
    desc: "Review every submission before anything goes public. Approve the best, reject the rest — bulk or one-by-one.",
    bullets: ["Approve / reject / delete", "Advanced filters & search (Pro+)", "Download originals (Pro+)", "Faster processing on paid plans"]
  },
  {
    icon: Globe2,
    label: "Publish",
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    title: "Embed & share anywhere",
    desc: "Drop an iframe on any page. Pick carousel, grid, or floating widget. Content refreshes automatically.",
    bullets: ["Iframe embed — no developer needed", "Carousel, Grid, Auto-refresh layouts", "Floating widget (Business)", "Remove FeedSpace branding (Pro+)"]
  },
  {
    icon: BarChart3,
    label: "Analyse",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    title: "Analytics & insights",
    desc: "Track opens, unique visitors, response rates, and engagement. Understand which campaigns drive real proof.",
    bullets: ["Link open & visitor tracking", "Video vs text breakdown", "Engagement metrics (Business)", "14-day trend view"]
  },
  {
    icon: Bot,
    label: "AI",
    color: "text-amber-600",
    bg: "bg-amber-50",
    ring: "ring-amber-200",
    title: "AI-powered highlights",
    desc: "Let the machine find your best testimonials. Sentiment analysis, auto-summaries, and spotlight suggestions — Business plan.",
    bullets: ["Auto-summary of all feedback", "Highlight best testimonials", "Sentiment analysis", "AI spotlight suggestions"]
  },
  {
    icon: Code2,
    label: "Integrate",
    color: "text-slate-600",
    bg: "bg-slate-50",
    ring: "ring-slate-200",
    title: "API & team access",
    desc: "Pull testimonials programmatically, manage multiple brands, and collaborate as a team — all in Business.",
    bullets: ["Full REST API access", "Multi-brand workspaces", "Team member seats", "Zapier & WhatsApp (coming soon)"]
  }
];

const comparison = [
  { label: "Projects",              free: "1",         pro: "3–5",         biz: "Unlimited" },
  { label: "Responses / month",     free: "50",        pro: "Unlimited",   biz: "Unlimited" },
  { label: "Max video length",      free: "30 sec",    pro: "60 sec",      biz: "120 sec"   },
  { label: "Storage",               free: "500 MB",    pro: "15 GB",       biz: "High"      },
  { label: "Branding removal",      free: false,       pro: true,          biz: true        },
  { label: "Widget layouts",        free: "Basic",     pro: "Advanced",    biz: "Advanced+" },
  { label: "Analytics",             free: false,       pro: "Basic",       biz: "Advanced"  },
  { label: "AI features",           free: false,       pro: false,         biz: true        },
  { label: "API access",            free: false,       pro: false,         biz: true        },
  { label: "Team members",          free: false,       pro: false,         biz: true        },
  { label: "Priority support",      free: false,       pro: "Priority",    biz: "Dedicated" },
];

/* ══════════════════════════════ CURSOR SYSTEM ══ */

const TRAIL_COUNT = 8;

function CursorSystem() {
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const shadowRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    document.body.classList.add("has-custom-cursor");

    const dot    = dotRef.current;
    const ring   = ringRef.current;
    const shadow = shadowRef.current;
    const trails = trailRefs.current;
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    const history = Array.from({ length: TRAIL_COUNT }, () => ({ x: mx, y: my }));

    const onMove = (e) => {
      mx = e.clientX; my = e.clientY;
      gsap.to(dot,    { x: mx, y: my, duration: 0.08, ease: "none" });
      gsap.to(ring,   { x: mx, y: my, duration: 0.22, ease: "power2.out" });
      gsap.to(shadow, { x: mx, y: my, duration: 0.65, ease: "power2.out" });
    };

    const ticker = gsap.ticker.add(() => {
      history.unshift({ x: mx, y: my }); history.pop();
      trails.forEach((el, i) => {
        if (!el) return;
        const pos = history[i] || history[history.length - 1];
        gsap.set(el, { x: pos.x, y: pos.y, scale: 1 - i / TRAIL_COUNT, opacity: (1 - i / TRAIL_COUNT) * 0.55 });
      });
    });

    const onEnter = () => document.body.classList.remove("cursor-out");
    const onLeave = () => document.body.classList.add("cursor-out");
    const hoverEls = document.querySelectorAll("a, button, [role=button], summary");
    const addHover    = () => document.body.classList.add("cursor-hover");
    const removeHover = () => document.body.classList.remove("cursor-hover");
    hoverEls.forEach((el) => { el.addEventListener("mouseenter", addHover); el.addEventListener("mouseleave", removeHover); });

    const onClick = () => gsap.fromTo(dot, { scale: 1 }, { scale: 2.5, duration: 0.18, ease: "power2.out",
      onComplete: () => gsap.to(dot, { scale: 1, duration: 0.25, ease: "elastic.out(1,0.5)" }) });

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseenter", onEnter);
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("click", onClick);

    return () => {
      document.body.classList.remove("has-custom-cursor", "cursor-out", "cursor-hover");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseenter", onEnter);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("click", onClick);
      gsap.ticker.remove(ticker);
      hoverEls.forEach((el) => { el.removeEventListener("mouseenter", addHover); el.removeEventListener("mouseleave", removeHover); });
    };
  }, []);

  return (
    <>
      <div id="cur-shadow" ref={shadowRef} />
      {Array.from({ length: TRAIL_COUNT }).map((_, i) => (
        <div key={i} className="cur-trail" ref={(el) => (trailRefs.current[i] = el)} />
      ))}
      <div id="cur-ring" ref={ringRef} />
      <div id="cur-dot"  ref={dotRef}  />
    </>
  );
}

/* ══════════════════════ ANIMATED DIVIDER LINE ══ */

function DrawLine({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = ref.current.querySelector("path");
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.4,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true }
      });
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
        <path
          d="M0 12 C200 2, 400 22, 600 12 S1000 2, 1200 12"
          stroke="hsl(172,72%,31%)"
          strokeWidth="1.5"
          strokeLinecap="round"
          opacity="0.35"
        />
      </svg>
    </div>
  );
}

/* ══════════════════════════ CONNECTING DOT LINE ══ */

function VerticalLine() {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { scaleY: 0, transformOrigin: "top center" },
        { scaleY: 1, duration: 1.1, ease: "power2.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } }
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="mx-auto h-16 w-px bg-gradient-to-b from-primary/50 to-transparent" />
  );
}

/* ═════════════════════════════════ TABLE CELL ══ */

function Cell({ val }) {
  if (val === true)  return <Check className="mx-auto h-4 w-4 text-primary" />;
  if (val === false) return <Minus className="mx-auto h-4 w-4 text-slate-300" />;
  return <span className="text-sm text-slate-700">{val}</span>;
}

/* ══════════════════════════════════════ PAGE ══ */

export function FeaturesPage() {
  /* hero */
  const heroRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-el"),
        { opacity: 0, y: 44 },
        { opacity: 1, y: 0, stagger: 0.13, duration: 0.85, ease: "power3.out", delay: 0.1 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* pillar cards */
  const pillarsRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pillarsRef.current.querySelectorAll(".pillar-card"),
        { opacity: 0, y: 56, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: pillarsRef.current, start: "top 82%", once: true } }
      );
    }, pillarsRef);
    return () => ctx.revert();
  }, []);

  /* table rows */
  const tableRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        tableRef.current.querySelectorAll("tr"),
        { opacity: 0, x: -24 },
        { opacity: 1, x: 0, stagger: 0.05, duration: 0.55, ease: "power2.out",
          scrollTrigger: { trigger: tableRef.current, start: "top 84%", once: true } }
      );
    }, tableRef);
    return () => ctx.revert();
  }, []);

  /* workflow steps */
  const workflowRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        workflowRef.current.querySelectorAll(".step-item"),
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, stagger: 0.18, duration: 0.75, ease: "power3.out",
          scrollTrigger: { trigger: workflowRef.current, start: "top 82%", once: true } }
      );
      /* animated progress bar per step */
      workflowRef.current.querySelectorAll(".step-bar").forEach((bar) => {
        gsap.fromTo(
          bar,
          { scaleX: 0, transformOrigin: "left center" },
          { scaleX: 1, duration: 0.9, ease: "power2.out",
            scrollTrigger: { trigger: bar, start: "top 90%", once: true } }
        );
      });
    }, workflowRef);
    return () => ctx.revert();
  }, []);

  /* CTA */
  const ctaRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, scale: 0.93 },
        { opacity: 1, scale: 1, duration: 0.85, ease: "back.out(1.4)",
          scrollTrigger: { trigger: ctaRef.current, start: "top 88%", once: true } }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <SiteShell>
      <CursorSystem />
      <div className="space-y-10">

        {/* ── Hero ── */}
        <section
          ref={heroRef}
          className="relative overflow-hidden rounded-[36px] border border-border/70 bg-white/80 px-6 py-16 md:px-14 md:py-20"
        >
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-80px", opacity: 0.55 }} />
          <div className="orb orb-3 pointer-events-none" style={{ bottom: "-60px", right: "-60px", opacity: 0.4 }} />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <div className="hero-el inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> Product features
              </div>
              <h1 className="hero-el mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
                Everything needed to run testimonials like a{" "}
                <span className="gradient-text">real product surface.</span>
              </h1>
              <p className="hero-el mt-5 max-w-2xl text-lg text-slate-600">
                FeedSpace is a full workflow — capture, moderate, analyse, and distribute. Pick the plan that fits your stage.
              </p>
              <div className="hero-el mt-6 flex flex-wrap gap-3">
                <Button asChild className="gap-2">
                  <Link to="/register"><Zap className="h-4 w-4" />Start free</Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/pricing">View pricing →</Link>
                </Button>
              </div>
            </div>

            {/* live badge stack */}
            <div className="hero-el hidden lg:flex flex-col gap-3">
              {[
                { icon: Camera,  text: "Video capture",     sub: "30–120 sec"  },
                { icon: Palette, text: "Custom branding",   sub: "Pro & above" },
                { icon: Brain,   text: "AI highlights",     sub: "Business"    },
              ].map((b) => {
                const Icon = b.icon;
                return (
                  <div key={b.text} className="flex items-center gap-3 rounded-2xl border border-border/70 bg-white/90 px-5 py-3 shadow-sm">
                    <Icon className="h-5 w-5 text-primary shrink-0" />
                    <div>
                      <p className="text-sm font-semibold">{b.text}</p>
                      <p className="text-xs text-slate-500">{b.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <DrawLine />

        {/* ── 6 pillars ── */}
        <section ref={pillarsRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Six pillars</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">The full testimonial stack.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div
                  key={p.title}
                  className={`pillar-card group relative overflow-hidden rounded-[28px] border p-8 transition hover:-translate-y-1 hover:shadow-panel ${p.bg} ${p.ring}`}
                >
                  {/* large faint label */}
                  <span className={`pointer-events-none absolute -top-2 -right-1 font-serif text-7xl font-bold opacity-[0.07] select-none ${p.color}`}>
                    {p.label}
                  </span>

                  <div className={`inline-flex rounded-2xl bg-white p-3 ${p.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className={`mt-5 text-xl font-semibold ${p.color}`}>{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.desc}</p>

                  <ul className="mt-5 space-y-2">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check className={`h-3.5 w-3.5 shrink-0 ${p.color}`} />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <DrawLine />

        {/* ── Workflow timeline ── */}
        <section ref={workflowRef} className="rounded-[36px] border border-border/70 bg-slate-950 px-6 py-14 md:px-12">
          <div className="mb-12 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">How it works</p>
            <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">Free → Hook → Pro → Scale.</h2>
          </div>

          <div className="relative mx-auto max-w-2xl space-y-0">
            {[
              { n: "01", icon: Sparkles,       title: "Create your portal in 2 min",  desc: "One project, one branded link. Share it anywhere — WhatsApp, email, bio.", bar: "w-1/4" },
              { n: "02", icon: UploadCloud,     title: "Collect on the free plan",      desc: "Up to 50 responses/month. Text, audio, and video up to 30 seconds.", bar: "w-2/4" },
              { n: "03", icon: ShieldCheck,     title: "Moderate & publish",            desc: "Approve the best. Everything else stays private. Embed via iframe.", bar: "w-3/4" },
              { n: "04", icon: Waves,           title: "Hit the limit — upgrade",       desc: "Go Pro: unlimited responses, remove branding, advanced filters, 15 GB.", bar: "w-4/4" },
              { n: "05", icon: Brain,           title: "Scale with Business + AI",      desc: "AI highlights, sentiment analysis, API access, team seats, custom CSS.", bar: "w-4/4" },
            ].map((step, i) => {
              const Icon = step.icon;
              const isLast = i === 4;
              return (
                <div key={step.n} className="step-item relative pl-14">
                  {/* vertical connector */}
                  {!isLast && (
                    <div className="absolute left-[22px] top-10 h-full w-px bg-white/10" />
                  )}
                  {/* circle */}
                  <div className="absolute left-0 top-1 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="pb-10">
                    <p className="font-serif text-3xl font-semibold text-white/20">{step.n}</p>
                    <h3 className="mt-1 text-lg font-semibold text-white">{step.title}</h3>
                    <p className="mt-1.5 text-sm text-slate-400">{step.desc}</p>
                    {/* animated bar */}
                    <div className="mt-4 h-1 w-full rounded-full bg-white/10">
                      <div className={`step-bar h-1 rounded-full bg-primary ${step.bar}`} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <VerticalLine />

        {/* ── Comparison table ── */}
        <section>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Compare</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Every feature, side by side.</h2>
          </div>

          <div ref={tableRef} className="overflow-x-auto rounded-[28px] border border-border/70 bg-white/90 shadow-panel">
            <table className="w-full min-w-[600px] text-center">
              <thead>
                <tr className="border-b border-border/70">
                  <th className="py-5 pl-8 pr-4 text-left text-sm font-semibold text-slate-500 w-[40%]">Feature</th>
                  <th className="py-5 px-4 text-sm font-semibold text-slate-600">Free</th>
                  <th className="py-5 px-4 text-sm font-semibold text-primary bg-primary/5">Pro</th>
                  <th className="py-5 px-4 text-sm font-semibold text-slate-800">Business</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={row.label} className={`border-b border-border/40 last:border-0 ${i % 2 === 0 ? "bg-slate-50/50" : ""}`}>
                    <td className="py-4 pl-8 pr-4 text-left text-sm text-slate-700">{row.label}</td>
                    <td className="py-4 px-4"><Cell val={row.free} /></td>
                    <td className="py-4 px-4 bg-primary/5"><Cell val={row.pro} /></td>
                    <td className="py-4 px-4"><Cell val={row.biz} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <DrawLine />

        {/* ── AI callout ── */}
        <section className="grid gap-5 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[28px] border border-amber-200 bg-amber-50 p-8">
            <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-amber-300/20 blur-2xl" />
            <Brain className="h-8 w-8 text-amber-600" />
            <h3 className="mt-4 font-serif text-2xl font-semibold text-amber-800">AI on Business</h3>
            <p className="mt-2 text-sm leading-relaxed text-amber-900/70">
              Auto-summarise every batch of feedback. Let the model surface your top testimonials and run sentiment analysis — so you spend zero time reading through bad submissions.
            </p>
            <ul className="mt-5 space-y-2">
              {["Auto summary of feedback", "Highlight best testimonials", "Sentiment analysis", "AI spotlight suggestions"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-amber-900">
                  <Check className="h-3.5 w-3.5 shrink-0 text-amber-600" />{f}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-[28px] border border-slate-800 bg-slate-950 p-8 text-white">
            <div className="absolute -left-8 -bottom-8 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
            <Users className="h-8 w-8 text-primary" />
            <h3 className="mt-4 font-serif text-2xl font-semibold">Team & API</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Fetch testimonials programmatically. Manage multiple brands under one roof. Invite your team and set roles — all in the Business plan.
            </p>
            <ul className="mt-5 space-y-2">
              {["Full REST API", "Multi-brand workspaces", "Team member seats", "Zapier & WhatsApp (coming)"].map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                  <Check className="h-3.5 w-3.5 shrink-0 text-primary" />{f}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── CTA ── */}
        <section
          ref={ctaRef}
          className="relative overflow-hidden rounded-[36px] bg-primary px-6 py-16 text-center text-white md:px-12"
        >
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-60px", opacity: 0.2 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-80px", right: "-40px", opacity: 0.15 }} />
          <div className="relative z-10 mx-auto max-w-2xl space-y-5">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-200">Ready to launch</p>
            <h2 className="font-serif text-4xl text-white md:text-6xl">
              Your proof engine is one click away.
            </h2>
            <p className="text-teal-100">Start free — no credit card, no time limit. Upgrade when you need more.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild className="bg-white px-8 py-4 text-base font-semibold text-primary hover:bg-white/90">
                <Link to="/register">Start for free</Link>
              </Button>
              <Button asChild className="border border-white/30 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/20">
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </SiteShell>
  );
}
