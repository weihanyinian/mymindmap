import { useAuthStore } from '../../stores/authStore';
import { LogOut, User } from 'lucide-react';

export default function UserMenu() {
  const { user, logout } = useAuthStore();

  if (!user) return null;

  return (
    <div className="border-t border-gray-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center">
          <User className="w-4 h-4 text-primary-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700 truncate">{user.username}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>
      </div>
      <button
        onClick={logout}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-600 transition-colors w-full"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </div>
  );
}
