import { create } from "zustand";
import { authAPI } from "../api";

const useAuthStore = create((set) => ({
  user: null,
  token: localStorage.getItem("token") || null,
  isLoading: false,
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
    try {
      const data = await authAPI.me();
      set({ user: data.user });
    } catch {
      set({ user: null, token: null, isAuthenticated: false });
      localStorage.removeItem("token");
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null, isAuthenticated: false });
  }
}));

export default useAuthStore;
