import { useUIStore } from '../../stores/uiStore';
import clsx from 'clsx';
import { X } from 'lucide-react';

export default function Toast() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={clsx(
            'flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-lg text-sm max-w-sm animate-in slide-in-from-right',
            t.type === 'success' && 'bg-green-600 text-white',
            t.type === 'error' && 'bg-red-600 text-white',
            t.type === 'info' && 'bg-gray-800 text-white'
          )}
        >
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
