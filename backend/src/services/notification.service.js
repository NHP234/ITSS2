const prisma = require('../prisma/client');

/**
 * Lấy danh sách thông báo của user
 */
async function getUserNotifications(userId) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50
  });
}

/**
 * Tạo thông báo mới
 */
async function createNotification(data) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null
    }
  });
}

/**
 * Tạo nhiều thông báo cùng lúc (Batch Insert)
 */
async function createManyNotifications(dataArray) {
  if (!dataArray || dataArray.length === 0) return;
  return prisma.notification.createMany({
    data: dataArray.map(data => ({
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      link: data.link || null
    })),
    skipDuplicates: true
  });
}

/**
 * Đánh dấu đã đọc
 */
async function markAsRead(id) {
  return prisma.notification.update({
    where: { id },
    data: { read: true }
  });
}

/**
 * Đánh dấu tất cả đã đọc
 */
async function markAllAsRead(userId) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
}

module.exports = {
  getUserNotifications,
  createNotification,
  createManyNotifications,
  markAsRead,
  markAllAsRead
};
