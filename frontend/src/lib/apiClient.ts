// Production-safe API client - NO hardcoded localhost

const BASE_URL = import.meta.env.VITE_API_URL;

if (!BASE_URL) {
  console.warn('⚠️ VITE_API_URL not set! API calls will fail.');
}

// Fallback to localhost only in development
const getApiUrl = () => {
  if (BASE_URL) return BASE_URL;
  
  // Only use localhost if we're in development mode
  if (import.meta.env.DEV) {
    return 'http://localhost:3001';
  }
  
  // In production without VITE_API_URL, we should fail loudly
  throw new Error('VITE_API_URL environment variable is not set!');
};

export interface Incident {
  id: string;
  title: string;
  description: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Open' | 'Investigating' | 'Resolved';
  reporter_name: string;
  latest_update: string | null;
  created_at: string;
  updated_at: string;
}

export interface IncidentUpdate {
  id: string;
  incident_id: string;
  message: string;
  author_name: string;
  created_at: string;
}

export interface AIResult {
  id: string;
  incident_id: string;
  type: string;
  result_text: string;
  created_at: string;
}

export interface IncidentDetails extends Incident {
  updates: IncidentUpdate[];
  ai_results: AIResult[];
}

const API_BASE = getApiUrl();

export const api = {
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${API_BASE}/api/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async createIncident(data: {
    title: string;
    description: string;
    priority: string;
    reporter_name: string;
  }): Promise<Incident> {
    const res = await fetch(`${API_BASE}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async getIncidentDetails(id: string): Promise<IncidentDetails> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/details`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async updateStatus(id: string, status: string): Promise<Incident> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async postUpdate(id: string, message: string, author_name: string): Promise<IncidentUpdate> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/update`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, author_name }),
    });
    if (!res.ok) throw new Error('Failed to post update');
    return res.json();
  },

  async getAIAssist(id: string): Promise<AIResult> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/ai-summary`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI assist');
    return res.json();
  },

  async getAIActions(id: string): Promise<AIResult> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/ai-actions`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI actions');
    return res.json();
  },

  async getAIPriorityReview(id: string): Promise<AIResult> {
    const res = await fetch(`${API_BASE}/api/incidents/${id}/ai-priority`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI priority review');
    return res.json();
  },
};

// Socket.IO URL - use same base without /api
export const getSocketUrl = () => {
  return BASE_URL || 'http://localhost:3001';
};