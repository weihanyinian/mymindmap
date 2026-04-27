import { MindMap, type IMindMapNodeDoc } from '../models/MindMap';
import type { IMindMapSummary, IMindMapNode, INodeStyle } from '@mindflow/shared';
import { DEFAULT_NODE_STYLE } from '@mindflow/shared';
import { nanoid } from 'nanoid';

function countNodes(node: IMindMapNodeDoc): number {
  let count = 1;
  for (const child of node.children) {
    count += countNodes(child);
  }
  return count;
}

function createDefaultNode(title: string): Omit<IMindMapNodeDoc, 'createdAt' | 'updatedAt'> {
  return {
    id: nanoid(8),
    title,
    children: [],
    position: { x: 0, y: 0 },
    style: { ...DEFAULT_NODE_STYLE },
    collapsed: false,
    notes: '',
    labels: [],
    icons: [],
  };
}

export async function listMindMaps(userId: string): Promise<IMindMapSummary[]> {
  const maps = await MindMap.find({ userId })
    .select('title rootNode.title rootNode.children updatedAt createdAt')
    .sort({ updatedAt: -1 })
    .lean();

  return maps.map((m) => ({
    _id: m._id.toString(),
    title: m.title,
    rootNodeTitle: m.rootNode.title,
    nodeCount: countNodes(m.rootNode as IMindMapNodeDoc),
    updatedAt: m.updatedAt.toISOString(),
    createdAt: m.createdAt.toISOString(),
  }));
}

export async function getMindMap(mapId: string, userId: string) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }
  return map.toJSON();
}

export async function createMindMap(userId: string, title: string) {
  const rootNode = createDefaultNode(title || 'Central Topic');
  const map = await MindMap.create({ userId, title, rootNode });
  return map.toJSON();
}

export async function updateMindMap(mapId: string, userId: string, updates: {
  title?: string;
  rootNode?: IMindMapNode;
  theme?: string;
}) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (updates.title !== undefined) map.title = updates.title;
  if (updates.theme !== undefined) map.theme = updates.theme;
  if (updates.rootNode !== undefined) {
    map.rootNode = updates.rootNode as unknown as IMindMapNodeDoc;
  }
  map.version += 1;
  await map.save();
  return map.toJSON();
}

export async function deleteMindMap(mapId: string, userId: string) {
  const result = await MindMap.deleteOne({ _id: mapId, userId });
  if (result.deletedCount === 0) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }
}

// Tree helpers for node-level operations
export function findNodeById(
  root: IMindMapNodeDoc,
  nodeId: string
): IMindMapNodeDoc | null {
  if (root.id === nodeId) return root;
  for (const child of root.children) {
    const found = findNodeById(child, nodeId);
    if (found) return found;
  }
  return null;
}

export function findParentNode(
  root: IMindMapNodeDoc,
  nodeId: string
): IMindMapNodeDoc | null {
  for (const child of root.children) {
    if (child.id === nodeId) return root;
    const found = findParentNode(child, nodeId);
    if (found) return found;
  }
  return null;
}

export function removeNodeById(root: IMindMapNodeDoc, nodeId: string): boolean {
  const idx = root.children.findIndex((c) => c.id === nodeId);
  if (idx !== -1) {
    root.children.splice(idx, 1);
    return true;
  }
  for (const child of root.children) {
    if (removeNodeById(child, nodeId)) return true;
  }
  return false;
}

export async function updateNode(
  mapId: string,
  userId: string,
  nodeId: string,
  changes: Partial<IMindMapNode>
) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const node = findNodeById(map.rootNode, nodeId);
  if (!node) {
    throw Object.assign(new Error('Node not found'), {
      statusCode: 404,
      code: 'NODE_NOT_FOUND',
    });
  }

  if (changes.title !== undefined) node.title = changes.title;
  if (changes.notes !== undefined) node.notes = changes.notes;
  if (changes.collapsed !== undefined) node.collapsed = changes.collapsed;
  if (changes.style) {
    node.style = { ...node.style, ...(changes.style as unknown as INodeStyle) };
  }
  if (changes.position) node.position = changes.position;

  map.version += 1;
  await map.save();
  return map.toJSON();
}

export async function addChildNode(
  mapId: string,
  userId: string,
  parentId: string,
  title = 'New Topic'
) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  const parent = findNodeById(map.rootNode, parentId);
  if (!parent) {
    throw Object.assign(new Error('Parent node not found'), {
      statusCode: 404,
      code: 'NODE_NOT_FOUND',
    });
  }

  const newNode = createDefaultNode(title);
  parent.children.push(newNode as IMindMapNodeDoc);
  parent.collapsed = false;

  map.version += 1;
  await map.save();
  return map.toJSON();
}

export async function deleteNode(
  mapId: string,
  userId: string,
  nodeId: string
) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (map.rootNode.id === nodeId) {
    throw Object.assign(new Error('Cannot delete root node'), {
      statusCode: 400,
      code: 'CANNOT_DELETE_ROOT',
    });
  }

  const removed = removeNodeById(map.rootNode, nodeId);
  if (!removed) {
    throw Object.assign(new Error('Node not found'), {
      statusCode: 404,
      code: 'NODE_NOT_FOUND',
    });
  }

  map.version += 1;
  await map.save();
  return map.toJSON();
}

export async function moveNode(
  mapId: string,
  userId: string,
  nodeId: string,
  newParentId: string,
  index: number
) {
  const map = await MindMap.findOne({ _id: mapId, userId });
  if (!map) {
    throw Object.assign(new Error('Mind map not found'), {
      statusCode: 404,
      code: 'NOT_FOUND',
    });
  }

  if (nodeId === map.rootNode.id) {
    throw Object.assign(new Error('Cannot move root node'), {
      statusCode: 400,
      code: 'CANNOT_MOVE_ROOT',
    });
  }

  // Check not moving into own subtree
  const checkNode = findNodeById(map.rootNode, nodeId);
  if (checkNode && findNodeById(checkNode, newParentId)) {
    throw Object.assign(new Error('Cannot move a node into its own subtree'), {
      statusCode: 400,
      code: 'CIRCULAR_MOVE',
    });
  }

  const parent = findParentNode(map.rootNode, nodeId);
  if (!parent) {
    throw Object.assign(new Error('Node not found'), {
      statusCode: 404,
      code: 'NODE_NOT_FOUND',
    });
  }

  const nodeIdx = parent.children.findIndex((c) => c.id === nodeId);
  const [node] = parent.children.splice(nodeIdx, 1);

  const newParent = findNodeById(map.rootNode, newParentId);
  if (!newParent) {
    throw Object.assign(new Error('Target parent not found'), {
      statusCode: 404,
      code: 'TARGET_NOT_FOUND',
    });
  }

  newParent.children.splice(index, 0, node);
  newParent.collapsed = false;

  map.version += 1;
  await map.save();
  return map.toJSON();
}
