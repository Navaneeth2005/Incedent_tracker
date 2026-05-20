# Real-Time AI Incident Room - Technical Specification

## 1. Project Overview

**Project Name:** Real-Time AI Incident Room
**Type:** Full-stack Web Application (SRE/DevOps Command Center)
**Core Functionality:** Real-time incident management dashboard with AI-powered diagnostics
**Target Users:** DevOps engineers, SRE teams, Platform engineers

## 2. Tech Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS 4
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **State:** React hooks + Context
- **HTTP:** Native fetch API

### Backend
- **Runtime:** Node.js
- **Framework:** Express 5
- **Database:** MongoDB with Mongoose
- **Real-time:** Socket.IO
- **AI:** OpenAI API (with rule-based fallback)

### Environment
- **Frontend:** Vercel deployable
- **Backend:** Render/Railway deployable

## 3. Database Schema (MongoDB)

### Incident Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  priority: String (enum: 'Low', 'Medium', 'High', 'Critical'),
  status: String (enum: 'Open', 'Investigating', 'Resolved'),
  reporter_name: String,
  latest_update: String | null,
  created_at: Date,
  updated_at: Date
}
```

### IncidentUpdate Collection
```javascript
{
  _id: ObjectId,
  incident_id: ObjectId (ref: Incident),
  message: String,
  author_name: String,
  created_at: Date
}
```

### AIResult Collection
```javascript
{
  _id: ObjectId,
  incident_id: ObjectId (ref: Incident),
  type: String (enum: 'summary', 'actions', 'priority_review'),
  result_text: String,
  created_at: Date
}
```

## 4. API Routes

### Incidents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/incidents | List all incidents |
| POST | /api/incidents | Create new incident |
| GET | /api/incidents/:id | Get incident details |
| GET | /api/incidents/:id/details | Get incident with updates + AI |
| PATCH | /api/incidents/:id/status | Update incident status |
| POST | /api/incidents/:id/update | Add incident update |
| POST | /api/incidents/:id/ai-summary | Get AI summary |
| POST | /api/incidents/:id/ai-actions | Get AI suggested actions |

## 5. Socket.IO Events

| Event | Direction | Payload |
|-------|-----------|---------|
| incident_created | Server → Client | Incident object |
| incident_updated | Server → Client | Incident object |
| new_update | Server → Client | { incident_id, update } |

## 6. UI/UX Specification

### Color Palette
- **Background Primary:** #060e1e (deep navy)
- **Background Secondary:** #0a1628 (dark blue)
- **Card Background:** rgba(30, 41, 59, 0.5) with backdrop blur
- **Border:** rgba(148, 163, 184, 0.1)
- **Text Primary:** #f8fafc
- **Text Secondary:** #94a3b8
- **Accent Blue:** #3b82f6
- **Accent Purple:** #8b5cf6
- **Success Green:** #10b981
- **Warning Yellow:** #f59e0b
- **Error Red:** #ef4444

### Status Badge Colors
- **Open:** Red (#ef4444)
- **Investigating:** Yellow (#f59e0b)
- **Resolved:** Green (#10b981)

### Priority Badge Colors
- **Low:** Gray (#6b7280)
- **Medium:** Blue (#3b82f6)
- **High:** Orange (#f97316)
- **Critical:** Red with glow (#ef4444)

### Typography
- **Font Family:** System UI (Inter fallback)
- **Headings:** Bold, tracking-tight
- **Body:** Regular, 14px
- **Small/Labels:** 12px

### Layout Structure
```
+----------------------------------------------------------+
|  HEADER (sticky)                                         |
|  Logo | Title | Live indicator | Notification bell       |
+----------------------------------------------------------+
|  +------------+  +------------------+  +---------------+  |
|  | LEFT       |  | CENTER           |  | RIGHT         |  |
|  | Create     |  | Incident         |  | Pipeline      |  |
|  | Incident   |  | Dashboard        |  | Monitor       |  |
|  | Form       |  | or               |  |               |  |
|  |            |  | Incident Detail  |  | AI Insights   |  |
|  +------------+  +------------------+  +---------------+  |
+----------------------------------------------------------+
```

### Responsive Breakpoints
- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (3 columns)

## 7. Components

### Header
- Sticky top, blur backdrop
- Logo + App title
- Live status indicator (pulsing green dot)
- Notification bell with badge count

### CreateIncidentForm (Left Panel)
- Title input (required)
- Description textarea
- Priority dropdown (Low/Medium/High/Critical)
- Reporter name input
- Submit button with loading state
- Validation errors

### IncidentDashboard (Center)
- Search input
- Status filter dropdown
- Priority filter dropdown
- Grid/List of incident cards
- Empty state when no incidents
- Loading skeletons

### IncidentCard
- Title (bold)
- Priority badge (colored)
- Status badge (colored)
- Reporter name
- Created/Updated timestamps
- Latest update preview
- Click to view details
- Hover glow effect

### IncidentDetail (Modal/Page)
- Full incident info
- Status change dropdown
- Timeline/updates feed
- AI Summary section
- AI Actions section
- Add update form

### PipelineMonitor (Right Panel)
- System health indicators
- Animated status dots
- Service names with latency
- Auto-refresh every 3 seconds

### Toast Notifications
- Success (green)
- Warning (yellow)
- Error (red)
- Auto-dismiss after 4 seconds

## 8. AI Features

### OpenAI Integration
- Uses GPT-4o-mini for efficiency
- Prompt engineering for incident context

### Fallback Rule-Based Logic
When no API key or API fails:

**Summary Generation:**
```
- Extract key terms from title + description
- Map priority to severity level
- Generate contextual summary based on keywords

Example:
- "Database connection timeout" + High → "High severity connectivity issue affecting database layer"
- "Payment gateway 502" + Critical → "Critical external service failure requiring immediate attention"
```

**Action Suggestions:**
```
Based on keywords mapped to runbook categories:

Database issues → "Check connection pool settings", "Review slow queries", "Verify replica health"
API failures → "Check gateway logs", "Review rate limits", "Verify service endpoints"
Auth problems → "Review token expiry", "Check LDAP/SSO status", "Verify permission settings"
Network → "Check load balancer health", "Review DNS resolution", "Verify firewall rules"
```

**Priority Review:**
```
Validate priority against keywords:
- Critical: outage, down, crash, data loss, security breach
- High: latency, error rate, partial failure, degraded
- Medium: warning, minor, cosmetic, performance
- Low: info, request, enhancement
```

## 9. Acceptance Criteria

### Functional
- [ ] Can create incident with all fields
- [ ] Can view incident list with filters
- [ ] Can view incident details with updates
- [ ] Can change incident status
- [ ] Can add updates to incident
- [ ] Can get AI summary (real or fallback)
- [ ] Can get AI actions (real or fallback)
- [ ] Real-time updates work via Socket.IO
- [ ] Toast notifications appear on actions

### Visual
- [ ] Dark theme with proper contrast
- [ ] Status badges have correct colors
- [ ] Priority badges have correct colors
- [ ] Animations are smooth
- [ ] Loading states show skeletons
- [ ] Empty states are displayed
- [ ] Responsive on mobile

### Technical
- [ ] MongoDB connection works
- [ ] API routes return proper responses
- [ ] Socket.IO emits events correctly
- [ ] OpenAI calls work (with fallback)
- [ ] No console errors
- [ ] TypeScript types are correct

## 10. Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/incident-room
PORT=3001
OPENAI_API_KEY=sk-... (optional)
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3001
```

## 11. Deployment

### Backend (Render/Railway)
- Build: npm install
- Start: node dist/index.js
- Env vars: MONGODB_URI, PORT, OPENAI_API_KEY

### Frontend (Vercel)
- Build: npm run build
- Output: dist
- Env vars: VITE_API_URL