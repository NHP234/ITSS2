const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.get('/', notificationController.getMyNotifications);
router.post('/mark-all-read', notificationController.markAllRead);
router.patch('/:id/read', notificationController.markRead);

module.exports = router;
