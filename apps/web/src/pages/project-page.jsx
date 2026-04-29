import { useEffect, useState } from "react";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";
import { formatDate, getEmbedCode } from "../lib/utils";

const statusFilters = ["all", "pending", "approved", "rejected"];

export function ProjectPage() {
  const { projectId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProjectData() {
    try {
      setLoading(true);
      setError("");
      const analyticsData = await api.getProjectAnalytics(projectId);
      const resolvedProjectId = analyticsData?.project?._id || projectId;
      const feedbackData = await api.getProjectFeedback(
        resolvedProjectId,
        filter === "all" ? {} : { status: filter }
      );

      setAnalytics(analyticsData);
      setFeedback(Array.isArray(feedbackData?.items) ? feedbackData.items : []);
    } catch (err) {
      setFeedback([]);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjectData();
  }, [projectId, filter]);

  async function updateStatus(id, status) {
    await api.updateFeedbackStatus(id, status);
    await loadProjectData();
  }

  async function removeFeedback(id) {
    await api.deleteFeedback(id);
    await loadProjectData();
  }

  async function copyEmbed(slug) {
    await navigator.clipboard.writeText(getEmbedCode(slug));
  }

  const project = analytics?.project;
  const metrics = analytics?.metrics;

  return (
    <AppShell>
      <div className="space-y-6">
        {project && (
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle>{project.name}</CardTitle>
                <CardDescription className="mt-2">Moderate feedback, inspect analytics, and share your widget.</CardDescription>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="secondary" className="gap-2" onClick={() => copyEmbed(project.slug)}>
                  <Copy className="h-4 w-4" />
                  Copy embed code
                </Button>
                <Button asChild>
                  <a href={`/feedback/${project.slug}`} target="_blank" rel="noreferrer" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Open public form
                  </a>
                </Button>
              </div>
            </div>

            {metrics && (
              <div className="mt-6 grid gap-4 md:grid-cols-3 xl:grid-cols-6">
                {[
                  ["Total", metrics.total],
                  ["Video", metrics.video],
                  ["Audio", metrics.audio],
                  ["Text", metrics.text],
                  ["Pending", metrics.pending],
                  ["Approved", metrics.approved]
                ].map(([label, value]) => (
                  <div key={label} className="rounded-3xl bg-white/85 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <Card>
          <div className="flex flex-wrap gap-2">
            {statusFilters.map((status) => (
              <Button
                key={status}
                type="button"
                variant={filter === status ? "primary" : "secondary"}
                onClick={() => setFilter(status)}
              >
                {status}
              </Button>
            ))}
          </div>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
          {loading && <p className="mt-4 text-sm text-slate-500">Loading feedback...</p>}

          <div className="mt-6 space-y-4">
            {feedback.map((item) => (
              <div key={item._id} className="rounded-[28px] border border-border/70 bg-white/80 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={item.status}>{item.status}</Badge>
                      <Badge tone={item.type}>{item.type}</Badge>
                    </div>
                    <div>
                      <p className="text-lg font-semibold">{item.name || "Anonymous"}</p>
                      <p className="text-sm text-slate-500">{formatDate(item.createdAt)}</p>
                    </div>
                    {item.message && <p className="max-w-3xl text-slate-700">{item.message}</p>}
                    {item.mediaUrl && (
                      <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary">
                        Open media asset
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="secondary" onClick={() => updateStatus(item._id, "approved")}>
                      Approve
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => updateStatus(item._id, "rejected")}>
                      Reject
                    </Button>
                    <Button type="button" variant="ghost" className="gap-2 text-rose-600" onClick={() => removeFeedback(item._id)}>
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {!loading && feedback.length === 0 && (
              <p className="text-sm text-slate-500">No feedback matches the current filter.</p>
            )}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}