import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, User, Send, Loader2, Bot, Sparkles } from 'lucide-react';
import { api, type IncidentDetails, type AIResult } from '../lib/api';
import { StatusBadge, PriorityBadge } from './Badges';
import { getSocket } from '../lib/socket';

interface IncidentDetailProps {
  incidentId: string;
  onBack: () => void;
  addToast: (message: string, type: 'success' | 'warning' | 'error') => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleString();
}

export default function IncidentDetail({ incidentId, onBack, addToast }: IncidentDetailProps) {
  const [incident, setIncident] = useState<IncidentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUpdate, setNewUpdate] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    const fetchDetails = async () => {
      try {
        const data = await api.getIncidentDetails(incidentId);
        if (isMounted) {
          setIncident(data);
        }
      } catch (err) {
        if (isMounted) {
          addToast('Failed to load details', 'error');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchDetails();

    const socket = getSocket();
    
    socket.on('new_update', (data: { incident_id: string; update: any }) => {
      if (isMounted && data.incident_id === incidentId) {
        setIncident(prev => prev ? {
          ...prev,
          updates: [...prev.updates, data.update]
        } : null);
      }
    });

    return () => {
      isMounted = false;
      socket.off('new_update');
    };
  }, [incidentId]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await api.updateStatus(incidentId, newStatus);
      setIncident(prev => prev ? { ...prev, ...updated } : null);
      addToast(`Status: ${newStatus}`, 'success');
    } catch (err) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleAddUpdate = async () => {
    if (!newUpdate.trim() || !authorName.trim()) {
      addToast('Fill all fields', 'warning');
      return;
    }
    
    setSubmitting(true);
    try {
      const update = await api.postUpdate(incidentId, newUpdate.trim(), authorName.trim());
      setIncident(prev => prev ? {
        ...prev,
        updates: [...prev.updates, update],
        latest_update: newUpdate.trim()
      } : null);
      setNewUpdate('');
      addToast('Update added', 'success');
    } catch (err) {
      addToast('Failed to add update', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAIRequest = async (type: 'summary' | 'actions' | 'priority') => {
    setAiLoading(type);
    try {
      const endpoint = type === 'summary' ? '/ai-summary' 
        : type === 'actions' ? '/ai-actions' 
        : '/ai-priority';
      
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/incidents/${incidentId}${endpoint}`, {
        method: 'POST'
      });
      
      const aiResult: AIResult = await res.json();
      
      setIncident(prev => prev ? {
        ...prev,
        ai_results: [aiResult, ...prev.ai_results]
      } : null);
      
      addToast('AI analysis complete', 'success');
    } catch (err) {
      addToast('AI request failed', 'error');
    } finally {
      setAiLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-black/50 border border-white/10 rounded-2xl p-6 min-h-[600px] flex items-center justify-center">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-10 h-10 border-2 border-white/20 border-t-white/60 rounded-full mx-auto mb-3"
          />
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
        <p className="text-white/40">Incident not found</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-black/50 border border-white/10 rounded-2xl p-6 min-h-[600px]"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 mb-5 transition-colors"
      >
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-medium text-white/90 mb-3">{incident.title}</h2>
          <div className="flex items-center gap-2">
            <PriorityBadge priority={incident.priority} />
            <StatusBadge status={incident.status} />
          </div>
        </div>
        
        <select
          value={incident.status}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 focus:outline-none focus:border-white/20 cursor-pointer"
        >
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      
      {incident.description && (
        <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-sm text-white/60">{incident.description}</p>
        </div>
      )}
      
      <div className="flex items-center gap-4 text-xs text-white/30 mb-6">
        <div className="flex items-center gap-1">
          <User size={12} />
          <span>{incident.reporter_name}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{formatTime(incident.created_at)}</span>
        </div>
      </div>
      
      {/* AI Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => handleAIRequest('summary')}
          disabled={!!aiLoading}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {aiLoading === 'summary' ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          AI Summary
        </button>
        <button
          onClick={() => handleAIRequest('actions')}
          disabled={!!aiLoading}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {aiLoading === 'actions' ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
          AI Actions
        </button>
        <button
          onClick={() => handleAIRequest('priority')}
          disabled={!!aiLoading}
          className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-xs py-2.5 rounded-xl transition-all disabled:opacity-50"
        >
          {aiLoading === 'priority' ? <Loader2 size={14} className="animate-spin" /> : <Bot size={14} />}
          Priority
        </button>
      </div>
      
      {/* AI Results */}
      {incident.ai_results.length > 0 && (
        <div className="mb-6 space-y-3">
          {incident.ai_results.map((ai) => (
            <div key={ai.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2 mb-2">
                <Bot size={14} className="text-white/40" />
                <span className="text-xs font-medium text-white/50 uppercase">
                  {ai.type.replace('_', ' ')}
                </span>
              </div>
              <p className="text-sm text-white/60 whitespace-pre-line">{ai.result_text}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Timeline */}
      <div className="border-t border-white/10 pt-4 mb-4">
        <h3 className="text-sm font-medium text-white/70 mb-3">Timeline</h3>
        
        {incident.updates.length === 0 ? (
          <p className="text-sm text-white/30">No updates yet</p>
        ) : (
          <div className="space-y-3 max-h-[250px] overflow-y-auto">
            {incident.updates.map((update) => (
              <div key={update.id} className="flex gap-3 p-3 bg-black/30 rounded-lg border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-white/30 mt-2 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white/70">{update.message}</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-white/30">
                    <span>{update.author_name}</span>
                    <span>·</span>
                    <span>{formatTime(update.created_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Add Update */}
      <div className="border-t border-white/10 pt-4">
        <h3 className="text-sm font-medium text-white/70 mb-3">Add Update</h3>
        
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            placeholder="Your name"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
        </div>
        
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add an update..."
            value={newUpdate}
            onChange={(e) => setNewUpdate(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddUpdate()}
            className="flex-1 bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20"
          />
          <button
            onClick={handleAddUpdate}
            disabled={submitting || !newUpdate.trim() || !authorName.trim()}
            className="px-4 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}