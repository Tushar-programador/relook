import { ArrowRight, BarChart3, Link2, PlayCircle, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
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

export function HomePage() {
  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="glass app-grid overflow-hidden rounded-[36px] border border-border/70 px-6 py-10 md:px-10 md:py-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-5">
              <p className="inline-flex rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.28em] text-slate-600">
                UGC collection + testimonial platform
              </p>
              <h1 className="max-w-2xl font-serif text-5xl leading-tight md:text-7xl">
                Turn customer feedback into reusable proof.
              </h1>
              <p className="max-w-2xl text-lg text-slate-600">
                FeedSpace gives brands one system for collecting, moderating, and embedding video, audio, and text testimonials.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/register">
                  Launch dashboard
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/login">Log in</Link>
              </Button>
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
      </div>
    </div>
  );
}