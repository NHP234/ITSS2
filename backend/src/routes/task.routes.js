const { Router } = require('express');
const task = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// GET    /api/tasks
router.get('/', task.getAll);

// GET    /api/tasks/overdue  — task quá hạn của user hiện tại
router.get('/overdue', authMiddleware, task.getOverdue);

// GET    /api/tasks/:id
router.get('/:id', task.getOne);

// POST   /api/tasks
router.post('/', task.create);

// PUT    /api/tasks/:id
router.put('/:id', task.update);

// PATCH  /api/tasks/:id/status
router.patch('/:id/status', task.updateStatus);

// PATCH  /api/tasks/:id/progress
router.patch('/:id/progress', authMiddleware, task.updateProgress);

// DELETE /api/tasks/:id
router.delete('/:id', task.remove);

module.exports = router;
