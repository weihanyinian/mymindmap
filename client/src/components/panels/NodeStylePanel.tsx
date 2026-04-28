import { useMindMapStore } from '../../stores/mindmapStore';
import { useT } from '../../lib/i18n';
import clsx from 'clsx';
import type { NodeShape, LineType } from '@mindflow/shared';

const COLORS = [
  '#4A90D9', '#E74C3C', '#2ECC71', '#F39C12', '#9B59B6',
  '#1ABC9C', '#E67E22', '#3498DB', '#E91E63', '#00BCD4',
  '#FFFFFF', '#F5F5F5', '#D9D9D9', '#333333', '#000000',
];

const SHAPES: { value: NodeShape; label: string }[] = [
  { value: 'rectangle', label: 'rect' },
  { value: 'rounded', label: 'rounded' },
  { value: 'pill', label: 'pill' },
  { value: 'underline', label: 'underline' },
];

const LINE_TYPES: { value: LineType; label: string }[] = [
  { value: 'curve', label: 'curve' },
  { value: 'straight', label: 'straight' },
  { value: 'angled', label: 'angled' },
];

export default function NodeStylePanel() {
  const { selectedNodeId, nodeMap, updateNode } = useMindMapStore();
  const t = useT();

  if (!selectedNodeId) return null;
  const node = nodeMap.get(selectedNodeId);
  if (!node) return null;

  const { style } = node;

  return (
    <div className="p-4 space-y-5">
      {/* Shape */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">{t.panel.shape}</label>
        <div className="grid grid-cols-4 gap-1.5">
          {SHAPES.map((s) => (
            <button key={s.value}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, shape: s.value } })}
              className={clsx(
                'text-xs py-1.5 px-1 rounded-lg border transition-all duration-150 font-medium',
                style.shape === s.value
                  ? 'border-primary-300 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
              )}>
              {t.panel[s.label as keyof typeof t.panel]}
            </button>
          ))}
        </div>
      </div>

      {/* Line Type */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">{t.panel.lineType}</label>
        <div className="grid grid-cols-3 gap-1.5">
          {LINE_TYPES.map((l) => (
            <button key={l.value}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, lineType: l.value } })}
              className={clsx(
                'text-xs py-1.5 px-1 rounded-lg border transition-all duration-150 font-medium',
                style.lineType === l.value
                  ? 'border-primary-300 bg-primary-50 text-primary-700 shadow-sm'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50 hover:border-gray-300'
              )}>
              {t.panel[l.label as keyof typeof t.panel]}
            </button>
          ))}
        </div>
      </div>

      {/* Fill Color */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
          {t.panel.fillColor}
          <span className="ml-1.5 text-gray-400 font-normal normal-case">{style.fillColor}</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, fillColor: c } })}
              className={clsx(
                'w-6 h-6 rounded-md border-2 transition-all duration-150',
                style.fillColor === c
                  ? 'border-primary-400 scale-110 shadow-sm ring-2 ring-primary-200'
                  : 'border-gray-200 hover:scale-105 hover:shadow-sm'
              )}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Stroke Color */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
          {t.panel.strokeColor}
          <span className="ml-1.5 text-gray-400 font-normal normal-case">{style.strokeColor}</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, strokeColor: c } })}
              className={clsx(
                'w-6 h-6 rounded-md border-2 transition-all duration-150',
                style.strokeColor === c
                  ? 'border-primary-400 scale-110 shadow-sm ring-2 ring-primary-200'
                  : 'border-gray-200 hover:scale-105 hover:shadow-sm'
              )}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Font Color */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
          {t.panel.fontColor}
          <span className="ml-1.5 text-gray-400 font-normal normal-case">{style.fontColor}</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {COLORS.map((c) => (
            <button key={c}
              onClick={() => updateNode(selectedNodeId, { style: { ...style, fontColor: c } })}
              className={clsx(
                'w-6 h-6 rounded-md border-2 transition-all duration-150',
                style.fontColor === c
                  ? 'border-primary-400 scale-110 shadow-sm ring-2 ring-primary-200'
                  : 'border-gray-200 hover:scale-105 hover:shadow-sm'
              )}
              style={{ backgroundColor: c }} />
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
          {t.panel.fontSize}: <span className="text-gray-700 font-bold">{style.fontSize}px</span>
        </label>
        <input type="range" min={8} max={72} value={style.fontSize}
          onChange={(e) => updateNode(selectedNodeId, { style: { ...style, fontSize: Number(e.target.value) } })}
          className="w-full accent-primary-500" />
      </div>

      {/* Line Width */}
      <div>
        <label className="text-xs font-semibold text-gray-500 block mb-2 uppercase tracking-wider">
          {t.panel.lineWidth}: <span className="text-gray-700 font-bold">{style.lineWidth}px</span>
        </label>
        <input type="range" min={1} max={10} value={style.lineWidth}
          onChange={(e) => updateNode(selectedNodeId, { style: { ...style, lineWidth: Number(e.target.value) } })}
          className="w-full accent-primary-500" />
      </div>
    </div>
  );
}
