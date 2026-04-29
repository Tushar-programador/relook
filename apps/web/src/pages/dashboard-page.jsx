import { useEffect, useState } from "react";
import { AppShell } from "../components/layout/app-shell.jsx";
import { ProjectCard } from "../components/dashboard/project-card.jsx";
import { StatsCard } from "../components/dashboard/stats-card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { api } from "../lib/api";

export function DashboardPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", slug: "" });
  const [submitting, setSubmitting] = useState(false);

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

  async function handleCreateProject(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.createProject(form);
      setForm({ name: "", slug: "" });
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const totals = projects.reduce(
    (acc, project) => {
      acc.projects += 1;
      acc.feedback += project.stats.totalFeedback;
      acc.approved += project.stats.approvedFeedback;
      return acc;
    },
    { projects: 0, feedback: 0, approved: 0 }
  );

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="grid gap-5 md:grid-cols-3">
          <StatsCard label="Projects" value={totals.projects} accent="#0f766e" />
          <StatsCard label="Total feedback" value={totals.feedback} accent="#ea580c" />
          <StatsCard label="Approved" value={totals.approved} accent="#15803d" />
        </div>

        <Card>
          <CardTitle>Launch a new feedback portal</CardTitle>
          <CardDescription className="mt-2">
            Every project gets a public collection page, a moderation dashboard, and an embeddable widget.
          </CardDescription>

          <form className="mt-6 grid gap-4 md:grid-cols-[1fr_1fr_auto]" onSubmit={handleCreateProject}>
            <Input
              placeholder="Brand name"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              required
            />
            <Input
              placeholder="custom-slug"
              value={form.slug}
              onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
            />
            <Button type="submit" disabled={submitting}>
              {submitting ? "Creating..." : "Create project"}
            </Button>
          </form>

          {error && <p className="mt-4 text-sm text-rose-600">{error}</p>}
        </Card>

        <div className="grid gap-5 xl:grid-cols-2">
          {!loading && projects.map((project) => <ProjectCard key={project._id} project={project} />)}
        </div>

        {!loading && projects.length === 0 && (
          <Card>
            <CardTitle>No projects yet</CardTitle>
            <CardDescription className="mt-2">Create your first project to start collecting testimonials.</CardDescription>
          </Card>
        )}
      </div>
    </AppShell>
  );
}