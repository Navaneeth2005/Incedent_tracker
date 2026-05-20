import { StatusBadge, PriorityBadge } from './Badges';
import type { Incident } from '../lib/apiClient';

interface IncidentCardProps {
  incident: Incident;
  onClick: () => void;
}

function formatTime(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString();
}

export default function IncidentCard({ incident, onClick }: IncidentCardProps) {
  const isHighPriority = incident.priority === 'High' || incident.priority === 'Critical';

  return (
    <div 
      onClick={onClick}
      className={`
        group relative bg-black/50 border border-white/10 rounded-xl p-5 
        transition-all duration-200 cursor-pointer hover:border-white/20 hover:bg-black/80
        ${isHighPriority ? 'hover:border-red-500/30' : ''}
      `}
    >
      {/* Priority & Status Row */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={incident.priority} />
          <StatusBadge status={incident.status} />
        </div>
        <span className="text-xs text-white/30 font-medium">{formatTime(incident.created_at)}</span>
      </div>

      {/* Main Title */}
      <h3 className="text-sm font-medium text-white/90 group-hover:text-white transition-colors duration-150">
        {incident.title}
      </h3>

      {/* Reporter Info */}
      <p className="text-xs text-white/40 mt-2 flex items-center gap-1.5">
        <span>by</span>
        <span className="text-white/60">{incident.reporter_name}</span>
      </p>

      {/* Latest Update Bar */}
      {incident.latest_update && (
        <div className="mt-4 flex items-center gap-2 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-white/50">
          <span className="text-amber-400">●</span>
          <span className="truncate text-white/40">{incident.latest_update}</span>
        </div>
      )}
    </div>
  );
}