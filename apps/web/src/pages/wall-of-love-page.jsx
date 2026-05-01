import { useEffect, useState } from "react";
import { Heart, PlayCircle, Quote } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

function TestimonialMedia({ item }) {
  if (!item.mediaUrl) {
    return null;
  }

  if (item.type === "video") {
    return <video src={item.mediaUrl} controls className="mt-4 w-full rounded-2xl" />;
  }

  if (item.type === "audio") {
    return <audio src={item.mediaUrl} controls className="mt-4 w-full" />;
  }

  return (
    <a
      href={item.mediaUrl}
      target="_blank"
      rel="noreferrer"
      className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
    >
      <PlayCircle className="h-4 w-4" /> Open media
    </a>
  );
}

export function WallOfLovePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-rose-600">{error}</div>;
  }

  const items = data?.items || [];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fef3c7_0%,_#ffffff_35%,_#f0fdfa_100%)] px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <Card>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                <Heart className="h-3.5 w-3.5" />
                Wall of Love
              </div>
              <CardTitle className="text-3xl">{data?.project?.name || "Portal"} testimonials</CardTitle>
              <CardDescription>Real customer love collected through this portal.</CardDescription>
            </div>
            <Button asChild variant="secondary">
              <Link to={`/feedback/${slug}`}>Share your feedback</Link>
            </Button>
          </div>
        </Card>

        {items.length === 0 ? (
          <Card>
            <CardTitle>No approved testimonials yet</CardTitle>
            <CardDescription className="mt-2">Once reviews are approved, they will appear here automatically.</CardDescription>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {items.map((item) => (
              <Card key={item._id} className="h-full bg-white/90">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{item.name || "Anonymous"}</CardTitle>
                    <CardDescription className="mt-1">{new Date(item.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Quote className="h-5 w-5 text-primary" />
                </div>

                <div className="mt-4 flex gap-2">
                  <Badge tone={item.type}>{item.type}</Badge>
                </div>

                {item.message && <p className="mt-4 text-sm leading-relaxed text-slate-700">{item.message}</p>}
                <TestimonialMedia item={item} />
              </Card>
            ))}
          </div>
        )}

        {data?.showBranding && (
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
