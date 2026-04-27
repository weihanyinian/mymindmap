import { useMindMapStore } from '../../stores/mindmapStore';

export default function NodeNotesPanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  return (
    <div className="p-3">
      <label className="text-xs font-medium text-gray-500 block mb-1.5">Notes</label>
      <textarea
        value={node.notes}
        onChange={(e) => updateNode(selectedNodeId, { notes: e.target.value })}
        placeholder="Add notes for this node..."
        className="input-field h-32 resize-none text-sm"
      />
      <p className="text-xs text-gray-400 mt-1">{node.notes.length}/10000</p>
    </div>
  );
}
