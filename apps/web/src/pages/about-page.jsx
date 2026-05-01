import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight, Building2, Heart, Lightbulb,
  Rocket, Sparkles, Target, Users2, Zap
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";

gsap.registerPlugin(ScrollTrigger);

/* ══════════════════ DATA ══ */

const pillars = [
  {
    icon: Rocket,
    color: "text-violet-600",
    bg: "bg-violet-50",
    ring: "ring-violet-200",
    title: "Built for fast shipping",
    description:
      "The product is intentionally shaped as an MVP that can run in production today and scale into deeper platform services later."
  },
  {
    icon: Building2,
    color: "text-sky-600",
    bg: "bg-sky-50",
    ring: "ring-sky-200",
    title: "Designed for modern brands",
    description:
      "The workflow maps to how D2C teams, freelancers, and agencies actually collect testimonials — through mobile-first interactions."
  },
  {
    icon: Users2,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    title: "Made for reuse",
    description:
      "Every decision is aimed at turning feedback into structured, reusable marketing proof instead of one-off submissions."
  }
];

const values = [
  { icon: Target,    label: "Clarity",    desc: "No dark patterns. Every feature has a single, clear purpose."    },
  { icon: Zap,       label: "Speed",      desc: "From sign-up to live embed in under five minutes."               },
  { icon: Heart,     label: "Respect",    desc: "User data is never sold. Feedback belongs to the brand."         },
  { icon: Lightbulb, label: "Iteration",  desc: "Ship, learn, improve. No feature is permanent if it isn't useful." },
];

const stats = [
  { value: 2,    suffix: "min",  label: "To set up a project" },
  { value: 100,  suffix: "%",    label: "Browser-based recording" },
  { value: 3,    suffix: "×",    label: "Faster than email workflows" },
  { value: 0,    suffix: "¢",    label: "Cost to start" },
];

/* ════════════════ CURSOR ══ */

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
        const p = history[i] || history[history.length - 1];
        gsap.set(el, { x: p.x, y: p.y, scale: 1 - i / TRAIL_COUNT, opacity: (1 - i / TRAIL_COUNT) * 0.55 });
      });
    });

    const onEnter = () => document.body.classList.remove("cursor-out");
    const onLeave = () => document.body.classList.add("cursor-out");
    const hoverEls = document.querySelectorAll("a,button,[role=button]");
    const add    = () => document.body.classList.add("cursor-hover");
    const remove = () => document.body.classList.remove("cursor-hover");
    hoverEls.forEach((el) => { el.addEventListener("mouseenter", add); el.addEventListener("mouseleave", remove); });

    const onClick = () =>
      gsap.fromTo(dot, { scale: 1 }, { scale: 2.5, duration: 0.18, ease: "power2.out",
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
      hoverEls.forEach((el) => { el.removeEventListener("mouseenter", add); el.removeEventListener("mouseleave", remove); });
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

/* ════════════════ SVG LINE ══ */

function DrawLine({ className = "" }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const path = ref.current.querySelector("path");
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0, duration: 1.4, ease: "power2.inOut",
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true }
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className={`pointer-events-none overflow-hidden ${className}`} aria-hidden>
      <svg viewBox="0 0 1200 24" fill="none" className="w-full">
        <path d="M0 12 C200 2,400 22,600 12 S1000 2,1200 12" stroke="hsl(172,72%,31%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      </svg>
    </div>
  );
}

/* ════════════════ COUNTER ══ */

function Counter({ value, suffix }) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { val: 0 };
      gsap.to(obj, {
        val: value, duration: 1.6, ease: "power2.out",
        onUpdate: () => { if (ref.current) ref.current.textContent = Math.round(obj.val) + suffix; },
        scrollTrigger: { trigger: ref.current, start: "top 88%", once: true }
      });
    });
    return () => ctx.revert();
  }, [value, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

/* ════════════════ PAGE ══ */

export function AboutPage() {
  /* hero */
  const heroRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        heroRef.current.querySelectorAll(".hero-el"),
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, stagger: 0.12, duration: 0.85, ease: "power3.out", delay: 0.1 }
      );
    }, heroRef);
    return () => ctx.revert();
  }, []);

  /* pillars */
  const pillarsRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        pillarsRef.current.querySelectorAll(".pillar-card"),
        { opacity: 0, y: 50, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, stagger: 0.11, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: pillarsRef.current, start: "top 82%", once: true } }
      );
    }, pillarsRef);
    return () => ctx.revert();
  }, []);

  /* values */
  const valuesRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        valuesRef.current.querySelectorAll(".val-card"),
        { opacity: 0, x: -30 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.7, ease: "power2.out",
          scrollTrigger: { trigger: valuesRef.current, start: "top 83%", once: true } }
      );
    }, valuesRef);
    return () => ctx.revert();
  }, []);

  /* stats */
  const statsRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        statsRef.current.querySelectorAll(".stat-card"),
        { opacity: 0, scale: 0.88 },
        { opacity: 1, scale: 1, stagger: 0.1, duration: 0.65, ease: "back.out(1.5)",
          scrollTrigger: { trigger: statsRef.current, start: "top 85%", once: true } }
      );
    }, statsRef);
    return () => ctx.revert();
  }, []);

  /* cta */
  const ctaRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(ctaRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
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
        <section ref={heroRef} className="relative overflow-hidden rounded-[36px] border border-border/70 bg-white/80 px-6 py-16 md:px-14 md:py-20">
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-60px", opacity: 0.45 }} />
          <div className="orb orb-3 pointer-events-none" style={{ bottom: "-60px", right: "-40px", opacity: 0.35 }} />

          <div className="relative z-10 grid gap-10 lg:grid-cols-[1fr_340px] lg:items-center">
            <div>
              <div className="hero-el inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                <Sparkles className="h-3.5 w-3.5" /> About FeedSpace
              </div>
              <h1 className="hero-el mt-5 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">
                We exist to make customer proof{" "}
                <span className="gradient-text">operational.</span>
              </h1>
              <p className="hero-el mt-5 max-w-2xl text-lg text-slate-600">
                Most brands already have testimonials. The real problem is that the proof is scattered, hard to moderate, and harder to reuse. FeedSpace fixes that system gap.
              </p>
              <div className="hero-el mt-6">
                <Button asChild className="gap-2">
                  <Link to="/register"><ArrowRight className="h-4 w-4" />Start building</Link>
                </Button>
              </div>
            </div>

            {/* aside quote */}
            <div className="hero-el hidden lg:block">
              <blockquote className="rounded-[24px] border border-border/70 bg-primary/5 p-7">
                <p className="font-serif text-xl leading-snug text-slate-800">
                  "Testimonials are not a marketing asset. They're a trust signal — and trust compounds."
                </p>
                <footer className="mt-4 text-xs uppercase tracking-widest text-slate-500">FeedSpace design brief, 2024</footer>
              </blockquote>
            </div>
          </div>
        </section>

        <DrawLine />

        {/* ── Pillars ── */}
        <section ref={pillarsRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Our focus</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Three things we care about.</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {pillars.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title}
                  className={`pillar-card group relative overflow-hidden rounded-[28px] border p-8 transition hover:-translate-y-1 hover:shadow-panel ${p.bg} ${p.ring}`}>
                  <span className={`pointer-events-none absolute -top-2 -right-1 font-serif text-7xl font-bold opacity-[0.06] select-none ${p.color}`}>
                    {p.title.split(" ")[0]}
                  </span>
                  <div className={`inline-flex rounded-2xl bg-white p-3 ${p.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className={`mt-5 text-xl font-semibold ${p.color}`}>{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{p.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Stats ── */}
        <section ref={statsRef} className="rounded-[36px] border border-border/70 bg-slate-950 px-6 py-12 md:px-12">
          <p className="mb-8 text-center text-xs uppercase tracking-[0.28em] text-slate-400">By the numbers</p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="stat-card rounded-[20px] bg-white/5 p-6 text-center ring-1 ring-white/10">
                <p className="font-serif text-4xl font-semibold text-white md:text-5xl">
                  <Counter value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        <DrawLine />

        {/* ── Values ── */}
        <section ref={valuesRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Values</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">How we make decisions.</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.label} className="val-card flex items-start gap-5 rounded-[24px] border border-border/70 bg-white/80 p-6 transition hover:shadow-panel">
                  <div className="mt-1 shrink-0 rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{v.label}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{v.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <section ref={ctaRef}
          className="relative overflow-hidden rounded-[36px] bg-primary px-6 py-14 text-center text-white md:px-12">
          <div className="orb orb-1 pointer-events-none" style={{ top: "-60px", left: "-60px", opacity: 0.18 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-60px", right: "-40px", opacity: 0.15 }} />
          <div className="relative z-10 mx-auto max-w-xl space-y-4">
            <h2 className="font-serif text-4xl text-white md:text-5xl">Ready to collect proof that works?</h2>
            <p className="text-teal-100">Free plan, no credit card. Your first project is live in two minutes.</p>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <Button asChild className="bg-white px-8 py-4 text-base font-semibold text-primary hover:bg-white/90">
                <Link to="/register">Get started free</Link>
              </Button>
              <Button asChild className="border border-white/30 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/20">
                <Link to="/contact">Talk to us →</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </SiteShell>
  );
}