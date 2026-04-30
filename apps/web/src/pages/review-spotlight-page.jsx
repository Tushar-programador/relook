import { useEffect, useMemo, useState } from "react";
import { Copy, ExternalLink, MessageCircle, Quote } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

function getCloudinaryVideoPoster(url) {
  if (!url || !url.includes("/upload/")) {
    return "";
  }

  return url.replace("/upload/", "/upload/so_1,f_jpg,q_auto/");
}

function SpotlightMedia({ item }) {
  if (!item?.mediaUrl) {
    return null;
  }

  if (item.type === "video") {
    return (
      <video
        src={item.mediaUrl}
        controls
        preload="metadata"
        poster={getCloudinaryVideoPoster(item.mediaUrl)}
        className="mt-5 w-full rounded-2xl border border-border/70"
      />
    );
  }

  if (item.type === "audio") {
    return <audio src={item.mediaUrl} controls preload="metadata" className="mt-5 w-full" />;
  }

  return (
    <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="mt-5 inline-flex text-sm font-semibold text-primary">
      Open media asset
    </a>
  );
}

export function ReviewSpotlightPage() {
  const { slug, feedbackId } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  const item = useMemo(() => data?.items?.find((entry) => entry._id === feedbackId), [data, feedbackId]);
  const shareUrl = `${window.location.origin}/spotlight/${slug}/${feedbackId}`;
  const whatsappShareLink = `https://wa.me/?text=${encodeURIComponent(`Customer story: ${shareUrl}`)}`;

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setActionMessage("Share link copied.");
    } catch {
      setActionMessage("Copy failed. Please copy from address bar.");
    }
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-rose-600">{error}</div>;
  }

  if (!data) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading spotlight page...</div>;
  }

  if (!item) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <Card className="max-w-xl text-center">
          <CardTitle>Spotlight not available</CardTitle>
          <CardDescription className="mt-2">This testimonial may not be approved yet or the link is invalid.</CardDescription>
          <div className="mt-5">
            <Button asChild variant="secondary">
              <Link to={`/feedback/${slug}`}>Visit feedback page</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed_0%,_#ffffff_40%,_#f0fdfa_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <Badge tone="approved">Customer spotlight</Badge>
              <CardTitle>{data.project?.name || "Product"}</CardTitle>
              <CardDescription>
                {data.project?.description || "Real customer feedback collected through this product experience."}
              </CardDescription>
              {data.project?.website && (
                <a
                  href={data.project.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                >
                  Visit product website
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary" className="gap-2" onClick={copyShareLink}>
                <Copy className="h-4 w-4" />
                Copy link
              </Button>
              <Button variant="secondary" asChild className="gap-2">
                <a href={whatsappShareLink} target="_blank" rel="noreferrer">
                  <MessageCircle className="h-4 w-4" />
                  Share on WhatsApp
                </a>
              </Button>
            </div>
          </div>
          {actionMessage && <p className="mt-4 text-sm text-slate-600">{actionMessage}</p>}
        </Card>

        <Card className="bg-white/95">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{item.name || "Anonymous"}</CardTitle>
              <CardDescription className="mt-2">{new Date(item.createdAt).toLocaleDateString()}</CardDescription>
            </div>
            <Quote className="h-6 w-6 text-primary" />
          </div>

          <div className="mt-4 flex gap-2">
            <Badge tone={item.type}>{item.type}</Badge>
          </div>

          {item.message && <p className="mt-5 text-lg leading-relaxed text-slate-700">"{item.message}"</p>}
          <SpotlightMedia item={item} />
        </Card>
      </div>
    </div>
  );
}
