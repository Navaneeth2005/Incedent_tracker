# 🚨 Real-Time AI Incident Room

A production-quality, real-time operations dashboard for DevOps/SRE teams. Built with React, Express, Prisma, Socket.IO, and Gemini AI.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v4 + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Real-time | Socket.IO |
| AI | Google Gemini 2.5 Flash (with rule-based fallback) |

## Project Structure

```
ProjectDemo/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   └── index.ts
│   ├── prisma.config.ts
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── CreateIncidentForm.tsx
    │   │   ├── IncidentDashboard.tsx
    │   │   ├── IncidentCard.tsx
    │   │   ├── IncidentDetail.tsx
    │   │   ├── PipelineMonitor.tsx
    │   │   ├── Badges.tsx
    │   │   ├── Skeletons.tsx
    │   │   └── ToastContainer.tsx
    │   ├── hooks/
    │   │   └── useToast.ts
    │   ├── lib/
    │   │   ├── api.ts
    │   │   └── socket.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    └── package.json
```

## Setup

### Prerequisites
- Node.js v18+
- PostgreSQL database (local or hosted e.g. Neon, Supabase)

### Backend

```bash
cd backend
npm install
```

Create `.env`:
```
DATABASE_URL="postgresql://user:password@host:5432/dbname"
GEMINI_API_KEY="your_gemini_api_key"   # optional — fallback kicks in if missing
PORT=3001
```

```bash
npx prisma migrate dev --name init
npm run dev
```

### Frontend

```bash
cd frontend
npm install
```

Create `.env`:
```
VITE_API_URL=http://localhost:3001
```

```bash
npm run dev
```

Open http://localhost:5173

## AI Feature

Uses **Google Gemini 2.5 Flash** to generate incident summaries and runbook recommendations. If `GEMINI_API_KEY` is not set or the call fails, a rule-based fallback summary is generated automatically — no crashes.

## Features

- **Incident Dashboard** — real-time card list with search + status/priority filters
- **Create Incident** — form with validation, instant socket broadcast
- **Live Feed** — per-incident update timeline with Socket.IO rooms
- **Status Workflow** — Open → Investigating → Resolved
- **AI Assist** — Gemini-powered summary + action checklist per incident
- **Pipeline Monitor** — animated infrastructure health widget (simulated)
- **Toast Notifications** — success/error/warning feedback
- **Loading Skeletons** — smooth loading states
- **Empty States** — clear UI when no incidents exist

## Deployment

### Backend (Render/Railway)
- Set env vars: `DATABASE_URL`, `GEMINI_API_KEY`, `PORT`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npx tsx src/index.ts`

### Frontend (Vercel)
- Set env var: `VITE_API_URL=https://your-backend.render.com`
- Build command: `npm run build`
- Output directory: `dist`