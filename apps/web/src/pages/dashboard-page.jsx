import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { AppShell } from "../components/layout/app-shell.jsx";
import { CreateProjectModal } from "../components/dashboard/create-project-modal.jsx";
import { ProjectCard } from "../components/dashboard/project-card.jsx";
import { StatsCard } from "../components/dashboard/stats-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { api } from "../lib/api";
import "driver.js/dist/driver.css";

export function DashboardPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  async function loadProjects() {
    try {
      setError("");
      const data = await api.getProjects();
      setProjects(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (!user?._id || loading) {
      return;
    }

    const storageKey = `feedspace-tour-completed-${user._id}`;
    const alreadyCompleted = localStorage.getItem(storageKey);
    if (alreadyCompleted) {
      return;
    }

    let cancelled = false;
    const timerId = setTimeout(async () => {
      if (cancelled) {
        return;
      }

      const { driver } = await import("driver.js");
      if (cancelled) {
        return;
      }

      const tour = driver({
        showProgress: true,
        allowClose: true,
        nextBtnText: "Next",
        prevBtnText: "Back",
        doneBtnText: "Done",
        steps: [
          {
            popover: {
              title: "Welcome to FeedSpace",
              description: "Quick tour: create portals, review feedback, and publish social proof widgets."
            }
          },
          {
            element: "[data-tour='new-portal']",
            popover: {
              title: "Create your first portal",
              description: "Start by creating a portal to collect text, audio, and video testimonials."
            }
          },
          {
            element: "[data-tour='stats-grid']",
            popover: {
              title: "Track your numbers",
              description: "These cards show total feedback, visitors, and response performance."
            }
          },
          {
            element: "[data-tour='quick-actions']",
            popover: {
              title: "Quick actions",
              description: "Jump to common tasks like viewing feedback, inviting team members, and reports."
            }
          },
          {
            element: "[data-tour='portals-list']",
            popover: {
              title: "Manage portals",
              description: "Open any portal to moderate feedback, copy embeds, and customize widgets."
            }
          }
        ],
        onDestroyed: () => {
          localStorage.setItem(storageKey, "1");
        }
      });

      tour.drive();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timerId);
    };
  }, [loading, user?._id]);

  async function handleCreated(form) {
    await api.createProject(form);
    await loadProjects();
  }

  const totals = projects.reduce(
    (acc, project) => {
      acc.projects += 1;
      acc.feedback += project.stats.totalFeedback;
      acc.approved += project.stats.approvedFeedback;
      acc.opens += project.stats.totalLinkOpens || 0;
      acc.uniqueVisitors += project.stats.uniqueLinkVisitors || 0;
      return acc;
    },
    { projects: 0, feedback: 0, approved: 0, opens: 0, uniqueVisitors: 0 }
  );

  const responseRate = totals.opens > 0 ? Math.round((totals.feedback / totals.opens) * 100) : 0;
  const recentProjects = useMemo(() => projects.slice(0, 4), [projects]);
  const topProjects = useMemo(() => projects.slice(0, 3), [projects]);
  const currentPlan = user?.plan || "free";

  function getPortalState(project) {
    if (!project.stats.totalFeedback) {
      return "New";
    }
    if (project.stats.approvedFeedback > 0) {
      return "Active";
    }
    return "Review";
  }

  function getResponseRate(project) {
    const opens = project.stats.totalLinkOpens || 0;
    if (!opens) return 0;
    return Math.min(100, Math.round((project.stats.totalFeedback / opens) * 100));
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage your portals, activity, and response performance.</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="md:self-start" data-tour="new-portal">
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New portal
            </span>
          </Button>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4" data-tour="stats-grid">
          <StatsCard label="Total portals" value={totals.projects} accent="#0f766e" hint={`${totals.approved} approved reviews`} />
          <StatsCard label="Active visitors" value={totals.uniqueVisitors} accent="#0ea5e9" hint={`${totals.opens} total portal opens`} />
          <StatsCard label="Feedback received" value={totals.feedback} accent="#16a34a" hint="Across all active portals" />
          <StatsCard label="Response rate" value={`${responseRate}%`} accent="#f97316" hint="Feedback / portal opens" />
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <Card className="space-y-4">
            <div>
              <CardTitle>Recent activity</CardTitle>
              <CardDescription className="mt-1">Your latest portal updates</CardDescription>
            </div>
            <div className="space-y-3">
              {recentProjects.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
              {recentProjects.map((project, index) => {
                const state = getPortalState(project);
                return (
                  <div key={project._id} className="flex items-center justify-between rounded-2xl border border-border/60 bg-white/75 px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: ["#0f766e", "#7c3aed", "#16a34a", "#ea580c"][index % 4] }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{project.name}</p>
                        <p className="text-xs text-slate-500">{project.stats.totalFeedback} responses</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">{state}</span>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4" data-tour="quick-actions">
            <div>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription className="mt-1">Manage your feedback collection</CardDescription>
            </div>

            <div className="space-y-2">
              <Button variant="secondary" className="w-full justify-start" onClick={() => setShowModal(true)}>
                + Create new portal
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <Link to={projects[0]?._id ? `/projects/${projects[0]._id}` : "/dashboard"}>View all feedback</Link>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <Link to={projects[0]?._id ? `/projects/${projects[0]._id}` : "/dashboard"}>Invite team members</Link>
              </Button>
              <Button variant="secondary" asChild className="w-full justify-start">
                <Link to={projects[0]?._id ? `/projects/${projects[0]._id}` : "/dashboard"}>Generate report</Link>
              </Button>
            </div>
          </Card>
        </div>

        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your feedback portals</CardTitle>
              <CardDescription className="mt-1">Manage and track all your portal performance.</CardDescription>
            </div>
            <Button variant="secondary" asChild>
              <Link to={projects[0]?._id ? `/projects/${projects[0]._id}` : "/dashboard"}>View all</Link>
            </Button>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
              {!loading &&
                topProjects.map((project) => {
                const rate = getResponseRate(project);
                const state = getPortalState(project);
                return (
                  <div key={project._id} className="rounded-3xl border border-border/70 bg-white/80 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-base font-semibold text-foreground">{project.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{project.stats.totalFeedback} responses</p>
                      </div>
                      <span className="text-sm text-slate-400">⋮</span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span>Response rate</span>
                        <span>{rate}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-accent"
                          style={{ width: `${rate}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">{state}</span>
                      <Button variant="ghost" asChild className="h-8 px-2 text-xs">
                        <Link to={`/projects/${project._id}`}>
                          Open
                          <ArrowRight className="ml-1 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        {!loading && projects.length === 0 && (
          <Card>
            <CardTitle>No portals yet</CardTitle>
            <CardDescription className="mt-2">
              Create your first feedback portal to start collecting testimonials.
            </CardDescription>
            <Button className="mt-6" onClick={() => setShowModal(true)}>
              <span className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create your first portal
              </span>
            </Button>
          </Card>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid gap-5 xl:grid-cols-2" data-tour="portals-list">
            {projects.map((project) => <ProjectCard key={project._id} project={project} plan={currentPlan} />)}
          </div>
        )}
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </AppShell>
  );
}