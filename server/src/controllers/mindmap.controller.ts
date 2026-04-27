import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authenticate';
import * as mindmapService from '../services/mindmap.service';

export async function list(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const maps = await mindmapService.listMindMaps(req.userId!);
    res.json({ mindMaps: maps });
  } catch (err) {
    next(err);
  }
}

export async function getById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.getMindMap(req.params.id, req.userId!);
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function create(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.createMindMap(req.userId!, req.body.title);
    res.status(201).json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function update(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.updateMindMap(
      req.params.id,
      req.userId!,
      req.body
    );
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function remove(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await mindmapService.deleteMindMap(req.params.id, req.userId!);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function addChild(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.addChildNode(
      req.params.id,
      req.userId!,
      req.body.parentId,
      req.body.title
    );
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function removeNode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.deleteNode(
      req.params.id,
      req.userId!,
      req.params.nodeId
    );
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function moveNode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.moveNode(
      req.params.id,
      req.userId!,
      req.params.nodeId,
      req.body.newParentId,
      req.body.index
    );
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}

export async function updateNode(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const map = await mindmapService.updateNode(
      req.params.id,
      req.userId!,
      req.params.nodeId,
      req.body
    );
    res.json({ mindMap: map });
  } catch (err) {
    next(err);
  }
}
