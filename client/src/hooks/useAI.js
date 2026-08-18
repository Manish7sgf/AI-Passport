import { useState } from "react";
import { timeMachineAPI, radarAPI, portfolioAPI } from "../api";
import useUserStore from "../store/userStore";
import useAuthStore from "../store/authStore";

export function useTimeMachine() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const predict = async ({ skills, interests }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await timeMachineAPI.predict({ skills, interests });
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, predict, setResult };
}

export function useSkillRadar() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyse = async ({ skills }) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await radarAPI.analyse({ skills });
      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const loadLatest = async () => {
    try {
      const data = await radarAPI.latest();
      if (data) setResult(data);
      return data;
    } catch {
      return null;
    }
  };

  return { result, isLoading, error, analyse, loadLatest, setResult };
}

export function usePortfolioVerifier() {
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { fetchPortfolio, fetchPassport } = useUserStore();
  const { user } = useAuthStore();

  const verify = async (repoUrl) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await portfolioAPI.verify({ repo_url: repoUrl });
      setResult(data);
      // Refresh portfolio and passport (score updated)
      if (user?.id) {
        await Promise.all([fetchPortfolio(user.id), fetchPassport(user.id)]);
      }
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { result, isLoading, error, verify, setResult };
}
