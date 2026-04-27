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
  } = useMindMapStore();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Don't handle if editing an input
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
        return;
      }

      if (e.key === 'Tab') {
        e.preventDefault();
        if (selectedNodeId) {
          addChild(selectedNodeId);
        }
        return;
      }

      if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (selectedNodeId && currentMap && selectedNodeId !== currentMap.rootNode.id) {
          addSibling(selectedNodeId);
        } else if (selectedNodeId) {
          addChild(selectedNodeId);
        }
        return;
      }

      if (e.key === 'Delete' && selectedNodeId) {
        e.preventDefault();
        if (currentMap && selectedNodeId !== currentMap.rootNode.id) {
          deleteNode(selectedNodeId);
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedNodeId, currentMap, addChild, addSibling, deleteNode, undo, redo]);
}
