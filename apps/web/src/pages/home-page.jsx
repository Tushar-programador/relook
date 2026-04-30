import { useEffect, useRef, useState } from "react";
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
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

/* ── Scroll-reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible];
}

/* ── Counter animation hook ── */
function useCount(target, visible) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);

  useEffect(() => {
    if (!visible) {
      return;
    }

    const duration = 1400;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(ease * target));

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    frameRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameRef.current);
  }, [visible, target]);

  return count;
}

/* ── Reusable reveal wrapper ── */
function Reveal({ children, className = "", delay = 0, direction = "" }) {
  const [ref, visible] = useReveal();
  const classes = `reveal ${direction} ${visible ? "in-view" : ""} ${delay ? `delay-${delay}` : ""} ${className}`;
  return (
    <div ref={ref} className={classes}>
      {children}
    </div>
  );
}

/* ── Animated stat box ── */
function AnimatedStat({ value, suffix = "", label }) {
  const [ref, visible] = useReveal();
  const count = useCount(value, visible);
  return (
    <div ref={ref} className="space-y-1 text-center">
      <p className="font-serif text-5xl font-semibold text-foreground">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

const floatingCards = [
  { name: "Sarah K.", role: "E-commerce founder", text: "Doubled conversion on our PDPs using FeedSpace video reviews.", stars: 5, delay: "animate-float-a", pos: "top-4 left-0 rotate-[-1.5deg]" },
  { name: "James R.", role: "Performance marketer", text: "Audio reviews from our community converted better than polished ads.", stars: 5, delay: "animate-float-b", pos: "top-2 right-0 rotate-[1.5deg]" },
  { name: "Nikita G.", role: "Agency partner", text: "One link, every format. Clients love the wall of love page.", stars: 5, delay: "animate-float-c", pos: "bottom-4 left-4 rotate-[-0.8deg]" }
];

const marqueeItems = [
  "Video testimonials", "Audio reviews", "Text feedback", "Public collection pages",
  "Moderation inbox", "Embeddable widgets", "Wall of love", "Spotlight pages",
  "Link analytics", "Unique visitors", "Response rates", "Cloudinary CDN"
];

const features = [
  { icon: Video,      title: "Video + audio + text",    description: "One mobile-friendly form accepts browser recordings, uploads, and written reviews." },
  { icon: ShieldCheck, title: "Approve before publishing", description: "Moderate every submission. Only the best ones hit your public widget." },
  { icon: Link2,       title: "Embed anywhere",           description: "Drop an iframe on any page and stream approved testimonials live." },
  { icon: BarChart3,   title: "Link analytics",           description: "Track opens, unique visitors, response rate, and trend over 14 days." },
  { icon: Globe,       title: "Spotlight pages",          description: "Each approved review gets its own shareable page for social proof campaigns." },
  { icon: Zap,         title: "Instant WhatsApp share",   description: "Share portal links and review spotlights directly through WhatsApp." }
];

const steps = [
  { n: "01", icon: Sparkles, title: "Launch your portal",       description: "Create a project, get a branded link, and start collecting testimonials in minutes." },
  { n: "02", icon: Workflow,  title: "Review in one inbox",      description: "Approve the strongest stories and reject anything off-brand. Bulk or one by one." },
  { n: "03", icon: CheckCircle2, title: "Publish and embed",    description: "Use your wall, widget, or spotlight links across landing pages and social campaigns." }
];

const testimonials = [
  { quote: "We moved from scattered Instagram DMs to one clean inbox in under a week.", author: "Aditi S.", role: "Founder, D2C Beauty Brand", stars: 5 },
  { quote: "Video testimonials on our checkout page lifted conversion by 18%. Needed FeedSpace to make it happen.", author: "Rahul M.", role: "Performance Marketer", stars: 5 },
  { quote: "The spotlight page is our favorite feature — one link per happy customer, shareable instantly.", author: "Priya T.", role: "SaaS Growth Lead", stars: 5 },
  { quote: "Finally a tool that handles the entire UGC workflow, not just the capture part.", author: "Nikita G.", role: "Agency Partner", stars: 5 },
  { quote: "Response rate analytics helped us figure out which campaign drove the most genuine reviews.", author: "Chris O.", role: "Head of Marketing", stars: 5 },
  { quote: "Embedding the wall of love on our home page took 30 seconds and it looks incredible.", author: "Mei L.", role: "Indie Maker", stars: 5 }
];

const faqs = [
  { question: "Can customers submit without an account?", answer: "Yes. Public feedback pages are open and mobile-optimized — no login required." },
  { question: "What media types are supported?", answer: "Browser-recorded video, browser-recorded audio, file uploads, and plain text." },
  { question: "Are public widgets safe?",   answer: "Only approved testimonials are returned by public API routes and embedded widgets." },
  { question: "Can I share individual reviews?", answer: "Yes. Every approved review gets a spotlight page you can share via link or WhatsApp." }
];

export function HomePage() {
  const [statsRef, statsVisible] = useReveal();

  return (
    <SiteShell>
      <div className="space-y-8">

        {/* ── Hero ── */}
        <header className="glass app-grid relative overflow-hidden rounded-[36px] border border-border/70 px-6 py-14 md:px-14 md:py-20">
          <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr_0.85fr] lg:items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm ring-1 ring-border">
                <Sparkles className="h-3.5 w-3.5" />
                Social proof platform
              </div>

              <h1 className="font-serif text-5xl leading-[1.1] md:text-7xl">
                Turn customer love into{" "}
                <span className="gradient-text">revenue-ready proof.</span>
              </h1>

              <p className="max-w-xl text-lg text-slate-600">
                FeedSpace collects video, audio, and text testimonials through one branded link,
                lets you moderate what goes live, and embeds social proof anywhere — no developer required.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button asChild className="gap-2 text-base">
                  <Link to="/register">
                    Start free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary" className="text-base">
                  <Link to="/pricing">View pricing</Link>
                </Button>
              </div>

              <p className="text-sm text-slate-500">No credit card required · Live in 5 minutes</p>
            </div>

            {/* Floating review cards */}
            <div className="relative hidden h-[420px] lg:block">
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

        {/* ── Animated stats ── */}
        <div
          ref={statsRef}
          className="grid gap-8 rounded-[32px] border border-border/70 bg-white/80 px-6 py-10 sm:grid-cols-3 md:px-10"
        >
          <AnimatedStat value={2400}  suffix="+"  label="Testimonials collected" />
          <AnimatedStat value={98}    suffix="%"  label="Customer satisfaction" />
          <AnimatedStat value={12}    suffix="x"  label="Average ROI on proof spend" />
        </div>

        {/* ── Scrolling marquee ── */}
        <div className="overflow-hidden rounded-[28px] border border-border/70 bg-slate-950 py-4">
          <div className="flex animate-marquee gap-8 whitespace-nowrap">
            {[...marqueeItems, ...marqueeItems].map((item, i) => (
              <span key={i} className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Features ── */}
        <section>
          <Reveal className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Everything you need</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Built for the full testimonial workflow.</h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <Reveal key={f.title} delay={(i % 3) + 1}>
                  <div className="group h-full rounded-[28px] border border-border/70 bg-white/80 p-7 transition hover:-translate-y-1 hover:shadow-panel">
                    <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary transition group-hover:bg-primary group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 text-xl font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── How it works ── */}
        <section className="rounded-[36px] border border-border/70 bg-slate-950 px-6 py-14 md:px-12">
          <Reveal>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-400">How it works</p>
            <h2 className="mt-3 font-serif text-4xl text-white md:text-5xl">
              From link to live proof in three steps.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <Reveal key={step.n} delay={i + 1}>
                  <div className="rounded-[28px] border border-white/10 bg-white/5 p-7">
                    <span className="font-serif text-5xl font-semibold text-white/20">{step.n}</span>
                    <div className="mt-4 inline-flex rounded-2xl bg-primary/20 p-3 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-xl font-semibold text-white">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── Testimonial grid ── */}
        <section>
          <Reveal className="mb-6 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">What teams say</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Proof that FeedSpace works.</h2>
          </Reveal>

          <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
            {testimonials.map((t, i) => (
              <Reveal key={t.author} delay={(i % 3) + 1} className="mb-5 break-inside-avoid">
                <div className="rounded-[28px] border border-border/70 bg-white/90 p-6">
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
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Submission types callout ── */}
        <section>
          <Reveal className="mb-5 text-center">
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Every format covered</p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">Collect any type of review.</h2>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Video, label: "Video",  desc: "In-browser recording or file upload. Stored on CDN, streamed anywhere.",  bg: "bg-rose-50",   ring: "ring-rose-200",   text: "text-rose-700" },
              { icon: Mic,   label: "Audio",  desc: "Voice testimonials for authenticity without video production overhead.",   bg: "bg-violet-50", ring: "ring-violet-200", text: "text-violet-700" },
              { icon: PlayCircle, label: "Text", desc: "Written reviews moderated and published to your public wall or widget.", bg: "bg-sky-50",    ring: "ring-sky-200",    text: "text-sky-700" }
            ].map((type, i) => {
              const Icon = type.icon;
              return (
                <Reveal key={type.label} delay={i + 1}>
                  <div className={`rounded-[28px] border p-8 text-center ${type.bg} ${type.ring}`}>
                    <div className={`mx-auto inline-flex rounded-2xl bg-white p-4 ${type.text}`}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className={`mt-5 text-2xl font-semibold ${type.text}`}>{type.label}</h3>
                    <p className="mt-2 text-sm text-slate-600">{type.desc}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <Reveal direction="reveal-left">
            <div className="rounded-[36px] border border-border/70 bg-white/80 p-10">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-500">FAQ</p>
              <h2 className="mt-4 font-serif text-4xl">Common questions answered.</h2>
              <p className="mt-4 text-slate-600">Still curious? Reach out to our team any time.</p>
              <div className="mt-6">
                <Button asChild variant="secondary">
                  <Link to="/contact">Contact support</Link>
                </Button>
              </div>
            </div>
          </Reveal>

          <div className="space-y-4">
            {faqs.map((item, i) => (
              <Reveal key={item.question} delay={i + 1} direction="reveal-right">
                <details className="group rounded-[24px] border border-border/70 bg-white/80">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-6 py-5 text-base font-semibold">
                    {item.question}
                    <span className="ml-4 shrink-0 text-xl text-primary transition group-open:rotate-45">+</span>
                  </summary>
                  <p className="px-6 pb-5 text-sm leading-relaxed text-slate-600">{item.answer}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Final CTA ── */}
        <Reveal direction="reveal-scale">
          <section className="rounded-[36px] bg-primary px-6 py-16 text-center text-white md:px-12">
            <p className="text-xs uppercase tracking-[0.28em] text-teal-200">Ready to launch</p>
            <h2 className="mt-4 font-serif text-4xl text-white md:text-6xl">
              Your proof engine is one click away.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-teal-100">
              Collect your first testimonials today. No design or dev work needed.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button asChild className="bg-white px-8 py-4 text-base font-semibold text-primary hover:bg-white/90">
                <Link to="/register">Start for free</Link>
              </Button>
              <Button asChild className="border border-white/30 bg-white/10 px-8 py-4 text-base text-white hover:bg-white/20">
                <Link to="/features">See all features</Link>
              </Button>
            </div>
          </section>
        </Reveal>

      </div>
    </SiteShell>
  );
}