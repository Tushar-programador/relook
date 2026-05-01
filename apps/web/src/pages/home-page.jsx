import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Globe,
  Link2,
  Mic,
  PlayCircle,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Video,
  Workflow,
  Zap
} from "lucide-react";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";

gsap.registerPlugin(ScrollTrigger);

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• DATA â•â• */

const floatingCards = [
  { name: "Sarah K.",  role: "E-commerce founder",    text: "Doubled conversion on our PDPs using FeedSpace video reviews.",               stars: 5, delay: "animate-float-a", pos: "top-4 left-0 rotate-[-1.5deg]" },
  { name: "James R.",  role: "Performance marketer",  text: "Audio reviews from our community converted better than polished ads.",        stars: 5, delay: "animate-float-b", pos: "top-2 right-0 rotate-[1.5deg]" },
  { name: "Nikita G.", role: "Agency partner",        text: "One link, every format. Clients love the wall of love page.",                 stars: 5, delay: "animate-float-c", pos: "bottom-4 left-4 rotate-[-0.8deg]" }
];

const marqueeItems = [
  "Video testimonials","Audio reviews","Text feedback","Public collection pages",
  "Moderation inbox","Embeddable widgets","Wall of love","Spotlight pages",
  "Link analytics","Unique visitors","Response rates","Cloudinary CDN"
];

const features = [
  { icon: Video,       title: "Video + audio + text",       description: "One mobile-friendly form accepts browser recordings, uploads, and written reviews." },
  { icon: ShieldCheck, title: "Approve before publishing",  description: "Moderate every submission. Only the best ones hit your public widget." },
  { icon: Link2,       title: "Embed anywhere",             description: "Drop an iframe on any page and stream approved testimonials live." },
  { icon: BarChart3,   title: "Link analytics",             description: "Track opens, unique visitors, response rate, and trend over 14 days." },
  { icon: Globe,       title: "Spotlight pages",            description: "Each approved review gets its own shareable page for social proof campaigns." },
  { icon: Zap,         title: "Instant WhatsApp share",     description: "Share portal links and review spotlights directly through WhatsApp." }
];

const steps = [
  { n: "01", icon: Sparkles,    title: "Launch your portal",  description: "Create a project, get a branded link, and start collecting testimonials in minutes." },
  { n: "02", icon: Workflow,    title: "Review in one inbox", description: "Approve the strongest stories and reject anything off-brand. Bulk or one by one." },
  { n: "03", icon: CheckCircle2,title: "Publish and embed",   description: "Use your wall, widget, or spotlight links across landing pages and social campaigns." }
];

const testimonials = [
  { quote: "We moved from scattered Instagram DMs to one clean inbox in under a week.",                                  author: "Aditi S.",  role: "Founder, D2C Beauty Brand", stars: 5 },
  { quote: "Video testimonials on our checkout page lifted conversion by 18%. Needed FeedSpace to make it happen.",     author: "Rahul M.",  role: "Performance Marketer",      stars: 5 },
  { quote: "The spotlight page is our favorite feature â€” one link per happy customer, shareable instantly.",             author: "Priya T.",  role: "SaaS Growth Lead",          stars: 5 },
  { quote: "Finally a tool that handles the entire UGC workflow, not just the capture part.",                            author: "Nikita G.", role: "Agency Partner",            stars: 5 },
  { quote: "Response rate analytics helped us figure out which campaign drove the most genuine reviews.",               author: "Chris O.",  role: "Head of Marketing",         stars: 5 },
  { quote: "Embedding the wall of love on our home page took 30 seconds and it looks incredible.",                      author: "Mei L.",    role: "Indie Maker",               stars: 5 }
];

const faqs = [
  { question: "Can customers submit without an account?", answer: "Yes. Public feedback pages are open and mobile-optimized â€” no login required." },
  { question: "What media types are supported?",          answer: "Browser-recorded video, browser-recorded audio, file uploads, and plain text." },
  { question: "Are public widgets safe?",                 answer: "Only approved testimonials are returned by public API routes and embedded widgets." },
  { question: "Can I share individual reviews?",          answer: "Yes. Every approved review gets a spotlight page you can share via link or WhatsApp." }
];

const stats = [
  { value: 2400, suffix: "+", label: "Testimonials collected" },
  { value: 98,   suffix: "%", label: "Customer satisfaction"  },
  { value: 12,   suffix: "x", label: "Average ROI on proof spend" }
];

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• CURSOR SYSTEM â•â• */

const TRAIL_COUNT = 8;

function CursorSystem() {
  const dotRef    = useRef(null);
  const ringRef   = useRef(null);
  const shadowRef = useRef(null);
  const trailRefs = useRef([]);

  useEffect(() => {
    /* only on pointer-capable devices */
    if (!window.matchMedia("(pointer:fine)").matches) return;

    document.body.classList.add("has-custom-cursor");

    const dot    = dotRef.current;
    const ring   = ringRef.current;
    const shadow = shadowRef.current;
    const trails = trailRefs.current;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;

    /* history buffer for trail */
    const history = Array.from({ length: TRAIL_COUNT }, () => ({ x: mx, y: my }));

    /* move shadow + dot instantly, ring with slight lag */
    const onMove = (e) => {
      mx = e.clientX;
      my = e.clientY;

      gsap.to(dot, { x: mx, y: my, duration: 0.08, ease: "none" });
      gsap.to(ring, { x: mx, y: my, duration: 0.22, ease: "power2.out" });
      gsap.to(shadow, { x: mx, y: my, duration: 0.65, ease: "power2.out" });
    };

    /* trail ticker */
    const ticker = gsap.ticker.add(() => {
      history.unshift({ x: mx, y: my });
      history.pop();
      trails.forEach((el, i) => {
        if (!el) return;
        const pos = history[i] || history[history.length - 1];
        const scale = 1 - i / TRAIL_COUNT;
        const opacity = (1 - i / TRAIL_COUNT) * 0.55;
        gsap.set(el, { x: pos.x, y: pos.y, scale, opacity });
      });
    });

    /* cursor in / out */
    const onEnter = () => document.body.classList.remove("cursor-out");
    const onLeave = () => document.body.classList.add("cursor-out");

    /* hover state for interactive elements */
    const hoverEls = document.querySelectorAll("a, button, [role=button], summary");
    const addHover   = () => document.body.classList.add("cursor-hover");
    const removeHover= () => document.body.classList.remove("cursor-hover");
    hoverEls.forEach((el) => {
      el.addEventListener("mouseenter", addHover);
      el.addEventListener("mouseleave", removeHover);
    });

    /* click pulse on dot */
    const onClick = () => {
      gsap.fromTo(dot, { scale: 1 }, { scale: 2.5, duration: 0.18, ease: "power2.out",
        onComplete: () => gsap.to(dot, { scale: 1, duration: 0.25, ease: "elastic.out(1,0.5)" })
      });
    };

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
      hoverEls.forEach((el) => {
        el.removeEventListener("mouseenter", addHover);
        el.removeEventListener("mouseleave", removeHover);
      });
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

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• GSAP HOOKS â•â• */

function useGsapIn(selector, vars, trigger) {
  const ref = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        selector ? ref.current.querySelectorAll(selector) : ref.current,
        { opacity: 0, y: 52, ...vars?.from },
        {
          opacity: 1, y: 0,
          stagger: vars?.stagger ?? 0.13,
          duration: vars?.duration ?? 0.8,
          ease: vars?.ease ?? "power3.out",
          scrollTrigger: {
            trigger: trigger ? ref.current.querySelector(trigger) : ref.current,
            start: "top 86%",
            once: true
          }
        }
      );
    }, ref);
    return () => ctx.revert();
  }, []);
  return ref;
}

/* animated counter */
function Counter({ value, suffix, label }) {
  const ref = useRef(null);
  const numRef = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      const obj = { n: 0 };
      gsap.to(obj, {
        n: value,
        duration: 1.6,
        ease: "power2.out",
        snap: { n: 1 },
        onUpdate() { if (numRef.current) numRef.current.textContent = Math.floor(obj.n).toLocaleString() + suffix; },
        scrollTrigger: { trigger: ref.current, start: "top 85%", once: true }
      });
    }, ref);
    return () => ctx.revert();
  }, [value, suffix]);

  return (
    <div ref={ref} className="space-y-1 text-center">
      <p ref={numRef} className="font-serif text-5xl font-semibold text-foreground">0{suffix}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

/* â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• PAGE â•â• */

export function HomePage() {
  /* hero */
  const heroRef   = useRef(null);
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".hero-word",
        { opacity: 0, y: 60, rotateX: -40 },
        { opacity: 1, y: 0, rotateX: 0, stagger: 0.05, duration: 0.9, ease: "power4.out", delay: 0.15 }
      );
      gsap.fromTo(".hero-sub", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.55 });
      gsap.fromTo(".hero-cta", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.75, stagger: 0.1 });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const statsRef    = useGsapIn(".stat-item", { stagger: 0.18 });
  const featuresRef = useGsapIn(".feat-card",  { stagger: 0.1 });
  const stepsRef    = useGsapIn(".step-card",  { stagger: 0.15 });
  const testiRef    = useGsapIn(".testi-card", { stagger: 0.08 });
  const typesRef    = useGsapIn(".type-card",  { stagger: 0.14 });
  const faqRef      = useGsapIn(".faq-item",   { stagger: 0.1 });

  /* parallax orbs in hero */
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(".hero-orb-1", {
        y: -120, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 1.5 }
      });
      gsap.to(".hero-orb-2", {
        y: -60, ease: "none",
        scrollTrigger: { trigger: heroRef.current, start: "top top", end: "bottom top", scrub: 2 }
      });
    });
    return () => ctx.revert();
  }, []);

  /* marquee pause on hover â€” just CSS, no GSAP needed */

  const heroWords = ["Turn", "customer", "love", "into"];
  const heroGrad  = ["revenue-ready", "proof."];

  return (
    <SiteShell>
      <CursorSystem />
      <div className="space-y-8">

        {/* â”€â”€ Hero â”€â”€ */}
        <header
          ref={heroRef}
          className="glass app-grid relative overflow-hidden rounded-[36px] border border-border/70 px-6 py-16 md:px-14 md:py-24"
          style={{ perspective: "1000px" }}
        >
          {/* parallax orbs */}
          <div className="hero-orb-1 orb orb-1" style={{ top: "-60px", left: "-80px" }} />
          <div className="hero-orb-2 orb orb-2" style={{ bottom: "-40px", right: "-60px" }} />

          <div className="relative z-10 grid gap-14 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="hero-cta inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm ring-1 ring-border">
                <Sparkles className="h-3.5 w-3.5" />
                Social proof platform
              </div>

              <h1 className="font-serif text-5xl leading-[1.08] md:text-7xl" style={{ perspective: "600px" }}>
                <span className="block">
                  {heroWords.map((w) => (
                    <span key={w} className="hero-word inline-block mr-[0.22em]">{w}</span>
                  ))}
                </span>
                <span className="block">
                  {heroGrad.map((w) => (
                    <span key={w} className="hero-word gradient-text inline-block mr-[0.22em]">{w}</span>
                  ))}
                </span>
              </h1>

              <p className="hero-sub max-w-xl text-lg text-slate-600">
                FeedSpace collects video, audio, and text testimonials through one branded link,
                lets you moderate what goes live, and embeds social proof anywhere â€” no developer required.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="hero-cta gap-2 text-base">
                  <Link to="/register">Start free <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="secondary" className="hero-cta text-base">
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </div>

              <p className="hero-cta text-sm text-slate-500">No credit card required Â· Live in 5 minutes</p>
            </div>

            {/* Floating review cards */}
            <div className="relative hidden h-[440px] lg:block">
              {floatingCards.map((card) => (
                <div
                  key={card.name}
                  className={`absolute w-64 rounded-3xl border border-border/70 bg-white/95 p-5 shadow-panel ${card.delay} ${card.pos}`}
                >
                  <div className="flex gap-0.5">
                    {Array.from({ length: card.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-700">"{card.text}"</p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                      {card.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{card.name}</p>
                      <p className="text-xs text-slate-500">{card.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </header>

        {/* â”€â”€ Animated stats â”€â”€ */}
        <div ref={statsRef} className="grid gap-8 rounded-[32px] border border-border/70 bg-white/80 px-6 py-10 sm:grid-cols-3 md:px-10">
          {stats.map((s) => (
            <div key={s.label} className="stat-item">
              <Counter value={s.value} suffix={s.suffix} label={s.label} />
            </div>
          ))}
        </div>

        {/* â”€â”€ Scrolling marquee â”€â”€ */}
        <div className="group overflow-hidden rounded-[28px] border border-border/70 bg-slate-950 py-4">
          <div className="flex animate-marquee gap-8 whitespace-nowrap group-hover:[animation-play-state:paused]">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* â”€â”€ Features â”€â”€ */}
        <section ref={featuresRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Everything you need</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Built for the full testimonial workflow.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="feat-card group h-full rounded-[28px] border border-border/70 bg-white/80 p-7 transition hover:-translate-y-1 hover:shadow-panel">
                  <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* â”€â”€ How it works â”€â”€ */}
        <section ref={stepsRef} className="rounded-[36px] border border-border/70 bg-slate-950 px-6 py-14 md:px-12">
          <div className="mb-10">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">How it works</p>
            <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">From link to live proof in three steps.</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.n} className="step-card rounded-[28px] border border-white/10 bg-white/5 p-7">
                  <span className="font-serif text-5xl font-semibold text-white/20">{step.n}</span>
                  <div className="mt-4 inline-flex rounded-2xl bg-primary/20 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* â”€â”€ Testimonials â”€â”€ */}
        <section ref={testiRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">What teams say</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Proof that FeedSpace works.</h2>
          </div>
          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {testimonials.map((t) => (
              <div key={t.author} className="testi-card mb-5 break-inside-avoid rounded-[28px] border border-border/70 bg-white/90 p-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.stars }).map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <Quote className="h-5 w-5 shrink-0 text-primary/40" />
                </div>
                <p className="mt-4 text-sm leading-relaxed text-slate-700">"{t.quote}"</p>
                <div className="mt-5 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                    {t.author[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.author}</p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* â”€â”€ Submission types â”€â”€ */}
        <section ref={typesRef}>
          <div className="mb-8 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Every format covered</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Collect any type of review.</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Video,       label: "Video", desc: "In-browser recording or file upload. Stored on CDN, streamed anywhere.",   bg: "bg-rose-50",   ring: "ring-rose-200",   text: "text-rose-700" },
              { icon: Mic,         label: "Audio", desc: "Voice testimonials for authenticity without video production overhead.",    bg: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-700" },
              { icon: PlayCircle,  label: "Text",  desc: "Written reviews moderated and published to your public wall or widget.",  bg: "bg-sky-50",    ring: "ring-sky-200",    text: "text-sky-700" }
            ].map((type) => {
              const Icon = type.icon;
              return (
                <div key={type.label} className={`type-card rounded-[28px] border p-8 text-center ${type.bg} ${type.ring}`}>
                  <div className={`mx-auto inline-flex rounded-2xl bg-white p-4 ${type.text}`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <h3 className={`mt-5 text-2xl font-semibold ${type.text}`}>{type.label}</h3>
                  <p className="mt-2 text-sm text-slate-600">{type.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* â”€â”€ FAQ â”€â”€ */}
        <section ref={faqRef} className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="faq-item rounded-[36px] border border-border/70 bg-white/80 p-10">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">FAQ</p>
            <h2 className="mt-4 font-serif text-4xl">Common questions answered.</h2>
            <p className="mt-4 text-slate-600">Still curious? Reach out to our team any time.</p>
            <div className="mt-6">
              <Button asChild variant="secondary">
                <Link to="/contact">Contact support</Link>
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {faqs.map((item) => (
              <details key={item.question} className="faq-item group rounded-[24px] border border-border/70 bg-white/80">
                <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-base font-semibold">
                  {item.question}
                  <span className="ml-4 shrink-0 text-xl text-primary transition-transform duration-300 group-open:rotate-45">+</span>
                </summary>
                <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* â”€â”€ Final CTA â”€â”€ */}
        <section className="relative overflow-hidden rounded-[36px] bg-primary px-6 py-16 text-center text-white md:px-12">
          <div className="orb orb-1 pointer-events-none" style={{ top: "-80px", left: "-60px", opacity: 0.25 }} />
          <div className="orb orb-2 pointer-events-none" style={{ bottom: "-80px", right: "-40px", opacity: 0.2 }} />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-200">Ready to launch</p>
            <h2 className="mt-4 font-serif text-4xl text-white md:text-6xl">Your proof engine is one click away.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-teal-100">Collect your first testimonials today. No design or dev work needed.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-white px-8 py-4 text-base font-semibold text-primary hover:bg-white/90">
                <Link to="/register">Start for free</Link>
              </Button>
              <Button asChild className="border border-white/30 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/20">
                <Link to="/features">See all features</Link>
              </Button>
            </div>
          </div>
        </section>

      </div>
    </SiteShell>
  );
}