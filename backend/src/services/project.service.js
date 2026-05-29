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
      links: true,
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
      links: true,
    },
  });
}

// Helper function to parse Vietnamese date range
function parseDateRange(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split(' → ');
  
  const parseSingle = (s) => {
    const match = s.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
    if (match) {
      return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
    }
    return null;
  };

  const start = parseSingle(parts[0]);
  const end = parts[1] ? parseSingle(parts[1]) : start;
  
  if (!start) return null;
  return { start, end: end || start };
}

// ─── Tạo project mới ──────────────────────────────────────────────────────────
async function createProject(data, creatorId) {
  const memberIds = data.memberIds || [];
  // Đảm bảo người tạo luôn là thành viên
  if (creatorId && !memberIds.includes(creatorId)) {
    memberIds.push(creatorId);
  }

  // Parse dates to determine initial status
  let initialStatus = 'Planning';
  if (data.dates) {
    const dateInfo = parseDateRange(data.dates);
    if (dateInfo && dateInfo.start <= new Date()) {
      initialStatus = 'In Progress';
    }
  }

  return prisma.project.create({
    data: {
      name: data.name.trim(),
      description: data.description ?? '',
      status: initialStatus,
      owner: data.owner ?? '',
      dates: data.dates ?? '',
      priority: data.priority ?? '',
      completion: data.completion ?? 0,
      blockedBy: data.blockedBy ?? '',
      icon: data.icon ?? '🎯',  // ✅ This is correct
      members: {
        connect: memberIds.map(id => ({ id }))
      },
    },
    include: { members: { select: { id: true, name: true, email: true } } },
  });
}

// ─── Cập nhật project với auto-status based on dates ─────────────────────────
async function updateProject(id, data) {
  const updateData = {};
  if (data.name !== undefined)        updateData.name = data.name.trim();
  if (data.description !== undefined) updateData.description = data.description;
  if (data.owner !== undefined)       updateData.owner = data.owner;
  if (data.dates !== undefined)       updateData.dates = data.dates;
  if (data.priority !== undefined)    updateData.priority = data.priority;
  if (data.completion !== undefined)  updateData.completion = data.completion;
  if (data.blockedBy !== undefined)   updateData.blockedBy = data.blockedBy;
  if (data.icon !== undefined)        updateData.icon = data.icon;
  
  // Handle status updates - only allow manual status if explicitly provided
  if (data.status !== undefined) {
    updateData.status = data.status;
  } else if (data.dates !== undefined) {
    // Auto-update status based on dates if no manual status provided
    const dateInfo = parseDateRange(data.dates);
    if (dateInfo && dateInfo.start <= new Date()) {
      updateData.status = 'In Progress';
    }
  }

  return prisma.project.update({ 
    where: { id }, 
    data: updateData,
    include: {
      links: true,
      members: { select: { id: true, name: true, email: true } },
    }
  });
}

// Function to update project status based on current date (called periodically)
async function updateProjectStatusByDate(projectId) {
  const project = await prisma.project.findUnique({
    where: { id },
    select: { dates: true, status: true }
  });
  
  if (!project || project.status === 'Finished') return;
  
  const dateInfo = parseDateRange(project.dates);
  if (dateInfo && dateInfo.start <= new Date() && project.status === 'Planning') {
    return prisma.project.update({
      where: { id: projectId },
      data: { status: 'In Progress' }
    });
  }
  
  return null;
}

// ─── Xoá project (và tất cả tasks) ───────────────────────────────────────────
async function deleteProject(id) {
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}

// ─── Tính lại completion % sau khi task thay đổi ─────────────────────────────
async function recalculateCompletion(projectId) {
  // Sử dụng aggregation để tính toán trực tiếp trên CSDL
  const result = await prisma.task.groupBy({
    by: ['status'],
    where: { projectId },
    _sum: {
      weight: true
    }
  });

  if (result.length === 0) {
    return prisma.project.update({
      where: { id: projectId },
      data: { completion: 0 },
    });
  }

  let totalWeight = 0;
  let doneWeight = 0;

  result.forEach(group => {
    const weight = group._sum.weight || 0;
    totalWeight += weight;
    if (group.status === 'Done') {
      doneWeight += weight;
    }
  });

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

  // Thông báo cho thành viên mới (chạy ngầm không block luồng trả về)
  notificationService.createNotification({
    userId,
    type: 'PROJECT_MEMBER_ADD',
    title: 'Bạn đã được thêm vào dự án mới',
    message: `Bạn đã được thêm vào dự án: ${result.name}`,
    link: `/projects/${projectId}`
  }).catch(err => console.error('[Notification] Error:', err.message));

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

// ─── Thêm Link ────────────────────────────────────────────────────────────────
async function addLink(projectId, data) {
  return prisma.projectLink.create({
    data: {
      title: data.title,
      url: data.url,
      projectId: projectId
    }
  });
}

// ─── Xoá Link ─────────────────────────────────────────────────────────────────
async function removeLink(linkId) {
  return prisma.projectLink.delete({
    where: { id: linkId }
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
  addLink,
  removeLink,
  updateProjectStatusByDate, // Add this
};
