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

// Toast context
export const ToastContext = createContext(null);

export function useToast() {
  return useContext(ToastContext);
}

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
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              cursor: "pointer",
              fontSize: "16px",
              padding: 0,
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

// GitHub OAuth callback page
function AuthCallback() {
  const [searchParams] = useSearchParams();
  const { setToken } = useAuthStore();
  const token = searchParams.get("token");

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  if (token) return <Navigate to="/dashboard" replace />;
  return <Navigate to="/auth?error=github_failed" replace />;
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  const { fetchMe, isAuthenticated } = useAuthStore();
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    if (isAuthenticated) fetchMe();
  }, []);

  const addToast = useCallback((message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout><Dashboard /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/timemachine"
            element={
              <ProtectedRoute>
                <Layout><TimeMachine /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/radar"
            element={
              <ProtectedRoute>
                <Layout><SkillRadarPage /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio"
            element={
              <ProtectedRoute>
                <Layout><Portfolio /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout><Profile /></Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </BrowserRouter>
    </ToastContext.Provider>
  );
}
