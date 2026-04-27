import { useState, useCallback, useRef } from 'react';
import { useMindMapStore } from '../stores/mindmapStore';
import type { LayoutNode } from '../lib/d3/layout';

interface DragState {
  dragging: boolean;
  draggedNodeId: string | null;
  ghostX: number;
  ghostY: number;
  targetNodeId: string | null;
}

export function useDragNode(layoutRoot: LayoutNode | null) {
  const [drag, setDrag] = useState<DragState>({
    dragging: false,
    draggedNodeId: null,
    ghostX: 0,
    ghostY: 0,
    targetNodeId: null,
  });

  const { currentMap, moveNode, selectNode } = useMindMapStore();
  const svgRef = useRef<SVGSVGElement | null>(null);

  const findClosestNode = useCallback(
    (svgX: number, svgY: number, excludeId: string): string | null => {
      if (!layoutRoot) return null;

      let closest: { id: string; dist: number } | null = null;

      function search(node: LayoutNode) {
        if (node.data.id !== excludeId) {
          const dx = node.x - svgX;
          const dy = node.y - svgY;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (closest === null || d < closest.dist) {
            closest = { id: node.data.id, dist: d };
          }
        }
        if (node.children) {
          node.children.forEach((child) => search(child as LayoutNode));
        }
      }

      search(layoutRoot);
      // TS can't track mutation through the closure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = closest as any;
      if (result && result.dist < 80) {
        return result.id as string;
      }
      return null;
    },
    [layoutRoot]
  );

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      if (!svgRef.current) return { x: 0, y: 0 };
      const pt = svgRef.current.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svgRef.current.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    []
  );

  const handleMouseDown = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      if (!currentMap || nodeId === currentMap.rootNode.id) return;

      e.stopPropagation();
      e.preventDefault();

      const startPoint = getSVGPoint(e.clientX, e.clientY);

      setDrag({
        dragging: true,
        draggedNodeId: nodeId,
        ghostX: startPoint.x,
        ghostY: startPoint.y,
        targetNodeId: null,
      });

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const point = getSVGPoint(moveEvent.clientX, moveEvent.clientY);
        const target = findClosestNode(point.x, point.y, nodeId);
        setDrag((prev) => ({
          ...prev,
          ghostX: point.x,
          ghostY: point.y,
          targetNodeId: target,
        }));
      };

      const handleMouseUp = (upEvent: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);

        const point = getSVGPoint(upEvent.clientX, upEvent.clientY);
        const target = findClosestNode(point.x, point.y, nodeId);

        setDrag({
          dragging: false,
          draggedNodeId: null,
          ghostX: 0,
          ghostY: 0,
          targetNodeId: null,
        });

        if (target && target !== nodeId) {
          // Move the dragged node to be a child of the target
          const targetNode = findNodeInLayout(layoutRoot, target);
          if (targetNode) {
            const targetChildren = targetNode.data.children?.length || 0;
            moveNode(nodeId, target, targetChildren);
          }
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [currentMap, layoutRoot, getSVGPoint, findClosestNode, moveNode]
  );

  return {
    drag,
    svgRef,
    handleMouseDown,
  };
}

function findNodeInLayout(root: LayoutNode | null, id: string): LayoutNode | null {
  if (!root) return null;
  if (root.data.id === id) return root;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeInLayout(child as LayoutNode, id);
      if (found) return found;
    }
  }
  return null;
}
