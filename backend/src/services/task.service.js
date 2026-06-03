const prisma = require('../prisma/client');
const { recalculateCompletion } = require('./project.service');
const notificationService = require('./notification.service');

const VALID_STATUSES = ['Not Started', 'In Progress', 'Done'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Very High'];

// Priority to weight mapping (0-10 scale)
function getPriorityWeight(priority) {
  switch (priority) {
    case 'Low': return 2;
    case 'Medium': return 4;
    case 'High': return 7;
    case 'Very High': return 10;
    default: return 4;
  }
}

// Difficulty to weight mapping (0-10 scale)
function getDifficultyWeight(difficulty) {
  switch (difficulty) {
    case 'Easy': return 2;
    case 'Medium': return 4;
    case 'Hard': return 7;
    case 'Very Hard': return 10;
    default: return 4;
  }
}

// Calculate total weight from priority and difficulty
function calculateTotalWeight(priority, difficulty) {
  const priorityWeight = getPriorityWeight(priority);
  const difficultyWeight = getDifficultyWeight(difficulty);
  // Average of priority and difficulty, range 2-10
  return Math.round((priorityWeight + difficultyWeight) / 2);
}

// Parse weight back to priority level (for display)
function getPriorityFromWeight(weight) {
  if (weight <= 3) return 'Low';
  if (weight <= 5) return 'Medium';
  if (weight <= 8) return 'High';
  return 'Very High';
}

// Parse weight back to difficulty level (for display)
function getDifficultyFromWeight(weight) {
  if (weight <= 3) return 'Easy';
  if (weight <= 5) return 'Medium';
  if (weight <= 8) return 'Hard';
  return 'Very Hard';
}

function parseDueDate(dueStr) {
  if (!dueStr) return null;
  // Format: "D tháng M, Y" (Vietnamese)
  const dateMatch = dueStr.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    return new Date(year, month - 1, day, 23, 59, 59); // End of day
  }
  const parsed = new Date(dueStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

// ─── Lấy tất cả tasks mà user có quyền xem ───────────────────────────────────
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
  // Calculate weight from priority and difficulty if provided
  let weight = data.weight !== undefined ? parseFloat(data.weight) : 4;
  
  if (data.priority && data.difficulty) {
    weight = calculateTotalWeight(data.priority, data.difficulty);
  } else if (data.priority) {
    weight = getPriorityWeight(data.priority);
  } else if (data.difficulty) {
    weight = getDifficultyWeight(data.difficulty);
  }

  // Validate priority if provided
  if (data.priority && !VALID_PRIORITIES.includes(data.priority)) {
    throw new Error(`Priority không hợp lệ. Phải là: ${VALID_PRIORITIES.join(', ')}`);
  }

  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      status: data.status ?? 'Not Started',
      projectId: data.projectId,
      assignee: data.assignee ?? '',
      due: data.due ?? '',
      dueDate: data.due ? parseDueDate(data.due) : null,
      priority: data.priority ?? 'Medium',
      summary: data.summary ?? '',
      icon: data.icon ?? 'calendar',
      weight: weight,
      assignees: data.assigneeIds ? {
        connect: data.assigneeIds.map(id => ({ id }))
      } : undefined,
    },
    include: { assignees: { select: { id: true, name: true, email: true } } },
  });

  const sideEffects = [recalculateCompletion(task.projectId)];

  // Gửi thông báo cho những người được gán
  if (data.assigneeIds && data.assigneeIds.length > 0) {
    const notifications = data.assigneeIds.map(userId => ({
      userId,
      type: 'ASSIGNED_TASK',
      title: 'Bạn được gán nhiệm vụ mới',
      message: `Bạn đã được gán nhiệm vụ: ${task.title} (${task.priority} priority, weight: ${task.weight})`,
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
  
  if (data.title !== undefined) updateData.title = data.title.trim();
  if (data.status !== undefined) updateData.status = data.status;
  if (data.assignee !== undefined) updateData.assignee = data.assignee;
  if (data.due !== undefined) {
    updateData.due = data.due;
    updateData.dueDate = data.due ? parseDueDate(data.due) : null;
  }
  if (data.priority !== undefined) {
    if (!VALID_PRIORITIES.includes(data.priority)) {
      throw new Error(`Priority không hợp lệ. Phải là: ${VALID_PRIORITIES.join(', ')}`);
    }
    updateData.priority = data.priority;
  }
  if (data.summary !== undefined) updateData.summary = data.summary;
  if (data.icon !== undefined) updateData.icon = data.icon;
  
  // Handle weight calculation
  if (data.weight !== undefined) {
    updateData.weight = parseFloat(data.weight);
  } else if (data.priority !== undefined || data.difficulty !== undefined) {
    // Recalculate weight based on priority and difficulty
    const currentTask = await prisma.task.findUnique({ where: { id } });
    const priority = data.priority || currentTask?.priority || 'Medium';
    const difficulty = data.difficulty || 'Medium'; // difficulty is not stored, just used for calculation
    updateData.weight = calculateTotalWeight(priority, difficulty);
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

  // Nếu status thay đổi, thông báo cho tất cả assignees
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

  // Nếu có thêm người mới được gán
  if (data.assigneeIds !== undefined && data.assigneeIds.length > 0) {
    const assignNotifications = data.assigneeIds.map(userId => ({
      userId,
      type: 'ASSIGNED_TASK',
      title: 'Bạn được gán vào nhiệm vụ',
      message: `Bạn đã được gán vào nhiệm vụ: ${task.title} (${task.priority} priority, weight: ${task.weight})`,
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

// ─── Lấy gợi ý những người có thể giúp đỡ task quá hạn ──────────────────────
async function getTaskRecommendations(taskId) {
  // Lấy thông tin task và project
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      project: {
        include: {
          members: { select: { id: true, name: true, email: true } },
          tasks: { include: { assignees: { select: { id: true } } } }
        }
      },
      assignees: { select: { id: true, name: true, email: true } }
    }
  });

  if (!task) {
    throw new Error('Không tìm thấy công việc');
  }

  // Kiểm tra xem task có quá hạn không
  if (!task.due) {
    return {
      task: { id: task.id, title: task.title },
      isOverdue: false,
      recommendations: []
    };
  }

  // Parse date string
  const dateMatch = task.due.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
  let dueDate;
  
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    dueDate = new Date(year, month - 1, day);
  } else {
    dueDate = new Date(task.due);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  const isOverdue = dueDate < today;

  if (!isOverdue) {
    return {
      task: { id: task.id, title: task.title },
      isOverdue: false,
      recommendations: []
    };
  }

  const currentAssigneeIds = task.assignees.map(a => a.id);
  const currentTaskWeight = task.weight || 4; // Weight is our combined complexity score

  const recommendations = [];

  for (const member of task.project.members) {
    if (currentAssigneeIds.includes(member.id)) {
      continue;
    }

    // Tìm tất cả tasks của người này trong project
    const memberTasks = task.project.tasks.filter(t =>
      t.assignees.some(a => a.id === member.id)
    );

    // Kiểm tra xem người này đã hoàn thành tất cả tasks chưa
    const allTasksCompleted = memberTasks.every(t => t.status === 'Done');

    if (!allTasksCompleted) {
      continue;
    }

    let totalWeight = 0;
    let experienceBonus = 0;
    
    if (memberTasks.length > 0) {
      for (const t of memberTasks) {
        const taskWeight = t.weight || 4;
        totalWeight += taskWeight;
        
        // Bonus for completing tasks with similar complexity
        const weightDiff = Math.abs(taskWeight - currentTaskWeight);
        if (weightDiff <= 2) {
          experienceBonus += 1; // Very similar complexity
        } else if (weightDiff <= 4) {
          experienceBonus += 0.5; // Somewhat similar
        }
      }
      
      // Average weight of completed tasks (2-10 range)
      const avgWeight = totalWeight / memberTasks.length;
      
      // Availability score (0-10)
      // Higher avgWeight = can handle complex tasks
      // experienceBonus rewards similar task experience
      let availabilityScore = (avgWeight / 10) * 8 + (experienceBonus * 0.5);
      availabilityScore = Math.min(10, availabilityScore);
      
      recommendations.push({
        id: member.id,
        name: member.name,
        email: member.email,
        completedTasks: memberTasks.length,
        avgWeight: avgWeight.toFixed(1),
        experienceBonus: experienceBonus,
        availabilityScore: parseFloat(availabilityScore.toFixed(1)),
        canHandleCurrentTask: avgWeight >= currentTaskWeight
      });
    } else {
      // No tasks completed - neutral score
      recommendations.push({
        id: member.id,
        name: member.name,
        email: member.email,
        completedTasks: 0,
        avgWeight: '0',
        experienceBonus: 0,
        availabilityScore: 3.0,
        canHandleCurrentTask: false
      });
    }
  }

  // Sắp xếp theo availabilityScore từ cao đến thấp
  recommendations.sort((a, b) => b.availabilityScore - a.availabilityScore);

  // Determine complexity level for display
  const getComplexityLevel = (weight) => {
    if (weight <= 3) return 'Low';
    if (weight <= 5) return 'Medium';
    if (weight <= 8) return 'High';
    return 'Very High';
  };

  return {
    task: { 
      id: task.id, 
      title: task.title, 
      status: task.status,
      priority: task.priority,
      weight: task.weight,
      complexityLevel: getComplexityLevel(task.weight)
    },
    isOverdue: true,
    daysOverdue: Math.floor((today - dueDate) / (1000 * 60 * 60 * 24)),
    currentTaskWeight: currentTaskWeight,
    recommendations: recommendations.slice(0, 5)
  };
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
  getTaskRecommendations,
  VALID_PRIORITIES,
  getPriorityWeight,
  getDifficultyWeight,
  calculateTotalWeight,
  getPriorityFromWeight,
  getDifficultyFromWeight,
};