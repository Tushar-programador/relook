import { useEffect, useState } from "react";
import { Copy, Mail, Upload } from "lucide-react";
import { AppShell } from "../components/layout/app-shell.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { useAuth } from "../context/auth-context.jsx";
import { api } from "../lib/api";

const EMAIL_REGEX = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;

function extractEmails(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  return [...new Set(matches.map((email) => email.toLowerCase()))];
}

export function SendPortalLinkPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [singleEmail, setSingleEmail] = useState("");
  const [importedEmails, setImportedEmails] = useState([]);
  const [subject, setSubject] = useState("Please share your feedback");
  const [body, setBody] = useState("Hi,\n\nPlease share your feedback using this link.\n\nThank you.");
  const [removePromotion, setRemovePromotion] = useState(false);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const singleEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(singleEmail.trim());
  const selectedProject = projects.find((project) => project._id === selectedProjectId) || null;
  const portalPath = selectedProject?.slug ? `/feedback/${selectedProject.slug}` : "/dashboard";
  const portalUrl = `${window.location.origin}${portalPath}`;
  const isFreePlan = (user?.plan || "free") === "free";

  useEffect(() => {
    let active = true;

    api
      .getProjects()
      .then((items) => {
        if (!active) {
          return;
        }

        setProjects(items);
        setSelectedProjectId(items?.[0]?._id || "");
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Could not load portals.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function sendEmails(recipients) {
    if (!selectedProjectId) {
      setNotice("Select a portal first.");
      return;
    }

    if (!subject.trim()) {
      setNotice("Email subject is required.");
      return;
    }

    if (!body.trim()) {
      setNotice("Email body is required.");
      return;
    }

    try {
      setSending(true);
      setNotice("");

      const result = await api.sendPortalLinkEmails(selectedProjectId, {
        recipients,
        subject: subject.trim(),
        body: body.trim(),
        removePromotion: isFreePlan ? false : removePromotion,
        appBaseUrl: window.location.origin
      });

      setNotice(
        `${result.queued ? "Queued" : "Sent"} ${result.sent} email${result.sent === 1 ? "" : "s"}.${
          result.includePromotion ? " FeedSpace promotion footer included." : " Promotion footer removed."
        }`
      );
    } catch (err) {
      setNotice(err.message || "Failed to send email.");
    } finally {
      setSending(false);
    }
  }

  async function sendToSingleEmail() {
    if (!singleEmailValid) {
      setNotice("Please enter a valid email address.");
      return;
    }

    await sendEmails([singleEmail.trim().toLowerCase()]);
  }

  async function sendToBulkEmails() {
    if (!importedEmails.length) {
      setNotice("Import a file with email addresses first.");
      return;
    }

    await sendEmails(importedEmails);
  }

  async function copyPortalLink() {
    await navigator.clipboard.writeText(portalUrl);
    setNotice("Portal link copied.");
  }

  function handleBulkFileImport(event) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const rawText = typeof reader.result === "string" ? reader.result : "";
      const emails = extractEmails(rawText);
      setImportedEmails(emails);
      setNotice(emails.length ? `Imported ${emails.length} email addresses.` : "No valid email addresses found in file.");
    };
    reader.onerror = () => {
      setImportedEmails([]);
      setNotice("Could not read this file. Try CSV or TXT.");
    };
    reader.readAsText(file);
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <Card>
          <CardTitle>Send Portal Link</CardTitle>
          <CardDescription className="mt-2">
            Send your feedback portal by email, or import a file to send to a bulk list.
          </CardDescription>

          {loading ? <p className="mt-6 text-sm text-slate-600">Loading your portals...</p> : null}
          {error ? <p className="mt-6 text-sm text-rose-600">{error}</p> : null}

          {!loading && !error && !projects.length ? (
            <p className="mt-6 text-sm text-slate-600">Create a portal first to start sending links.</p>
          ) : null}

          {!loading && projects.length ? (
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Choose portal</p>
                <select
                  value={selectedProjectId}
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  className="w-full rounded-2xl border border-border bg-white/85 px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  {projects.map((project) => (
                    <option key={project._id} value={project._id}>
                      {project.name} (/{project.slug})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-slate-600 break-all">{portalUrl}</p>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Email content</p>
                <Input type="text" value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Email subject" />
                <Textarea value={body} onChange={(event) => setBody(event.target.value)} placeholder="Email body" />
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={removePromotion}
                    onChange={(event) => setRemovePromotion(event.target.checked)}
                    disabled={isFreePlan}
                  />
                  Remove FeedSpace promotion footer
                </label>
                {isFreePlan ? (
                  <p className="text-xs text-slate-500">Free plan requires FeedSpace promotion in every email.</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Single email</p>
                <div className="flex flex-col gap-2 md:flex-row">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={singleEmail}
                    onChange={(event) => setSingleEmail(event.target.value)}
                  />
                  <Button variant="secondary" className="gap-2" onClick={sendToSingleEmail} disabled={!singleEmail.trim() || sending}>
                    <Mail className="h-4 w-4" />
                    {sending ? "Sending..." : "Send"}
                  </Button>
                  <Button variant="ghost" className="gap-2" onClick={copyPortalLink}>
                    <Copy className="h-4 w-4" />
                    Copy link
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Bulk import</p>
                <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-border bg-white px-4 py-3 text-sm text-slate-700">
                  <Upload className="h-4 w-4" />
                  <span>Import bulk emails (CSV/TXT)</span>
                  <input className="hidden" type="file" accept=".csv,.txt" onChange={handleBulkFileImport} />
                </label>

                <Button variant="secondary" onClick={sendToBulkEmails} disabled={!importedEmails.length || sending}>
                  {sending ? "Sending..." : "Send to imported list"}
                </Button>
              </div>

              {notice ? <p className="text-sm text-slate-600">{notice}</p> : null}
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}
