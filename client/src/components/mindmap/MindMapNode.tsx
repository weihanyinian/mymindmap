import { useState, useRef, useEffect } from 'react';
import { useMindMapStore } from '../../stores/mindmapStore';
import type { LayoutNode } from '../../lib/d3/layout';
import { useT } from '../../lib/i18n';
import clsx from 'clsx';

interface MindMapNodeProps {
  d3Node: LayoutNode;
  isSelected: boolean;
  hasChildren: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export default function MindMapNode({ d3Node, isSelected, hasChildren, onMouseDown }: MindMapNodeProps) {
  const { selectNode, updateNode, toggleCollapse } = useMindMapStore();
  const node = d3Node.data;
  const { style } = node;
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const nodeWidth = 140;
  const nodeHeight = 36;
  const x = d3Node.x - nodeWidth / 2;
  const y = d3Node.y - nodeHeight / 2;
  const rx = style.shape === 'pill' ? nodeHeight / 2 : style.shape === 'rounded' ? 6 : style.shape === 'underline' ? 0 : 0;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditText(node.title);
    setEditing(true);
  };

  const finishEditing = () => {
    setEditing(false);
    if (editText.trim() && editText !== node.title) {
      updateNode(node.id, { title: editText.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') finishEditing();
    else if (e.key === 'Escape') { setEditText(node.title); setEditing(false); }
    e.stopPropagation();
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    selectNode(node.id);
  };

  const handleCollapseClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleCollapse(node.id);
  };

  const renderNodeShape = () => {
    switch (style.shape) {
      case 'underline':
        return (
          <line x1={x + 4} y1={y + nodeHeight - 3} x2={x + nodeWidth - 4} y2={y + nodeHeight - 3}
            stroke={style.strokeColor} strokeWidth={2} />
        );
      default:
        return (
          <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx={rx} ry={rx}
            fill={style.fillColor} stroke={isSelected ? '#3b82f6' : style.strokeColor}
            strokeWidth={isSelected ? 2.5 : 1.5} filter={isSelected ? 'url(#node-shadow)' : undefined}
            className="transition-colors duration-150" />
        );
    }
  };

  return (
    <g transform={`translate(0, 0)`} className={clsx('cursor-pointer', editing && 'pointer-events-auto')}
      onClick={handleClick} onMouseDown={onMouseDown}>
      <rect x={x - 8} y={y - 4} width={nodeWidth + 16} height={nodeHeight + 8} fill="transparent" stroke="none" />
      {renderNodeShape()}

      {hasChildren && (
        <g onClick={handleCollapseClick} className="cursor-pointer"
          transform={`translate(${x + nodeWidth + 14}, ${y + nodeHeight / 2})`}>
          <circle r={8} fill="white" stroke={style.strokeColor} strokeWidth={1.5} />
          <text textAnchor="middle" dy=".35em" fontSize={12} fontWeight="bold" fill={style.strokeColor}
            style={{ userSelect: 'none' }}>
            {node.collapsed ? '+' : '-'}
          </text>
        </g>
      )}

      {editing ? (
        <foreignObject x={x + 4} y={y + 2} width={nodeWidth - 8} height={nodeHeight - 4}>
          <input ref={inputRef} value={editText} onChange={(e) => setEditText(e.target.value)}
            onBlur={finishEditing} onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent outline-none text-center"
            style={{ fontSize: `${style.fontSize}px`, color: style.fontColor, fontFamily: 'inherit' }} />
        </foreignObject>
      ) : (
        <text x={d3Node.x} y={d3Node.y + 1} textAnchor="middle" dominantBaseline="central"
          fontSize={style.fontSize} fill={style.fontColor} onDoubleClick={handleDoubleClick}
          style={{ userSelect: 'none' }} className="pointer-events-auto">
          {node.title}
        </text>
      )}
    </g>
  );
}
