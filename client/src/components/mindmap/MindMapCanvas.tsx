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
    return <div className="flex-1 flex items-center justify-center bg-gray-50"><Spinner size="lg" /></div>;
  }

  if (!currentMap || !layoutRoot) {
    return <div className="flex-1 flex items-center justify-center bg-gray-50"><p className="text-gray-400">{t.canvas.noMap}</p></div>;
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
    <div className="flex-1 bg-gray-50 overflow-hidden relative">
      <svg ref={svgRef} className="w-full h-full cursor-grab active:cursor-grabbing" onClick={handleSvgClick}>
        <defs>
          <filter id="node-shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>
        <g ref={zoomGroupRef}>
          {connections.map(({ from, to }) => (
            <ConnectionLine key={`conn-${from.data.id}-${to.data.id}`} from={from} to={to} nodeWidth={140}
              highlight={drag.targetNodeId === to.data.id} />
          ))}
          {nodes.map(({ d3Node }) => (
            <MindMapNode key={d3Node.data.id} d3Node={d3Node} isSelected={d3Node.data.id === selectedNodeId}
              hasChildren={d3Node.children ? d3Node.children.length > 0 : false}
              onMouseDown={(e) => handleMouseDown(d3Node.data.id, e)} />
          ))}
          {drag.dragging && drag.draggedNodeId && (
            <line x1={drag.ghostX} y1={drag.ghostY} x2={drag.ghostX + 20} y2={drag.ghostY}
              stroke="#3b82f6" strokeWidth={2} strokeDasharray="4 3" opacity={0.6} />
          )}
        </g>
      </svg>
      <MiniMap layoutRoot={layoutRoot} viewportWidth={800} viewportHeight={600} />
      <div className="absolute top-2 left-2 text-xs text-gray-400 bg-white/80 rounded px-2 py-1 z-10">{currentMap.title}</div>
    </div>
  );
}
