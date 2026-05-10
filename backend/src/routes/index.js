const { Router } = require('express');
const projectRoutes = require('./project.routes');
const taskRoutes   = require('./task.routes');
const authRoutes   = require('./auth.routes');
const userRoutes   = require('./user.routes');
const dashboardRoutes = require('./dashboard.routes');
const notificationRoutes = require('./notification.routes');
const taskCtrl     = require('../controllers/task.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// Root
router.get('/', (_req, res) => {
  res.json({ message: 'Welcome to ITSS2 API', status: 'running' });
});

// Health check
router.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Resources
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/notifications', notificationRoutes);
router.use('/projects', authMiddleware, projectRoutes);
router.use('/tasks', authMiddleware, taskRoutes);

// Nested: GET /api/projects/:id/tasks
router.get('/projects/:id/tasks', authMiddleware, taskCtrl.getAll);

module.exports = router;
