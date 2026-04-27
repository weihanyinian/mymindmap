import UserMenu from '../sidebar/UserMenu';
import MindMapList from '../sidebar/MindMapList';
import { useMindMapStore } from '../../stores/mindmapStore';
import { useNavigate } from 'react-router-dom';
import { useUIStore } from '../../stores/uiStore';
import { Plus, PanelLeftClose } from 'lucide-react';
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
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col shrink-0">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <span className="font-bold text-gray-800 text-sm">{t.app.name}</span>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
          title={t.toolbar.closePanel}
        >
          <PanelLeftClose className="w-4 h-4" />
        </button>
      </div>

      <button
        onClick={handleNewMap}
        className="mx-3 mt-3 flex items-center justify-center gap-2 btn-primary text-sm py-2"
      >
        <Plus className="w-4 h-4" />
        {t.sidebar.newMap}
      </button>

      <div className="flex-1 overflow-y-auto mt-3">
        <MindMapList />
      </div>

      <UserMenu />
    </div>
  );
}
