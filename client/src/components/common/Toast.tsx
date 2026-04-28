import { useUIStore } from '../../stores/uiStore';
import clsx from 'clsx';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-4 h-4" />,
    error: <AlertCircle className="w-4 h-4" />,
    info: <Info className="w-4 h-4" />,
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm max-w-sm animate-slide-in-right',
            'backdrop-blur-xl border',
            t.type === 'success' && 'bg-emerald-500/90 text-white border-emerald-400/30',
            t.type === 'error' && 'bg-red-500/90 text-white border-red-400/30',
            t.type === 'info' && 'bg-gray-800/90 text-white border-gray-700/30'
          )}
        >
          {icons[t.type]}
          <span className="flex-1 text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-60 hover:opacity-100 transition-opacity ml-1">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
