import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import PropertyPanel from './PropertyPanel';
import MindMapCanvas from '../mindmap/MindMapCanvas';
import { useUIStore } from '../../stores/uiStore';
import { useMindMapStore } from '../../stores/mindmapStore';
import { useEffect } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboard } from '../../hooks/useKeyboard';
import Toast from '../common/Toast';

function Dashboard() {
  return (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-600 mb-2">Welcome to MindFlow</h2>
        <p className="text-gray-400">Select a mind map from the sidebar or create a new one</p>
      </div>
    </div>
  );
}

function MindMapEditor() {
  const { id } = useParams<{ id: string }>();
  const { loadMap } = useMindMapStore();

  useEffect(() => {
    if (id) {
      loadMap(id);
    }
  }, [id, loadMap]);

  useAutoSave();
  useKeyboard();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Toolbar />
      <div className="flex-1 flex">
        <MindMapCanvas />
        <PropertyPanel />
      </div>
    </div>
  );
}

export default function AppShell() {
  const { sidebarOpen } = useUIStore();
  const { fetchList } = useMindMapStore();

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return (
    <div className="h-screen flex overflow-hidden">
      {sidebarOpen && <Sidebar />}
      <div className="flex-1 flex flex-col min-w-0">
        <Routes>
          <Route index element={<Dashboard />} />
          <Route path="map/:id" element={<MindMapEditor />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      <Toast />
    </div>
  );
}
