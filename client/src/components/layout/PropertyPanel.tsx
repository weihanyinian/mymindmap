import { useUIStore } from '../../stores/uiStore';
import { useMindMapStore } from '../../stores/mindmapStore';
import NodeStylePanel from '../panels/NodeStylePanel';
import NodeNotesPanel from '../panels/NodeNotesPanel';
import { Settings, FileText } from 'lucide-react';
import clsx from 'clsx';

export default function PropertyPanel() {
  const { propertyPanelOpen, propertyPanelTab, setPanelTab, closePanel } = useUIStore();
  const { selectedNodeId, nodeMap } = useMindMapStore();

  if (!propertyPanelOpen) return null;

  const selectedNode = selectedNodeId ? nodeMap.get(selectedNodeId) : null;

  return (
    <div className="w-72 border-l border-gray-200 bg-white flex flex-col shrink-0">
      <div className="flex items-center border-b border-gray-100">
        <button
          onClick={() => setPanelTab('style')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
            propertyPanelTab === 'style' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <Settings className="w-3.5 h-3.5" />
          Style
        </button>
        <button
          onClick={() => setPanelTab('notes')}
          className={clsx(
            'flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-medium transition-colors',
            propertyPanelTab === 'notes' ? 'text-primary-600 border-b-2 border-primary-600' : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <FileText className="w-3.5 h-3.5" />
          Notes
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {!selectedNode ? (
          <p className="text-xs text-gray-400 p-4 text-center">Select a node to edit its properties</p>
        ) : propertyPanelTab === 'style' ? (
          <NodeStylePanel />
        ) : (
          <NodeNotesPanel />
        )}
      </div>
    </div>
  );
}
