import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, X } from 'lucide-react';

type ToastType = 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: Toast[];
  removeToast: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle
};

const colors = {
  success: 'border-emerald-500/30 bg-emerald-950/40 text-emerald-300',
  warning: 'border-amber-500/30 bg-amber-950/40 text-amber-300',
  error: 'border-red-500/30 bg-red-950/40 text-red-300'
};

export default function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = icons[toast.type];
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, x: 100, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 100, scale: 0.9 }}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg ${colors[toast.type]}`}
            >
              <Icon size={18} />
              <span className="text-sm font-medium">{toast.message}</span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-2 opacity-60 hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}