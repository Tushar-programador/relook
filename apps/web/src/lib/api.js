const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:4000/api").replace(/\/$/, "");

async function request(path, options = {}) {
  const token = localStorage.getItem("feedspace-token");
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    },
    ...options
  });

  const payload = await response.json();
  if (!response.ok || !payload.success) {
    throw new Error(payload.error?.message || "Request failed");
  }

  return payload.data;
}

export const api = {
  request,
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  getProjects: () => request("/projects"),
  createProject: (body) => request("/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  getProjectAnalytics: (id) => request(`/projects/${id}/analytics`),
  getProjectFeedback: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/feedback/project/${projectId}${query ? `?${query}` : ""}`);
  },
  updateFeedbackStatus: (id, status) =>
    request(`/feedback/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteFeedback: (id) => request(`/feedback/${id}`, { method: "DELETE" }),
  getPublicFeed: (slug) => request(`/public/${slug}/feedback`),
  submitFeedback: (slug, body) => request(`/feedback/${slug}`, { method: "POST", body: JSON.stringify(body) }),
  signPublicUpload: (body) => request("/uploads/public/sign", { method: "POST", body: JSON.stringify(body) }),
  signPrivateUpload: (body) => request("/uploads/sign", { method: "POST", body: JSON.stringify(body) })
};