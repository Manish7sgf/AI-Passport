import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import useAuthStore from "../store/authStore";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login, register, isLoading, isAuthenticated, setToken } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Handle GitHub OAuth callback
  useEffect(() => {
    const token = searchParams.get("token");
    const oauthError = searchParams.get("error");
    if (token) {
      setToken(token);
      navigate("/dashboard");
    }
    if (oauthError) {
      setError("GitHub authentication failed. Please try again.");
    }
  }, [searchParams]);

  useEffect(() => {
    if (isAuthenticated) navigate("/dashboard");
  }, [isAuthenticated]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        if (!name.trim()) {
          setError("Name is required");
          return;
        }
        await register(email, name, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleGitHub = () => {
    window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/github`;
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Left panel */}
      <div
        style={{
          width: "40%",
          background: "var(--accent)",
          display: "flex",
          flexDirection: "column",
          padding: "40px",
          position: "relative"
        }}
      >
        <div>
          <span
            style={{
              fontFamily: "var(--font)",
              fontSize: "28px",
              fontWeight: "500",
              color: "var(--accent-text)",
              letterSpacing: "-0.02em"
            }}
          >
            AFP
          </span>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "13px",
              color: "rgba(245,244,240,0.6)",
              marginTop: "8px"
            }}
          >
            Your future, verified.
          </p>
        </div>

        {/* Stats */}
        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "20px" }}>
          {[
            { value: "12,400", label: "students" },
            { value: "2030", label: "ready" },
            { value: "AI", label: "verified" }
          ].map(({ value, label }) => (
            <div key={label}>
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "28px",
                  fontWeight: "500",
                  color: "var(--accent-text)",
                  lineHeight: 1
                }}
              >
                {value}
              </div>
              <div
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  color: "rgba(245,244,240,0.5)",
                  marginTop: "4px"
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          flex: 1,
          background: "var(--surface)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px"
        }}
      >
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <h1
            style={{
              fontFamily: "var(--font)",
              fontSize: "28px",
              fontWeight: "500",
              color: "var(--text-primary)",
              marginBottom: "8px",
              letterSpacing: "-0.02em"
            }}
          >
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "32px" }}>
            {mode === "login" ? "Sign in to your passport" : "Start building your AI future"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <Input
                label="Full Name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            )}
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder={mode === "register" ? "Min 8 characters" : "Your password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
            />

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "var(--red-bg)",
                  border: "0.5px solid var(--red)",
                  borderRadius: "var(--radius)",
                  fontSize: "13px",
                  color: "var(--red)"
                }}
              >
                {error}
              </div>
            )}

            <Button type="submit" fullWidth disabled={isLoading}>
              {isLoading ? "Loading..." : mode === "login" ? "Sign in" : "Create account"}
            </Button>
          </form>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              margin: "20px 0"
            }}
          >
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
            <span style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>or</span>
            <div style={{ flex: 1, height: "0.5px", background: "var(--border)" }} />
          </div>

          <Button variant="secondary" fullWidth onClick={handleGitHub}>
            <GitHubIcon />
            Continue with GitHub
          </Button>

          {/* Toggle */}
          <p
            style={{
              textAlign: "center",
              fontSize: "13px",
              color: "var(--text-secondary)",
              marginTop: "24px"
            }}
          >
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontWeight: "500",
                fontSize: "13px",
                textDecoration: "underline",
                fontFamily: "var(--font-body)"
              }}
            >
              {mode === "login" ? "Register" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}
