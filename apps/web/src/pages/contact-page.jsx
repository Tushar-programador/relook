import { Mail, MessageSquareMore, PhoneCall } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";

export function ContactPage() {
  return (
    <SiteShell>
      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="space-y-5">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Contact</p>
          <CardTitle className="text-4xl">Need a rollout plan for your brand or agency?</CardTitle>
          <CardDescription>
            Use the demo request form or reach out directly if you want help with onboarding, branding, or multi-project setup.
          </CardDescription>

          <div className="space-y-4 text-sm text-slate-700">
            <div className="flex items-center gap-3 rounded-3xl bg-white/80 p-4">
              <Mail className="h-5 w-5 text-primary" />
              <span>hello@feedspace.app</span>
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-white/80 p-4">
              <PhoneCall className="h-5 w-5 text-primary" />
              <span>Sales and onboarding support</span>
            </div>
            <div className="flex items-center gap-3 rounded-3xl bg-white/80 p-4">
              <MessageSquareMore className="h-5 w-5 text-primary" />
              <span>Replies within one business day</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardTitle>Request a demo</CardTitle>
          <CardDescription className="mt-2">This form is presentational for now. Use email or start with the free plan immediately.</CardDescription>

          <form className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Input placeholder="Your name" />
              <Input type="email" placeholder="Work email" />
            </div>
            <Input placeholder="Company or brand" />
            <Textarea placeholder="Tell us about your testimonial workflow, current pain points, and rollout goals" />

            <div className="flex flex-wrap gap-3">
              <Button asChild>
                <a href="mailto:hello@feedspace.app?subject=FeedSpace%20Demo%20Request">Email sales</a>
              </Button>
              <Button asChild variant="secondary">
                <Link to="/register">Start free instead</Link>
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </SiteShell>
  );
}