# Real-Time AI Incident Room

A production-quality, real-time operations dashboard for DevOps/SRE teams.

## Tech Stack

| Layer | Technology |
|-------|-------------|
| Frontend | React + Vite + Tailwind CSS v4 + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB with Mongoose ODM |
| Real-time | Socket.IO |
| AI | OpenAI API (with rule-based fallback) |

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)

### Step 1: Setup MongoDB

**Option A - Local MongoDB:**
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or download from https://www.mongodb.com/try/download/community
```

**Option B - MongoDB Atlas (Cloud):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/incident-room`

### Step 2: Configure Environment

**Backend - Edit `backend/.env`:**
```env
MONGODB_URI=mongodb://localhost:27017/incident-room
PORT=3001
OPENAI_API_KEY=sk-your-openai-key-here  # Optional - leave empty for fallback mode
FRONTEND_URL=http://localhost:5173
```

**Frontend - Edit `frontend/.env`:**
```env
VITE_API_URL=http://localhost:3001
```

### Step 3: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 4: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Should see: `🚀 Server running on http://localhost:3001`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Should see: `Local: http://localhost:5173/`

### Step 5: Open Browser

Navigate to http://localhost:5173

## Features

- **Incident Dashboard** - Real-time card list with search + status/priority filters
- **Create Incident** - Form with validation, instant socket broadcast
- **Live Updates** - Per-incident timeline with Socket.IO sync
- **Status Workflow** - Open → Investigating → Resolved
- **AI Assist** - OpenAI-powered summary, actions, priority validation
- **Pipeline Monitor** - Animated infrastructure health widget
- **Fallback AI** - Works without OpenAI key using intelligent rule-based system

## AI Feature

The app works **without an OpenAI key** using built-in fallback logic:

- **Database issues** → Suggests connection pool, slow queries, replica health
- **API failures** → Suggests gateway logs, rate limits, endpoint verification
- **Auth problems** → Suggests token checks, LDAP status, permissions
- **Network issues** → Suggests DNS, firewall, load balancer checks

To enable real AI: Add your OpenAI key to `backend/.env`:
```
OPENAI_API_KEY=sk-...
```

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/incidents | List incidents |
| POST | /api/incidents | Create incident |
| GET | /api/incidents/:id | Get incident |
| GET | /api/incidents/:id/details | Get with updates + AI |
| PATCH | /api/incidents/:id/status | Update status |
| POST | /api/incidents/:id/update | Add update |
| POST | /api/incidents/:id/ai-summary | AI summary |
| POST | /api/incidents/:id/ai-actions | AI actions |
| POST | /api/incidents/:id/ai-priority | AI priority review |

## Deployment

### Backend (Render/Railway)
```bash
# Set environment variables:
# MONGODB_URI, PORT=3001, OPENAI_API_KEY, FRONTEND_URL
npm run build
npm start
```

### Frontend (Vercel)
```bash
# Set VITE_API_URL=https://your-backend-url
npm run build
# Deploy dist folder
```

## Project Structure

```
ProjectDemo/
├── backend/
│   ├── src/
│   │   ├── index.ts           # Express + Socket.IO server
│   │   ├── models/            # Mongoose models
│   │   └── services/aiService.ts
│   ├── .env
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/             # Custom hooks
│   │   └── lib/               # API + Socket clients
│   ├── .env
│   └── package.json
└── README.md
```