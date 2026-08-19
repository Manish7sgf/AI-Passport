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
    // Strip /api suffix — the OAuth route is at /api/auth/github, not /auth/github
    const base = import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, "");
    window.location.href = `${base}/api/auth/github`;
  };

  return (
    <div className="auth-page">
      {/* Left branding panel */}
      <div className="auth-hero-panel">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "var(--accent-text)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font)",
                fontSize: "14px",
                fontWeight: "700"
              }}
            >
              FP
            </div>
            <span
              style={{
                fontFamily: "var(--font)",
                fontSize: "24px",
                fontWeight: "600",
                color: "var(--accent-text)",
                letterSpacing: "-0.02em"
              }}
            >
              AI Passport
            </span>
          </div>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontSize: "14px",
              color: "rgba(245,244,240,0.7)",
              marginTop: "12px",
              lineHeight: "1.5"
            }}
          >
            AI-era proof of work, skill gap radar, and future employability passport.
          </p>
        </div>

        {/* Authentic Platform Highlights (Desktop / Tablet) */}
        <div
          className="auth-features-list"
          style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "32px" }}
        >
          {[
            {
              num: "01",
              title: "AI Repository Verification",
              desc: "Deep analysis of code complexity, tech stack, and skills demonstrated."
            },
            {
              num: "02",
              title: "2030 Skill Gap Radar",
              desc: "Benchmark your skills against future demand with actionable recommendations."
            },
            {
              num: "03",
              title: "Career Time Machine",
              desc: "Predict your fit for emerging AI-era job roles across 2025–2040."
            },
            {
              num: "04",
              title: "Verified Public Passport",
              desc: "Share your tamper-proof employability score with recruiters and peers."
            }
          ].map(({ num, title, desc }) => (
            <div key={num} style={{ display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span
                style={{
                  fontFamily: "var(--font)",
                  fontSize: "12px",
                  color: "rgba(245,244,240,0.4)",
                  fontWeight: "600",
                  marginTop: "2px"
                }}
              >
                {num}
              </span>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font)",
                    fontSize: "13px",
                    fontWeight: "500",
                    color: "var(--accent-text)",
                    marginBottom: "2px"
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    color: "rgba(245,244,240,0.6)",
                    lineHeight: "1.4"
                  }}
                >
                  {desc}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: "24px", fontSize: "11px", color: "rgba(245,244,240,0.4)", fontFamily: "var(--font)" }}>
          AI FUTURE PASSPORT
        </div>
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div style={{ width: "100%", maxWidth: "380px" }}>
          <h1
            style={{
              fontFamily: "var(--font)",
              fontSize: "26px",
              fontWeight: "600",
              color: "var(--text-primary)",
              marginBottom: "8px",
              letterSpacing: "-0.02em"
            }}
          >
            {mode === "login" ? "Welcome back" : "Create your passport"}
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "28px" }}>
            {mode === "login"
              ? "Sign in to manage your AI employability profile"
              : "Start verifying projects and tracking future skills"}
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {mode === "register" && (
              <Input
                label="Full Name"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                fullWidth
              />
            )}
            <Input
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
            />
            <Input
              label="Password"
              type="password"
              placeholder={mode === "register" ? "At least 8 characters" : "Your password"}
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
              {isLoading ? "Authenticating..." : mode === "login" ? "Sign in →" : "Create account →"}
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
            {mode === "login" ? "Don't have a passport yet?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text-primary)",
                fontWeight: "600",
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
