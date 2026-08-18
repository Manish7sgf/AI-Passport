import { create } from "zustand";
import { passportAPI, portfolioAPI, scoreAPI, githubAPI } from "../api";

const useUserStore = create((set, get) => ({
  passport:      null,
  portfolio:     [],
  score:         null,
  isLoading:     false,
  isSyncing:     false,   // GitHub sync in progress
  syncResult:    null,    // last sync summary

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
      // Response now includes fresh score — update both passport and score
      set({ passport: data, score: data.score || null });
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
      // Refresh passport to get recalculated score
      await get().fetchPassport(userId);
    } catch (err) {
      throw err;
    }
  },

  // GitHub sync — fetches public repos and merges skills
  syncGitHub: async (userId) => {
    set({ isSyncing: true, syncResult: null });
    try {
      const result = await githubAPI.sync();
      set({ syncResult: result, isSyncing: false });
      // Refresh passport (skills may have been updated) and portfolio
      await Promise.all([
        get().fetchPassport(userId),
        get().fetchPortfolio(userId)
      ]);
      return result;
    } catch (err) {
      set({ isSyncing: false });
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
