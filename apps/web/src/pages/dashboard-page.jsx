import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { AppShell } from "../components/layout/app-shell.jsx";
import { CreateProjectModal } from "../components/dashboard/create-project-modal.jsx";
import { ProjectCard } from "../components/dashboard/project-card.jsx";
import { StatsCard } from "../components/dashboard/stats-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

export function DashboardPage() {
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
      return acc;
    },
    { projects: 0, feedback: 0, approved: 0, opens: 0 }
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <StatsCard label="Projects" value={totals.projects} accent="#0f766e" />
          <StatsCard label="Total feedback" value={totals.feedback} accent="#ea580c" />
          <StatsCard label="Approved" value={totals.approved} accent="#15803d" />
          <StatsCard label="Review link opens" value={totals.opens} accent="#2563eb" />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Your feedback portals</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Each portal gets a public collection page, a moderation dashboard, and an embeddable widget.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)}>
            <span className="flex items-center gap-2">
              <Plus className="h-4 w-4" /> New portal
            </span>
          </Button>
        </div>

        {error && <p className="text-sm text-rose-600">{error}</p>}

        <div className="grid gap-5 xl:grid-cols-2">
          {!loading && projects.map((project) => <ProjectCard key={project._id} project={project} />)}
        </div>

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
      </div>

      {showModal && (
        <CreateProjectModal onClose={() => setShowModal(false)} onCreated={handleCreated} />
      )}
    </AppShell>
  );
}