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
  verifyEmail: (body) => request("/auth/verify-email", { method: "POST", body: JSON.stringify(body) }),
  resendVerification: (body) => request("/auth/resend-verification", { method: "POST", body: JSON.stringify(body) }),
  forgotPassword: (body) => request("/auth/forgot-password", { method: "POST", body: JSON.stringify(body) }),
  resetPassword: (body) => request("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),
  me: () => request("/auth/me"),
  getProjects: () => request("/projects"),
  createProject: (body) => request("/projects", { method: "POST", body: JSON.stringify(body) }),
  updateProject: (id, body) => request(`/projects/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: "DELETE" }),
  sendPortalLinkEmails: (id, body) => request(`/projects/${id}/send-portal-link`, { method: "POST", body: JSON.stringify(body) }),
  getProjectAnalytics: (id) => request(`/projects/${id}/analytics`),
  regenProjectApiKey: (id) => request(`/projects/${id}/regen-api-key`, { method: "POST" }),
  getProjectFeedback: (projectId, params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/feedback/project/${projectId}${query ? `?${query}` : ""}`);
  },
  updateFeedbackStatus: (id, status) =>
    request(`/feedback/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteFeedback: (id) => request(`/feedback/${id}`, { method: "DELETE" }),
  getPublicFeed: (slug) => request(`/public/${slug}/feedback`),
  trackPublicOpen: (slug, body) => request(`/public/${slug}/track-open`, { method: "POST", body: JSON.stringify(body) }),
  submitFeedback: (slug, body) => request(`/feedback/${slug}`, { method: "POST", body: JSON.stringify(body) }),
  signPublicUpload: (body) => request("/uploads/public/sign", { method: "POST", body: JSON.stringify(body) }),
  signPrivateUpload: (body) => request("/uploads/sign", { method: "POST", body: JSON.stringify(body) }),
  // AI
  aiSummarize: (projectId) => request(`/ai/projects/${projectId}/summarize`),
  aiHighlights: (projectId) => request(`/ai/projects/${projectId}/highlights`),
  aiSentiment: (projectId) => request(`/ai/projects/${projectId}/sentiment`),
  // Billing
  getSubscription: () => request("/billing/subscription"),
  createCheckoutSession: (body) => request("/billing/checkout", { method: "POST", body: JSON.stringify(body) }),
  cancelSubscription: () => request("/billing/cancel", { method: "POST" }),
  // Webhooks
  getWebhooks: (projectId) => request(`/projects/${projectId}/webhooks`),
  createWebhook: (projectId, body) => request(`/projects/${projectId}/webhooks`, { method: "POST", body: JSON.stringify(body) }),
  deleteWebhook: (projectId, webhookId) => request(`/projects/${projectId}/webhooks/${webhookId}`, { method: "DELETE" }),
  testWebhook: (projectId, webhookId) => request(`/projects/${projectId}/webhooks/${webhookId}/test`, { method: "POST" }),
  // Team
  getTeamMembers: (projectId) => request(`/projects/${projectId}/team`),
  inviteTeamMember: (projectId, body) => request(`/projects/${projectId}/team/invite`, { method: "POST", body: JSON.stringify(body) }),
  removeTeamMember: (projectId, memberId) => request(`/projects/${projectId}/team/${memberId}`, { method: "DELETE" }),
  acceptTeamInvite: (token) => request(`/projects/team/accept/${token}`, { method: "POST" })
};