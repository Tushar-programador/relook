import { ArrowRight, Copy, ExternalLink, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { getEmbedCode } from "../../lib/utils";
import { Card, CardDescription, CardTitle } from "../ui/card.jsx";
import { Button } from "../ui/button.jsx";

export function ProjectCard({ project }) {
  const portalLink = `${window.location.origin}/feedback/${project.slug}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(`Share your feedback here: ${portalLink}`)}`;

  async function copyEmbed() {
    await navigator.clipboard.writeText(getEmbedCode(project.slug));
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
        <Button variant="secondary" className="gap-2" onClick={copyEmbed}>
          <Copy className="h-4 w-4" />
          Copy widget embed
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
    </Card>
  );
}