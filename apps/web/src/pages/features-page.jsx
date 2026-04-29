import { Camera, Globe2, LayoutDashboard, ShieldCheck, UploadCloud, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

const features = [
  {
    icon: Camera,
    title: "Media-first collection",
    description: "Capture video and audio testimonials directly in the browser or upload existing assets from mobile."
  },
  {
    icon: UploadCloud,
    title: "Signed upload pipeline",
    description: "Large media files go straight to Cloudflare R2 or S3-compatible storage to keep the app fast."
  },
  {
    icon: LayoutDashboard,
    title: "Moderation dashboard",
    description: "Review, approve, reject, and remove feedback from a single project-specific workspace."
  },
  {
    icon: Globe2,
    title: "Embeddable widget",
    description: "Publish approved testimonials anywhere with an iframe that reads from a safe public feed."
  },
  {
    icon: ShieldCheck,
    title: "Access control and validation",
    description: "JWT auth, validation, and rate limiting protect dashboard actions and public submission routes."
  },
  {
    icon: Waves,
    title: "Basic analytics",
    description: "See counts by type and moderation status so you know what content is arriving and what is going live."
  }
];

export function FeaturesPage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <section className="rounded-[36px] border border-border/70 bg-white/80 px-6 py-10 md:px-10 md:py-14">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Features</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">Everything needed to run testimonials like a real product surface.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            FeedSpace is designed as a full workflow: capture, store, moderate, analyze, and distribute.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <Card key={feature.title} className="space-y-4">
                <div className="inline-flex rounded-2xl bg-white/90 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            );
          })}
        </section>

        <section className="rounded-[36px] border border-border/70 bg-slate-950 px-6 py-10 text-slate-100 md:px-10">
          <h2 className="font-serif text-4xl">Want to see it live?</h2>
          <p className="mt-4 max-w-2xl text-slate-300">Create an account and go from empty workspace to embeddable proof wall in one setup flow.</p>
          <div className="mt-6">
            <Button asChild>
              <Link to="/register">Start free</Link>
            </Button>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}