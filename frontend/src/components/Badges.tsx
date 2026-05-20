

type Status = 'Open' | 'Investigating' | 'Resolved';
type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export function StatusBadge({ status }: { status: Status }) {
  const statusClasses = {
    'Open': 'bg-red-500/10 text-red-400/80 border-red-500/20',
    'Investigating': 'bg-amber-500/10 text-amber-400/80 border-amber-500/20',
    'Resolved': 'bg-emerald-500/10 text-emerald-400/80 border-emerald-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${statusClasses[status]}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  const priorityClasses = {
    'Low': 'bg-white/5 text-white/50 border-white/10',
    'Medium': 'bg-blue-500/10 text-blue-400/80 border-blue-500/20',
    'High': 'bg-orange-500/10 text-orange-400/80 border-orange-500/20',
    'Critical': 'bg-red-500/10 text-red-400/80 border-red-500/20'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${priorityClasses[priority]}`}>
      {priority}
    </span>
  );
}