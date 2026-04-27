import { z } from 'zod';

export const createMindMapSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
});

export const updateMindMapSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  rootNode: z.any().optional(),
  theme: z.string().optional(),
});

export const importMindMapSchema = z.object({
  format: z.enum(['json', 'xmind']),
});
