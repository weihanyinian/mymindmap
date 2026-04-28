import { useMindMapStore } from '../../stores/mindmapStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Undo2, Redo2, Plus, Trash2, PanelRightOpen, PanelRightClose,
  Download, Upload, PanelLeft, ChevronDown, Save,
} from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadMarkdown } from '../../lib/export/toMarkdown';
import { exportToPNG } from '../../lib/export/toPNG';
import { useT } from '../../lib/i18n';

export default function Toolbar() {
  const { selectedNodeId, addChild, addSibling, deleteNode, undo, redo, undoStack, redoStack, currentMap, autoSave } =
    useMindMapStore();
  const { sidebarOpen, toggleSidebar, propertyPanelOpen, openPanel, closePanel } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [exportingPNG, setExportingPNG] = useState(false);
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) addChild(selectedNodeId);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id) {
          addSibling(selectedNodeId);
        } else if (selectedNodeId) {
          addChild(selectedNodeId);
        }
      } else if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        deleteNode(selectedNodeId);
      }
    },
    [selectedNodeId, addChild, addSibling, deleteNode, currentMap]
  );

  const handleExportJSON = () => {
    if (!currentMap) return;
    const blob = new Blob([JSON.stringify(currentMap, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentMap.title}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMenuOpen(false);
  };

  const handleExportMarkdown = () => {
    if (!currentMap) return;
    downloadMarkdown(currentMap.rootNode, currentMap.title);
    setExportMenuOpen(false);
  };

  const handleExportPNG = async () => {
    if (!currentMap) return;
    const svg = document.querySelector('svg');
    if (!svg) return;
    setExportingPNG(true);
    try {
      await exportToPNG(svg as SVGSVGElement, currentMap.title);
    } finally {
      setExportingPNG(false);
      setExportMenuOpen(false);
    }
  };

  const handleImportJSON = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      const res = await fetch('/api/mindmaps/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const { mindMap } = await res.json();
        navigate(`/map/${mindMap._id}`);
        window.location.reload();
      }
    } catch {
      // Handle error
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const canAddChild = !!selectedNodeId;
  const canAddSibling = !!selectedNodeId && currentMap?.rootNode.id !== selectedNodeId;
  const canDelete = !!selectedNodeId && currentMap?.rootNode.id !== selectedNodeId;

  return (
    <div className="h-11 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 flex items-center px-3 gap-1 shrink-0" onKeyDown={handleKeyDown}>
      {/* Sidebar toggle */}
      {!sidebarOpen && (
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title={t.toolbar.showSidebar}>
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      {/* Undo / Redo */}
      <button onClick={undo} disabled={undoStack.length === 0}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
        title={t.toolbar.undo}>
        <Undo2 className="w-4 h-4" />
      </button>
      <button onClick={redo} disabled={redoStack.length === 0}
        className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors"
        title={t.toolbar.redo}>
        <Redo2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      {/* Node operations */}
      <button onClick={() => selectedNodeId && addChild(selectedNodeId)} disabled={!canAddChild}
        className="p-1.5 rounded-lg hover:bg-primary-50 disabled:opacity-30 text-gray-600 hover:text-primary-600 transition-colors"
        title={t.toolbar.addChild}>
        <Plus className="w-4 h-4" />
      </button>
      <button onClick={() => selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id && addSibling(selectedNodeId)} disabled={!canAddSibling}
        className="p-1.5 rounded-lg hover:bg-primary-50 disabled:opacity-30 text-gray-600 hover:text-primary-600 transition-colors"
        title={t.toolbar.addSibling}>
        <span className="text-xs font-bold w-4 h-4 flex items-center justify-center">+S</span>
      </button>
      <button onClick={() => selectedNodeId && deleteNode(selectedNodeId)} disabled={!canDelete}
        className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-30 text-gray-600 hover:text-red-600 transition-colors"
        title={t.toolbar.deleteNode}>
        <Trash2 className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      {/* Export */}
      <div className="relative" ref={exportMenuRef}>
        <button onClick={() => setExportMenuOpen(!exportMenuOpen)}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center gap-0.5 transition-colors"
          title={t.toolbar.export}>
          <Download className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        {exportMenuOpen && (
          <div className="absolute left-0 top-9 glass-lg rounded-xl py-1.5 z-50 min-w-[160px] shadow-lg animate-scale-in">
            <button onClick={handleExportJSON} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">{t.toolbar.exportJSON}</button>
            <button onClick={handleExportMarkdown} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">{t.toolbar.exportMarkdown}</button>
            <button onClick={handleExportPNG} disabled={exportingPNG} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors disabled:opacity-50">
              {exportingPNG ? t.toolbar.exporting : t.toolbar.exportPNG}
            </button>
          </div>
        )}
      </div>

      {/* Import */}
      <button onClick={() => fileInputRef.current?.click()}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        title={t.toolbar.importJSON}>
        <Upload className="w-4 h-4" />
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />

      <div className="flex-1" />

      {/* Save status */}
      <button onClick={() => autoSave()}
        className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
        title={t.toolbar.save}>
        <Save className="w-3 h-3" />
        {t.toolbar.save}
      </button>

      {/* Panel toggle */}
      <button onClick={propertyPanelOpen ? closePanel : () => openPanel()}
        className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
        title={propertyPanelOpen ? t.toolbar.closePanel : t.toolbar.openPanel}>
        {propertyPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
      </button>
    </div>
  );
}
