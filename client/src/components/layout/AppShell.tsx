import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import PropertyPanel from './PropertyPanel';
import MindMapCanvas from '../mindmap/MindMapCanvas';
import { useUIStore } from '../../stores/uiStore';
import { useMindMapStore } from '../../stores/mindmapStore';
import { useEffect } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useT } from '../../lib/i18n';
import { Brain, Plus, Zap, Palette, Download, FileText, Layers, Sparkles } from 'lucide-react';
import Toast from '../common/Toast';

function Dashboard() {
  const t = useT();
  const { mindMaps, createMap } = useMindMapStore();
  const navigate = useNavigate();
  const recentMaps = mindMaps.slice(0, 4);

  const handleNewMap = async () => {
    try {
      const map = await createMap(t.sidebar.untitled);
      navigate(`/map/${map._id}`);
    } catch { /* handled */ }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40">
      <div className="max-w-4xl mx-auto px-8 py-10">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 shadow-lg shadow-primary-200 mb-5">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.dashboard.welcome}</h1>
          <p className="text-gray-500 max-w-md mx-auto leading-relaxed">{t.dashboard.subtitle}</p>
          <button
            onClick={handleNewMap}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:from-primary-700 hover:to-indigo-700 transition-all duration-200"
          >
            <Plus className="w-5 h-5" />
            {t.dashboard.createFirst}
          </button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { icon: Layers, title: t.dashboard.feature1, desc: t.dashboard.feature1Desc },
            { icon: Zap, title: t.dashboard.feature2, desc: t.dashboard.feature2Desc },
            { icon: Palette, title: t.dashboard.feature3, desc: t.dashboard.feature3Desc },
            { icon: Download, title: t.dashboard.feature4, desc: t.dashboard.feature4Desc },
          ].map((f, i) => (
            <div key={i} className="bg-white/80 backdrop-blur rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mb-3">
                <f.icon className="w-4.5 h-4.5 text-primary-600" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent maps */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-600">{t.dashboard.recentMaps}</h2>
          </div>
          {recentMaps.length === 0 ? (
            <div className="bg-white/60 rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <Sparkles className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">{t.dashboard.noRecent}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {recentMaps.map((m) => (
                <div
                  key={m._id}
                  onClick={() => navigate(`/map/${m._id}`)}
                  className="bg-white rounded-xl border border-gray-100 p-4 cursor-pointer hover:border-primary-200 hover:shadow-md transition-all group"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mb-2.5">
                    <FileText className="w-4 h-4 text-primary-600" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 truncate group-hover:text-primary-700 transition-colors">{m.title}</p>
                  <p className="text-xs text-gray-400 mt-1">{m.nodeCount} {t.sidebar.nodes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MindMapEditor() {
  const { id } = useParams<{ id: string }>();
  const { loadMap } = useMindMapStore();

  useEffect(() => {
    if (id) loadMap(id);
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
