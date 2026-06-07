import { create } from "zustand";
import { authAPI } from "../api";

const useAuthStore = create((set, get) => ({
  user:            null,
  token:           localStorage.getItem("token") || null,
  isLoading:       false,
  isInitialising:  true,   // true until fetchMe resolves — prevents auth flicker
  isAuthenticated: !!localStorage.getItem("token"),

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user) => set({ user }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, name, password) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.register({ email, name, password });
      localStorage.setItem("token", data.token);
      set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  fetchMe: async () => {
    const { token } = get();
    if (!token) {
      set({ isInitialising: false });
      return;
    }
    try {
      const data = await authAPI.me();
      set({ user: data.user, isAuthenticated: true, isInitialising: false });
    } catch (err) {
      // Only invalidate session on a definitive 401 — not on network/timeout errors
      // (Render free tier spins down and can cause transient failures)
      const isAuthFailure =
        err.message?.toLowerCase().includes("unauthorized") ||
        err.message?.toLowerCase().includes("token expired");

      if (isAuthFailure) {
        localStorage.removeItem("token");
        set({ user: null, token: null, isAuthenticated: false, isInitialising: false });
      } else {
        // Network error — keep the existing token and session intact
        set({ isInitialising: false });
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false, isInitialising: false });
  }
}));

export default useAuthStore;
