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

## Tech Stack

**Frontend:** React 18, Vite, Zustand, React Router v6, Axios  
**Backend:** Node.js, Express, JWT, bcryptjs  
**Database:** SQLite via `sql.js` — zero config, no server needed, single file  
**AI:** Nvidia NIM — `meta/llama-3.1-8b-instruct` (OpenAI-compatible SDK)  
**External APIs:** GitHub REST API v3

---

## Database

This project uses **SQLite** (via `sql.js`) instead of PostgreSQL.

- No database server to install or run
- Database is a single file: `server/data/passport.db`
- Tables are created automatically on first server start
- To reset: delete `server/data/passport.db` and restart the server

> **Why sql.js?** It's pure JavaScript/WebAssembly — no native compilation needed. Works on any machine without Visual Studio Build Tools or PostgreSQL installed. Perfect for demos and hackathons.

---

## Setup

### 1. Clone the repo

```bash
git clone https://github.com/Manish7sgf/Team-9-NGPIT.git
cd Team-9-NGPIT
```

### 2. Configure environment variables

```bash
# Server
cp server/.env.example server/.env
# Fill in your values in server/.env

# Client
cp client/.env.example client/.env
```

### 3. Install dependencies

```bash
# Backend
cd server
npm install

# Frontend (new terminal)
cd client
npm install
```

### 4. Start the app

```bash
# Terminal 1 — Backend (auto-creates SQLite DB on first run)
cd server
npm run dev

# Terminal 2 — Frontend
cd client
npm run dev
```

- Frontend: `http://localhost:5173`
- API: `http://localhost:5000`

No database setup step needed. The SQLite file is created automatically.

---

## Environment Variables

### `server/.env`

```env
PORT=5000
DB_PATH=./data/passport.db
JWT_SECRET=your_jwt_secret_min_32_chars
NVIDIA_API_KEY=your_nvidia_api_key
GITHUB_TOKEN=your_personal_github_token
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
NODE_ENV=development
```

### `client/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_GITHUB_CLIENT_ID=your_github_oauth_client_id
```

---

## API Keys Required

| Service | Where to get it |
|---|---|
| **Nvidia NIM** | [build.nvidia.com](https://build.nvidia.com) → API key |
| **GitHub OAuth App** | GitHub → Settings → Developer Settings → OAuth Apps → New OAuth App |
| **GitHub Personal Token** | GitHub → Settings → Developer Settings → Personal access tokens |

**GitHub OAuth App settings:**
- Homepage URL: `http://localhost:5173`
- Callback URL: `http://localhost:5000/api/auth/github/callback`

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

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register with email/password |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/github` | GitHub OAuth redirect |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/passport/:userId` | Get full passport |
| PUT | `/api/passport/:userId` | Update skills, bio, stats |
| POST | `/api/timemachine/predict` | AI career simulation |
| GET | `/api/timemachine/history` | Past simulations |
| POST | `/api/radar/analyse` | AI skill gap analysis |
| GET | `/api/radar/latest` | Latest gap snapshot |
| POST | `/api/portfolio/verify` | Verify GitHub repo with AI |
| GET | `/api/portfolio/:userId` | Get all portfolio items |
| DELETE | `/api/portfolio/:id` | Remove portfolio item |
| GET | `/api/score/:userId` | Get score breakdown |
| POST | `/api/score/recalculate` | Force recalculate score |

---

## Project Structure

```
ai-future-passport/
├── client/                  # React 18 + Vite frontend
│   ├── src/
│   │   ├── api/             # Axios instance + all API calls
│   │   ├── components/      # UI, layout, passport, radar, timemachine, portfolio
│   │   ├── hooks/           # usePassport, useAI (timemachine, radar, portfolio)
│   │   ├── pages/           # Auth, Dashboard, TimeMachine, SkillRadar, Portfolio
│   │   ├── store/           # Zustand: authStore, userStore
│   │   └── utils/           # scoreCalc, formatters
├── server/                  # Node.js + Express API
│   ├── src/
│   │   ├── config/          # db.js (sql.js SQLite), nvidia.js
│   │   ├── controllers/     # auth, passport, timemachine, radar, portfolio, score
│   │   ├── middleware/       # JWT auth, error handler
│   │   ├── models/          # user, passport, portfolio (SQLite queries)
│   │   ├── routes/          # 6 route files
│   │   └── services/        # nvidia.service, github.service, score.service
│   └── data/                # passport.db lives here (git-ignored)
└── database/
    └── schema.sql           # Reference schema (not required — auto-created by server)
```

---

## Demo Script (60 seconds)

1. Open `http://localhost:5173` — show login page
2. Register or login with GitHub
3. Dashboard: passport with score ring
4. **Career Time Machine** → type `Python, React, Machine Learning` → simulate → show 4 AI job cards
5. **Skill Gap Radar** → import skills from passport → show 2030 gap analysis
6. **Portfolio** → paste `https://github.com/Manish7sgf/Team-9-NGPIT` → show AI analysis card
7. Return to Dashboard → score ring updated automatically

> *"This is not a course platform. This is proof of value in an AI world."*

---

## Team

**Team-9-NGPIT** — Manish · Kishkindhan · Swetha · Shenbagapriya · Dinehkumar
