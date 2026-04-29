import { cn } from "../../lib/utils";

const styles = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  rejected: "bg-rose-100 text-rose-700",
  video: "bg-sky-100 text-sky-700",
  audio: "bg-violet-100 text-violet-700",
  text: "bg-slate-200 text-slate-700"
};

export function Badge({ className, tone = "pending", children }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold", styles[tone], className)}>
      {children}
    </span>
  );
}