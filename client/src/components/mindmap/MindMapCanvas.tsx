import { useRef, useEffect, useCallback } from 'react';
import { useMindMapStore } from '../../stores/mindmapStore';
import { computeLayout } from '../../lib/d3/layout';
import { setupZoom } from '../../lib/d3/zoom';
import type { LayoutNode } from '../../lib/d3/layout';
import { useDragNode } from '../../hooks/useDragNode';
import MindMapNode from './MindMapNode';
import ConnectionLine from './ConnectionLine';
import MiniMap from './MiniMap';
import Spinner from '../common/Spinner';
import { useT } from '../../lib/i18n';
import { useState } from 'react';
import { Map } from 'lucide-react';

export default function MindMapCanvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomGroupRef = useRef<SVGGElement>(null);
  const { isLoading, currentMap, selectedNodeId, selectNode } = useMindMapStore();
  const [layoutRoot, setLayoutRoot] = useState<LayoutNode | null>(null);
  const t = useT();

  useEffect(() => {
    if (!currentMap) { setLayoutRoot(null); return; }
    const root = computeLayout(currentMap.rootNode);
    setLayoutRoot(root);
  }, [currentMap?.rootNode, currentMap]);

  const { drag, handleMouseDown } = useDragNode(layoutRoot);

  useEffect(() => {
    if (!svgRef.current || !zoomGroupRef.current) return;
    const z = setupZoom(svgRef.current, zoomGroupRef.current, () => {});
    return () => {
      svgRef.current?.removeEventListener('wheel', z as unknown as EventListener);
      svgRef.current?.removeEventListener('mousedown', z as unknown as EventListener);
    };
  }, []);

  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current || e.target === zoomGroupRef.current) selectNode(null);
  }, [selectNode]);

  if (isLoading) {
    return <div className="flex-1 flex items-center justify-center dot-grid"><Spinner size="lg" /></div>;
  }

  if (!currentMap || !layoutRoot) {
    return (
      <div className="flex-1 flex items-center justify-center dot-grid">
        <div className="text-center glass-lg rounded-2xl p-8 animate-fade-in">
          <Map className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">{t.canvas.noMap}</p>
        </div>
      </div>
    );
  }

  const nodes: { d3Node: LayoutNode; parentId: string | null }[] = [];
  const connections: { from: LayoutNode; to: LayoutNode }[] = [];

  function collectNodes(d3Node: LayoutNode, parentId: string | null) {
    nodes.push({ d3Node, parentId });
    if (parentId && d3Node.parent) connections.push({ from: d3Node.parent as LayoutNode, to: d3Node });
    if (d3Node.children) d3Node.children.forEach((c) => collectNodes(c as LayoutNode, d3Node.data.id));
  }
  collectNodes(layoutRoot, null);

  return (
    <div className="flex-1 bg-surface-50 dot-grid overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" onClick={handleSvgClick}>
        <defs>
          <filter id="node-shadow" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="rgba(0,0,0,0.08)" />
          </filter>
          <filter id="node-shadow-selected" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="3" stdDeviation="6" floodColor="rgba(76,110,245,0.25)" />
          </filter>
          <filter id="node-shadow-hover" x="-20%" y="-20%" width="140%" height="150%">
            <feDropShadow dx="0" dy="2" stdDeviation="5" floodColor="rgba(0,0,0,0.12)" />
          </filter>
          {/* Gradient for connection lines */}
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id="line-gradient-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
        <g ref={zoomGroupRef}>
          {/* Connections */}
          {connections.map(({ from, to }) => (
            <ConnectionLine key={`conn-${from.data.id}-${to.data.id}`} from={from} to={to}
              nodeWidth={140} highlight={drag.targetNodeId === to.data.id} />
          ))}
          {/* Nodes */}
          {nodes.map(({ d3Node }) => (
            <MindMapNode key={d3Node.data.id} d3Node={d3Node}
              isSelected={d3Node.data.id === selectedNodeId}
              isDragTarget={drag.targetNodeId === d3Node.data.id}
              hasChildren={d3Node.children ? d3Node.children.length > 0 : false}
              onMouseDown={(e) => handleMouseDown(d3Node.data.id, e)} />
          ))}
          {/* Drag ghost line */}
          {drag.dragging && drag.draggedNodeId && (
            <line x1={drag.ghostX} y1={drag.ghostY} x2={drag.ghostX + 24} y2={drag.ghostY}
              stroke="#6366f1" strokeWidth={2} strokeDasharray="5 4" opacity={0.5}
              strokeLinecap="round" />
          )}
          {/* Drop zone indicator */}
          {drag.dragging && drag.targetNodeId && (
            <circle cx={drag.ghostX} cy={drag.ghostY} r={6}
              fill="rgba(99,102,241,0.15)" stroke="#6366f1" strokeWidth={1.5}
              className="animate-pulse-soft" />
          )}
        </g>
      </svg>

      {/* Title label */}
      <div className="absolute top-3 left-3 glass rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 z-10 shadow-sm">
        {currentMap.title}
      </div>

      {/* Mini map */}
      <MiniMap layoutRoot={layoutRoot} viewportWidth={800} viewportHeight={600} />
    </div>
  );
}
