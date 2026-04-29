import { Card } from "../ui/card.jsx";

export function StatsCard({ label, value, accent }) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-x-6 top-0 h-1 rounded-full" style={{ backgroundColor: accent }} />
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-4 text-4xl font-semibold">{value}</p>
    </Card>
  );
}