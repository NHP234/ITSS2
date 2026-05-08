const { Router } = require('express');
const authCtrl      = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

// POST /api/auth/register
router.post('/register', authCtrl.register);

// POST /api/auth/login
router.post('/login', authCtrl.login);

// GET  /api/auth/me  (protected)
router.get('/me', authMiddleware, authCtrl.me);

module.exports = router;
