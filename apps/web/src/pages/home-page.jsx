import { ArrowRight, BarChart3, CheckCircle2, Link2, PlayCircle, ShieldCheck, Sparkles, Workflow } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

const featureCards = [
  {
    icon: PlayCircle,
    title: "Collect video, audio, and text",
    description: "Public feedback pages work on mobile first and accept media-rich testimonials."
  },
  {
    icon: ShieldCheck,
    title: "Moderate before publishing",
    description: "Review every submission, approve the best ones, and keep public widgets clean."
  },
  {
    icon: Link2,
    title: "Embed anywhere",
    description: "Drop an iframe on any site and stream approved testimonials instantly."
  },
  {
    icon: BarChart3,
    title: "Track what matters",
    description: "Basic analytics show the volume and mix of video, audio, and text feedback."
  }
];

const steps = [
  {
    icon: Sparkles,
    title: "Launch a branded collection page",
    description: "Spin up a project, set a unique slug, and start collecting text, audio, or video feedback."
  },
  {
    icon: Workflow,
    title: "Review incoming proof in one inbox",
    description: "Moderate submissions, approve only the strongest stories, and keep everything organized by project."
  },
  {
    icon: CheckCircle2,
    title: "Embed approved testimonials anywhere",
    description: "Use the widget on storefronts, landing pages, or campaign microsites without rebuilding content blocks."
  }
];

const faqs = [
  {
    question: "Can customers submit feedback without creating an account?",
    answer: "Yes. Public feedback pages are unauthenticated and optimized for mobile-first submissions."
  },
  {
    question: "Does FeedSpace support video and audio uploads?",
    answer: "Yes. It supports browser recording and direct signed uploads to R2 or S3-compatible storage."
  },
  {
    question: "How do widgets stay safe for public display?",
    answer: "Only approved feedback is exposed through the public feed and widget routes."
  }
];

const trustSignals = [
  {
    title: "Secure by design",
    description: "JWT auth, route-level validation, and OTP-based account recovery are built into the platform architecture."
  },
  {
    title: "Performance minded",
    description: "Direct signed uploads keep heavy media away from app servers and reduce bottlenecks under load."
  },
  {
    title: "Moderation guardrails",
    description: "Only approved testimonials are exposed through public endpoints and embeddable widgets."
  }
];

const customerProof = [
  {
    quote: "We moved from random Instagram DMs to one reliable testimonial inbox in a week.",
    author: "Aditi S.",
    role: "Founder, D2C Beauty Brand"
  },
  {
    quote: "The approval pipeline gave us confidence to show video testimonials on paid landing pages.",
    author: "Rahul M.",
    role: "Performance Marketer"
  },
  {
    quote: "Clients finally have one place for capture, review, and embed. It cut agency handoff friction hard.",
    author: "Nikita G.",
    role: "Agency Partner"
  }
];

export function HomePage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <header className="glass app-grid overflow-hidden rounded-[36px] border border-border/70 px-6 py-10 md:px-10 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="max-w-3xl space-y-5">
              <p className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600">
                UGC collection + testimonial platform
              </p>
              <h1 className="max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
                Turn scattered customer feedback into a revenue-ready proof library.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                FeedSpace gives brands one system for collecting, moderating, and embedding video, audio, and text testimonials without duct-taping forms, drives, and DMs.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link to="/register">
                    Launch dashboard
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="secondary">
                  <Link to="/pricing">See pricing</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="bg-white/90">
                <CardDescription>Submission types</CardDescription>
                <CardTitle className="mt-3 text-4xl">3</CardTitle>
                <p className="mt-3 text-sm text-slate-600">Text, audio, and video all flow through the same moderation pipeline.</p>
              </Card>
              <Card className="bg-white/90">
                <CardDescription>Public widget safety</CardDescription>
                <CardTitle className="mt-3 text-4xl">100%</CardTitle>
                <p className="mt-3 text-sm text-slate-600">Only approved testimonials reach the widget and public API feed.</p>
              </Card>
              <Card className="bg-white/90 sm:col-span-2">
                <CardDescription>Built for D2C brands, agencies, creators, and SaaS teams</CardDescription>
                <CardTitle className="mt-3 text-3xl">Capture proof once, distribute it across every touchpoint.</CardTitle>
              </Card>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {featureCards.map((card) => {
            const Icon = card.icon;

            return (
              <Card key={card.title} className="space-y-4">
                <div className="inline-flex rounded-2xl bg-white/90 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </Card>
            );
          })}
        </section>

        <section className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardDescription className="uppercase tracking-[0.24em]">How it works</CardDescription>
            <CardTitle className="mt-4 max-w-lg">A complete testimonial workflow, not just a capture form.</CardTitle>
          </Card>

          <div className="grid gap-5 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;

              return (
                <Card key={step.title} className="space-y-4">
                  <div className="inline-flex rounded-2xl bg-white/90 p-3 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card className="bg-slate-950 text-slate-100">
            <CardDescription className="text-slate-400">Why teams switch</CardDescription>
            <CardTitle className="mt-4 text-4xl text-white">Stop managing testimonials in screenshots, DMs, and random folders.</CardTitle>
            <p className="mt-4 max-w-xl text-sm text-slate-300">
              FeedSpace centralizes capture, moderation, analytics, and embeds so your proof pipeline is reliable enough for production campaigns.
            </p>
          </Card>

          <Card>
            <CardDescription className="uppercase tracking-[0.24em]">FAQ</CardDescription>
            <div className="mt-6 space-y-5">
              {faqs.map((item) => (
                <div key={item.question} className="rounded-3xl bg-white/75 p-5">
                  <h3 className="text-lg font-semibold">{item.question}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.answer}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <Card>
            <CardDescription className="uppercase tracking-[0.24em]">Trust signals</CardDescription>
            <CardTitle className="mt-4">Built with production safeguards, not just pretty UI blocks.</CardTitle>
            <div className="mt-5 space-y-4">
              {trustSignals.map((signal) => (
                <div key={signal.title} className="rounded-3xl bg-white/80 p-5">
                  <h3 className="text-lg font-semibold">{signal.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{signal.description}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <CardDescription className="uppercase tracking-[0.24em]">What users say</CardDescription>
            <CardTitle className="mt-4">Social proof from early teams using FeedSpace workflows.</CardTitle>
            <div className="mt-5 space-y-4">
              {customerProof.map((item) => (
                <div key={item.author} className="rounded-3xl bg-white/80 p-5">
                  <p className="text-sm text-slate-700">"{item.quote}"</p>
                  <p className="mt-3 text-sm font-semibold">{item.author}</p>
                  <p className="text-xs text-slate-500">{item.role}</p>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="rounded-[36px] border border-border/70 bg-white/80 px-6 py-10 text-center md:px-10">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Ready to launch</p>
          <h2 className="mt-4 font-serif text-4xl md:text-5xl">Build a proof engine your team can actually operate.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Start with the free tier, collect your first wave of testimonials, and ship an embeddable wall of proof in the same week.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild>
              <Link to="/register">Start free</Link>
            </Button>
            <Button asChild variant="secondary">
              <Link to="/contact">Talk to sales</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}