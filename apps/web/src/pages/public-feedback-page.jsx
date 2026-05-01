import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, Sparkles, UploadCloud } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { MediaRecorderPanel } from "../components/feedback/media-recorder.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { api } from "../lib/api";

function getOrCreateVisitorId() {
  const key = "feedspace-visitor-id";
  const existing = localStorage.getItem(key);

  if (existing) {
    return existing;
  }

  const created = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  localStorage.setItem(key, created);
  return created;
}

async function uploadToCloudinary(uploadParams, file, setProgress) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", uploadParams.apiKey);
  formData.append("timestamp", String(uploadParams.timestamp));
  formData.append("signature", uploadParams.signature);
  formData.append("folder", uploadParams.folder);
  if (uploadParams.eager) formData.append("eager", uploadParams.eager);
  if (uploadParams.eager_async) formData.append("eager_async", uploadParams.eager_async);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", uploadParams.uploadUrl);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

export function PublicFeedbackPage() {
  const { slug } = useParams();
  const [type, setType] = useState("text");
  const [pageData, setPageData] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [selectedFile, setSelectedFile] = useState(null);
  const [recordedFile, setRecordedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setPageData)
      .catch((err) => setError(err.message));
  }, [slug]);

  useEffect(() => {
    const visitorId = getOrCreateVisitorId();
    api.trackPublicOpen(slug, { visitorId }).catch(() => {
      // Best-effort analytics tracking should never block public form usage.
    });
  }, [slug]);

  useEffect(() => {
    setSelectedFile(null);
    setRecordedFile(null);
    setProgress(0);
  }, [type]);

  function handleRecordedBlob(blob, mimeType) {
    const extension = mimeType.includes("video") ? "webm" : "webm";
    const fileName = mimeType.includes("video") ? `recorded-video.${extension}` : `recorded-audio.${extension}`;
    setRecordedFile(new File([blob], fileName, { type: mimeType }));
    setSelectedFile(null);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setStatusMessage("");

    try {
      let mediaUrl = "";
      const file = recordedFile || selectedFile;

      if (type !== "text") {
        if (!file) {
          throw new Error("Add or record a media file before submitting.");
        }

        const signed = await api.signPublicUpload({
          slug,
          contentType: file.type
        });

        const uploaded = await uploadToCloudinary(signed, file, setProgress);
        mediaUrl = uploaded.secure_url;
      }

      const payload = {
        type,
        ...(form.name.trim() ? { name: form.name.trim() } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.message.trim() ? { message: form.message.trim() } : {}),
        ...(mediaUrl ? { mediaUrl } : {})
      };

      await api.submitFeedback(slug, payload);

      setForm({ name: "", email: "", message: "" });
      setSelectedFile(null);
      setRecordedFile(null);
      setProgress(0);
      setStatusMessage("Thanks. Your feedback is pending review.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const project = pageData?.project;
  const hasSubmitted = Boolean(statusMessage);

  function handleSubmitAnother() {
    setStatusMessage("");
    setError("");
  }

  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Badge tone="approved">Public feedback page</Badge>
              <CardTitle>{project?.name || "Loading project..."}</CardTitle>
              <CardDescription className="max-w-2xl">
                Share your experience in text, audio, or video. Every testimonial is reviewed before it goes live.
              </CardDescription>
            </div>
            {project && (
              <div className="rounded-[28px] bg-white/85 p-5 text-sm text-slate-600">
                <p>Approved testimonials shown publicly: {pageData.items.length}</p>
              </div>
            )}
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            {hasSubmitted ? (
              <div className="space-y-6">
                <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 text-center">
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-7 w-7 text-emerald-700" />
                  </div>
                  <h3 className="text-2xl font-semibold text-emerald-900">Thank you for your feedback</h3>
                  <p className="mt-2 text-sm text-emerald-800">
                    Your testimonial is safely received and now pending moderator review.
                  </p>
                </div>

                <div className="rounded-[28px] border border-border bg-gradient-to-br from-white via-amber-50/40 to-teal-50/50 p-6">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                    Build Your Own Feedback Funnel
                  </div>

                  <h4 className="text-xl font-semibold text-slate-900">
                    Want more testimonials like this for your brand?
                  </h4>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    FeedSpace helps teams collect text, audio, and video testimonials with one branded link,
                    then publish approved feedback across websites, landing pages, and social proof widgets.
                  </p>

                  <div className="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                    <p className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-200">One link for text, voice, and video</p>
                    <p className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-200">Review and approve before publishing</p>
                    <p className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-200">Cloud media storage with fast delivery</p>
                    <p className="rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-slate-200">Embed testimonials anywhere</p>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <Button type="button" onClick={handleSubmitAnother} variant="secondary">
                      Submit another feedback
                    </Button>
                    <Button asChild>
                      <Link to="/" className="inline-flex items-center gap-2">
                        Explore FeedSpace
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              <div className="flex flex-wrap gap-2">
                {[
                  ["text", "Text"],
                  ["audio", "Audio"],
                  ["video", "Video"]
                ].map(([value, label]) => (
                  <Button
                    key={value}
                    type="button"
                    variant={type === value ? "primary" : "secondary"}
                    onClick={() => setType(value)}
                  >
                    {label}
                  </Button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  placeholder="Your name"
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                />
              </div>

              <Textarea
                placeholder="Tell us what stood out about your experience"
                value={form.message}
                onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))}
              />

              {type !== "text" && (
                <div className="space-y-4">
                  <MediaRecorderPanel mode={type} onBlobReady={handleRecordedBlob} />

                  <div className="rounded-[28px] border border-dashed border-border bg-white/65 p-5">
                    <label className="flex cursor-pointer flex-col items-center justify-center gap-3 text-center text-sm text-slate-600">
                      <UploadCloud className="h-6 w-6 text-primary" />
                      <span>Or upload an existing {type} file</span>
                      <input
                        type="file"
                        className="hidden"
                        accept={type === "video" ? "video/*" : "audio/*"}
                        onChange={(event) => {
                          setSelectedFile(event.target.files?.[0] || null);
                          setRecordedFile(null);
                        }}
                      />
                    </label>
                    {(selectedFile || recordedFile) && (
                      <p className="mt-4 text-sm font-medium text-slate-700">
                        Ready to upload: {(recordedFile || selectedFile)?.name}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {progress > 0 && progress < 100 && <p className="text-sm text-slate-600">Upload progress: {progress}%</p>}
              {error && <p className="text-sm text-rose-600">{error}</p>}
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit feedback"}
              </Button>
            </form>
            )}
          </Card>

          <Card>
            <CardTitle>Why brands use FeedSpace</CardTitle>
            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <p>One mobile-first form collects feedback that usually gets lost in DMs and chat threads.</p>
              <p>Moderation keeps spam out and ensures only approved stories reach the widget.</p>
              <p>Media uploads go straight to object storage so the app stays fast under load.</p>
            </div>
          </Card>
        </div>

        {pageData?.showBranding && (
          <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-slate-400">
            Powered by{" "}
            <a
              href="https://feedspace.app"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-slate-500 hover:text-primary"
            >
              FeedSpace
            </a>
          </div>
        )}
      </div>
    </div>
  );
}