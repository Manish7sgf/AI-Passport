import { useEffect, useCallback } from "react";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";

export function usePassport() {
  const { user } = useAuthStore();
  const { passport, portfolio, isLoading, fetchPassport, updatePassport, fetchPortfolio, removePortfolioItem } =
    useUserStore();

  useEffect(() => {
    if (user?.id && !passport) {
      fetchPassport(user.id);
    }
  }, [user?.id, passport, fetchPassport]);

  useEffect(() => {
    if (user?.id && portfolio.length === 0) {
      fetchPortfolio(user.id);
    }
  }, [user?.id]);

  const refresh = useCallback(() => {
    if (user?.id) {
      fetchPassport(user.id);
      fetchPortfolio(user.id);
    }
  }, [user?.id, fetchPassport, fetchPortfolio]);

  const update = useCallback(
    async (updates) => {
      if (!user?.id) return;
      return updatePassport(user.id, updates);
    },
    [user?.id, updatePassport]
  );

  const removeProject = useCallback(
    async (id) => {
      if (!user?.id) return;
      return removePortfolioItem(id, user.id);
    },
    [user?.id, removePortfolioItem]
  );

  return { passport, portfolio, isLoading, refresh, update, removeProject };
}
