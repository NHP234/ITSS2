const prisma = require('../prisma/client');
const { recalculateCompletion } = require('./project.service');

const VALID_STATUSES = ['Not Started', 'In Progress', 'Done'];

// ─── Lấy tất cả tasks (tuỳ chọn filter theo projectId) ───────────────────────
async function getAllTasks(projectId) {
  return prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
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
      assignees: data.assigneeIds ? {
        connect: data.assigneeIds.map(id => ({ id }))
      } : undefined,
    },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });
  await recalculateCompletion(task.projectId);
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
