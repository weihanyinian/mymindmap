import { useState, useCallback, useRef } from 'react';
import { useMindMapStore } from '../stores/mindmapStore';
import type { LayoutNode } from '../lib/d3/layout';
import type { IMindMapNode } from '@mindflow/shared';

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
      const result = closest as { id: string; dist: number } | null;
      if (result && result.dist < 100) {
        return result.id;
      }
      return null;
    },
    [layoutRoot]
  );

  const getSVGPoint = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } => {
      const svg = document.querySelector('svg');
      if (!svg) return { x: 0, y: 0 };
      const pt = svg.createSVGPoint();
      pt.x = clientX;
      pt.y = clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return { x: 0, y: 0 };
      const svgPt = pt.matrixTransform(ctm.inverse());
      return { x: svgPt.x, y: svgPt.y };
    },
    []
  );

  const findParentNode = useCallback(
    (nodeId: string): IMindMapNode | null => {
      if (!currentMap) return null;
      function findParent(node: IMindMapNode): IMindMapNode | null {
        for (const child of node.children) {
          if (child.id === nodeId) return node;
          const found = findParent(child);
          if (found) return found;
        }
        return null;
      }
      return findParent(currentMap.rootNode);
    },
    [currentMap]
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
          // Check if target is the current parent — reorder instead of reparent
          const currentParent = findParentNode(nodeId);
          if (currentParent && target === currentParent.id) {
            // Reorder to end of siblings
            const siblingCount = currentParent.children.length;
            moveNode(nodeId, target, siblingCount - 1);
          } else {
            // Reparent: drag to a new parent
            const targetChildren = findNodeChildren(target)?.length || 0;
            moveNode(nodeId, target, targetChildren);
          }
        }
        // If dropping on empty space (no target), node stays in place
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    },
    [currentMap, layoutRoot, getSVGPoint, findClosestNode, moveNode, findParentNode]
  );

  return {
    drag,
    handleMouseDown,
  };
}

function findNodeChildren(root: LayoutNode | null, id: string): IMindMapNode['children'] | null {
  if (!root) return null;
  if (root.data.id === id) return root.data.children;
  if (root.children) {
    for (const child of root.children) {
      const found = findNodeChildren(child as LayoutNode, id);
      if (found) return found;
    }
  }
  return null;
}
