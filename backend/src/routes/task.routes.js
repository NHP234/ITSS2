const { Router } = require('express');
const task = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// GET    /api/tasks
router.get('/', authMiddleware, task.getAll);

// GET    /api/tasks/overdue (MUST be before /:id)
router.get('/overdue', authMiddleware, task.getOverdue);

// GET    /api/tasks/:id/recommendations (MUST be before /:id)
router.post('/:id/recommendations', authMiddleware, task.getRecommendations);

// GET    /api/tasks/:id
router.get('/:id', authMiddleware, task.getOne);

// POST   /api/tasks
router.post('/', authMiddleware, task.create);

// PUT    /api/tasks/:id
router.put('/:id', authMiddleware, task.update);

// PATCH  /api/tasks/:id/status
router.patch('/:id/status', authMiddleware, task.updateStatus);

// PATCH  /api/tasks/:id/progress
router.patch('/:id/progress', authMiddleware, task.updateProgress);

// DELETE /api/tasks/:id
router.delete('/:id', authMiddleware, task.remove);

module.exports = router;