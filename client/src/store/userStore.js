import { create } from "zustand";
import { passportAPI, portfolioAPI, scoreAPI } from "../api";

const useUserStore = create((set, get) => ({
  passport: null,
  portfolio: [],
  score: null,
  isLoading: false,

  fetchPassport: async (userId) => {
    set({ isLoading: true });
    try {
      const passport = await passportAPI.get(userId);
      set({ passport, isLoading: false });
      return passport;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  updatePassport: async (userId, updates) => {
    try {
      const data = await passportAPI.update(userId, updates);
      set({ passport: data });
      return data;
    } catch (err) {
      throw err;
    }
  },

  fetchPortfolio: async (userId) => {
    try {
      const items = await portfolioAPI.getByUser(userId);
      set({ portfolio: items });
      return items;
    } catch (err) {
      throw err;
    }
  },

  removePortfolioItem: async (id, userId) => {
    try {
      await portfolioAPI.remove(id);
      const items = get().portfolio.filter((p) => p.id !== id);
      set({ portfolio: items });
      // Refresh passport to get updated score
      await get().fetchPassport(userId);
    } catch (err) {
      throw err;
    }
  },

  recalculateScore: async () => {
    try {
      const score = await scoreAPI.recalculate();
      set({ score });
      return score;
    } catch (err) {
      throw err;
    }
  }
}));

export default useUserStore;
