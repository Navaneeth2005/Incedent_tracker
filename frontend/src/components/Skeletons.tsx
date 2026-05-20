export function IncidentCardSkeleton() {
  return (
    <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-4 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="h-5 bg-slate-700/50 rounded w-3/4" />
        <div className="h-5 bg-slate-700/50 rounded w-16" />
      </div>
      <div className="h-4 bg-slate-700/30 rounded w-full mb-2" />
      <div className="h-4 bg-slate-700/30 rounded w-2/3 mb-3" />
      <div className="flex items-center gap-3">
        <div className="h-3 bg-slate-700/40 rounded w-20" />
        <div className="h-3 bg-slate-700/40 rounded w-24" />
      </div>
    </div>
  );
}

export function IncidentListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <IncidentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-slate-700/50 rounded w-3/4" />
      <div className="h-4 bg-slate-700/30 rounded w-full" />
      <div className="h-4 bg-slate-700/30 rounded w-5/6" />
      <div className="h-32 bg-slate-700/20 rounded-lg" />
    </div>
  );
}

export function PipelineSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-slate-700" />
          <div className="h-4 bg-slate-700/50 rounded flex-1" />
          <div className="h-4 bg-slate-700/50 rounded w-12" />
        </div>
      ))}
    </div>
  );
}