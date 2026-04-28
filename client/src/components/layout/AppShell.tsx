import { Routes, Route, Navigate, useParams, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Toolbar from './Toolbar';
import PropertyPanel from './PropertyPanel';
import MindMapCanvas from '../mindmap/MindMapCanvas';
import { useUIStore } from '../../stores/uiStore';
import { useMindMapStore } from '../../stores/mindmapStore';
import { useEffect, useMemo } from 'react';
import { useAutoSave } from '../../hooks/useAutoSave';
import { useKeyboard } from '../../hooks/useKeyboard';
import { useT } from '../../lib/i18n';
import { Brain, Plus, Zap, Palette, Download, Layers, Sparkles, ArrowRight, FileText } from 'lucide-react';
import Toast from '../common/Toast';

function Dashboard() {
  const t = useT();
  const { mindMaps, createMap } = useMindMapStore();
  const navigate = useNavigate();
  const recentMaps = useMemo(() => mindMaps.slice(0, 4), [mindMaps]);

  const handleNewMap = async () => {
    try {
      const map = await createMap(t.sidebar.untitled);
      navigate(`/map/${map._id}`);
    } catch { /* handled */ }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-animated relative">
      {/* Floating decoration */}
      <div className="floating-shape w-[500px] h-[500px] bg-primary-200 -top-40 -right-40" style={{ animationDelay: '0s' }} />
      <div className="floating-shape w-[400px] h-[400px] bg-indigo-200 bottom-0 -left-20" style={{ animationDelay: '-5s' }} />
      <div className="floating-shape w-64 h-64 bg-accent-200 top-1/3 left-1/3" style={{ animationDelay: '-3s' }} />

      <div className="max-w-5xl mx-auto px-6 py-12 relative z-10">
        {/* Hero */}
        <div className="text-center mb-14 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 shadow-lg shadow-primary-500/25 mb-6 animate-float">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight mb-3">{t.dashboard.welcome}</h1>
          <p className="text-gray-500 text-lg max-w-lg mx-auto leading-relaxed">{t.dashboard.subtitle}</p>
          <button
            onClick={handleNewMap}
            className="mt-8 btn-primary text-base px-8 py-3.5 rounded-2xl shadow-xl shadow-primary-500/25"
          >
            <Plus className="w-5 h-5" />
            {t.dashboard.createFirst}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14 animate-slide-up">
          {[
            { icon: Layers, title: t.dashboard.feature1, desc: t.dashboard.feature1Desc, gradient: 'from-blue-500 to-cyan-500' },
            { icon: Zap, title: t.dashboard.feature2, desc: t.dashboard.feature2Desc, gradient: 'from-amber-500 to-orange-500' },
            { icon: Palette, title: t.dashboard.feature3, desc: t.dashboard.feature3Desc, gradient: 'from-violet-500 to-purple-500' },
            { icon: Download, title: t.dashboard.feature4, desc: t.dashboard.feature4Desc, gradient: 'from-emerald-500 to-teal-500' },
          ].map((f, i) => (
            <div key={i} className="glass-card group p-5 cursor-default" style={{ animationDelay: `${i * 100}ms` }}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-sm font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Recent maps */}
        <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-500" />
            </div>
            <h2 className="text-base font-semibold text-gray-700">{t.dashboard.recentMaps}</h2>
          </div>
          {recentMaps.length === 0 ? (
            <div className="glass rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <Sparkles className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">{t.dashboard.noRecent}</p>
              <button onClick={handleNewMap} className="mt-4 btn-primary text-sm">
                <Plus className="w-4 h-4" />
                {t.dashboard.createFirst}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {recentMaps.map((m) => (
                <div
                  key={m._id}
                  onClick={() => navigate(`/map/${m._id}`)}
                  className="glass-card group p-5 cursor-pointer"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-100 to-indigo-100 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <FileText className="w-4.5 h-4.5 text-primary-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate mb-1">{m.title}</p>
                  <p className="text-xs text-gray-400">
                    {m.nodeCount} {t.sidebar.nodes}
                  </p>
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
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      <Toolbar />
      <div className="flex-1 flex overflow-hidden">
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
    <div className="h-screen flex overflow-hidden bg-surface-50">
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
