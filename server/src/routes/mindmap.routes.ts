import { Router } from 'express';
import multer from 'multer';
import * as mindmapController from '../controllers/mindmap.controller';
import * as importController from '../controllers/import.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { createMindMapSchema, updateMindMapSchema } from '../validators/mindmap.validator';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });
const router = Router();

router.use(authenticate);

// Import (must be before /:id routes)
router.post('/import', upload.single('file'), importController.importMap);

router.get('/', mindmapController.list);
router.post('/', validate(createMindMapSchema), mindmapController.create);
router.get('/:id', mindmapController.getById);
router.patch('/:id', validate(updateMindMapSchema), mindmapController.update);
router.delete('/:id', mindmapController.remove);

// Node-level operations
router.post('/:id/nodes', mindmapController.addChild);
router.patch('/:id/nodes/:nodeId', mindmapController.updateNode);
router.delete('/:id/nodes/:nodeId', mindmapController.removeNode);
router.put('/:id/nodes/:nodeId/move', mindmapController.moveNode);

export default router;
