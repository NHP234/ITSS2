import { Router } from 'express';
import * as project from '../controllers/project.controller';

const router = Router();

// GET    /api/projects          – Lấy tất cả projects
router.get('/', project.getAll);

// GET    /api/projects/:id      – Lấy một project
router.get('/:id', project.getOne);

// POST   /api/projects          – Tạo project mới
router.post('/', project.create);

// PUT    /api/projects/:id      – Cập nhật project
router.put('/:id', project.update);

// DELETE /api/projects/:id      – Xoá project
router.delete('/:id', project.remove);

export default router;
