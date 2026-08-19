import { create } from "zustand";
import { authAPI } from "../api";

const storedUser = (() => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

const useAuthStore = create((set, get) => ({
  user:            storedUser,
  token:           localStorage.getItem("token") || null,
  isLoading:       false,
  isInitialising:  true,   // true until fetchMe resolves
  isAuthenticated: !!localStorage.getItem("token"),

  setToken: (token) => {
    localStorage.setItem("token", token);
    set({ token, isAuthenticated: true });
  },

  setUser: (user) => {
    try {
      localStorage.setItem("user", JSON.stringify(user));
    } catch {}
    set({ user });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.login({ email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
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
      localStorage.setItem("user", JSON.stringify(data.user));
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
      set({ isInitialising: false, isAuthenticated: false, user: null });
      return;
    }
    try {
      const data = await authAPI.me();
      if (data?.user) {
        try {
          localStorage.setItem("user", JSON.stringify(data.user));
        } catch {}
        set({ user: data.user, isAuthenticated: true, isInitialising: false });
      } else {
        set({ isInitialising: false });
      }
    } catch (err) {
      console.warn("fetchMe error:", err.message);
      // On auth error, clear stale tokens so user can re-login cleanly
      if (err.message?.toLowerCase().includes("unauthorized") || err.message?.toLowerCase().includes("expired")) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        set({ user: null, token: null, isAuthenticated: false, isInitialising: false });
      } else {
        set({ isInitialising: false });
      }
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ user: null, token: null, isAuthenticated: false, isInitialising: false });
  }
}));

export default useAuthStore;
