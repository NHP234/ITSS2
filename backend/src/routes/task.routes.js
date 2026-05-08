const { Router } = require('express');
const task = require('../controllers/task.controller');

const router = Router();

// GET    /api/tasks
router.get('/', task.getAll);

// GET    /api/tasks/:id
router.get('/:id', task.getOne);

// POST   /api/tasks
router.post('/', task.create);

// PUT    /api/tasks/:id
router.put('/:id', task.update);

// PATCH  /api/tasks/:id/status
router.patch('/:id/status', task.updateStatus);

// DELETE /api/tasks/:id
router.delete('/:id', task.remove);

module.exports = router;
