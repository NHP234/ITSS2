import { Router } from 'express';
import * as task from '../controllers/task.controller';

const router = Router();

// GET    /api/tasks             – Lấy tất cả (có thể ?projectId=xxx)
router.get('/', task.getAll);

// GET    /api/tasks/:id         – Lấy một task
router.get('/:id', task.getOne);

// POST   /api/tasks             – Tạo task mới
router.post('/', task.create);

// PUT    /api/tasks/:id         – Cập nhật task
router.put('/:id', task.update);

// PATCH  /api/tasks/:id/status  – Cập nhật nhanh status
router.patch('/:id/status', task.updateStatus);

// DELETE /api/tasks/:id         – Xoá task
router.delete('/:id', task.remove);

export default router;
