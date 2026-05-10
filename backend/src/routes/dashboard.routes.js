const { Router } = require('express');
const dashboardCtrl = require('../controllers/dashboard.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.get('/stats', authMiddleware, dashboardCtrl.getStats);

module.exports = router;
