import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function getEmbedCode(slug, options = {}) {
  const layout = options.layout || "simple";
  const heightByLayout = {
    simple: 480,
    carousel: 360,
    bubble: 520,
    post: 720
  };
  const height = options.height || heightByLayout[layout] || 480;
  const src = `${window.location.origin}/widget/${slug}?layout=${encodeURIComponent(layout)}`;
  return `<iframe src="${src}" width="100%" height="${height}" style="border:0;border-radius:24px;overflow:hidden"></iframe>`;
}