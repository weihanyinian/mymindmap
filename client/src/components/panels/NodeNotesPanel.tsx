import { useMindMapStore } from '../../stores/mindmapStore';
import { useT } from '../../lib/i18n';

export default function NodeNotesPanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();
  const t = useT();

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  return (
    <div className="p-3">
      <label className="text-xs font-medium text-gray-500 block mb-1.5">{t.panel.notes}</label>
      <textarea
        value={node.notes}
        onChange={(e) => updateNode(selectedNodeId, { notes: e.target.value })}
        placeholder={t.panel.notesPlaceholder}
        className="input-field h-32 resize-none text-sm"
      />
      <p className="text-xs text-gray-400 mt-1">{node.notes.length}/10000</p>
    </div>
  );
}
