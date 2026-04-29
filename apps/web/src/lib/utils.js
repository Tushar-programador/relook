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

export function getEmbedCode(slug) {
  return `<iframe src="${window.location.origin}/widget/${slug}" width="100%" height="480" style="border:0;border-radius:24px;overflow:hidden"></iframe>`;
}