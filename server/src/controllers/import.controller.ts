import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authenticate';
import * as importService from '../services/import.service';

export async function importMap(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const file = req.file;
    if (!file) {
      // JSON body import
      const map = await importService.importFromJSON(req.userId!, req.body);
      res.status(201).json({ mindMap: map });
      return;
    }

    const format = req.body.format || 'json';

    if (format === 'xmind') {
      const map = await importService.importFromXMind(req.userId!, file.buffer);
      res.status(201).json({ mindMap: map });
    } else {
      const data = JSON.parse(file.buffer.toString());
      const map = await importService.importFromJSON(req.userId!, data);
      res.status(201).json({ mindMap: map });
    }
  } catch (err) {
    next(err);
  }
}
