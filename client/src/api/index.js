import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 90000 // 90s — covers Nvidia NIM + Render cold start
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handler
api.interceptors.response.use(
  (res) => res.data.data, // unwrap { success, data } envelope
  (err) => {
    const status = err.response?.status;
    const code   = err.response?.data?.code;

    // Only clear token and redirect on a confirmed auth failure —
    // NOT on network errors (Render spin-down, timeout) to avoid
    // logging users out during server cold start.
    if (status === 401) {
      // TOKEN_EXPIRED is a real expiry — clear and redirect
      // Generic 401 without a body (e.g. network error) → don't clear
      if (code === "TOKEN_EXPIRED" || err.response?.data?.error === "Unauthorized") {
        localStorage.removeItem("token");
        // Avoid redirect loop if already on /auth
        if (!window.location.pathname.startsWith("/auth")) {
          window.location.href = "/auth";
        }
      }
    }

    const message =
      err.response?.data?.error ||
      (err.code === "ECONNABORTED" ? "Request timed out — the server may be waking up, please try again" : null) ||
      (err.message === "Network Error" ? "Could not reach server — please check your connection" : null) ||
      "Something went wrong";

    return Promise.reject(new Error(message));
  }
);

export default api;

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login:    (data) => api.post("/auth/login",    data),
  me:       ()     => api.get("/auth/me")
};

// ── Passport ──────────────────────────────────────────────────────────────────
export const passportAPI = {
  get:      (userId) => api.get(`/passport/${userId}`),
  update:   (userId, data) => api.put(`/passport/${userId}`, data),
  getScore: (userId) => api.get(`/passport/${userId}/score`)
};

// ── Time Machine ──────────────────────────────────────────────────────────────
export const timeMachineAPI = {
  predict: (data) => api.post("/timemachine/predict", data),
  history: ()     => api.get("/timemachine/history")
};

// ── Radar ─────────────────────────────────────────────────────────────────────
export const radarAPI = {
  analyse: (data) => api.post("/radar/analyse", data),
  latest:  ()     => api.get("/radar/latest")
};

// ── Portfolio ─────────────────────────────────────────────────────────────────
export const portfolioAPI = {
  verify:    (data) => api.post("/portfolio/verify", data),
  getByUser: (userId) => api.get(`/portfolio/${userId}`),
  remove:    (id)     => api.delete(`/portfolio/${id}`)
};

// ── Score ─────────────────────────────────────────────────────────────────────
export const scoreAPI = {
  get:         (userId) => api.get(`/score/${userId}`),
  recalculate: ()       => api.post("/score/recalculate")
};
