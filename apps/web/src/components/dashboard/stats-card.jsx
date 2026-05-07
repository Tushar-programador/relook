import { Card } from "../ui/card.jsx";

export function StatsCard({ label, value, accent, hint }) {
  return (
    <Card className="relative overflow-hidden border border-border/70 bg-white/80">
      <div className="absolute inset-x-6 top-0 h-1 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-4xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-3 text-xs font-medium text-slate-500">{hint}</p> : null}
    </Card>
  );
}