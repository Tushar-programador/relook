import { BookOpenText, LifeBuoy, MessageCircleQuestion, ShieldCheck } from "lucide-react";
import { AppShell } from "../components/layout/app-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

const helpTopics = [
  {
    icon: BookOpenText,
    title: "Getting started",
    description: "Create a portal, share your feedback link, and start collecting customer reviews in minutes."
  },
  {
    icon: ShieldCheck,
    title: "Moderation",
    description: "Approve or reject incoming responses before publishing them on wall, widget, or spotlight pages."
  },
  {
    icon: MessageCircleQuestion,
    title: "Sharing",
    description: "Use copy-link, WhatsApp share, and spotlight pages to distribute testimonials quickly."
  }
];

export function HelpPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Help center</p>
          <CardTitle className="mt-3 text-4xl">Customer help for your logged-in workspace</CardTitle>
          <CardDescription className="mt-3 max-w-3xl">
            This page is dedicated for logged-in customers. Find quick answers for setup, moderation,
            sharing, and support without leaving your dashboard area.
          </CardDescription>
        </Card>

        <div className="grid gap-5 md:grid-cols-3">
          {helpTopics.map((topic) => {
            const Icon = topic.icon;
            return (
              <Card key={topic.title} className="space-y-4">
                <div className="inline-flex rounded-2xl bg-white/90 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-2xl">{topic.title}</CardTitle>
                <CardDescription>{topic.description}</CardDescription>
              </Card>
            );
          })}
        </div>

        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Need direct support?</CardTitle>
              <CardDescription className="mt-2">
                For account access, billing, or onboarding help, contact our support team.
              </CardDescription>
            </div>
            <Button asChild className="gap-2">
              <a href="mailto:hello@feedspace.app?subject=FeedSpace%20Support%20Request">
                <LifeBuoy className="h-4 w-4" />
                Email support
              </a>
            </Button>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
