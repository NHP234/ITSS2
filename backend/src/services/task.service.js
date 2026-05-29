const prisma = require('../prisma/client');
const { recalculateCompletion } = require('./project.service');
const notificationService = require('./notification.service');

const VALID_STATUSES = ['Not Started', 'In Progress', 'Reviewing', 'Done'];

// ─── Parse dueDate from a Vietnamese date string like "19 tháng 11, 2025" ─────
function parseDueDate(due) {
  if (!due || typeof due !== 'string') return null;
  const match = due.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/i);
  if (match) {
    const [_, day, month, year] = match;
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    d.setHours(23, 59, 59, 999); // end of day
    return d;
  }
  return null;
}

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

// ─── Lấy danh sách task quá hạn của user ─────────────────────────────────────
async function getOverdueTasks(userId) {
  const now = new Date();
  return prisma.task.findMany({
    where: {
      project: {
        members: { some: { id: userId } }
      },
      dueDate: { lt: now },
      status: { notIn: ['Done'] }
    },
    orderBy: { dueDate: 'asc' },
    include: {
      assignees: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, icon: true } }
    }
  });
}

// ─── Tạo task mới ─────────────────────────────────────────────────────────────
async function createTask(data) {
  const dueDate = parseDueDate(data.due);

  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      status: data.status ?? 'Not Started',
      projectId: data.projectId,
      assignee: data.assignee ?? '',
      due: data.due ?? '',
      dueDate: dueDate,
      priority: data.priority ?? '',
      summary: data.summary ?? '',
      icon: data.icon ?? 'calendar',
      weight: data.weight !== undefined ? parseFloat(data.weight) : 1,
      progress: data.progress !== undefined ? parseInt(data.progress) : 0,
      assignees: data.assigneeIds ? {
        connect: data.assigneeIds.map(id => ({ id }))
      } : undefined,
    },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });

  const sideEffects = [recalculateCompletion(task.projectId)];

  // Gửi thông báo cho những người được gán bằng batch insert
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const notifications = data.assigneeIds.map(userId => ({
      userId,
      type: 'ASSIGNED_TASK',
      title: 'Bạn được gán nhiệm vụ mới',
      message: `Bạn đã được gán nhiệm vụ: ${task.title}`,
      link: `/projects/${task.projectId}`
    }));
    sideEffects.push(notificationService.createManyNotifications(notifications));
  }

  await Promise.all(sideEffects);

  return task;
}

// ─── Cập nhật task ────────────────────────────────────────────────────────────
async function updateTask(id, data) {
  const updateData = {};
  if (data.title !== undefined)    updateData.title = data.title.trim();
  if (data.status !== undefined)   updateData.status = data.status;
  if (data.assignee !== undefined) updateData.assignee = data.assignee;
  if (data.priority !== undefined) updateData.priority = data.priority;
  if (data.summary !== undefined)  updateData.summary = data.summary;
  if (data.icon !== undefined)     updateData.icon = data.icon;
  if (data.weight !== undefined)   updateData.weight = parseFloat(data.weight);
  if (data.progress !== undefined) updateData.progress = parseInt(data.progress);
  if (data.due !== undefined) {
    updateData.due = data.due;
    updateData.dueDate = parseDueDate(data.due);
  }
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

  const sideEffects = [recalculateCompletion(task.projectId)];

  // Nếu status thay đổi, thông báo cho tất cả assignees bằng batch insert
  if (data.status !== undefined) {
    const assignees = task.assignees || [];
    if (assignees.length > 0) {
      const statusNotifications = assignees.map(user => ({
        userId: user.id,
        type: 'TASK_STATUS_CHANGE',
        title: 'Trạng thái nhiệm vụ thay đổi',
        message: `Nhiệm vụ "${task.title}" đã chuyển sang trạng thái: ${task.status}`,
        link: `/projects/${task.projectId}`
      }));
      sideEffects.push(notificationService.createManyNotifications(statusNotifications));
    }
  }

  // Nếu có thêm người mới được gán bằng batch insert
  if (data.assigneeIds !== undefined && data.assigneeIds.length > 0) {
    const assignNotifications = data.assigneeIds.map(userId => ({
      userId,
      type: 'ASSIGNED_TASK',
      title: 'Bạn được gán vào nhiệm vụ',
      message: `Bạn đã được gán vào nhiệm vụ: ${task.title}`,
      link: `/projects/${task.projectId}`
    }));
    sideEffects.push(notificationService.createManyNotifications(assignNotifications));
  }

  await Promise.all(sideEffects);

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

// ─── Cập nhật nhanh progress ─────────────────────────────────────────────────
async function updateTaskProgress(id, progress) {
  const val = parseInt(progress);
  if (isNaN(val) || val < 0 || val > 100) {
    const err = new Error('Progress phải là số nguyên từ 0 đến 100');
    err.statusCode = 400;
    throw err;
  }
  return prisma.task.update({
    where: { id },
    data: { progress: val },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
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
  getOverdueTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  updateTaskProgress,
  deleteTask,
};
