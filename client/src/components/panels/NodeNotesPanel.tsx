import { useMindMapStore } from '../../stores/mindmapStore';
import { useT } from '../../lib/i18n';
import { FileText } from 'lucide-react';

export default function NodeNotesPanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();
  const t = useT();

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  const maxLen = 10000;

  return (
    <div className="p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <FileText className="w-3.5 h-3.5 text-gray-400" />
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{t.panel.notes}</label>
      </div>
      <textarea
        value={node.notes}
        onChange={(e) => updateNode(selectedNodeId, { notes: e.target.value })}
        placeholder={t.panel.notesPlaceholder}
        maxLength={maxLen}
        className="input-field h-36 resize-none text-sm font-normal"
      />
      <p className="text-xs text-gray-400 mt-2 text-right tabular-nums">
        {node.notes.length.toLocaleString()}/{maxLen.toLocaleString()}
      </p>
    </div>
  );
}
