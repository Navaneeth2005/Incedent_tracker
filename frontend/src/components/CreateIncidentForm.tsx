import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

interface CreateIncidentFormProps {
  onCreated: () => void;
  addToast: (message: string, type: 'success' | 'warning' | 'error') => void;
}

export default function CreateIncidentForm({ onCreated, addToast }: CreateIncidentFormProps) {
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string; reporter?: string }>({});
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as string;
    const reporter_name = formData.get('reporter_name') as string;
    
    const newErrors: { title?: string; reporter?: string } = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!reporter_name.trim()) newErrors.reporter = 'Reporter name is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      await api.createIncident({
        title: title.trim(),
        description: description.trim(),
        priority,
        reporter_name: reporter_name.trim()
      });
      
      addToast('Incident created', 'success');
      onCreated();
      e.currentTarget.reset();
    } catch (err) {
      addToast('Failed to create', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black/50 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
          <Plus className="w-4 h-4 text-white/80" />
        </div>
        <h2 className="text-base font-medium text-white/90">Report Incident</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Title *</label>
          <input
            name="title"
            type="text"
            placeholder="e.g., Database connection timeout"
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all"
          />
          {errors.title && (
            <motion.p 
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1 text-xs text-red-400 mt-2"
            >
              <AlertCircle size={12} />
              {errors.title}
            </motion.p>
          )}
        </div>
        
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Provide context..."
            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all resize-none"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Priority</label>
            <select
              name="priority"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all"
            >
              <option value="Low">Low</option>
              <option value="Medium" selected>Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs font-medium text-white/50 mb-2">Reporter *</label>
            <input
              name="reporter_name"
              type="text"
              placeholder="Your name"
              className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-black/80 transition-all"
            />
            {errors.reporter && (
              <motion.p 
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-1 text-xs text-red-400 mt-2"
              >
                <AlertCircle size={12} />
                {errors.reporter}
              </motion.p>
            )}
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-white text-black font-medium text-sm py-3 rounded-xl hover:bg-white/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              Create Incident
            </>
          )}
        </button>
      </form>
    </div>
  );
}