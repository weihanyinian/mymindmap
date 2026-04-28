import { useEffect } from 'react';
import { useMindMapStore } from '../stores/mindmapStore';

export function useKeyboard() {
  const {
    selectedNodeId,
    currentMap,
    addChild,
    addSibling,
    deleteNode,
    undo,
    redo,
    reorderNode,
  } = useMindMapStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't handle if editing an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      // Tab: Add child
      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) addChild(selectedNodeId);
        return;
      }

      // Enter: Add sibling (or child for root)
      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id) {
          addSibling(selectedNodeId);
        } else if (selectedNodeId) {
          addChild(selectedNodeId);
        }
        return;
      }

      // Delete: Remove node
      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        if (currentMap && selectedNodeId !== currentMap.rootNode.id) {
          deleteNode(selectedNodeId);
        }
        return;
      }

      // Arrow keys: Reorder node within siblings
      if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && selectedNodeId) {
        e.preventDefault();
        if (currentMap && selectedNodeId !== currentMap.rootNode.id) {
          reorderNode(selectedNodeId, e.key === 'ArrowUp' ? 'up' : 'down');
        }
        return;
      }

      // F2: Rename (trigger double-click via DOM)
      if (e.key === 'F2' && selectedNodeId) {
        e.preventDefault();
        // Find the selected node's text element and dispatch double-click
        const svgTextEl = document.querySelector(`[data-node-id="${selectedNodeId}"] text`);
        if (svgTextEl) {
          svgTextEl.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, currentMap, addChild, addSibling, deleteNode, undo, redo, reorderNode]);
}
