import { ArrowRight, Copy, ExternalLink, Eye, MessageCircle, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmbedCode } from "../../lib/utils";
import { Card, CardDescription, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";

export function ProjectCard({ project, plan = "free" }) {
  const portalLink = `${window.location.origin}/feedback/${project.slug}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(`Share your feedback here: ${portalLink}`)}`;
  const isFreePlan = plan === "free";
  const layoutOptions = useMemo(
    () => (isFreePlan ? ["simple", "carousel"] : ["simple", "carousel", "bubble", "post"]),
    [isFreePlan]
  );
  const [embedLayout, setEmbedLayout] = useState(layoutOptions[0]);
  const [showPreview, setShowPreview] = useState(false);

  function getPreviewUrl() {
    return `/widget/${project.slug}?layout=${encodeURIComponent(embedLayout)}`;
  }

  async function copyEmbed() {
    await navigator.clipboard.writeText(getEmbedCode(project.slug, { layout: embedLayout }));
  }

  async function copyPortalLink() {
    await navigator.clipboard.writeText(portalLink);
  }

  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>{project.name}</CardTitle>
          <CardDescription className="mt-2">/{project.slug}</CardDescription>
        </div>
        <div className="flex gap-2">
          <a href={`/feedback/${project.slug}`} target="_blank" rel="noreferrer" className="rounded-full bg-muted p-3 text-slate-700">
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-3xl bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total feedback</p>
          <p className="mt-2 text-3xl font-semibold">{project.stats.totalFeedback}</p>
        </div>
        <div className="rounded-3xl bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Approved</p>
          <p className="mt-2 text-3xl font-semibold">{project.stats.approvedFeedback}</p>
        </div>
        <div className="rounded-3xl bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Review link opens</p>
          <p className="mt-2 text-3xl font-semibold">{project.stats.totalLinkOpens || 0}</p>
        </div>
        <div className="rounded-3xl bg-white/85 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Unique visitors</p>
          <p className="mt-2 text-3xl font-semibold">{project.stats.uniqueLinkVisitors || 0}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="secondary" className="gap-2" onClick={copyPortalLink}>
          <Copy className="h-4 w-4" />
          Copy portal link
        </Button>
        <Button variant="secondary" asChild className="gap-2">
          <a href={whatsappShareLink} target="_blank" rel="noreferrer">
            <MessageCircle className="h-4 w-4" />
            Share on WhatsApp
          </a>
        </Button>
        <div className="flex items-center gap-2 rounded-2xl border border-border/60 bg-white/70 px-2 py-1.5">
          <select
            value={embedLayout}
            onChange={(e) => setEmbedLayout(e.target.value)}
            className="h-8 rounded-lg border border-border/60 bg-white px-2 text-xs text-foreground outline-none"
          >
            {layoutOptions.map((layout) => (
              <option key={layout} value={layout}>
                {layout} embed
              </option>
            ))}
          </select>
          <Button variant="secondary" className="h-8 gap-2 px-3 text-xs" onClick={copyEmbed}>
            <Copy className="h-3.5 w-3.5" />
            Copy embed
          </Button>
          <Button variant="secondary" className="h-8 gap-2 px-3 text-xs" onClick={() => setShowPreview(true)}>
            <Eye className="h-3.5 w-3.5" />
            Preview
          </Button>
        </div>
        <Button variant="secondary" asChild>
          <a href={`/feedback/${project.slug}`} target="_blank" rel="noreferrer">
            Open portal webpage
          </a>
        </Button>
        <Button variant="secondary" asChild>
          <a href={`/wall/${project.slug}`} target="_blank" rel="noreferrer">
            View wall of love
          </a>
        </Button>
        <Button asChild className="gap-2">
          <Link to={`/projects/${project._id}`}>
            Manage project
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {isFreePlan ? (
        <p className="text-xs text-slate-500">Free plan includes <span className="font-semibold">simple</span> and <span className="font-semibold">carousel</span> embeds.</p>
      ) : (
        <p className="text-xs text-slate-500">Pro/Business unlocks showcase embeds: <span className="font-semibold">bubble</span> and <span className="font-semibold">post</span>.</p>
      )}

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setShowPreview(false)}>
          <div className="w-full max-w-4xl rounded-3xl border border-border/70 bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Embed preview</p>
                <p className="text-xs text-slate-500">Layout: {embedLayout}</p>
              </div>
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowPreview(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mb-3 flex flex-wrap gap-2">
              {layoutOptions.map((layout) => (
                <button
                  key={layout}
                  type="button"
                  onClick={() => setEmbedLayout(layout)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                    embedLayout === layout
                      ? "bg-slate-900 text-white"
                      : "border border-border/60 bg-white text-slate-600 hover:bg-muted"
                  }`}
                >
                  {layout}
                </button>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/60 bg-slate-50">
              <iframe
                src={getPreviewUrl()}
                title={`Embed preview ${project.slug}`}
                className="h-[520px] w-full border-0"
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}