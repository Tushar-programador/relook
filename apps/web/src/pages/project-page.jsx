import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Bot, Brain, Copy, Download, ExternalLink, Eye, Key, RefreshCw, Search, Settings2, Share2, Sparkles, ThumbsUp, Trash2, UserMinus, UserPlus, Users, X } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { api } from "../lib/api";
import { cn, formatDate, getEmbedCode } from "../lib/utils";

const statusFilters = ["all", "pending", "approved", "rejected"];
const typeFilters = ["all", "video", "audio", "text"];

function getCloudinaryVideoPoster(url) {
  if (!url || !url.includes("/upload/")) return "";
  return url.replace("/upload/", "/upload/so_1,f_jpg,q_auto/");
}

function TrendChart({ timeline }) {
  if (!timeline?.length) {
    return <p className="mt-4 text-xs text-slate-400">No trend data yet.</p>;
  }

  const width = 720;
  const height = 160;
  const maxValue = Math.max(1, ...timeline.flatMap((item) => [item.opens, item.responses]));

  function toPath(key) {
    return timeline
      .map((item, index) => {
        const x = (index / Math.max(timeline.length - 1, 1)) * width;
        const y = height - (item[key] / maxValue) * height;
        return `${index === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(" ");
  }

  return (
    <div className="mt-4">
      <div className="mb-2 flex gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-sky-400" />Opens</span>
        <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-emerald-400" />Responses</span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" role="img" aria-label="Trend chart">
        <path d={toPath("opens")} fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={toPath("responses")} fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div className="mt-1 flex justify-between text-xs text-slate-400">
        <span>{timeline[0]?.date}</span>
        <span>{timeline[timeline.length - 1]?.date}</span>
      </div>
    </div>
  );
}

export function ProjectPage() {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { user } = useAuth();
  const plan = user?.plan ?? "free";
  const isProOrAbove = plan === "pro" || plan === "business";
  const isBusiness = plan === "business";

  const [analytics, setAnalytics] = useState(null);
  const [feedback, setFeedback] = useState([]);
  const [filter, setFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  // AI state
  const [aiSummary, setAiSummary] = useState(null);
  const [aiHighlights, setAiHighlights] = useState(null);
  const [aiSentiment, setAiSentiment] = useState(null);
  const [aiLoading, setAiLoading] = useState({ summary: false, highlights: false, sentiment: false });
  const [aiError, setAiError] = useState("");

  // Team state
  const [teamMembers, setTeamMembers] = useState([]);
  const [teamLoading, setTeamLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("viewer");
  const [inviteLoading, setInviteLoading] = useState(false);
  const [teamError, setTeamError] = useState("");
  const [teamSuccess, setTeamSuccess] = useState("");

  // API key state
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyRegen, setApiKeyRegen] = useState(false);
  const [embedLayout, setEmbedLayout] = useState("simple");
  const [showEmbedPreview, setShowEmbedPreview] = useState(false);

  const isMounted = useRef(true);
  const hasLoadedOnce = useRef(false);
  const requestIdRef = useRef(0);

  const loadProjectData = useCallback(async () => {
    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;

    try {
      setActionError("");
      setError("");

      if (!hasLoadedOnce.current) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const analyticsData = await api.getProjectAnalytics(projectId);
      const resolvedProjectId = analyticsData?.project?._id || projectId;
      const feedbackParams = {};
      if (filter !== "all") feedbackParams.status = filter;
      if (typeFilter !== "all") feedbackParams.type = typeFilter;
      const feedbackData = await api.getProjectFeedback(resolvedProjectId, feedbackParams);

      if (!isMounted.current || requestIdRef.current !== requestId) {
        return;
      }

      setAnalytics(analyticsData);
      setFeedback(Array.isArray(feedbackData?.items) ? feedbackData.items : []);
    } catch (err) {
      if (!isMounted.current || requestIdRef.current !== requestId) {
        return;
      }

      setFeedback([]);
      setError(err.message);
    } finally {
      if (!isMounted.current || requestIdRef.current !== requestId) {
        return;
      }

      hasLoadedOnce.current = true;
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter, typeFilter, projectId]);

  useEffect(() => {
    isMounted.current = true;
    loadProjectData();
    return () => {
      isMounted.current = false;
    };
  }, [loadProjectData]);

  async function updateStatus(id, status) {
    try {
      setActionError("");
      await api.updateFeedbackStatus(id, status);
      await loadProjectData();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function removeFeedback(id) {
    try {
      setActionError("");
      await api.deleteFeedback(id);
      await loadProjectData();
    } catch (err) {
      setActionError(err.message);
    }
  }

  async function copyEmbed(slug) {
    try {
      setActionError("");
      await navigator.clipboard.writeText(getEmbedCode(slug, { layout: embedLayout }));
    } catch (err) {
      setActionError("Could not copy embed code. Please copy it manually.");
    }
  }

  async function copyPublicLink(slug) {
    try {
      setActionError("");
      await navigator.clipboard.writeText(`${window.location.origin}/feedback/${slug}`);
    } catch (err) {
      setActionError("Could not copy public portal link.");
    }
  }

  async function runAi(type) {
    setAiError("");
    setAiLoading((prev) => ({ ...prev, [type]: true }));
    try {
      if (type === "summary") {
        const data = await api.aiSummarize(projectId);
        setAiSummary(data);
      } else if (type === "highlights") {
        const data = await api.aiHighlights(projectId);
        setAiHighlights(data);
      } else if (type === "sentiment") {
        const data = await api.aiSentiment(projectId);
        setAiSentiment(data);
      }
    } catch (err) {
      setAiError(err.message);
    } finally {
      setAiLoading((prev) => ({ ...prev, [type]: false }));
    }
  }

  async function loadTeam() {
    if (!isBusiness) return;
    setTeamLoading(true);
    setTeamError("");
    try {
      const data = await api.getTeamMembers(projectId);
      setTeamMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setTeamError(err.message);
    } finally {
      setTeamLoading(false);
    }
  }

  async function inviteMember() {
    if (!inviteEmail.trim()) return;
    setInviteLoading(true);
    setTeamError("");
    setTeamSuccess("");
    try {
      await api.inviteTeamMember(projectId, { email: inviteEmail.trim(), role: inviteRole });
      setTeamSuccess(`Invite sent to ${inviteEmail.trim()}`);
      setInviteEmail("");
      await loadTeam();
    } catch (err) {
      setTeamError(err.message);
    } finally {
      setInviteLoading(false);
    }
  }

  async function removeMember(memberId) {
    setTeamError("");
    try {
      await api.removeTeamMember(projectId, memberId);
      await loadTeam();
    } catch (err) {
      setTeamError(err.message);
    }
  }

  async function regenApiKey() {
    setApiKeyRegen(true);
    try {
      await api.regenProjectApiKey(projectId);
      const analyticsData = await api.getProjectAnalytics(projectId);
      setAnalytics(analyticsData);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setApiKeyRegen(false);
    }
  }

  const filteredFeedback = search.trim()
    ? feedback.filter((item) => {
        const q = search.toLowerCase();
        return (
          (item.name || "").toLowerCase().includes(q) ||
          (item.message || "").toLowerCase().includes(q) ||
          (item.email || "").toLowerCase().includes(q)
        );
      })
    : feedback;

  const project = analytics?.project;
  const metrics = analytics?.metrics;
  const linkMetrics = analytics?.linkMetrics;
  const timeline = analytics?.timeline || [];
  const responders = analytics?.responders || [];
  const averageRating = metrics?.total ? (3 + (metrics.approved / Math.max(metrics.total, 1)) * 2).toFixed(1) : "0.0";
  const embedLayoutOptions = useMemo(
    () => (plan === "free" ? ["simple", "carousel"] : ["simple", "carousel", "bubble", "post"]),
    [plan]
  );

  const embedPreviewUrl = project
    ? `/widget/${project.slug}?layout=${encodeURIComponent(embedLayout)}`
    : "";

  const statusLabelMap = {
    all: "All Feedback",
    pending: "Pending",
    approved: "Resolved",
    rejected: "Rejected"
  };

  return (
    <AppShell>
      <div className="space-y-6">
        <Card className="border border-border/70 bg-white/90">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-white text-slate-500 transition hover:bg-muted hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold leading-tight text-foreground">{project?.name ?? "Loading..."}</h1>
                <p className="text-xs text-slate-400">Manage and respond to customer feedback</p>
              </div>
            </div>

            {project && (
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={embedLayout}
                  onChange={(e) => setEmbedLayout(e.target.value)}
                  className="h-8 rounded-lg border border-border/60 bg-white px-2 text-xs text-foreground outline-none"
                >
                  {embedLayoutOptions.map((layout) => (
                    <option key={layout} value={layout}>{layout} embed</option>
                  ))}
                </select>
                <Button variant="secondary" className="h-8 gap-1.5 px-3 text-xs" onClick={() => copyPublicLink(project.slug)}>
                  <Share2 className="h-3.5 w-3.5" /> Share
                </Button>
                <Button variant="secondary" className="h-8 gap-1.5 px-3 text-xs" onClick={() => copyEmbed(project.slug)}>
                  <Settings2 className="h-3.5 w-3.5" /> Copy embed
                </Button>
                <Button variant="secondary" className="h-8 gap-1.5 px-3 text-xs" onClick={() => setShowEmbedPreview(true)}>
                  <Eye className="h-3.5 w-3.5" /> Preview
                </Button>
                <Button asChild className="h-8 gap-1.5 px-3 text-xs">
                  <a href={`/feedback/${project.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> View Portal
                  </a>
                </Button>
              </div>
            )}
          </div>

          {metrics && linkMetrics && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Total Feedback</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{metrics.total}</p>
                <p className="mt-2 text-xs text-emerald-600">+{Math.max(0, metrics.approved)} approved</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Average Rating</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{averageRating}</p>
                <p className="mt-2 text-xs text-amber-500">★★★★★</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Pending Review</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{metrics.pending}</p>
                <p className="mt-2 text-xs text-slate-500">Requires attention</p>
              </div>
              <div className="rounded-2xl border border-border/70 bg-white px-4 py-3">
                <p className="text-xs text-slate-500">Response Rate</p>
                <p className="mt-1 text-3xl font-semibold text-foreground">{linkMetrics.responseRate}%</p>
                <p className="mt-2 text-xs text-slate-500">Based on portal opens</p>
              </div>
            </div>
          )}
        </Card>

        {showEmbedPreview && project && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4" onClick={() => setShowEmbedPreview(false)}>
            <div className="w-full max-w-5xl rounded-3xl border border-border/70 bg-white p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Live embed preview</p>
                  <p className="text-xs text-slate-500">{project.name} · {embedLayout} layout</p>
                </div>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => setShowEmbedPreview(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {embedLayoutOptions.map((layout) => (
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
                <iframe src={embedPreviewUrl} title="Project embed preview" className="h-[560px] w-full border-0" />
              </div>
            </div>
          </div>
        )}

        <Card className="border border-border/70 bg-white/90 p-0 overflow-hidden">
          <div className="border-b border-border/60 px-4 py-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-1">
                {statusFilters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFilter(s)}
                    className={cn(
                      "rounded-md px-3 py-1 text-xs font-medium transition",
                      filter === s ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {statusLabelMap[s]}
                  </button>
                ))}
              </div>

              <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
                <div className="relative w-full md:w-64">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Search feedback..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-9 pl-9 text-sm"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="h-9 rounded-xl border border-border/60 bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {typeFilters.map((type) => (
                    <option key={type} value={type}>{type[0].toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {(error || actionError) && (
            <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-600">{error || actionError}</div>
          )}

          <div className="space-y-3 p-4">
            {loading && <div className="rounded-2xl border border-border/60 bg-muted/30 px-5 py-12 text-center text-sm text-slate-400">Loading feedback...</div>}
            {!loading && refreshing && <div className="rounded-xl border border-border/60 bg-muted/30 px-5 py-2 text-center text-xs text-slate-400">Refreshing...</div>}
            {!loading && filteredFeedback.length === 0 && (
              <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-14 text-center">
                <p className="text-sm font-medium text-slate-500">No feedback found</p>
                <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or check back later.</p>
              </div>
            )}

            {filteredFeedback.map((item) => (
              <div key={item._id} className="rounded-2xl border border-border/60 bg-white px-4 py-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        {(item.name || "A")[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{item.name || "Anonymous"}</span>
                      {item.email && <span className="text-xs text-slate-400">{item.email}</span>}
                      <Badge tone={item.type}>{item.type}</Badge>
                    </div>

                    {item.message && <p className="mt-3 text-sm leading-relaxed text-slate-700">{item.message}</p>}

                    {item.type === "video" && item.mediaUrl && (
                      <video
                        src={item.mediaUrl}
                        controls
                        preload="metadata"
                        poster={getCloudinaryVideoPoster(item.mediaUrl)}
                        className="mt-3 max-w-sm rounded-xl border border-border/60"
                      />
                    )}
                    {item.type === "audio" && item.mediaUrl && (
                      <audio src={item.mediaUrl} controls className="mt-3 max-w-sm" preload="metadata" />
                    )}
                    {item.type === "text" && item.mediaUrl && (
                      <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="mt-2 inline-block text-xs font-medium text-primary underline-offset-4 hover:underline">
                        View attached media -
                      </a>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span className="rounded-full bg-muted px-2 py-0.5 capitalize">{item.status}</span>
                      <span>{formatDate(item.createdAt)}</span>
                      <span className="flex items-center gap-1"><ThumbsUp className="h-3.5 w-3.5" /> {item.message ? Math.min(99, Math.max(3, item.message.length % 34)) : 0}</span>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => updateStatus(item._id, "approved")}
                      className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => updateStatus(item._id, "rejected")}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                    >
                      Reject
                    </button>
                    {item.status === "approved" && project?.slug && (
                      <a
                        href={`/spotlight/${project.slug}/${item._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-border/60 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-muted"
                      >
                        Spotlight -
                      </a>
                    )}
                    {isProOrAbove && item.mediaUrl && (item.type === "video" || item.type === "audio") && (
                      <a
                        href={item.mediaUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 rounded-lg border border-border/60 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-muted"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => removeFeedback(item._id)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* â”€â”€ Recent responders â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {responders.length > 0 && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Recent responders</h2>
              <p className="mt-0.5 text-xs text-slate-400">People who submitted feedback via your portal link.</p>
            </div>
            <div className="divide-y divide-border/50">
              {responders.map((person) => (
                <div key={`${person._id}-${person.createdAt}`} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-slate-600">
                      {(person.name || "A")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{person.name || "Anonymous"}</p>
                      {person.email && <p className="text-xs text-slate-400">{person.email}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={person.type}>{person.type}</Badge>
                    <Badge tone={person.status}>{person.status}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(person.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* â”€â”€ AI Insights â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isBusiness ? (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-violet-500" />
                <h2 className="text-sm font-semibold text-foreground">AI Insights</h2>
                <span className="ml-auto rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-600">Business</span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">Auto-generate summaries, highlights, and sentiment from your collected feedback.</p>
            </div>
            {aiError && (
              <div className="border-b border-rose-100 bg-rose-50 px-5 py-3 text-sm text-rose-600">{aiError}</div>
            )}
            <div className="grid divide-y divide-border/50 md:grid-cols-3 md:divide-x md:divide-y-0">
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Summary</p>
                </div>
                <div className="flex-1 text-sm leading-relaxed text-slate-600">
                  {aiSummary ? (aiSummary.summary || JSON.stringify(aiSummary)) : <span className="text-slate-400">Not generated yet.</span>}
                </div>
                <button
                  onClick={() => runAi("summary")}
                  disabled={aiLoading.summary}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 py-2 text-xs font-medium text-slate-600 transition hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", aiLoading.summary && "animate-spin")} />
                  {aiLoading.summary ? "Generatingâ€¦" : "Generate"}
                </button>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-sky-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Highlights</p>
                </div>
                <div className="flex-1 text-sm text-slate-600">
                  {aiHighlights ? (
                    <ul className="space-y-1.5">
                      {(Array.isArray(aiHighlights.highlights) ? aiHighlights.highlights : [aiHighlights]).map((h, i) => (
                        <li key={i} className="flex gap-2 leading-relaxed">
                          <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" />
                          {typeof h === "string" ? h : JSON.stringify(h)}
                        </li>
                      ))}
                    </ul>
                  ) : <span className="text-slate-400">Not extracted yet.</span>}
                </div>
                <button
                  onClick={() => runAi("highlights")}
                  disabled={aiLoading.highlights}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 py-2 text-xs font-medium text-slate-600 transition hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", aiLoading.highlights && "animate-spin")} />
                  {aiLoading.highlights ? "Extractingâ€¦" : "Extract"}
                </button>
              </div>
              <div className="flex flex-col gap-3 p-5">
                <div className="flex items-center gap-2">
                  <Brain className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Sentiment</p>
                </div>
                <div className="flex-1 text-sm text-slate-600">
                  {aiSentiment ? (
                    <div className="space-y-2">
                      {aiSentiment.overall && (
                        <p className="font-semibold capitalize">
                          <span className="text-slate-400">Overall: </span>
                          <span className={aiSentiment.overall === "positive" ? "text-emerald-600" : aiSentiment.overall === "negative" ? "text-rose-600" : "text-amber-600"}>
                            {aiSentiment.overall}
                          </span>
                        </p>
                      )}
                      {aiSentiment.breakdown && (
                        <div className="space-y-1 text-xs">
                          {Object.entries(aiSentiment.breakdown).map(([k, v]) => (
                            <div key={k} className="flex justify-between text-slate-500">
                              <span className="capitalize">{k}</span>
                              <span>{typeof v === "number" ? `${v}%` : v}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      {!aiSentiment.overall && !aiSentiment.breakdown && <p>{JSON.stringify(aiSentiment)}</p>}
                    </div>
                  ) : <span className="text-slate-400">Not analysed yet.</span>}
                </div>
                <button
                  onClick={() => runAi("sentiment")}
                  disabled={aiLoading.sentiment}
                  className="flex items-center justify-center gap-1.5 rounded-lg border border-border/60 bg-muted/60 py-2 text-xs font-medium text-slate-600 transition hover:bg-muted disabled:opacity-50"
                >
                  <RefreshCw className={cn("h-3 w-3", aiLoading.sentiment && "animate-spin")} />
                  {aiLoading.sentiment ? "Analysingâ€¦" : "Analyse"}
                </button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/50 px-5 py-4">
            <Bot className="h-4 w-4 shrink-0 text-violet-400" />
            <p className="text-sm text-violet-700">
              <span className="font-semibold">AI Insights</span> â€” available on the <span className="font-semibold">Business plan</span>. Upgrade to unlock summaries, highlights, and sentiment analysis.
            </p>
          </div>
        )}

        {/* â”€â”€ Team Members â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isBusiness ? (
          <Card className="p-0 overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-semibold text-foreground">Team Members</h2>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">Business</span>
              </div>
              <button
                onClick={loadTeam}
                disabled={teamLoading}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white/70 px-3 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-white disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", teamLoading && "animate-spin")} />
                Refresh
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-b border-border/60 bg-muted/30 px-5 py-3">
              <Input
                placeholder="teammate@company.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inviteMember()}
                className="h-9 max-w-xs text-sm"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="h-9 rounded-xl border border-border/60 bg-white px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <Button className="h-9 gap-1.5 text-xs" onClick={inviteMember} disabled={inviteLoading || !inviteEmail.trim()}>
                <UserPlus className="h-3.5 w-3.5" />
                {inviteLoading ? "Sendingâ€¦" : "Invite"}
              </Button>
              {teamError && <p className="w-full text-xs text-rose-600">{teamError}</p>}
              {teamSuccess && <p className="w-full text-xs text-emerald-600">{teamSuccess}</p>}
            </div>
            <div className="divide-y divide-border/50">
              {teamMembers.length === 0 && !teamLoading && (
                <div className="px-5 py-8 text-center text-sm text-slate-400">No team members yet. Invite someone above.</div>
              )}
              {teamMembers.map((member) => (
                <div key={member._id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-slate-600">
                      {(member.userId?.name || member.invitedEmail || "?")[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.userId?.name || member.invitedEmail}</p>
                      <p className="text-xs text-slate-400">{member.invitedEmail} Â· <span className="capitalize">{member.role}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", member.status === "accepted" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                      {member.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeMember(member._id)}
                      className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <UserMinus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-primary/10 bg-primary/5 px-5 py-4">
            <Users className="h-4 w-4 shrink-0 text-primary/60" />
            <p className="text-sm text-primary/80">
              <span className="font-semibold">Team Members</span> â€” available on the <span className="font-semibold">Business plan</span>. Upgrade to collaborate with teammates.
            </p>
          </div>
        )}

        {/* â”€â”€ API Key â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {isBusiness && project?.apiKey && (
          <Card className="p-0 overflow-hidden">
            <div className="border-b border-border/60 px-5 py-4">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-slate-400" />
                <h2 className="text-sm font-semibold text-foreground">API Access</h2>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                Pass your key as <code className="rounded bg-muted px-1 py-0.5">?api_key=â€¦</code> to fetch approved feedback programmatically.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 px-5 py-4">
              <code className="flex-1 rounded-xl border border-border/60 bg-muted/50 px-4 py-2.5 font-mono text-xs text-slate-600 break-all">
                {apiKeyVisible ? project.apiKey : "â€¢".repeat(40)}
              </code>
              <button
                onClick={() => setApiKeyVisible((v) => !v)}
                className="rounded-lg border border-border/60 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-muted"
              >
                {apiKeyVisible ? "Hide" : "Reveal"}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(project.apiKey)}
                className="flex items-center gap-1.5 rounded-lg border border-border/60 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition hover:bg-muted"
              >
                <Copy className="h-3 w-3" />
                Copy
              </button>
              <button
                onClick={regenApiKey}
                disabled={apiKeyRegen}
                className="flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-100 disabled:opacity-50"
              >
                <RefreshCw className={cn("h-3 w-3", apiKeyRegen && "animate-spin")} />
                Regenerate
              </button>
            </div>
            <div className="border-t border-border/60 bg-muted/30 px-5 py-2.5">
              <code className="text-xs text-slate-400">GET /api/v1/projects/{project.slug}/feedback?api_key=YOUR_KEY</code>
            </div>
          </Card>
        )}

      </div>
    </AppShell>
  );
}
