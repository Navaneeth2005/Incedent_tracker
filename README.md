# 🚨 Real-Time AI Incident Tracker

A production-style real-time incident management system designed for DevOps/SRE teams with AI-powered insights, built using MERN stack + Socket.IO.

---

## 🌐 Live Demo

- **Frontend (Vercel):** https://incedent-trackermain.vercel.app/ 
- **Backend (Render):** https://incedent-tracker-3.onrender.com  

> Replace the above with your actual deployed URLs.

---

## ⚙️ Tech Stack

| Layer | Technology |
|------|-------------|
| Frontend | React + Vite + Tailwind CSS + Framer Motion |
| Backend | Node.js + Express + TypeScript |
| Database | MongoDB Atlas (Mongoose ODM) |
| Real-time | Socket.IO |
| AI Layer | OpenAI API + Rule-based fallback system |

---

## 🏗️ System Architecture

```

Frontend (React - Vercel)
↓
Backend API + Socket.IO (Render)
↓
MongoDB Atlas (Database)
↓
AI Service (OpenAI + Fallback Logic)

```

---

## 🚀 Deployment Guide

### 🖥️ Frontend Deployment (Vercel)

1. Push project to GitHub
2. Go to https://vercel.com
3. Import repository
4. Configure:

```

Root Directory: frontend
Framework: Vite

```

---

### 🔐 Frontend Environment Variables (Vercel)

```

VITE_API_URL=https://your-render-backend.onrender.com

```

Then click **Deploy**

---

### 🧠 Backend Deployment (Render)

1. Go to https://dashboard.render.com
2. Create **New Web Service**
3. Connect GitHub repo
4. Configure:

```

Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start

```

---

### 🔐 Backend Environment Variables (Render)

```

MONGODB_URI=your_mongodb_atlas_connection_string
PORT=10000
OPENAI_API_KEY=your_openai_key (optional)
FRONTEND_URL=https://your-vercel-app.vercel.app

```

---

## 📦 Features

### 📊 Incident Management
- Create, update, and track incidents in real time
- Status flow: Open → Investigating → Resolved
- Priority classification system

---

### ⚡ Real-Time Updates
- Socket.IO powered live synchronization
- Instant updates across all connected clients

---

### 🤖 AI Incident Assistant
- AI-generated incident summaries
- Suggested debugging actions
- Smart priority recommendations
- Rule-based fallback when AI key is not available

---

### 📡 DevOps Dashboard
- Live incident feed
- Filtering & search functionality
- Timeline-based incident tracking
- System health insights

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|------|----------|-------------|
| GET | /api/incidents | Fetch all incidents |
| POST | /api/incidents | Create new incident |
| GET | /api/incidents/:id | Get incident details |
| PATCH | /api/incidents/:id/status | Update incident status |
| POST | /api/incidents/:id/update | Add incident update |
| POST | /api/incidents/:id/ai-summary | Generate AI summary |
| POST | /api/incidents/:id/ai-actions | AI suggested actions |
| POST | /api/incidents/:id/ai-priority | AI priority analysis |

---

## 🧪 Local Development Setup

### 1️⃣ Clone Repository
```bash
git clone https://github.com/your-username/incident-tracker
cd incident-tracker
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:

```
MONGODB_URI=mongodb://localhost:27017/incident-room
PORT=3001
OPENAI_API_KEY=your_key_here
FRONTEND_URL=http://localhost:5173
```

Run backend:

```bash
npm run dev
```

---

### 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:

```
VITE_API_URL=http://localhost:3001
```

Run frontend:

```bash
npm run dev
```

---

## 📁 Project Structure

```
backend/
 ├── src/
 │   ├── index.ts
 │   ├── models/
 │   │   ├── Incident.ts
 │   │   ├── IncidentUpdate.ts
 │   │   └── AIResult.ts
 │   └── services/
 │       └── aiService.ts

frontend/
 ├── src/
 │   ├── components/
 │   │   ├── Badges.tsx
 │   │   ├── CreateIncidentForm.tsx
 │   │   ├── IncidentCard.tsx
 │   │   ├── IncidentDashboard.tsx
 │   │   ├── IncidentDetail.tsx
 │   │   ├── PipelineMonitor.tsx
 │   │   └── ToastContainer.tsx
 │   ├── lib/
 │   │   ├── apiClient.ts
 │   │   └── socket.ts
 │   ├── hooks/
 │   │   └── useToast.ts
 │   ├── App.tsx
 │   └── index.css
```

---

## ⭐ Key Highlights

- ⚡ Real-time incident tracking using Socket.IO
- 🤖 AI-powered incident analysis engine
- 🔄 Scalable MERN architecture
- 🌍 Fully deployed (Vercel + Render + MongoDB Atlas)
- 🧠 Smart fallback AI system (works without API key)
- 📡 Production-ready API design
- 🎨 Premium Polar-style dark UI

---

## 🚀 Future Improvements

- Role-based authentication (RBAC)
- Email & Slack incident alerts
- Kubernetes deployment support
- Redis caching layer
- Advanced observability dashboard
- Audit logs & analytics module

---

## 👨‍💻 Author

**Navaneeth Indarapu**  
Full Stack Developer | MERN | DSA Enthusiast  
Malla Reddy Engineering College (2026)