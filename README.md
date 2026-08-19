# AI Future Passport

> **The Living Employability Ecosystem for the AI Era.**  
> Not a static resume builder. Not a generic course platform. A dynamic, AI-verified system that measures, proves, and navigates a student's real-world readiness for the 2025–2040 workforce.

[![Live App](https://img.shields.io/badge/Live_App-Vercel-000000?style=for-the-badge&logo=vercel)](https://ai-passport-ebon.vercel.app)
[![Backend](https://img.shields.io/badge/FastAPI_Backend-Render-46E3B7?style=for-the-badge&logo=fastapi)](https://ai-passport-1.onrender.com)
[![AI Engine](https://img.shields.io/badge/AI_Engine-Nvidia_NIM-76B900?style=for-the-badge&logo=nvidia)](https://build.nvidia.com)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-00E599?style=for-the-badge&logo=postgresql)](https://neon.tech)

---

## 🌟 1. Core Idea of the Project

**AI Future Passport** bridges the critical trust gap between academic education and modern technical recruitment. 

Traditional hiring relies on **unverified resumes** and static LinkedIn claims that suffer from keyword inflation and lack technical credibility. Meanwhile, students have no data-backed way of knowing whether the skills they learn today will remain relevant in the AI-accelerated job market.

### What AI Future Passport Does:
1. **Verifies Technical Truth**: Analyzes real GitHub code repositories, architectures, and language distributions using **Nvidia NIM (Llama 3.1 8B)** to eliminate fake claims.
2. **Computes a Live 100-Point Employability Score**: A transparent, multi-dimensional algorithm evaluating verified code complexity, polyglot versatility, hackathons, open source PRs, and community leadership.
3. **Simulates Career Trajectories (2025–2040)**: Uses predictive AI modeling to forecast emerging futuristic roles and student readiness scores.
4. **Performs 2030 Skill Gap Radar Analytics**: Compares a student’s current technical competencies against 2030 industry demand curves and recommends high-impact certifications.
5. **Issues a Verifiable Public Credential Sheet**: A public URL (`/public/passport/:username`) that recruiters can inspect with zero friction.

---

## 🎯 2. Why It Was Created (The Problem It Solves)

| The Problem | How AI Future Passport Solves It |
|---|---|
| **Resume Inflation & Fake Skills** | **AI Code Verification**: Repositories are crawled and evaluated with Nvidia AI for architecture, code depth, and polyglot balance. |
| **Arbitrary Metric Steppers** | **Proof-Backed Credential System**: Hackathons require Devpost/Certificates; PRs require valid GitHub pull request links. |
| **Uncertainty About the AI Future** | **Career Time Machine**: Forecasts how LLMs, automation, and quantum systems will transform job roles by 2040. |
| **Blind Skill Acquisition** | **Skill Gap Radar**: Pinpoints exact missing competencies and assigns 2030 relevance scores (0–100). |
| **Disconnected Tooling** | **All-in-One Living Dashboard**: Syncs GitHub, tracks live employability score, and updates passport in real-time. |

---

## ⚙️ 3. How It Works (System Architecture)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        REACT 18 / VITE FRONTEND                        │
│   Dashboard (ScoreRing) · Portfolio · Time Machine · Skill Radar · Profile  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / REST API (JWT)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   PYTHON / FASTAPI BACKEND GATEWAY                     │
│  FastAPI Router · Auth Middleware · SlowAPI Rate Limiter · URL Rewriter │
└───────────┬───────────────────────┬──────────────────────┬─────────────┘
            │                       │                      │
            ▼                       ▼                      ▼
┌───────────────────────┐ ┌───────────────────┐ ┌────────────────────────┐
│   NEON POSTGRESQL     │ │    NVIDIA NIM     │ │     GITHUB REST v3     │
│ Connection Pool (SSL) │ │ Llama-3.1-8B-Ins  │ │ OAuth 2.0 Auth         │
│ users, passports,     │ │ Code Analysis     │ │ Repo Ingestion         │
│ portfolio_items,      │ │ Career Simulation │ │ Language Byte Parsing  │
│ verified_activities   │ │ 2030 Skill Radar  │ │ PR / Contributor Check │
└───────────────────────┘ └───────────────────┘ └────────────────────────┘
```

### The Employability Scoring Algorithm

$$S_{\text{total}} = \min(S_{\text{projects}} + S_{\text{skills}} + S_{\text{hackathons}} + S_{\text{open\_source}} + S_{\text{mentoring}}, 100)$$

- **AI-Verified Projects** ($S_{\text{projects}} = \min(N \times 10, 30)$): Evaluated with AI complexity ratings ($\ge 5/10$) and modular architecture.
- **Verified Skills** ($S_{\text{skills}} = \min(N \times 2, 20)$): Extracted directly from repository language engines (noise files filtered).
- **Verified Hackathons** ($S_{\text{hackathons}} = \min(N \times 5, 20)$): Backed by Devpost/Certificate proof links.
- **Open Source PRs** ($S_{\text{open\_source}} = \min(N \times 5, 15)$): Validated via GitHub PR URL regex.
- **Mentoring & Leadership** ($S_{\text{mentoring}} = \min(N \times 5, 15)$): Documented community workshops and club leadership.

---

## 🚀 4. How to Use It (Step-by-Step User Journey)

### Step 1: Sign In & Connect GitHub
1. Open [AI Future Passport](https://ai-passport-ebon.vercel.app).
2. Click **"Sign in with GitHub"** to securely authenticate via OAuth 2.0.

### Step 2: Auto-Sync & AI-Verify Repositories
1. Navigate to the **Portfolio** page.
2. Click **"Sync & Auto-Verify Repos"**.
3. Nvidia AI automatically analyzes your public repositories, generates clean summaries, assigns complexity scores ($1\text{--}10$), extracts technical skills, and marks them **AI-Verified**.

### Step 3: Add Proof-Backed Activity Credentials
1. On the **Dashboard**, locate the **Verified Activity Credentials** section.
2. Click **"+ Add Verified Proof"**.
3. Select **Hackathon** (add Devpost/Certificate link), **Open Source PR** (add GitHub PR URL), or **Mentoring**.
4. Click **"Save & Recalculate Score"** — watch your Employability Score and Score Breakdown update instantly!

### Step 4: Run the Career Time Machine (2025–2040)
1. Go to **Career Time Machine**.
2. Select your skills and career interests.
3. Click **"Simulate Career Trajectory"**.
4. Review 4 futuristic job roles, their emerging years (e.g. 2027, 2030), and your **Fit Score & Readiness Index**.

### Step 5: Explore the 2030 Skill Gap Radar
1. Navigate to **Skill Radar**.
2. Click **"Run 2030 Skill Gap Analysis"**.
3. Review your skills' 2030 relevance scores (0–100), overall gap percentage, and actionable certification recommendations.

### Step 6: Share Your Public Passport
1. Click **"View public ↗"** or copy your public profile link (`https://ai-passport-ebon.vercel.app/public/passport/YOUR_USERNAME`).
2. Attach it to your LinkedIn, job applications, or portfolio for instant recruiter verification.

---

## 🛠️ 5. Technology Stack

- **Frontend**: React 18, Vite, Zustand (State Management), React Router v6, Lucide Icons, Vanilla CSS Glassmorphic Design System (100dvh mobile viewport).
- **Backend**: Python 3.10+, FastAPI, Uvicorn, SlowAPI (Rate Limiting), HTTPX (Async HTTP), Pydantic v2.
- **AI / LLM**: Nvidia NIM Microservices (`meta/llama-3.1-8b-instruct`), OpenAI-compatible Python SDK.
- **Database**: Neon Serverless PostgreSQL, `psycopg2-binary` Threaded Connection Pooling with SSL.
- **External Integration**: GitHub REST API v3, GitHub OAuth 2.0.
- **Deployment**: Vercel (Frontend SPA) + Render (Python FastAPI Web Service).

---

## 💻 6. Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Manish7sgf/AI-Passport.git
cd AI-Passport
```

### 2. Backend Setup (Python FastAPI)
```bash
cd server_python
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
# Copy environment file
cp .env.example .env
# Start FastAPI backend
uvicorn main:app --reload --port 5000
```

### 3. Frontend Setup (React / Vite)
```bash
cd ../client
npm install
# Start Vite development server
npm run dev
```

Frontend runs at `http://localhost:5173` | Backend API runs at `http://localhost:5000`

---

## 📄 7. Documentation Artifacts

For in-depth architectural and code documentation, refer to the generated Word specifications in the workspace root:
- 📘 **`AI_Future_Passport_Complete_Architecture_and_Workflow.docx`**: Complete technical and workflow specification.
- 🔬 **`AI_Future_Passport_Score_Engine_AI_Grading_and_Code_Deep_Dive.docx`**: Deep-dive mathematical scoring engine, AI grading algorithms, and module code walkthrough.

---

## 👤 Author
**Manish Varman**  
GitHub: [@Manish7sgf](https://github.com/Manish7sgf)  
Live Platform: [https://ai-passport-ebon.vercel.app](https://ai-passport-ebon.vercel.app)
