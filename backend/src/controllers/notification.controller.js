const notificationService = require('../services/notification.service');

async function getMyNotifications(req, res, next) {
  try {
    const notifications = await notificationService.getUserNotifications(req.userId);
    res.json(notifications);
  } catch (err) {
    next(err);
  }
}

async function markRead(req, res, next) {
  try {
    const { id } = req.params;
    const updated = await notificationService.markAsRead(id);
    res.json(updated);
  } catch (err) {
    next(err);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationService.markAllAsRead(req.userId);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getMyNotifications,
  markRead,
  markAllRead
};
