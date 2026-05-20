const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

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

export const api = {
  async getIncidents(): Promise<Incident[]> {
    const res = await fetch(`${BASE_URL}/api/incidents`);
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  async createIncident(data: {
    title: string;
    description: string;
    priority: string;
    reporter_name: string;
  }): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/api/incidents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create incident');
    return res.json();
  },

  async getIncidentDetails(id: string): Promise<IncidentDetails> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/details`);
    if (!res.ok) throw new Error('Failed to fetch incident details');
    return res.json();
  },

  async updateStatus(id: string, status: string): Promise<Incident> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update status');
    return res.json();
  },

  async postUpdate(id: string, message: string, author_name: string): Promise<IncidentUpdate> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/updates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, author_name }),
    });
    if (!res.ok) throw new Error('Failed to post update');
    return res.json();
  },

  async getAIAssist(id: string): Promise<AIResult> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/ai-summary`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI assist');
    return res.json();
  },

  async getAIActions(id: string): Promise<AIResult> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/ai-actions`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI actions');
    return res.json();
  },

  async getAIPriorityReview(id: string): Promise<AIResult> {
    const res = await fetch(`${BASE_URL}/api/incidents/${id}/ai-priority`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to get AI priority review');
    return res.json();
  },
};