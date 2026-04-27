const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

export const api = {
  // Auth
  signup: (email: string, password: string) =>
    request("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) }),
  verifyOtp: (email: string, code: string) =>
    request<{ access_token: string }>("/api/auth/verify-otp", { method: "POST", body: JSON.stringify({ email, code }) }),
  login: (email: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  forgotPassword: (email: string) =>
    request("/api/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (email: string, code: string, new_password: string) =>
    request("/api/auth/reset-password", { method: "POST", body: JSON.stringify({ email, code, new_password }) }),

  // Session
  createSession: (data: { ideal_person?: string; favourite_celebrity?: string; celebrity_to_talk?: string }) =>
    request<{ id: string }>("/api/session", { method: "POST", body: JSON.stringify(data) }),
  getMySession: () =>
    request<{ session_id: string | null }>("/api/session/me"),

  // Chat
  chat: (session_id: string, message: string) =>
    request<{ response: string; sources: string[] }>("/api/doc-chat", {
      method: "POST",
      body: JSON.stringify({ session_id, message }),
    }),
  getHistory: (session_id: string) =>
    request<{ history: { role: string; content: string }[] }>(`/api/conversations/${session_id}`),

  // Documents
  uploadDocument: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const token = getToken();
    return fetch(`${BASE}/api/documents/upload`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    }).then((r) => r.json());
  },
  getDocuments: (session_id: string) =>
    request<{ documents: { id: string; filename: string }[] }>(`/api/documents/all`),
  deleteDocument: (id: string) =>
    request(`/api/documents/${id}`, { method: "DELETE" }),
  reindexDocuments: () =>
    request<{ status: string; message: string; reindexed: number }>("/api/documents/reindex", { method: "POST" }),
  downloadDocument: (id: string) => {
    const token = getToken();
    return fetch(`${BASE}/api/documents/download/${id}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }).then(async (r) => {
      if (!r.ok) throw new Error("Download failed");
      const disposition = r.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="?([^"]+)"?/);
      const filename = match ? match[1] : "document.txt";
      const blob = await r.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    });
  },

  // Admin
  getDashboardStats: () => request<{ total_conversations: number; pending_approvals: number; approved_count: number; active_users: number; accuracy_rate: number }>("/api/learning/dashboard-stats"),
  getGraphStats: () => request<{
    conversation_trend: { month: string; conversations: number }[];
    user_activity: { day: string; active: number }[];
    approval_status: { name: string; value: number; color: string }[];
    accuracy_trend: { week: string; accuracy: number }[];
  }>("/api/learning/graph-stats"),
  getLearningQueue: (status = "pending") => request<any[]>(`/api/learning/queue?status=${status}`),
  approveItem: (id: string, edited_answer?: string) =>
    request(`/api/learning/approve/${id}`, { method: "POST", body: JSON.stringify({ edited_answer }) }),
  rejectItem: (id: string) =>
    request(`/api/learning/reject/${id}`, { method: "POST" }),
  getAllSessions: () => request<{ sessions: { id: string; created_at: string }[] }>("/api/sessions"),
  getAllConversations: (feedback?: string) =>
    request<{ conversations: any[] }>(`/api/conversations${feedback ? `?feedback=${feedback}` : ""}`),
  getUsers: () => request<{ users: any[] }>("/api/auth/admin/users"),
  submitFeedback: (data: { question: string; ai_answer: string; feedback: string; suggested_answer?: string }) =>
    request("/api/learning/feedback", { method: "POST", body: JSON.stringify(data) }),
};
