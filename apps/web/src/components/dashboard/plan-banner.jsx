import { ArrowRight, Sparkles, Zap } from "lucide-react";

/* ── plan config ───────────────────────────────── */

const PLAN_CONFIG = {
  free: {
    label: "Free",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    projectLimit: 1,
    responseLimit: 50,
  },
  pro: {
    label: "Pro",
    badge: "bg-primary/10 text-primary ring-primary/20",
    projectLimit: 5,
    responseLimit: Infinity,
  },
  business: {
    label: "Business",
    badge: "bg-violet-100 text-violet-700 ring-violet-200",
    projectLimit: Infinity,
    responseLimit: Infinity,
  },
};

function UsageBar({ used, limit, label, warn }) {
  const pct = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100);
  const atLimit = used >= limit;
  const nearLimit = pct >= 80;

  const trackColor = atLimit
    ? "bg-rose-100"
    : nearLimit
    ? "bg-amber-100"
    : "bg-slate-100";
  const fillColor = atLimit
    ? "bg-rose-500"
    : nearLimit
    ? "bg-amber-400"
    : "bg-primary";
  const textColor = atLimit
    ? "text-rose-600 font-semibold"
    : nearLimit
    ? "text-amber-600"
    : "text-slate-500";

  return (
    <div className="min-w-[160px]">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-slate-500">{label}</span>
        {limit === Infinity ? (
          <span className="text-xs text-primary font-medium">Unlimited</span>
        ) : (
          <span className={`text-xs ${textColor}`}>
            {used} / {limit}
          </span>
        )}
      </div>
      {limit !== Infinity && (
        <div className={`mt-1.5 h-1.5 w-full rounded-full ${trackColor}`}>
          <div
            className={`h-1.5 rounded-full transition-all duration-700 ${fillColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function PlanBanner({ plan = "free", projectsUsed = 0, responsesUsed = 0, onUpgradeClick }) {
  const cfg = PLAN_CONFIG[plan] ?? PLAN_CONFIG.free;
  const atProjectLimit = projectsUsed >= cfg.projectLimit;
  const atResponseLimit = responsesUsed >= cfg.responseLimit;
  const nearResponseLimit = cfg.responseLimit !== Infinity && responsesUsed / cfg.responseLimit >= 0.8;
  const showUpgradeNudge = plan === "free" && (atProjectLimit || atResponseLimit || nearResponseLimit);

  return (
    <div
      className={`relative overflow-hidden rounded-[20px] border px-5 py-4 flex flex-wrap items-center gap-4 justify-between
        ${showUpgradeNudge
          ? "border-amber-200 bg-amber-50"
          : "border-border/70 bg-white/80"
        }`}
    >
      {/* left: plan badge + meters */}
      <div className="flex flex-wrap items-center gap-5">
        {/* plan label */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-semibold ring-1 ${cfg.badge}`}>
            {cfg.label} Plan
          </span>
        </div>

        {/* usage bars */}
        <div className="flex flex-wrap gap-5">
          <UsageBar
            label="Projects"
            used={projectsUsed}
            limit={cfg.projectLimit}
          />
          <UsageBar
            label="Responses this month"
            used={responsesUsed}
            limit={cfg.responseLimit}
          />
        </div>
      </div>

      {/* right: upgrade CTA (only on free) */}
      {plan === "free" && (
        <button
          onClick={onUpgradeClick}
          className="flex shrink-0 items-center gap-2 rounded-full bg-primary px-5 py-2 text-xs font-semibold text-white transition hover:bg-primary/90 active:scale-95"
        >
          <Zap className="h-3.5 w-3.5" />
          Upgrade plan
          <ArrowRight className="h-3 w-3" />
        </button>
      )}

      {/* soft paywall nudge text */}
      {showUpgradeNudge && (
        <p className="w-full text-xs text-amber-700 -mt-1">
          {atProjectLimit
            ? "You've hit the 1-project limit. Upgrade to Pro for 5 projects."
            : atResponseLimit
            ? "You've used all 50 free responses this month. Upgrade to get unlimited."
            : "You're nearing your free plan limits. Upgrade before you're blocked."}
        </p>
      )}
    </div>
  );
}
