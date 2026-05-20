import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell } from 'lucide-react';
import { api, type Incident } from './lib/api';
import { getSocket } from './lib/socket';
import { useToast } from './hooks/useToast';
import CreateIncidentForm from './components/CreateIncidentForm';
import IncidentDashboard from './components/IncidentDashboard';
import IncidentDetail from './components/IncidentDetail';
import PipelineMonitor from './components/PipelineMonitor';
import ToastContainer from './components/ToastContainer';

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <span className="text-xs font-medium text-white/80 tracking-wide">Live</span>
    </div>
  );
}

export default function App() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toasts, addToast, removeToast } = useToast();

  const fetchIncidents = useCallback(async () => {
    try {
      const data = await api.getIncidents();
      setIncidents(data);
      setError(null);
    } catch {
      setError('Failed to connect to backend');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIncidents();

    const socket = getSocket();

    socket.on('incident-created', (incident: Incident) => {
      setIncidents(prev => [incident, ...prev]);
      addToast(`New incident: ${incident.title}`, 'warning');
    });

    socket.on('incident-updated', (updated: Incident) => {
      setIncidents(prev => prev.map(i => i.id === updated.id ? updated : i));
    });

    return () => {
      socket.off('incident-created');
      socket.off('incident-updated');
    };
  }, [fetchIncidents, addToast]);

  const openIncidents = incidents.filter(i => i.status === 'Open').length;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/80 backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-xl">⚡</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Incident Room
              </h1>
              <p className="text-xs text-white/40 mt-0.5">
                Operations dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <LiveIndicator />
            <div className="relative">
              <Bell size={18} className="text-white/40 hover:text-white/80 transition-colors" />
              {openIncidents > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center font-medium">
                  {openIncidents}
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-red-500/10 border-b border-red-500/20 px-6 py-2 flex items-center gap-2 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main layout */}
      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr_320px] gap-6">
          
          {/* LEFT: Create form */}
          <div className="lg:sticky lg:top-[72px] self-start">
            <CreateIncidentForm
              onCreated={fetchIncidents}
              addToast={addToast}
            />
          </div>

          {/* CENTER: Dashboard / Detail */}
          <div className="min-h-[600px] flex flex-col">
            <AnimatePresence mode="wait">
              {selectedId ? (
                <IncidentDetail
                  key={selectedId}
                  incidentId={selectedId}
                  onBack={() => setSelectedId(null)}
                  addToast={addToast}
                />
              ) : (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex flex-col"
                >
                  <IncidentDashboard
                    incidents={incidents}
                    loading={loading}
                    onSelectIncident={setSelectedId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT: Pipeline monitor */}
          <div className="lg:sticky lg:top-[72px] self-start">
            <PipelineMonitor />
          </div>
        </div>
      </main>

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
}