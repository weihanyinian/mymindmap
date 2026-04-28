import { useState } from 'react';
import { useMindMapStore } from '../../stores/mindmapStore';
import { ICON_LIBRARY } from '@mindflow/shared';
import type { IconDef } from '@mindflow/shared';
import { Link, Image, StickyNote, X } from 'lucide-react';

const CATEGORIES: { id: IconDef['category']; label: string }[] = [
  { id: 'priority', label: '优先级' },
  { id: 'progress', label: '进度' },
  { id: 'task', label: '任务' },
  { id: 'flag', label: '旗帜' },
  { id: 'star', label: '标记' },
  { id: 'arrow', label: '箭头' },
  { id: 'misc', label: '其他' },
];

export default function NodeContentPanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();
  const [iconCat, setIconCat] = useState<IconDef['category']>('priority');
  const [hyperlinkInput, setHyperlinkInput] = useState('');

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  const filteredIcons = ICON_LIBRARY.filter((i) => i.category === iconCat);
  const activeIcons = node.icons || [];

  const toggleIcon = (iconId: string) => {
    const newIcons = activeIcons.includes(iconId)
      ? activeIcons.filter((i) => i !== iconId)
      : [...activeIcons, iconId];
    updateNode(selectedNodeId, { icons: newIcons } as any);
  };

  const handleAddHyperlink = () => {
    if (!hyperlinkInput.trim()) return;
    const url = hyperlinkInput.startsWith('http') ? hyperlinkInput : `https://${hyperlinkInput}`;
    updateNode(selectedNodeId, { hyperlink: url } as any);
    setHyperlinkInput('');
  };

  const handleRemoveHyperlink = () => {
    updateNode(selectedNodeId, { hyperlink: undefined } as any);
  };

  return (
    <div className="p-4 space-y-5">
      {/* Icons */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">图标</label>
        {/* Category tabs */}
        <div className="flex flex-wrap gap-1 mb-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setIconCat(cat.id)}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                iconCat === cat.id
                  ? 'bg-primary-100 text-primary-700 font-medium'
                  : 'text-gray-500 hover:bg-gray-100'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Icon grid */}
        <div className="grid grid-cols-6 gap-1">
          {filteredIcons.map((icon) => (
            <button
              key={icon.id}
              onClick={() => toggleIcon(icon.id)}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all ${
                activeIcons.includes(icon.id)
                  ? 'bg-primary-100 ring-2 ring-primary-300 scale-110'
                  : 'hover:bg-gray-100'
              }`}
              title={icon.nameZh}
            >
              {icon.emoji}
            </button>
          ))}
        </div>
        {/* Active icons on node */}
        {activeIcons.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {activeIcons.map((iconId) => {
              const icon = ICON_LIBRARY.find((i) => i.id === iconId);
              return icon ? (
                <span key={iconId} className="text-sm bg-gray-100 rounded px-1.5 py-0.5 flex items-center gap-1">
                  {icon.emoji}
                  <button onClick={() => toggleIcon(iconId)} className="text-gray-400 hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Hyperlink */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider flex items-center gap-1">
          <Link className="w-3 h-3" /> 超链接
        </label>
        {node.hyperlink ? (
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
            <a href={node.hyperlink} target="_blank" rel="noopener noreferrer"
              className="text-xs text-primary-600 truncate flex-1 hover:underline">
              {node.hyperlink}
            </a>
            <button onClick={handleRemoveHyperlink} className="text-gray-400 hover:text-red-500 shrink-0">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex gap-1.5">
            <input
              type="text"
              value={hyperlinkInput}
              onChange={(e) => setHyperlinkInput(e.target.value)}
              placeholder="输入网址..."
              className="input-field flex-1 text-xs py-1.5"
              onKeyDown={(e) => e.key === 'Enter' && handleAddHyperlink()}
            />
            <button onClick={handleAddHyperlink} className="btn-primary text-xs px-3 py-1.5">添加</button>
          </div>
        )}
      </div>

      {/* Notes summary */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider flex items-center gap-1">
          <StickyNote className="w-3 h-3" /> 备注
        </label>
        {node.notes ? (
          <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 leading-relaxed max-h-24 overflow-y-auto whitespace-pre-wrap">
            {node.notes}
          </p>
        ) : (
          <p className="text-xs text-gray-400 italic">暂无备注</p>
        )}
      </div>
    </div>
  );
}
