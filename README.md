# AI Future Passport

> A living employability ecosystem for students — not a course platform, not a resume builder. A dynamic system that measures, proves, and grows a student's real-world readiness for an AI-dominated job market.

Built for **CodeZap by Descience** hackathon.

---

## Modules

| Module | Description |
|---|---|
| **Passport** | Live employability profile with skills, projects, and score |
| **Career Time Machine** | AI simulation of jobs you'll qualify for in 2026–2040 |
| **Skill Gap Radar** | 2030 gap analysis — what you have vs. what employers need |
| **Portfolio Generator** | GitHub repo analysis — AI-verified project cards |
| **Employability Score** | Dynamic 0–100 score across 5 weighted dimensions |

---

## Setup

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE aifuture;"
psql -U postgres -d aifuture -f database/schema.sql
```

### 2. Backend

```bash
cd server
npm install
# Edit .env with your credentials
npm run dev
```

### 3. Frontend

```bash
cd client
npm install
# Edit .env with your credentials
npm run dev
```

App runs at: `http://localhost:5173`
API runs at: `http://localhost:5000`

---

## Environment Variables

### server/.env

```
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/aifuture
JWT_SECRET=your_jwt_secret_min_32_chars
NVIDIA_API_KEY=your_nvidia_api_key
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_TOKEN=your_personal_github_token
NODE_ENV=development
```

### client/.env

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

---

## API Keys Required

| Service | Where to get it |
|---|---|
| **Nvidia NIM** | [build.nvidia.com](https://build.nvidia.com) → API key |
| **GitHub OAuth App** | GitHub Settings → Developer Settings → OAuth Apps |
| **GitHub Personal Token** | GitHub Settings → Developer Settings → Personal access tokens |

---

## Score Formula

| Dimension | Formula | Max |
|---|---|---|
| Projects verified | `count × 10` | 30 |
| Skills | `count × 2` | 20 |
| Hackathons | `count × 5` | 20 |
| Open source PRs | `count × 3` | 15 |
| Mentoring sessions | `count × 5` | 15 |
| **Total** | | **100** |

---

## Tech Stack

**Frontend:** React 18, Vite, Zustand, React Router, Axios  
**Backend:** Node.js, Express, PostgreSQL (pg), JWT, bcryptjs  
**AI:** Nvidia NIM — `meta/llama-3.1-70b-instruct` (OpenAI-compatible SDK)  
**External APIs:** GitHub REST API v3

---

## Demo Script (60 seconds)

1. Open app → clean login page with dark left panel
2. Login with GitHub → lands on dashboard
3. Dashboard: passport with score ring
4. Career Time Machine → type "Python, React, Machine Learning" → simulate
5. Show 4 AI job cards with readiness score
6. Skill Gap Radar → import skills → show 2030 gap analysis
7. Portfolio → paste a real GitHub URL → show AI analysis card
8. Return to dashboard → updated score ring

> "This is not a course platform. This is proof of value in an AI world."

Live Demo link: https://ai-passport-ebon.vercel.app/auth
