import { Router } from 'express';
import projectRoutes from './project.routes';
import taskRoutes from './task.routes';
import * as task from '../controllers/task.controller';

const router = Router();

// ─── Health check ──────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── Resources ────────────────────────────────────────────────────────────────
router.use('/projects', projectRoutes);
router.use('/tasks', taskRoutes);

// ─── Nested: GET /api/projects/:id/tasks ──────────────────────────────────────
router.get('/projects/:id/tasks', task.getAll);

export default router;
