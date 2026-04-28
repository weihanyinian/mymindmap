import { create } from 'zustand';
import type { IMindMap, IMindMapSummary, IMindMapNode } from '@mindflow/shared';
import { mindmapApi } from '../api/mindmap.api';
import { nanoid } from 'nanoid';

interface MindMapState {
  mindMaps: IMindMapSummary[];
  currentMap: IMindMap | null;
  selectedNodeId: string | null;
  nodeMap: Map<string, IMindMapNode>;
  isDirty: boolean;
  isSaving: boolean;
  isLoading: boolean;
  isLoadingList: boolean;

  undoStack: IMindMapNode[];
  redoStack: IMindMapNode[];
  copiedNode: IMindMapNode | null;

  fetchList: () => Promise<void>;
  loadMap: (id: string) => Promise<void>;
  createMap: (title: string) => Promise<IMindMap>;
  deleteMap: (id: string) => Promise<void>;
  selectNode: (id: string | null) => void;

  updateNode: (id: string, changes: Partial<IMindMapNode>) => void;
  addChild: (parentId: string) => void;
  addSibling: (nodeId: string) => void;
  deleteNode: (id: string) => void;
  toggleCollapse: (id: string) => void;
  moveNode: (nodeId: string, newParentId: string, index: number) => void;
  reorderNode: (nodeId: string, direction: 'up' | 'down') => void;
  copyNode: (id: string) => void;
  pasteNode: (parentId: string) => void;

  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
  autoSave: () => Promise<void>;
  markClean: () => void;
}

function buildNodeMap(node: IMindMapNode): Map<string, IMindMapNode> {
  const map = new Map<string, IMindMapNode>();
  map.set(node.id, node);
  for (const child of node.children) {
    for (const [id, n] of buildNodeMap(child)) {
      map.set(id, n);
    }
  }
  return map;
}

function cloneNode(node: IMindMapNode): IMindMapNode {
  return JSON.parse(JSON.stringify(node));
}

function deepCloneWithNewIds(node: IMindMapNode): IMindMapNode {
  return {
    ...JSON.parse(JSON.stringify(node)),
    id: nanoid(8),
    children: node.children.map(deepCloneWithNewIds),
  };
}

export const useMindMapStore = create<MindMapState>((set, get) => ({
  mindMaps: [],
  currentMap: null,
  selectedNodeId: null,
  nodeMap: new Map(),
  isDirty: false,
  isSaving: false,
  isLoading: false,
  isLoadingList: false,
  undoStack: [],
  redoStack: [],
  copiedNode: null,

  fetchList: async () => {
    set({ isLoadingList: true });
    try {
      const { mindMaps } = await mindmapApi.list();
      set({ mindMaps });
    } catch {
      // silently fail
    } finally {
      set({ isLoadingList: false });
    }
  },

  loadMap: async (id) => {
    set({ isLoading: true });
    try {
      const { mindMap } = await mindmapApi.getById(id);
      set({
        currentMap: mindMap,
        selectedNodeId: null,
        nodeMap: buildNodeMap(mindMap.rootNode),
        isDirty: false,
        undoStack: [],
        redoStack: [],
      });
    } catch {
      // handled by toast
    } finally {
      set({ isLoading: false });
    }
  },

  createMap: async (title) => {
    const { mindMap } = await mindmapApi.create(title);
    set((s) => ({ mindMaps: [mindMapToSummary(mindMap), ...s.mindMaps] }));
    return mindMap;
  },

  deleteMap: async (id) => {
    await mindmapApi.delete(id);
    set((s) => ({
      mindMaps: s.mindMaps.filter((m) => m._id !== id),
      currentMap: s.currentMap?._id === id ? null : s.currentMap,
    }));
  },

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNode: (id, changes) => {
    const { currentMap, undoStack } = get();
    if (!currentMap) return;

    if (undoStack.length === 0) {
      set({ undoStack: [cloneNode(currentMap.rootNode)] });
    }

    const updateInTree = (node: IMindMapNode): IMindMapNode => {
      if (node.id === id) {
        return { ...node, ...changes, style: changes.style ? { ...node.style, ...changes.style } : node.style };
      }
      return { ...node, children: node.children.map(updateInTree) };
    };

    const newRoot = updateInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      isDirty: true,
    });
  },

  addChild: (parentId) => {
    const { currentMap, undoStack } = get();
    if (!currentMap) return;

    if (undoStack.length === 0) {
      set({ undoStack: [cloneNode(currentMap.rootNode)] });
    }

    const newNode: IMindMapNode = {
      id: nanoid(8),
      title: 'New Topic',
      children: [],
      position: { x: 0, y: 0 },
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4A90D9',
        fontColor: '#333333',
        fontSize: 14,
        shape: 'rounded',
        lineType: 'curve',
        lineColor: '#B0BEC5',
        lineWidth: 2,
      },
      collapsed: false,
      notes: '',
      labels: [],
      icons: [],
    };

    const addInTree = (node: IMindMapNode): IMindMapNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newNode], collapsed: false };
      }
      return { ...node, children: node.children.map(addInTree) };
    };

    const newRoot = addInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      selectedNodeId: newNode.id,
      isDirty: true,
    });
  },

  addSibling: (nodeId) => {
    const { currentMap, undoStack } = get();
    if (!currentMap) return;
    if (nodeId === currentMap.rootNode.id) return; // Cannot add sibling to root

    if (undoStack.length === 0) {
      set({ undoStack: [cloneNode(currentMap.rootNode)] });
    }

    const newNode: IMindMapNode = {
      id: nanoid(8),
      title: 'New Topic',
      children: [],
      position: { x: 0, y: 0 },
      style: {
        fillColor: '#FFFFFF',
        strokeColor: '#4A90D9',
        fontColor: '#333333',
        fontSize: 14,
        shape: 'rounded',
        lineType: 'curve',
        lineColor: '#B0BEC5',
        lineWidth: 2,
      },
      collapsed: false,
      notes: '',
      labels: [],
      icons: [],
    };

    const addSiblingInTree = (node: IMindMapNode): IMindMapNode => {
      const idx = node.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        const newChildren = [...node.children];
        newChildren.splice(idx + 1, 0, newNode);
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(addSiblingInTree) };
    };

    const newRoot = addSiblingInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      selectedNodeId: newNode.id,
      isDirty: true,
    });
  },

  deleteNode: (id) => {
    const { currentMap, undoStack } = get();
    if (!currentMap) return;
    if (id === currentMap.rootNode.id) return;

    if (undoStack.length === 0) {
      set({ undoStack: [cloneNode(currentMap.rootNode)] });
    }

    const removeInTree = (node: IMindMapNode): IMindMapNode => {
      return { ...node, children: node.children.filter((c) => c.id !== id).map(removeInTree) };
    };

    const newRoot = removeInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      selectedNodeId: null,
      isDirty: true,
    });
  },

  toggleCollapse: (id) => {
    const { currentMap } = get();
    if (!currentMap) return;

    const toggleInTree = (node: IMindMapNode): IMindMapNode => {
      if (node.id === id) {
        return { ...node, collapsed: !node.collapsed };
      }
      return { ...node, children: node.children.map(toggleInTree) };
    };

    const newRoot = toggleInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      isDirty: true,
    });
  },

  moveNode: (nodeId, newParentId, index) => {
    const { currentMap } = get();
    if (!currentMap) return;
    if (nodeId === currentMap.rootNode.id) return;

    // Find and remove node from its current parent
    let removedNode: IMindMapNode | null = null;

    const removeFromTree = (node: IMindMapNode): IMindMapNode => {
      const idx = node.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        removedNode = node.children[idx];
        const newChildren = [...node.children];
        newChildren.splice(idx, 1);
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(removeFromTree) };
    };

    const afterRemove = removeFromTree(currentMap.rootNode);
    if (!removedNode) return;

    // Insert into new parent
    const insertIntoTree = (node: IMindMapNode): IMindMapNode => {
      if (node.id === newParentId) {
        const newChildren = [...node.children];
        const insertIdx = Math.min(index, newChildren.length);
        newChildren.splice(insertIdx, 0, removedNode!);
        return { ...node, children: newChildren, collapsed: false };
      }
      return { ...node, children: node.children.map(insertIntoTree) };
    };

    const newRoot = insertIntoTree(afterRemove);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      isDirty: true,
    });
  },

  reorderNode: (nodeId, direction) => {
    const { currentMap } = get();
    if (!currentMap || nodeId === currentMap.rootNode.id) return;

    // Save undo state
    set((s) => ({
      undoStack: s.undoStack.length === 0
        ? [cloneNode(currentMap.rootNode)]
        : [...s.undoStack, cloneNode(currentMap.rootNode)].slice(-50),
      redoStack: [],
    }));

    const reorderInTree = (node: IMindMapNode): IMindMapNode => {
      const idx = node.children.findIndex((c) => c.id === nodeId);
      if (idx !== -1) {
        const newChildren = [...node.children];
        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
        if (targetIdx < 0 || targetIdx >= newChildren.length) return node;
        [newChildren[idx], newChildren[targetIdx]] = [newChildren[targetIdx], newChildren[idx]];
        return { ...node, children: newChildren };
      }
      return { ...node, children: node.children.map(reorderInTree) };
    };

    const newRoot = reorderInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      isDirty: true,
    });
  },

  copyNode: (id) => {
    const { nodeMap } = get();
    const node = nodeMap.get(id);
    if (!node) return;
    set({ copiedNode: cloneNode(node) });
  },

  pasteNode: (parentId) => {
    const { currentMap, copiedNode, undoStack } = get();
    if (!currentMap || !copiedNode) return;

    if (undoStack.length === 0) {
      set({ undoStack: [cloneNode(currentMap.rootNode)] });
    }

    // Deep clone with new IDs
    const cloned = deepCloneWithNewIds(copiedNode);

    const insertInTree = (node: IMindMapNode): IMindMapNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, cloned], collapsed: false };
      }
      return { ...node, children: node.children.map(insertInTree) };
    };

    const newRoot = insertInTree(currentMap.rootNode);
    set({
      currentMap: { ...currentMap, rootNode: newRoot },
      nodeMap: buildNodeMap(newRoot),
      selectedNodeId: cloned.id,
      isDirty: true,
    });
  },

  pushUndo: () => {
    const { currentMap } = get();
    if (!currentMap) return;
    set((s) => ({
      undoStack: [...s.undoStack, cloneNode(currentMap.rootNode)].slice(-50),
      redoStack: [],
    }));
  },

  undo: () => {
    const { currentMap, undoStack } = get();
    if (!currentMap || undoStack.length === 0) return;

    const prev = undoStack[undoStack.length - 1];
    set((s) => ({
      undoStack: s.undoStack.slice(0, -1),
      redoStack: [...s.redoStack, cloneNode(currentMap.rootNode)],
      currentMap: { ...currentMap, rootNode: prev },
      nodeMap: buildNodeMap(prev),
      isDirty: true,
    }));
  },

  redo: () => {
    const { currentMap, redoStack } = get();
    if (!currentMap || redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];
    set((s) => ({
      redoStack: s.redoStack.slice(0, -1),
      undoStack: [...s.undoStack, cloneNode(currentMap.rootNode)],
      currentMap: { ...currentMap, rootNode: next },
      nodeMap: buildNodeMap(next),
      isDirty: true,
    }));
  },

  autoSave: async () => {
    const { currentMap, isDirty, isSaving } = get();
    if (!currentMap || !isDirty || isSaving) return;

    set({ isSaving: true });
    try {
      await mindmapApi.update(currentMap._id, {
        title: currentMap.title,
        rootNode: currentMap.rootNode,
        theme: currentMap.theme,
      });
      set({ isDirty: false });
    } catch {
      // retry on next change
    } finally {
      set({ isSaving: false });
    }
  },

  markClean: () => set({ isDirty: false }),
}));

function mindMapToSummary(m: IMindMap): IMindMapSummary {
  function count(n: IMindMapNode): number {
    let c = 1;
    for (const ch of n.children) c += count(ch);
    return c;
  }
  return {
    _id: m._id,
    title: m.title,
    rootNodeTitle: m.rootNode.title,
    nodeCount: count(m.rootNode),
    updatedAt: m.updatedAt,
    createdAt: m.createdAt,
  };
}
