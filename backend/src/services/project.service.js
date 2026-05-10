const prisma = require('../prisma/client');
const notificationService = require('./notification.service');

// ─── Lấy tất cả projects mà user là thành viên (kèm số lượng tasks) ──────────
async function getAllProjects(userId) {
  return prisma.project.findMany({
    where: {
      members: {
        some: { id: userId }
      }
    },
    include: {
      _count: { select: { tasks: true } },
      members: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Lấy một project theo id (kèm tasks) ──────────────────────────────────────
async function getProjectById(id) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: 'asc' } },
      _count: { select: { tasks: true } },
      members: { select: { id: true, name: true, email: true } },
    },
  });
}

// ─── Tạo project mới ──────────────────────────────────────────────────────────
async function createProject(data, creatorId) {
  const memberIds = data.memberIds || [];
  // Đảm bảo người tạo luôn là thành viên
  if (creatorId && !memberIds.includes(creatorId)) {
    memberIds.push(creatorId);
  }

  return prisma.project.create({
    data: {
      name: data.name.trim(),
      description: data.description ?? '',
      status: data.status ?? 'Planning',
      owner: data.owner ?? '',
      dates: data.dates ?? '',
      priority: data.priority ?? '',
      completion: data.completion ?? 0,
      blockedBy: data.blockedBy ?? '',
      icon: data.icon ?? '🎯',
      members: {
        connect: memberIds.map(id => ({ id }))
      },
    },
    include: { members: { select: { id: true, name: true, email: true } } },
  });
}

// ─── Cập nhật project ─────────────────────────────────────────────────────────
async function updateProject(id, data) {
  const updateData = {};
  if (data.name !== undefined)        updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description;
  if (data.status !== undefined)      updateData.status = data.status;
  if (data.owner !== undefined)       updateData.owner = data.owner;
  if (data.dates !== undefined)       updateData.dates = data.dates;
  if (data.priority !== undefined)    updateData.priority = data.priority;
  if (data.completion !== undefined)  updateData.completion = data.completion;
  if (data.blockedBy !== undefined)   updateData.blockedBy = data.blockedBy;
  if (data.icon !== undefined)        updateData.icon = data.icon;

  return prisma.project.update({ where: { id }, data: updateData });
}

// ─── Xoá project (và tất cả tasks) ───────────────────────────────────────────
async function deleteProject(id) {
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}

// ─── Tính lại completion % sau khi task thay đổi ─────────────────────────────
async function recalculateCompletion(projectId) {
  const tasks = await prisma.task.findMany({ where: { projectId } });
  
  if (tasks.length === 0) {
    return prisma.project.update({
      where: { id: projectId },
      data: { completion: 0 },
    });
  }

  const totalWeight = tasks.reduce((sum, task) => sum + (task.weight || 1), 0);
  const doneWeight = tasks.filter(t => t.status === 'Done').reduce((sum, task) => sum + (task.weight || 1), 0);
  
  const completion = totalWeight === 0 
    ? 0 
    : Math.round((doneWeight / totalWeight) * 10000) / 100;

  return prisma.project.update({
    where: { id: projectId },
    data: { completion },
  });
}

// ─── Thêm thành viên ──────────────────────────────────────────────────────────
async function addMember(projectId, userId) {
  const result = await prisma.project.update({
    where: { id: projectId },
    data: { members: { connect: { id: userId } } },
    include: { members: { select: { id: true, name: true, email: true } } },
  });

  // Thông báo cho thành viên mới
  await notificationService.createNotification({
    userId,
    type: 'PROJECT_MEMBER_ADD',
    title: 'Bạn đã được thêm vào dự án mới',
    message: `Bạn đã được thêm vào dự án: ${result.name}`,
    link: `/projects/${projectId}`
  });

  return result;
}

// ─── Xoá thành viên ───────────────────────────────────────────────────────────
async function removeMember(projectId, userId) {
  return prisma.project.update({
    where: { id: projectId },
    data: { members: { disconnect: { id: userId } } },
    include: { members: { select: { id: true, name: true, email: true } } },
  });
}

module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  recalculateCompletion,
  addMember,
  removeMember,
};
