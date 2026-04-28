import { useUIStore } from '../../stores/uiStore';
import { useMindMapStore } from '../../stores/mindmapStore';
import NodeStylePanel from '../panels/NodeStylePanel';
import NodeNotesPanel from '../panels/NodeNotesPanel';
import { useT } from '../../lib/i18n';
import { Settings, FileText, PanelRightClose } from 'lucide-react';
import clsx from 'clsx';

export default function PropertyPanel() {
  const { propertyPanelOpen, propertyPanelTab, setPanelTab, closePanel } = useUIStore();
  const { selectedNodeId } = useMindMapStore();
  const t = useT();

  if (!propertyPanelOpen) return null;

  return (
    <div className="w-72 border-l border-gray-200/60 bg-white/90 backdrop-blur-xl flex flex-col shrink-0 animate-slide-in-right">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100/60">
        <button
          onClick={() => setPanelTab('style')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200',
            propertyPanelTab === 'style'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          {t.panel.style}
        </button>
        <button
          onClick={() => setPanelTab('notes')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-all duration-200',
            propertyPanelTab === 'notes'
              ? 'text-primary-600 border-b-2 border-primary-500 bg-primary-50/50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50/50'
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          {t.panel.notes}
        </button>
        <button
          onClick={closePanel}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50/50 transition-colors"
          title="Close panel"
        >
          <PanelRightClose className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {!selectedNodeId ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Settings className="w-10 h-10 text-gray-200 mb-3" />
            <p className="text-xs text-gray-400 leading-relaxed">{t.panel.noSelection}</p>
          </div>
        ) : propertyPanelTab === 'style' ? (
          <NodeStylePanel />
        ) : (
          <NodeNotesPanel />
        )}
      </div>
    </div>
  );
}
