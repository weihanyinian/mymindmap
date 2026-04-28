import UserMenu from '../sidebar/UserMenu';
import MindMapList from '../sidebar/MindMapList';
import { useMindMapStore } from '../../stores/mindmapStore';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { Plus, PanelLeftClose, Brain } from 'lucide-react';
import { useT } from '../../lib/i18n';

export default function Sidebar() {
  const { createMap } = useMindMapStore();
  const { toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const t = useT();

  const handleNewMap = async () => {
    try {
      const map = await createMap(t.sidebar.untitled);
      navigate(`/map/${map._id}`);
    } catch {
      // handled by store
    }
  };

  return (
    <div className="w-64 bg-white/90 backdrop-blur-xl border-r border-gray-200/60 flex flex-col shrink-0 animate-slide-in-left">
      {/* Header */}
      <div className="p-3.5 border-b border-gray-100/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-sm">
            <Brain className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-gray-800 text-sm tracking-tight">{t.app.name}</span>
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg hover:bg-gray-100/80 text-gray-400 hover:text-gray-600 transition-colors"
          title={t.toolbar.closePanel}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      {/* New map button */}
      <div className="px-3 pt-3 pb-2">
        <button
          onClick={handleNewMap}
          className="btn-primary w-full text-sm py-2.5"
        >
          <Plus className="w-4 h-4" />
          {t.sidebar.newMap}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2">
        <MindMapList />
      </div>

      {/* User menu */}
      <UserMenu />
    </div>
  );
}
