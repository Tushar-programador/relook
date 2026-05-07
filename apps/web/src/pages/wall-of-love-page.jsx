import { useEffect, useMemo, useRef, useState } from "react";
import { Check, Heart, Move, Paintbrush, PlayCircle, Quote, Save, Settings2 } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge.jsx";
import { Button } from "../components/ui/button.jsx";
import { Card, CardDescription, CardTitle } from "../components/ui/card.jsx";
import { Input } from "../components/ui/input.jsx";
import { api } from "../lib/api";

const WALL_CANVAS_WIDTH = 1200;
const WALL_CANVAS_HEIGHT = 900;

const DEFAULT_THEME = {
  primaryColor: "#0f766e",
  accentColor: "#f59e0b",
  backgroundColor: "#f8fafc",
  textColor: "#0f172a",
  pattern: "dots"
};

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildDefaultLayout(items) {
  const result = {};
  items.forEach((item, index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    result[item._id] = {
      x: 24 + col * 384,
      y: 24 + row * 280,
      w: 360,
      h: 250
    };
  });
  return result;
}

function mergeLayout(items, savedLayout) {
  const defaults = buildDefaultLayout(items);
  const merged = {};
  items.forEach((item) => {
    const current = savedLayout?.[item._id];
    if (!current) {
      merged[item._id] = defaults[item._id];
      return;
    }

    merged[item._id] = {
      x: clamp(Number(current.x) || defaults[item._id].x, 0, WALL_CANVAS_WIDTH - 180),
      y: clamp(Number(current.y) || defaults[item._id].y, 0, WALL_CANVAS_HEIGHT - 130),
      w: clamp(Number(current.w) || defaults[item._id].w, 220, WALL_CANVAS_WIDTH),
      h: clamp(Number(current.h) || defaults[item._id].h, 170, WALL_CANVAS_HEIGHT)
    };
  });
  return merged;
}

function canvasPattern(theme) {
  const dots = `radial-gradient(circle at 1px 1px, ${theme.accentColor}22 1px, transparent 0)`;
  const grid = `linear-gradient(to right, ${theme.accentColor}22 1px, transparent 1px), linear-gradient(to bottom, ${theme.accentColor}22 1px, transparent 1px)`;
  const lines = `repeating-linear-gradient(135deg, ${theme.accentColor}22 0px, ${theme.accentColor}22 2px, transparent 2px, transparent 12px)`;
  if (theme.pattern === "grid") {
    return { backgroundImage: grid, backgroundSize: "28px 28px" };
  }
  if (theme.pattern === "lines") {
    return { backgroundImage: lines, backgroundSize: "auto" };
  }
  return { backgroundImage: dots, backgroundSize: "24px 24px" };
}

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

function EditableCard({ item, layout, onLayoutChange, accentColor, textColor }) {
  const cardRef = useRef(null);
  const dragState = useRef(null);
  const resizeState = useRef(null);

  function onDragPointerDown(event) {
    dragState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startLeft: layout.x,
      startTop: layout.y
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onDragPointerMove(event) {
    if (!dragState.current) return;
    const dx = event.clientX - dragState.current.startX;
    const dy = event.clientY - dragState.current.startY;
    const nextX = clamp(dragState.current.startLeft + dx, 0, WALL_CANVAS_WIDTH - layout.w);
    const nextY = clamp(dragState.current.startTop + dy, 0, WALL_CANVAS_HEIGHT - layout.h);
    onLayoutChange(item._id, { ...layout, x: nextX, y: nextY });
  }

  function onDragPointerUp(event) {
    dragState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  function onResizePointerDown(event) {
    resizeState.current = {
      startX: event.clientX,
      startY: event.clientY,
      startW: layout.w,
      startH: layout.h
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onResizePointerMove(event) {
    if (!resizeState.current) return;
    const dx = event.clientX - resizeState.current.startX;
    const dy = event.clientY - resizeState.current.startY;
    const nextW = clamp(resizeState.current.startW + dx, 220, WALL_CANVAS_WIDTH - layout.x);
    const nextH = clamp(resizeState.current.startH + dy, 170, WALL_CANVAS_HEIGHT - layout.y);
    onLayoutChange(item._id, { ...layout, w: nextW, h: nextH });
  }

  function onResizePointerUp(event) {
    resizeState.current = null;
    event.currentTarget.releasePointerCapture(event.pointerId);
  }

  return (
    <div
      ref={cardRef}
      className="absolute overflow-hidden rounded-3xl border border-white/70 bg-white/92 shadow-lg"
      style={{ left: layout.x, top: layout.y, width: layout.w, height: layout.h, color: textColor }}
    >
      <div
        className="flex cursor-grab items-center justify-between border-b px-4 py-2"
        style={{ borderColor: `${accentColor}33` }}
        onPointerDown={onDragPointerDown}
        onPointerMove={onDragPointerMove}
        onPointerUp={onDragPointerUp}
      >
        <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: accentColor }}>
          <Move className="h-3.5 w-3.5" /> Drag
        </div>
        <Badge tone={item.type}>{item.type}</Badge>
      </div>

      <div className="h-[calc(100%-44px)] overflow-auto p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold">{item.name || "Anonymous"}</h3>
            <p className="text-xs opacity-70">{new Date(item.createdAt).toLocaleDateString()}</p>
          </div>
          <Quote className="h-4 w-4" style={{ color: accentColor }} />
        </div>

        {item.message && <p className="mt-3 text-sm leading-relaxed">{item.message}</p>}
        <TestimonialMedia item={item} />
      </div>

      <div
        className="absolute bottom-1 right-1 h-6 w-6 cursor-se-resize rounded-lg border bg-white/90"
        style={{ borderColor: `${accentColor}66` }}
        onPointerDown={onResizePointerDown}
        onPointerMove={onResizePointerMove}
        onPointerUp={onResizePointerUp}
      />
    </div>
  );
}

export function WallOfLovePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [ownerProjectId, setOwnerProjectId] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [layout, setLayout] = useState({});
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const hasHydratedEditorState = useRef(false);
  const lastSavedSnapshot = useRef("");

  function serializeSettings(themeValue, layoutValue) {
    return JSON.stringify({ theme: themeValue, layout: layoutValue });
  }

  useEffect(() => {
    api
      .getPublicFeed(slug)
      .then(setData)
      .catch((err) => setError(err.message));
  }, [slug]);

  useEffect(() => {
    let active = true;
    api
      .getProjects()
      .then((projects) => {
        if (!active) return;
        const owned = projects.find((project) => project.slug === slug);
        setIsOwner(Boolean(owned));
        setOwnerProjectId(owned?._id || "");
      })
      .catch(() => {
        if (active) {
          setIsOwner(false);
          setOwnerProjectId("");
        }
      });

    return () => {
      active = false;
    };
  }, [slug]);

  useEffect(() => {
    if (!data?.customCss) return;
    const el = document.createElement("style");
    el.id = "feedspace-custom-css";
    el.textContent = data.customCss;
    document.head.appendChild(el);
    return () => el.remove();
  }, [data?.customCss]);

  const items = data?.items || [];
  const loadedTheme = useMemo(() => {
    return {
      ...DEFAULT_THEME,
      ...(data?.wallSettings?.theme || data?.project?.wallSettings?.theme || {})
    };
  }, [data?.wallSettings?.theme, data?.project?.wallSettings?.theme]);

  useEffect(() => {
    if (editMode) {
      return;
    }
    setTheme(loadedTheme);
  }, [loadedTheme, editMode]);

  useEffect(() => {
    if (editMode) {
      return;
    }

    if (!items.length) {
      setLayout({});
      lastSavedSnapshot.current = serializeSettings(loadedTheme, {});
      hasHydratedEditorState.current = true;
      return;
    }
    const nextLayout = mergeLayout(items, data?.wallSettings?.layout || data?.project?.wallSettings?.layout || {});
    setLayout(nextLayout);
    lastSavedSnapshot.current = serializeSettings(loadedTheme, nextLayout);
    hasHydratedEditorState.current = true;
  }, [items, data?.wallSettings?.layout, data?.project?.wallSettings?.layout, loadedTheme, editMode]);

  async function saveWallSettings(options = {}) {
    const { auto = false } = options;

    if (auto && saving) {
      return;
    }

    if (!ownerProjectId) {
      setSaveMessage("Only the portal owner can save changes.");
      return;
    }

    setSaving(true);
    setSaveMessage("");
    try {
      const updatedProject = await api.updateProject(ownerProjectId, {
        wallSettings: {
          theme,
          layout
        }
      });

      setData((current) => {
        if (!current) {
          return current;
        }

        const nextWallSettings = updatedProject?.wallSettings || { theme, layout };
        return {
          ...current,
          wallSettings: nextWallSettings,
          project: {
            ...current.project,
            ...(updatedProject || {}),
            wallSettings: nextWallSettings
          }
        };
      });

      lastSavedSnapshot.current = serializeSettings(theme, layout);
      setSaveMessage(auto ? "Auto-saved" : "Layout saved successfully.");
      if (!auto) {
        setTimeout(() => setSaveMessage(""), 3000);
      }
    } catch (err) {
      setSaveMessage(err.message);
    } finally {
      setSaving(false);
    }
  }

  useEffect(() => {
    if (!editMode || !isOwner || !ownerProjectId || !hasHydratedEditorState.current) {
      return;
    }

    const currentSnapshot = serializeSettings(theme, layout);
    if (currentSnapshot === lastSavedSnapshot.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      saveWallSettings({ auto: true, refresh: false });
    }, 900);

    return () => clearTimeout(timeoutId);
  }, [editMode, isOwner, ownerProjectId, theme, layout]);

  function updateLayout(itemId, nextLayout) {
    setLayout((current) => ({
      ...current,
      [itemId]: nextLayout
    }));
  }

  if (error) {
    return <div className="flex min-h-screen items-center justify-center px-4 text-center text-sm text-rose-600">{error}</div>;
  }

  return (
    <div className="min-h-screen px-4 py-10 md:px-8" style={{ background: theme.backgroundColor }}>
      <div className="mx-auto max-w-7xl space-y-8">
        <Card>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold" style={{ backgroundColor: `${theme.accentColor}22`, color: theme.accentColor }}>
                <Heart className="h-3.5 w-3.5" />
                Wall of Love
              </div>
              <CardTitle className="text-3xl" style={{ color: theme.textColor }}>{data?.project?.name || "Portal"} testimonials</CardTitle>
              <CardDescription style={{ color: `${theme.textColor}CC` }}>Real customer love collected through this portal.</CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isOwner && (
                <Button variant={editMode ? "primary" : "secondary"} onClick={() => setEditMode((v) => !v)}>
                  <span className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" /> {editMode ? "Exit editor" : "Edit page"}
                  </span>
                </Button>
              )}
              <Button asChild variant="secondary">
                <Link to={`/feedback/${slug}`}>Share your feedback</Link>
              </Button>
            </div>
          </div>
        </Card>

        {editMode && isOwner && (
          <Card className="bg-white/90">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Paintbrush className="h-4 w-4" /> Wall style editor
                </div>
                <p className="mt-1 text-xs text-slate-500">Drag cards, resize from bottom-right corner, then save.</p>
              </div>

              <Button onClick={() => saveWallSettings({ auto: false })} disabled={saving}>
                <span className="flex items-center gap-2">
                  {saving ? <Save className="h-4 w-4 animate-pulse" /> : <Check className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save changes"}
                </span>
              </Button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Primary
                <Input type="color" value={theme.primaryColor} onChange={(e) => setTheme((t) => ({ ...t, primaryColor: e.target.value }))} />
              </label>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Accent
                <Input type="color" value={theme.accentColor} onChange={(e) => setTheme((t) => ({ ...t, accentColor: e.target.value }))} />
              </label>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Background
                <Input type="color" value={theme.backgroundColor} onChange={(e) => setTheme((t) => ({ ...t, backgroundColor: e.target.value }))} />
              </label>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Text
                <Input type="color" value={theme.textColor} onChange={(e) => setTheme((t) => ({ ...t, textColor: e.target.value }))} />
              </label>
              <label className="space-y-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Pattern
                <select
                  className="h-10 w-full rounded-2xl border border-border/60 bg-white px-3 text-sm"
                  value={theme.pattern}
                  onChange={(e) => setTheme((t) => ({ ...t, pattern: e.target.value }))}
                >
                  <option value="dots">Dots</option>
                  <option value="grid">Grid</option>
                  <option value="lines">Lines</option>
                </select>
              </label>
            </div>

            {saveMessage && <p className="mt-3 text-sm text-slate-600">{saveMessage}</p>}
          </Card>
        )}

        {items.length === 0 ? (
          <Card>
            <CardTitle>No approved testimonials yet</CardTitle>
            <CardDescription className="mt-2">Once reviews are approved, they will appear here automatically.</CardDescription>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <div
              className="relative rounded-3xl border border-white/80 shadow-inner"
              style={{
                width: WALL_CANVAS_WIDTH,
                minHeight: WALL_CANVAS_HEIGHT,
                backgroundColor: theme.backgroundColor,
                ...canvasPattern(theme)
              }}
            >
              {items.map((item) => {
                const itemLayout = layout[item._id] || { x: 24, y: 24, w: 360, h: 250 };

                if (editMode && isOwner) {
                  return (
                    <EditableCard
                      key={item._id}
                      item={item}
                      layout={itemLayout}
                      onLayoutChange={updateLayout}
                      accentColor={theme.accentColor}
                      textColor={theme.textColor}
                    />
                  );
                }

                return (
                  <div
                    key={item._id}
                    className="absolute overflow-hidden rounded-3xl border border-white/70 bg-white/92 shadow-lg"
                    style={{ left: itemLayout.x, top: itemLayout.y, width: itemLayout.w, height: itemLayout.h, color: theme.textColor }}
                  >
                    <div className="h-full overflow-auto p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-lg">{item.name || "Anonymous"}</CardTitle>
                          <CardDescription className="mt-1">{new Date(item.createdAt).toLocaleDateString()}</CardDescription>
                        </div>
                        <Quote className="h-5 w-5" style={{ color: theme.accentColor }} />
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Badge tone={item.type}>{item.type}</Badge>
                      </div>

                      {item.message && <p className="mt-4 text-sm leading-relaxed">{item.message}</p>}
                      <TestimonialMedia item={item} />
                    </div>
                  </div>
                );
              })}
            </div>
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
