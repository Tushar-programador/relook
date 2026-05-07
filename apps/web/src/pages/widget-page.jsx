import { useEffect, useState } from "react";
import { Quote } from "lucide-react";
import { useParams, useSearchParams } from "react-router-dom";
import { Badge } from "../components/ui/badge.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { api } from "../lib/api";

export function WidgetPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  // Inject project-level custom CSS when available
  useEffect(() => {
    if (!data?.customCss) return;
    const el = document.createElement("style");
    el.id = "feedspace-custom-css";
    el.textContent = data.customCss;
    document.head.appendChild(el);
    return () => el.remove();
  }, [data?.customCss]);

  if (error) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-rose-600">{error}</div>;
  }

  const items = data?.items || [];
  const requestedLayout = (searchParams.get("layout") || "simple").toLowerCase();
  const allowedLayouts = data?.showBranding ? ["simple", "carousel"] : ["simple", "carousel", "bubble", "post"];
  const activeLayout = allowedLayouts.includes(requestedLayout) ? requestedLayout : "simple";

  const simpleGridClass = "mx-auto grid max-w-6xl gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className="min-h-screen bg-transparent p-4">
      {activeLayout === "carousel" && (
        <div className="mx-auto flex max-w-6xl snap-x snap-mandatory gap-4 overflow-x-auto pb-2">
          {items.map((item) => (
            <Card key={item._id} className="h-full min-w-[280px] snap-start bg-white/92 md:min-w-[340px]">
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
            </Card>
          ))}
        </div>
      )}

      {activeLayout === "bubble" && (
        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-4">
          {items.map((item, index) => (
            <div
              key={item._id}
              className={`max-w-sm rounded-[26px] px-5 py-4 shadow ${index % 2 === 0 ? "bg-white" : "bg-primary/10"}`}
            >
              <p className="text-sm font-semibold text-foreground">{item.name || "Anonymous"}</p>
              {item.message && <p className="mt-2 text-sm text-slate-700">{item.message}</p>}
              <p className="mt-2 text-xs text-slate-500">{data.project.name}</p>
            </div>
          ))}
        </div>
      )}

      {activeLayout === "post" && (
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {items.map((item) => (
            <div key={item._id} className="rounded-3xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                  {(item.name || "A")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{item.name || "Anonymous"}</p>
                  <p className="text-xs text-slate-500">{data.project.name}</p>
                </div>
              </div>
              {item.message && <p className="mt-4 text-sm leading-relaxed text-slate-700">{item.message}</p>}
              <div className="mt-4 flex gap-2">
                <Badge tone={item.type}>{item.type}</Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeLayout === "simple" && (
        <div className={simpleGridClass}>
          {items.map((item) => (
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
      )}

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