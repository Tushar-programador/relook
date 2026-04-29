import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { SiteShell } from "../components/marketing/site-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "For early-stage brands validating the workflow.",
    features: ["50 feedback submissions per month", "Basic moderation dashboard", "Iframe widget", "Text, audio, and video capture"]
  },
  {
    name: "Pro",
    price: "$29",
    description: "For teams that want unlimited proof collection and brand control.",
    features: ["Unlimited submissions", "Custom branding", "Priority support", "Advanced widget usage"]
  },
  {
    name: "Business",
    price: "$99",
    description: "For larger brands and agencies managing multiple proof channels.",
    features: ["Analytics access", "API access", "Higher operational limits", "Multi-brand workflows"]
  }
];

export function PricingPage() {
  return (
    <SiteShell>
      <div className="space-y-8">
        <section className="rounded-[36px] border border-border/70 bg-white/80 px-6 py-10 md:px-10 md:py-14">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">Pricing</p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-6xl">Pricing shaped around collection volume, not vanity seats.</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">
            Start free, prove demand, then move up when you need more collection capacity, branding control, and analytics.
          </p>
        </section>

        <section className="grid gap-5 xl:grid-cols-3">
          {plans.map((plan, index) => (
            <Card key={plan.name} className={index === 1 ? "bg-slate-950 text-slate-100" : ""}>
              <CardTitle className={index === 1 ? "text-white" : ""}>{plan.name}</CardTitle>
              <p className={`mt-4 text-5xl font-semibold ${index === 1 ? "text-white" : "text-slate-900"}`}>
                {plan.price}
                <span className={`text-base font-normal ${index === 1 ? "text-slate-300" : "text-slate-500"}`}>/mo</span>
              </p>
              <CardDescription className={`mt-4 ${index === 1 ? "text-slate-300" : ""}`}>{plan.description}</CardDescription>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3 text-sm">
                    <div className={`mt-0.5 rounded-full p-1 ${index === 1 ? "bg-white/10 text-white" : "bg-emerald-100 text-emerald-700"}`}>
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <Button asChild variant={index === 1 ? "primary" : "secondary"} className={index === 1 ? "bg-white text-slate-950 hover:opacity-95" : ""}>
                  <Link to="/register">Choose {plan.name}</Link>
                </Button>
              </div>
            </Card>
          ))}
        </section>
      </div>
    </SiteShell>
  );
}