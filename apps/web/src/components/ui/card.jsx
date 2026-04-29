import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return <div className={cn("glass rounded-[28px] border border-border/70 p-6 shadow-panel", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("font-serif text-2xl font-semibold", className)} {...props} />;
}

export function CardDescription({ className, ...props }) {
  return <p className={cn("text-sm text-slate-600", className)} {...props} />;
}