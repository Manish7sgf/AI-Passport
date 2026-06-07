import React, { useEffect, useState, createContext, useContext, useCallback } from "react";
import { BrowserRouter, Routes, Route, Navigate, useSearchParams } from "react-router-dom";
import useAuthStore from "./store/authStore";
import Layout from "./components/layout/Layout";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import TimeMachine from "./pages/TimeMachine";
import SkillRadarPage from "./pages/SkillRadar";
import Portfolio from "./pages/Portfolio";
import Profile from "./pages/Profile";

// ── Toast context ─────────────────────────────────────────────────────────────
export const ToastContext = createContext(null);
export function useToast() { return useContext(ToastContext); }

function ToastContainer({ toasts, removeToast }) {
  return (
    <div id="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            padding: "12px 16px",
            background: toast.type === "error" ? "var(--red)" : "var(--green)",
            color: "#fff",
            borderRadius: "var(--radius)",
            fontSize: "13px",
            fontFamily: "var(--font-body)",
            minWidth: "280px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            animation: "fadeIn 0.2s ease",
            pointerEvents: "all"
          }}
        >
          {toast.message}
          <button
            onClick={() => removeToast(toast.id)}
            style={{
              background: "none", border: "none", color: "rgba(255,255,255,0.8)",
              cursor: "pointer", fontSize: "16px", padding: 0, lineHeight: 1
            }}
          >×</button>
        </div>
      ))}
    </div>
  );
}

// ── GitHub OAuth callback ─────────────────────────────────────────────────────
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken, fetchMe } = useAuthStore();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      setToken(token);
      fetchMe(); // populate user immediately after OAuth
    }
  }, [token]);

  if (token) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/auth?error=github_failed" replace />;
}

// ── Protected route — waits for initialisation before deciding ────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated, isInitialising } = useAuthStore();

  // Show a neutral full-screen loader while we verify the token —
  // prevents the login redirect flash on hard refresh
  if (isInitialising) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "var(--bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "12px"
        }}
      >
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
          <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
          <circle cx="12" cy="12" r="10" stroke="var(--border-strong)" strokeWidth="2" />
          <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <span style={{ fontFamily: "var(--font)", fontSize: "12px", color: "var(--text-tertiary)" }}>
          Loading...
        </span>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

// ── Keep-alive ping for Render free tier ─────────────────────────────────────
// Render spins down after 15 min of inactivity — ping every 10 min to prevent it
function useKeepAlive() {
  useEffect(() => {
    const API = import.meta.env.VITE_API_BASE_URL;
    if (!API) return;

    const ping = () => {
      fetch(`${API}/ping`, { method: "GET" }).catch(() => {});
    };

    // Ping immediately on load, then every 10 minutes
    ping();
    const interval = setInterval(ping, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const { fetchMe, isAuthenticated } = useAuthStore();
  const [toasts, setToasts] = useState([]);

  useKeepAlive();

  useEffect(() => {
    // Always call fetchMe on mount — it resolves isInitialising
    // and re-populates user from a valid stored token
    fetchMe();
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast }}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth"          element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard"     element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
          <Route path="/timemachine"   element={<ProtectedRoute><Layout><TimeMachine /></Layout></ProtectedRoute>} />
          <Route path="/radar"         element={<ProtectedRoute><Layout><SkillRadarPage /></Layout></ProtectedRoute>} />
          <Route path="/portfolio"     element={<ProtectedRoute><Layout><Portfolio /></Layout></ProtectedRoute>} />
          <Route path="/profile"       element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
          <Route path="*"              element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
