import { useState, useRef, useEffect } from 'react';
import { useMindMapStore } from '../../stores/mindmapStore';
import type { LayoutNode } from '../../lib/d3/layout';
import { useT } from '../../lib/i18n';
import clsx from 'clsx';

interface MindMapNodeProps {
  d3Node: LayoutNode;
  isSelected: boolean;
  isDragTarget: boolean;
  hasChildren: boolean;
  onMouseDown?: (e: React.MouseEvent) => void;
}

export default function MindMapNode({ d3Node, isSelected, isDragTarget, hasChildren, onMouseDown }: MindMapNodeProps) {
  const { selectNode, updateNode, toggleCollapse } = useMindMapStore();
  const node = d3Node.data;
  const { style } = node;
  const [editing, setEditing] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [editText, setEditText] = useState(node.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const nodeWidth = 140;
  const nodeHeight = 36;
  const x = d3Node.x - nodeWidth / 2;
  const y = d3Node.y - nodeHeight / 2;
  const rx = style.shape === 'pill' ? nodeHeight / 2 : style.shape === 'rounded' ? 8 : style.shape === 'underline' ? 0 : 4;

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

  const shadowFilter = isSelected
    ? 'url(#node-shadow-selected)'
    : (hovered || isDragTarget) ? 'url(#node-shadow-hover)' : 'url(#node-shadow)';

  const renderNodeShape = () => {
    const effectiveStrokeColor = isDragTarget ? '#6366f1' : (isSelected ? '#4c6ef5' : style.strokeColor);
    const effectiveStrokeWidth = isSelected ? 2.5 : (isDragTarget ? 2 : 1.5);

    switch (style.shape) {
      case 'underline':
        return (
          <>
            <line x1={x + 6} y1={y + nodeHeight - 3} x2={x + nodeWidth - 6} y2={y + nodeHeight - 3}
              stroke={effectiveStrokeColor} strokeWidth={2.5} strokeLinecap="round" />
          </>
        );
      default:
        return (
          <rect x={x} y={y} width={nodeWidth} height={nodeHeight} rx={rx} ry={rx}
            fill={isDragTarget ? 'rgba(238,242,255,0.9)' : style.fillColor}
            stroke={effectiveStrokeColor}
            strokeWidth={effectiveStrokeWidth}
            filter={shadowFilter}
            className="transition-all duration-150" />
        );
    }
  };

  return (
    <g
      transform={`translate(0, 0)`}
      data-node-id={node.id}
      data-draggable={d3Node.depth > 0 ? 'true' : undefined}
      className={clsx('cursor-pointer', editing && 'pointer-events-auto')}
      onClick={handleClick}
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Invisible larger hit area */}
      <rect x={x - 8} y={y - 4} width={nodeWidth + 16} height={nodeHeight + 8} fill="transparent" stroke="none" />

      {renderNodeShape()}

      {/* Drag handle indicator (small dots on right side) */}
      {(hovered || isSelected) && (
        <g transform={`translate(${x + nodeWidth - 10}, ${y + nodeHeight / 2})`} opacity={0.4}>
          <circle r={1} cy={-3} fill={style.strokeColor} />
          <circle r={1} fill={style.strokeColor} />
          <circle r={1} cy={3} fill={style.strokeColor} />
        </g>
      )}

      {/* Collapse/expand button */}
      {hasChildren && (
        <g onClick={handleCollapseClick} className="cursor-pointer"
          transform={`translate(${x + nodeWidth + 14}, ${y + nodeHeight / 2})`}>
          <circle r={8} fill="white" stroke={style.strokeColor} strokeWidth={1.5}
            className="transition-all duration-150 hover:r-[10]" />
          <text textAnchor="middle" dy=".35em" fontSize={12} fontWeight="bold" fill={style.strokeColor}
            style={{ userSelect: 'none' }}>
            {node.collapsed ? '+' : '−'}
          </text>
        </g>
      )}

      {/* Title text or edit input */}
      {editing ? (
        <foreignObject x={x + 6} y={y + 3} width={nodeWidth - 12} height={nodeHeight - 6}>
          <input ref={inputRef} value={editText} onChange={(e) => setEditText(e.target.value)}
            onBlur={finishEditing} onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent outline-none text-center text-sm"
            style={{ fontSize: `${style.fontSize}px`, color: style.fontColor, fontFamily: 'inherit' }} />
        </foreignObject>
      ) : (
        <text x={d3Node.x} y={d3Node.y + 1} textAnchor="middle" dominantBaseline="central"
          fontSize={style.fontSize} fill={style.fontColor} onDoubleClick={handleDoubleClick}
          style={{ userSelect: 'none', fontWeight: isSelected ? 600 : 500 }}
          className="pointer-events-auto">
          {node.title}
        </text>
      )}
    </g>
  );
}
