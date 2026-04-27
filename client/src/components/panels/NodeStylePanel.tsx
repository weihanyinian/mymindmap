import { useMindMapStore } from '../../stores/mindmapStore';
import clsx from 'clsx';
import type { NodeShape, LineType } from '@mindflow/shared';

const SHAPES: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: 'Rect' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'pill', label: 'Pill' },
  { value: 'underline', label: 'Underline' },
];

const LINE_TYPES: { value: LineType; label: string }[] = [
  { value: 'curve', label: 'Curve' },
  { value: 'straight', label: 'Straight' },
  { value: 'angled', label: 'Angled' },
];

const COLORS = [
  '#4A90D9', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#3498DB', '#E91E63', '#00BCD4',
  '#FFFFFF', '#F5F5F5', '#D9D9D9', '#333333', '#000000',
];

export default function NodeStylePanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  const { style } = node;

  return (
    <div className="p-3 space-y-4">
      {/* Shape */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Shape</label>
        <div className="grid grid-cols-4 gap-1">
          {SHAPES.map((s) => (
            <button
              key={s.value}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, shape: s.value } })}
              className={clsx(
                'text-xs py-1 px-1.5 rounded border transition-colors',
                style.shape === s.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Type */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">Line Type</label>
        <div className="grid grid-cols-3 gap-1">
          {LINE_TYPES.map((l) => (
            <button
              key={l.value}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, lineType: l.value } })}
              className={clsx(
                'text-xs py-1 px-1.5 rounded border transition-colors',
                style.lineType === l.value
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50'
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">
          Fill Color
          <span className="ml-1 text-gray-400 font-normal">{style.fillColor}</span>
        </label>
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, fillColor: c } })}
              className={clsx(
                'w-6 h-6 rounded border-2 transition-all',
                style.fillColor === c ? 'border-primary-500 scale-110' : 'border-gray-300 hover:scale-105'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">
          Stroke Color
          <span className="ml-1 text-gray-400 font-normal">{style.strokeColor}</span>
        </label>
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, strokeColor: c } })}
              className={clsx(
                'w-6 h-6 rounded border-2 transition-all',
                style.strokeColor === c ? 'border-primary-500 scale-110' : 'border-gray-300 hover:scale-105'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">
          Font Color
          <span className="ml-1 text-gray-400 font-normal">{style.fontColor}</span>
        </label>
        <div className="flex flex-wrap gap-1">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, fontColor: c } })}
              className={clsx(
                'w-6 h-6 rounded border-2 transition-all',
                style.fontColor === c ? 'border-primary-500 scale-110' : 'border-gray-300 hover:scale-105'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">
          Font Size: {style.fontSize}px
        </label>
        <input
          type="range"
          min={8}
          max={72}
          value={style.fontSize}
          onChange={(e) =>
            updateNode(selectedNodeId, { style: { ...style, fontSize: Number(e.target.value) } })
          }
          className="w-full"
        />
      </div>

      {/* Line Width */}
      <div>
        <label className="text-xs font-medium text-gray-500 block mb-1.5">
          Line Width: {style.lineWidth}px
        </label>
        <input
          type="range"
          min={1}
          max={10}
          value={style.lineWidth}
          onChange={(e) =>
            updateNode(selectedNodeId, { style: { ...style, lineWidth: Number(e.target.value) } })
          }
          className="w-full"
        />
      </div>
    </div>
  );
}
