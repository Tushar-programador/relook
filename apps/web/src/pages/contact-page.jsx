import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Clock, Mail, MessageSquareMore, PhoneCall,
  Send, Sparkles, Twitter, Youtube
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";

gsap.registerPlugin(ScrollTrigger);

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
    const hoverEls = document.querySelectorAll("a,button,[role=button],input,textarea");
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

function DrawLine() {
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
    <div ref={ref} className="pointer-events-none overflow-hidden" aria-hidden>
      <svg viewBox="0 0 1200 24" fill="none" className="w-full">
        <path d="M0 12 C200 2,400 22,600 12 S1000 2,1200 12" stroke="hsl(172,72%,31%)" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      </svg>
    </div>
  );
}

/* ════════════════ PAGE ══ */

export function ContactPage() {
  const [sent, setSent] = useState(false);

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

  /* contact cards */
  const cardsRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cardsRef.current.querySelectorAll(".contact-card"),
        { opacity: 0, x: -32 },
        { opacity: 1, x: 0, stagger: 0.1, duration: 0.7, ease: "power3.out",
          scrollTrigger: { trigger: cardsRef.current, start: "top 83%", once: true } }
      );
    }, cardsRef);
    return () => ctx.revert();
  }, []);

  /* form */
  const formRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        formRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: formRef.current, start: "top 85%", once: true } }
      );
    });
    return () => ctx.revert();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    /* presentational — animate the send icon then show confirmation */
    const btn = e.currentTarget.querySelector("button[type=submit]");
    gsap.fromTo(btn, { scale: 1 }, { scale: 0.92, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.inOut",
      onComplete: () => setSent(true) });
  };

  return (
    <SiteShell>
      <CursorSystem />
      <div className="space-y-10">

        {/* ── Hero ── */}
        <section ref={heroRef} className="relative overflow-hidden rounded-[36px] border border-border/70 bg-white/80 px-6 py-14 md:px-14 md:py-18">
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-60px", opacity: 0.4 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-50px", right: "-40px", opacity: 0.3 }} />

          <div className="relative z-10 mx-auto max-w-3xl text-center">
            <div className="hero-el inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              <Sparkles className="h-3.5 w-3.5" /> Get in touch
            </div>
            <h1 className="hero-el mt-5 font-serif text-5xl leading-tight md:text-6xl">
              Have a question or a{" "}
              <span className="gradient-text">big rollout plan?</span>
            </h1>
            <p className="hero-el mt-5 text-lg text-slate-600">
              We reply within one business day. For faster help, check the{" "}
              <Link to="/help" className="text-primary underline underline-offset-2">help centre</Link> first.
            </p>
          </div>
        </section>

        <DrawLine />

        {/* ── Main grid ── */}
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">

          {/* Left — contact info */}
          <div className="space-y-5" ref={cardsRef}>
            <h2 className="font-serif text-3xl">Reach us directly.</h2>
            <p className="text-slate-600 text-sm leading-relaxed">
              Use the form for demo requests and onboarding questions. For quick answers, the channels below are fastest.
            </p>

            {[
              { icon: Mail,              label: "Email",           value: "hello@feedspace.app",      sub: "For billing and account questions"    },
              { icon: PhoneCall,         label: "Sales",           value: "Sales & onboarding",       sub: "Custom setup, white-label, agencies"  },
              { icon: Clock,             label: "Response time",   value: "≤ 1 business day",         sub: "Mon – Fri, 9 am – 6 pm IST"           },
              { icon: MessageSquareMore, label: "Community",       value: "Join the Discord",         sub: "Ask questions, share setups"          },
            ].map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.label}
                  className="contact-card flex items-center gap-4 rounded-[20px] border border-border/70 bg-white/90 px-5 py-4 transition hover:shadow-panel hover:-translate-y-0.5">
                  <div className="shrink-0 rounded-2xl bg-primary/10 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-widest text-slate-500">{c.label}</p>
                    <p className="font-semibold text-slate-900">{c.value}</p>
                    <p className="text-xs text-slate-500">{c.sub}</p>
                  </div>
                </div>
              );
            })}

            {/* social row */}
            <div className="flex gap-3 pt-1">
              {[
                { icon: Twitter, label: "@feedspaceapp" },
                { icon: Youtube, label: "YouTube demos"  },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <div key={s.label}
                    className="flex items-center gap-2 rounded-full border border-border/70 bg-white/90 px-4 py-2 text-sm text-slate-600 transition hover:border-primary/40 hover:text-primary">
                    <Icon className="h-4 w-4" />
                    {s.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right — form */}
          <div ref={formRef} className="rounded-[28px] border border-border/70 bg-white/90 p-8 shadow-panel">
            {sent ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="rounded-full bg-primary/10 p-5 text-primary">
                  <Send className="h-8 w-8" />
                </div>
                <h3 className="font-serif text-3xl">Message sent!</h3>
                <p className="max-w-sm text-slate-500">We'll get back to you within one business day. In the meantime, you can <Link to="/register" className="text-primary underline underline-offset-2">start for free</Link>.</p>
                <Button variant="secondary" onClick={() => setSent(false)} className="mt-2">Send another</Button>
              </div>
            ) : (
              <>
                <h2 className="font-serif text-2xl">Request a demo</h2>
                <p className="mt-1 text-sm text-slate-500">This form is presentational — or email us directly to skip it.</p>

                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Name</label>
                      <Input placeholder="Your name" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Work email</label>
                      <Input type="email" placeholder="you@company.com" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Company or brand</label>
                    <Input placeholder="Acme Inc." />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">Message</label>
                    <Textarea
                      rows={4}
                      placeholder="Tell us about your testimonial workflow, current pain points, and rollout goals"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 pt-1">
                    <Button type="submit" className="gap-2">
                      <Send className="h-4 w-4" />Send message
                    </Button>
                    <Button asChild variant="secondary">
                      <a href="mailto:hello@feedspace.app?subject=FeedSpace%20Demo%20Request">Email directly</a>
                    </Button>
                    <Button asChild variant="secondary">
                      <Link to="/register">Start free instead</Link>
                    </Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

      </div>
    </SiteShell>
  );
}