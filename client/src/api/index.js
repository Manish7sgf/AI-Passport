import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000 // 30s for Nvidia NIM calls
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global error handler
api.interceptors.response.use(
  (res) => res.data.data, // unwrap the data field
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    const message = err.response?.data?.error || "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default api;

// Auth endpoints
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me")
};

// Passport endpoints
export const passportAPI = {
  get: (userId) => api.get(`/passport/${userId}`),
  update: (userId, data) => api.put(`/passport/${userId}`, data),
  getScore: (userId) => api.get(`/passport/${userId}/score`)
};

// Time Machine endpoints
export const timeMachineAPI = {
  predict: (data) => api.post("/timemachine/predict", data),
  history: () => api.get("/timemachine/history")
};

// Radar endpoints
export const radarAPI = {
  analyse: (data) => api.post("/radar/analyse", data),
  latest: () => api.get("/radar/latest")
};

// Portfolio endpoints
export const portfolioAPI = {
  verify: (data) => api.post("/portfolio/verify", data),
  getByUser: (userId) => api.get(`/portfolio/${userId}`),
  remove: (id) => api.delete(`/portfolio/${id}`)
};

// Score endpoints
export const scoreAPI = {
  get: (userId) => api.get(`/score/${userId}`),
  recalculate: () => api.post("/score/recalculate")
};
