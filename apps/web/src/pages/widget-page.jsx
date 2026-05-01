import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

export function WidgetPage() {
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
    return <div className="flex min-h-screen items-center justify-center text-sm text-rose-600">{error}</div>;
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data?.items?.map((item) => (
          <Card key={item._id} className="h-full bg-white/92">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">{item.name || "Anonymous"}</CardTitle>
                <CardDescription className="mt-1">{data.project.name}</CardDescription>
              </div>
              <Quote className="h-5 w-5 text-primary" />
            </div>

            <div className="mt-4 flex gap-2">
              <Badge tone={item.type}>{item.type}</Badge>
            </div>

            {item.message && <p className="mt-4 text-sm text-slate-700">{item.message}</p>}
            {item.mediaUrl && (
              <a href={item.mediaUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-sm font-semibold text-primary">
                Watch testimonial
              </a>
            )}
          </Card>
        ))}
      </div>

      {data?.showBranding && (
        <div className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
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
  );
}