import { useMindMapStore } from '../../stores/mindmapStore';
import { useUIStore } from '../../stores/uiStore';
import {
  Undo2, Redo2, Plus, Trash2, PanelRightOpen, PanelRightClose,
  Download, Upload, PanelLeft, ChevronDown, Save, Maximize2, Moon, Sun,
  GitBranch, Palette,
} from 'lucide-react';
import { useCallback, useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { downloadMarkdown } from '../../lib/export/toMarkdown';
import { exportToPNG } from '../../lib/export/toPNG';
import { useT } from '../../lib/i18n';
import type { MapStructure } from '@mindflow/shared';
import { PRESET_THEMES } from '@mindflow/shared';

const STRUCTURES: { value: MapStructure; label: string }[] = [
  { value: 'logic', label: '逻辑图' },
  { value: 'mindmap', label: '思维导图' },
  { value: 'orgchart', label: '组织结构图' },
  { value: 'fishbone', label: '鱼骨图' },
  { value: 'timeline-h', label: '时间轴(横)' },
  { value: 'timeline-v', label: '时间轴(纵)' },
];

export default function Toolbar() {
  const { selectedNodeId, addChild, addSibling, deleteNode, undo, redo, undoStack, redoStack,
    currentMap, autoSave, setStructure, setTheme } = useMindMapStore();
  const { sidebarOpen, toggleSidebar, propertyPanelOpen, openPanel, closePanel, darkMode, toggleDarkMode } = useUIStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [structureMenuOpen, setStructureMenuOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [exportingPNG, setExportingPNG] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const structureMenuRef = useRef<HTMLDivElement>(null);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) setExportMenuOpen(false);
      if (structureMenuRef.current && !structureMenuRef.current.contains(e.target as Node)) setStructureMenuOpen(false);
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) setThemeMenuOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') { e.preventDefault(); if (selectedNodeId) addChild(selectedNodeId); }
      else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (selectedNodeId) addChild(selectedNodeId); }
      else if (e.key === 'Enter' && e.shiftKey) { e.preventDefault(); if (selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id) addSibling(selectedNodeId); }
      else if (e.key === 'Delete' && selectedNodeId) { e.preventDefault(); deleteNode(selectedNodeId); }
    },
    [selectedNodeId, addChild, addSibling, deleteNode, currentMap]
  );

  const handleExportJSON = () => { if (!currentMap) return; const blob = new Blob([JSON.stringify(currentMap, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${currentMap.title}.json`; a.click(); URL.revokeObjectURL(url); setExportMenuOpen(false); };
  const handleExportMarkdown = () => { if (!currentMap) return; downloadMarkdown(currentMap.rootNode, currentMap.title); setExportMenuOpen(false); };
  const handleExportPNG = async () => { if (!currentMap) return; const svg = document.querySelector('svg'); if (!svg) return; setExportingPNG(true); try { await exportToPNG(svg as SVGSVGElement, currentMap.title); } finally { setExportingPNG(false); setExportMenuOpen(false); } };
  const handleExportSVG = () => { const svg = document.querySelector('svg'); if (!svg) return; const clone = svg.cloneNode(true) as SVGSVGElement; const data = new XMLSerializer().serializeToString(clone); const blob = new Blob([data], { type: 'image/svg+xml' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${currentMap?.title || 'mindmap'}.svg`; a.click(); URL.revokeObjectURL(url); setExportMenuOpen(false); };

  const handleImportJSON = async () => { const file = fileInputRef.current?.files?.[0]; if (!file) return; const text = await file.text(); try { const data = JSON.parse(text); const res = await fetch('/api/mindmaps/import', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` }, body: JSON.stringify(data) }); if (res.ok) { const { mindMap } = await res.json(); navigate(`/map/${mindMap._id}`); window.location.reload(); } } catch { /* ignore */ } if (fileInputRef.current) fileInputRef.current.value = ''; };

  const handleFitScreen = () => {
    const svg = document.querySelector('svg');
    if (!svg) return;
    // Reset zoom to identity
    const event = new WheelEvent('wheel', { deltaY: 0 });
    svg.dispatchEvent(event);
    // Simpler approach: reload the view
    window.location.reload();
  };

  const currentStructure = currentMap?.structure || 'logic';
  const currentTheme = currentMap?.theme || 'classic';

  return (
    <div className="h-11 bg-white/90 backdrop-blur-xl border-b border-gray-200/60 flex items-center px-3 gap-1 shrink-0" onKeyDown={handleKeyDown}>
      {!sidebarOpen && (
        <button onClick={toggleSidebar} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors" title={t.toolbar.showSidebar}>
          <PanelLeft className="w-4 h-4" />
        </button>
      )}

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      <button onClick={undo} disabled={undoStack.length === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors" title={t.toolbar.undo}><Undo2 className="w-4 h-4" /></button>
      <button onClick={redo} disabled={redoStack.length === 0} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 text-gray-600 transition-colors" title={t.toolbar.redo}><Redo2 className="w-4 h-4" /></button>

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      <button onClick={() => selectedNodeId && addChild(selectedNodeId)} disabled={!selectedNodeId} className="p-1.5 rounded-lg hover:bg-primary-50 disabled:opacity-30 text-gray-600 hover:text-primary-600 transition-colors" title={t.toolbar.addChild}><Plus className="w-4 h-4" /></button>
      <button onClick={() => selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id && addSibling(selectedNodeId)} disabled={!selectedNodeId || currentMap?.rootNode.id === selectedNodeId} className="p-1.5 rounded-lg hover:bg-primary-50 disabled:opacity-30 text-gray-600 hover:text-primary-600 transition-colors"><span className="text-xs font-bold w-4 h-4 flex items-center justify-center">+S</span></button>
      <button onClick={() => selectedNodeId && deleteNode(selectedNodeId)} disabled={!selectedNodeId || currentMap?.rootNode.id === selectedNodeId} className="p-1.5 rounded-lg hover:bg-red-50 disabled:opacity-30 text-gray-600 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      {/* Structure switcher */}
      <div className="relative" ref={structureMenuRef}>
        <button onClick={() => { setStructureMenuOpen(!structureMenuOpen); setThemeMenuOpen(false); setExportMenuOpen(false); }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-xs transition-colors" title="切换结构">
          <GitBranch className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{STRUCTURES.find(s => s.value === currentStructure)?.label || '结构'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {structureMenuOpen && (
          <div className="absolute left-0 top-9 glass-lg rounded-xl py-1.5 z-50 min-w-[170px] shadow-lg animate-scale-in">
            {STRUCTURES.map((s) => (
              <button key={s.value} onClick={() => { setStructure(s.value); setStructureMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${currentStructure === s.value ? 'text-primary-600 bg-primary-50/80 font-medium' : 'text-gray-700 hover:bg-gray-50/80'}`}>
                {s.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme switcher */}
      <div className="relative" ref={themeMenuRef}>
        <button onClick={() => { setThemeMenuOpen(!themeMenuOpen); setStructureMenuOpen(false); setExportMenuOpen(false); }}
          className="flex items-center gap-1 px-2 py-1.5 rounded-lg hover:bg-gray-100 text-gray-600 text-xs transition-colors" title="切换主题">
          <Palette className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">{PRESET_THEMES.find(t => t.id === currentTheme)?.nameZh || '主题'}</span>
          <ChevronDown className="w-3 h-3" />
        </button>
        {themeMenuOpen && (
          <div className="absolute left-0 top-9 glass-lg rounded-xl py-1.5 z-50 min-w-[150px] shadow-lg animate-scale-in max-h-64 overflow-y-auto">
            {PRESET_THEMES.map((theme) => (
              <button key={theme.id} onClick={() => { setTheme(theme.id); setThemeMenuOpen(false); }}
                className={`w-full text-left px-3.5 py-2 text-xs transition-colors flex items-center gap-2 ${currentTheme === theme.id ? 'text-primary-600 bg-primary-50/80 font-medium' : 'text-gray-700 hover:bg-gray-50/80'}`}>
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: theme.colors.rootFill }} />
                {theme.nameZh}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-gray-200/60 mx-1.5" />

      {/* Export */}
      <div className="relative" ref={exportMenuRef}>
        <button onClick={() => { setExportMenuOpen(!exportMenuOpen); setStructureMenuOpen(false); setThemeMenuOpen(false); }}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 flex items-center gap-0.5 transition-colors" title={t.toolbar.export}>
          <Download className="w-4 h-4" />
          <ChevronDown className="w-3 h-3" />
        </button>
        {exportMenuOpen && (
          <div className="absolute left-0 top-9 glass-lg rounded-xl py-1.5 z-50 min-w-[160px] shadow-lg animate-scale-in">
            <button onClick={handleExportPNG} disabled={exportingPNG} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors disabled:opacity-50">{exportingPNG ? t.toolbar.exporting : t.toolbar.exportPNG}</button>
            <button onClick={handleExportSVG} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">导出为 SVG</button>
            <button onClick={handleExportJSON} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">{t.toolbar.exportJSON}</button>
            <button onClick={handleExportMarkdown} className="w-full text-left px-3.5 py-2 text-xs text-gray-700 hover:bg-gray-50/80 transition-colors">{t.toolbar.exportMarkdown}</button>
          </div>
        )}
      </div>

      <button onClick={() => fileInputRef.current?.click()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title={t.toolbar.importJSON}><Upload className="w-4 h-4" /></button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />

      <div className="flex-1" />

      {/* Fit to screen */}
      <button onClick={handleFitScreen} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title="适应屏幕">
        <Maximize2 className="w-4 h-4" />
      </button>

      {/* Dark mode toggle */}
      <button onClick={toggleDarkMode} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title={darkMode ? '浅色模式' : '深色模式'}>
        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>

      <button onClick={() => autoSave()} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors" title={t.toolbar.save}>
        <Save className="w-3 h-3" />{t.toolbar.save}
      </button>

      <button onClick={propertyPanelOpen ? closePanel : () => openPanel()} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors" title={propertyPanelOpen ? t.toolbar.closePanel : t.toolbar.openPanel}>
        {propertyPanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
      </button>
    </div>
  );
}
