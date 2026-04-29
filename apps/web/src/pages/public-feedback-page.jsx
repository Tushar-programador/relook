import { useEffect, useState } from "react";
import { CheckCircle2, UploadCloud } from "lucide-react";
import { useParams } from "react-router-dom";
import { MediaRecorderPanel } from "../components/feedback/media-recorder.jsx";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { Textarea } from "../components/ui/textarea.jsx";
import { api } from "../lib/api";

async function uploadFileWithProgress(uploadUrl, file, setProgress) {
  await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(file);
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

  function handleRecordedBlob(blob, mimeType) {
    const extension = mimeType.includes("video") ? "webm" : "webm";
    setRecordedFile(new File([blob], `testimonial-${Date.now()}.${extension}`, { type: mimeType }));
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
          fileName: file.name,
          contentType: file.type
        });

        await uploadFileWithProgress(signed.uploadUrl, file, setProgress);
        mediaUrl = signed.publicUrl || `${signed.objectKey}`;
      }

      await api.submitFeedback(slug, {
        type,
        name: form.name,
        email: form.email,
        message: form.message,
        mediaUrl
      });

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
              {statusMessage && (
                <p className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {statusMessage}
                </p>
              )}

              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit feedback"}
              </Button>
            </form>
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
      </div>
    </div>
  );
}