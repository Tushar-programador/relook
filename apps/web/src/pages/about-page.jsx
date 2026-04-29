import { Building2, Rocket, Users2 } from "lucide-react";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

const pillars = [
  {
    icon: Rocket,
    title: "Built for fast shipping",
    description: "The product is intentionally shaped as an MVP that can run in production today and scale into deeper platform services later."
  },
  {
    icon: Building2,
    title: "Designed for modern brands",
    description: "The workflow maps to how D2C teams, freelancers, and agencies actually collect testimonials now: through mobile-first interactions."
  },
  {
    icon: Users2,
    title: "Made for reuse",
    description: "Every decision is aimed at turning feedback into structured, reusable marketing proof instead of one-off submissions."
  }
];

export function AboutPage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <section className="rounded-[36px] border border-border/70 bg-white/80 px-6 py-10 md:px-10 md:py-14">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">About</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">FeedSpace exists to make customer proof operational.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Most brands already have testimonials. The real problem is that the proof is scattered, hard to moderate, and harder to reuse. FeedSpace fixes that system gap.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <Card key={pillar.title} className="space-y-4">
                <div className="inline-flex rounded-2xl bg-white/90 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl">{pillar.title}</CardTitle>
                <CardDescription>{pillar.description}</CardDescription>
              </Card>
            );
          })}
        </section>
      </div>
    </SiteShell>
  );
}