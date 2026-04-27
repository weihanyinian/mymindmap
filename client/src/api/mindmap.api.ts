import { api } from './client';
import type { IMindMap, IMindMapSummary } from '@mindflow/shared';

export const mindmapApi = {
  list() {
    return api.get('mindmaps').json<{ mindMaps: IMindMapSummary[] }>();
  },

  getById(id: string) {
    return api.get(`mindmaps/${id}`).json<{ mindMap: IMindMap }>();
  },

  create(title: string) {
    return api.post('mindmaps', { json: { title } }).json<{ mindMap: IMindMap }>();
  },

  update(id: string, data: { title?: string; rootNode?: unknown; theme?: string }) {
    return api.patch(`mindmaps/${id}`, { json: data }).json<{ mindMap: IMindMap }>();
  },

  delete(id: string) {
    return api.delete(`mindmaps/${id}`).json<{ success: boolean }>();
  },

  addChild(mapId: string, parentId: string, title?: string) {
    return api
      .post(`mindmaps/${mapId}/nodes`, { json: { parentId, title } })
      .json<{ mindMap: IMindMap }>();
  },

  deleteNode(mapId: string, nodeId: string) {
    return api.delete(`mindmaps/${mapId}/nodes/${nodeId}`).json<{ mindMap: IMindMap }>();
  },

  updateNode(mapId: string, nodeId: string, data: Record<string, unknown>) {
    return api
      .patch(`mindmaps/${mapId}/nodes/${nodeId}`, { json: data })
      .json<{ mindMap: IMindMap }>();
  },

  moveNode(mapId: string, nodeId: string, newParentId: string, index: number) {
    return api
      .put(`mindmaps/${mapId}/nodes/${nodeId}/move`, {
        json: { newParentId, index },
      })
      .json<{ mindMap: IMindMap }>();
  },
};
