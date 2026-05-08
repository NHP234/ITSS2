const prisma = require('../prisma/client');

// ─── Lấy tất cả projects (kèm số lượng tasks) ─────────────────────────────────
async function getAllProjects() {
  return prisma.project.findMany({
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
async function createProject(data) {
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
      members: data.memberIds ? {
        connect: data.memberIds.map(id => ({ id }))
      } : undefined,
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
  const completion = tasks.length === 0
    ? 0
    : Math.round((tasks.filter(t => t.status === 'Done').length / tasks.length) * 10000) / 100;

  return prisma.project.update({
    where: { id: projectId },
    data: { completion },
  });
}

// ─── Thêm thành viên ──────────────────────────────────────────────────────────
async function addMember(projectId, userId) {
  return prisma.project.update({
    where: { id: projectId },
    data: { members: { connect: { id: userId } } },
    include: { members: { select: { id: true, name: true, email: true } } },
  });
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
