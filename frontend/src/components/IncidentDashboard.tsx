import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Inbox } from 'lucide-react';
import IncidentCard from './IncidentCard';
import type { Incident } from '../lib/apiClient';

interface IncidentDashboardProps {
  incidents: Incident[];
  loading: boolean;
  onSelectIncident: (id: string) => void;
}

export default function IncidentDashboard({ incidents, loading, onSelectIncident }: IncidentDashboardProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const filteredIncidents = useMemo(() => {
    return incidents.filter(incident => {
      const matchesSearch = !search || 
        incident.title.toLowerCase().includes(search.toLowerCase()) ||
        incident.reporter_name.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || incident.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [incidents, search, statusFilter, priorityFilter]);

  const hasFilters = search || statusFilter !== 'all' || priorityFilter !== 'all';

  if (loading) {
    return (
      <div className="bg-black/50 border border-white/10 rounded-2xl p-6">
        <div className="h-6 w-32 bg-white/5 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 min-h-[600px]">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-medium text-white/90">Incidents</h2>
          <p className="text-xs text-white/40 mt-1">
            {filteredIncidents.length} {filteredIncidents.length === 1 ? 'incident' : 'incidents'}
          </p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Search incidents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all"
          />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="Open">Open</option>
          <option value="Investigating">Investigating</option>
          <option value="Resolved">Resolved</option>
        </select>
        
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all appearance-none cursor-pointer"
        >
          <option value="all">All Priority</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>
      
      {/* Results */}
      <AnimatePresence mode="wait">
        {filteredIncidents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <Inbox className="w-8 h-8 text-white/20" />
            </div>
            <h3 className="text-white/60 font-medium mb-1">
              {hasFilters ? 'No matching incidents' : 'No incidents yet'}
            </h3>
            <p className="text-white/30 text-sm max-w-xs">
              {hasFilters ? 'Try adjusting filters' : 'Create your first incident'}
            </p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            {filteredIncidents.map((incident, idx) => (
              <motion.div
                key={incident.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <IncidentCard
                  incident={incident}
                  onClick={() => onSelectIncident(incident.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}