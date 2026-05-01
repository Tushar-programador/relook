import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../lib/api";

/**
 * Floating Widget Page – /floating/:slug
 *
 * This page is designed to be embedded as an iframe inside a floating button
 * on external websites. It shows approved testimonials in a compact vertical list.
 *
 * Embed snippet (copy from dashboard):
 *   <script src="https://yourapp.com/embed.js?slug=MY_SLUG" defer></script>
 *
 * The page is self-contained with inline styles so it works without any
 * Tailwind classes being loaded by the host page.
 */
export function FloatingWidgetPage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  useEffect(() => {
    if (!data?.customCss) return;
    const el = document.createElement("style");
    el.id = "feedspace-custom-css";
    el.textContent = data.customCss;
    document.head.appendChild(el);
    return () => el.remove();
  }, [data?.customCss]);

  if (error) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#e11d48", fontSize: 13 }}>
        {error}
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", color: "#94a3b8", fontSize: 13 }}>
        Loading…
      </div>
    );
  }

  const items = data.items || [];

  return (
    <div
      style={{
        fontFamily: "system-ui, -apple-system, sans-serif",
        background: "#f8fafc",
        minHeight: "100vh",
        padding: "12px",
        boxSizing: "border-box"
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: 12, padding: "10px 14px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,.07)" }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{data.project.name}</p>
        <p style={{ margin: "2px 0 0", fontSize: 11, color: "#64748b" }}>Customer testimonials</p>
      </div>

      {items.length === 0 ? (
        <p style={{ fontSize: 13, color: "#64748b", textAlign: "center", padding: "32px 0" }}>No approved testimonials yet.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((item) => (
            <div
              key={item._id}
              style={{
                background: "#fff",
                borderRadius: 12,
                padding: "12px 14px",
                boxShadow: "0 1px 4px rgba(0,0,0,.07)"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{item.name || "Anonymous"}</p>
                  <span
                    style={{
                      display: "inline-block",
                      marginTop: 3,
                      fontSize: 10,
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      padding: "1px 6px",
                      borderRadius: 99,
                      background: item.type === "video" ? "#dbeafe" : item.type === "audio" ? "#d1fae5" : "#f1f5f9",
                      color: item.type === "video" ? "#1d4ed8" : item.type === "audio" ? "#065f46" : "#475569"
                    }}
                  >
                    {item.type}
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: 10, color: "#94a3b8" }}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </p>
              </div>

              {item.message && (
                <p style={{ margin: "8px 0 0", fontSize: 12, color: "#374151", lineHeight: 1.5 }}>
                  "{item.message}"
                </p>
              )}

              {item.mediaUrl && item.type === "video" && (
                <video
                  src={item.mediaUrl}
                  controls
                  preload="none"
                  style={{ marginTop: 8, width: "100%", borderRadius: 8, display: "block" }}
                />
              )}

              {item.mediaUrl && item.type === "audio" && (
                <audio
                  src={item.mediaUrl}
                  controls
                  preload="none"
                  style={{ marginTop: 8, width: "100%", display: "block" }}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {data.showBranding && (
        <div style={{ marginTop: 16, textAlign: "center", fontSize: 11, color: "#94a3b8" }}>
          Powered by{" "}
          <a href="https://feedspace.app" target="_blank" rel="noreferrer" style={{ color: "#0f766e", fontWeight: 600 }}>
            FeedSpace
          </a>
        </div>
      )}
    </div>
  );
}
