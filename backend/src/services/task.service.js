const prisma = require('../prisma/client');
const { recalculateCompletion } = require('./project.service');
const notificationService = require('./notification.service');

const VALID_STATUSES = ['Not Started', 'In Progress', 'Done'];

// ─── Lấy tất cả tasks mà user có quyền xem (tuỳ chọn filter theo projectId) ──
async function getAllTasks(projectId, userId) {
  return prisma.task.findMany({
    where: {
      projectId: projectId || undefined,
      project: {
        members: {
          some: { id: userId }
        }
      }
    },
    orderBy: { createdAt: 'asc' },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
}

// ─── Lấy tasks theo project ───────────────────────────────────────────────────
async function getTasksByProject(projectId) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
}

// ─── Lấy một task theo id ─────────────────────────────────────────────────────
async function getTaskById(id) {
  return prisma.task.findUnique({
    where: { id },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
}

// ─── Tạo task mới ─────────────────────────────────────────────────────────────
async function createTask(data) {
  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      status: data.status ?? 'Not Started',
      projectId: data.projectId,
      assignee: data.assignee ?? '',
      due: data.due ?? '',
      priority: data.priority ?? '',
      summary: data.summary ?? '',
      icon: data.icon ?? 'calendar',
      weight: data.weight !== undefined ? parseFloat(data.weight) : 1,
      assignees: data.assigneeIds ? {
        connect: data.assigneeIds.map(id => ({ id }))
      } : undefined,
    },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
  await recalculateCompletion(task.projectId);

  // Gửi thông báo cho những người được gán
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    for (const userId of data.assigneeIds) {
      await notificationService.createNotification({
        userId,
        type: 'ASSIGNED_TASK',
        title: 'Bạn được gán nhiệm vụ mới',
        message: `Bạn đã được gán nhiệm vụ: ${task.title}`,
        link: `/projects/${task.projectId}`
      });
    }
  }

  return task;
}

// ─── Cập nhật task ────────────────────────────────────────────────────────────
async function updateTask(id, data) {
  const updateData = {};
  if (data.title !== undefined)    updateData.title = data.title.trim();
  if (data.status !== undefined)   updateData.status = data.status;
  if (data.assignee !== undefined) updateData.assignee = data.assignee;
  if (data.due !== undefined)      updateData.due = data.due;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.summary !== undefined)  updateData.summary = data.summary;
  if (data.icon !== undefined)     updateData.icon = data.icon;
  if (data.weight !== undefined)   updateData.weight = parseFloat(data.weight);
  if (data.assigneeIds !== undefined) {
    updateData.assignees = {
      set: data.assigneeIds.map(id => ({ id }))
    };
  }

  const task = await prisma.task.update({
    where: { id },
    data: updateData,
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
  await recalculateCompletion(task.projectId);

  // Nếu status thay đổi, thông báo cho tất cả assignees
  if (data.status !== undefined) {
    const assignees = task.assignees || [];
    for (const user of assignees) {
      await notificationService.createNotification({
        userId: user.id,
        type: 'TASK_STATUS_CHANGE',
        title: 'Trạng thái nhiệm vụ thay đổi',
        message: `Nhiệm vụ "${task.title}" đã chuyển sang trạng thái: ${task.status}`,
        link: `/projects/${task.projectId}`
      });
    }
  }

  // Nếu có thêm người mới được gán
  if (data.assigneeIds !== undefined) {
    for (const userId of data.assigneeIds) {
      await notificationService.createNotification({
        userId,
        type: 'ASSIGNED_TASK',
        title: 'Bạn được gán vào nhiệm vụ',
        message: `Bạn đã được gán vào nhiệm vụ: ${task.title}`,
        link: `/projects/${task.projectId}`
      });
    }
  }

  return task;
}

// ─── Cập nhật nhanh status ───────────────────────────────────────────────────
async function updateTaskStatus(id, status) {
  if (!VALID_STATUSES.includes(status)) {
    const err = new Error(`Status không hợp lệ. Phải là: ${VALID_STATUSES.join(', ')}`);
    err.statusCode = 400;
    throw err;
  }
  const task = await prisma.task.update({
    where: { id },
    data: { status },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
  await recalculateCompletion(task.projectId);
  return task;
}

// ─── Xoá task ─────────────────────────────────────────────────────────────────
async function deleteTask(id) {
  const task = await prisma.task.delete({ where: { id } });
  await recalculateCompletion(task.projectId);
  return task;
}

module.exports = {
  getAllTasks,
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
