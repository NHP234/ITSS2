const prisma = require('../prisma/client');
const notificationService = require('./notification.service');

function parseTaskDueDate(task) {
  if (task.dueDate) return new Date(task.dueDate);
  if (!task.due) return null;
  
  // Format: "D tháng M, Y" (Vietnamese)
  const dateMatch = task.due.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    // Set to end of that day (23:59:59)
    return new Date(year, month - 1, day, 23, 59, 59);
  }
  
  const parsed = new Date(task.due);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function checkDeadlinesAndOverdue() {
  console.log('⏰ Running deadline and overdue tasks check...');
  try {
    const tasks = await prisma.task.findMany({
      where: {
        status: { not: 'Done' }
      },
      include: {
        assignees: { select: { id: true, name: true } }
      }
    });

    const today = new Date();
    
    for (const task of tasks) {
      const dueDate = parseTaskDueDate(task);
      if (!dueDate) continue;

      const diffMs = dueDate.getTime() - today.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      const assignees = task.assignees || [];
      if (assignees.length === 0) continue;

      // Case 1: Overdue task (diffDays < 0)
      if (diffDays < 0) {
        for (const user of assignees) {
          // Check if notification already exists
          const link = `/projects/${task.projectId}?taskId=${task.id}&alert=overdue`;
          const existing = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'TASK_OVERDUE',
              link
            }
          });

          if (!existing) {
            await notificationService.createNotification({
              userId: user.id,
              type: 'TASK_OVERDUE',
              title: `Nhiệm vụ quá hạn!`,
              message: `Nhiệm vụ "${task.title}" của bạn đã quá hạn từ ngày ${task.due}.`,
              link
            });
            console.log(`✉️ Sent TASK_OVERDUE notification to ${user.name} for task: ${task.title}`);
          }
        }
      }
      // Case 2: Approaching deadline (0 <= diffDays <= 1)
      else if (diffDays <= 1) {
        for (const user of assignees) {
          // Check if notification already exists
          const link = `/projects/${task.projectId}?taskId=${task.id}&alert=approaching`;
          const existing = await prisma.notification.findFirst({
            where: {
              userId: user.id,
              type: 'TASK_DEADLINE_APPROACHING',
              link
            }
          });

          if (!existing) {
            await notificationService.createNotification({
              userId: user.id,
              type: 'TASK_DEADLINE_APPROACHING',
              title: `Nhiệm vụ sắp hết hạn!`,
              message: `Nhiệm vụ "${task.title}" của bạn còn chưa đầy 1 ngày để hoàn thành (Hạn chót: ${task.due}).`,
              link
            });
            console.log(`✉️ Sent TASK_DEADLINE_APPROACHING notification to ${user.name} for task: ${task.title}`);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error during deadline check:', error);
  }
}

function startDeadlineChecks() {
  // Run immediately on startup
  checkDeadlinesAndOverdue();

  // Run every 1 hour
  const intervalMs = 60 * 60 * 1000;
  setInterval(checkDeadlinesAndOverdue, intervalMs);
}

module.exports = {
  startDeadlineChecks,
  checkDeadlinesAndOverdue
};
