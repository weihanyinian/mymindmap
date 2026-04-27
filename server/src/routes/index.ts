import { Router } from 'express';
import authRoutes from './auth.routes';
import mindmapRoutes from './mindmap.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/mindmaps', mindmapRoutes);

export default router;
