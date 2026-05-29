const prisma = require('../prisma/client');

/**
 * Parses a Vietnamese date string like "19 tháng 11, 2025"
 */
function parseVietnameseDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/i);
  if (match) {
    const [_, day, month, year] = match;
    return new Date(year, month - 1, day);
  }
  return null;
}

/**
 * Extracts the end date from a range string like "17 tháng 9, 2025 → 19 tháng 11, 2025"
 */
function getEndDate(dates) {
  if (!dates) return null;
  const parts = dates.split('→');
  const endDateStr = parts[parts.length - 1].trim();
  return parseVietnameseDate(endDateStr);
}

async function getDashboardStats(userId) {
  const userProjectsFilter = {
    members: {
      some: { id: userId }
    }
  };

  const [activeProjectsCount, completedTasksCount, allProjects, totalProjects] = await Promise.all([
    prisma.project.count({
      where: {
        ...userProjectsFilter,
        NOT: { status: 'Done' }
      }
    }),
    prisma.task.count({
      where: {
        project: userProjectsFilter,
        status: 'Done'
      }
    }),
    prisma.project.findMany({
      where: {
        ...userProjectsFilter,
        NOT: { status: 'Done' }
      },
      orderBy: { updatedAt: 'desc' }
    }),
    prisma.project.count({
      where: userProjectsFilter
    })
  ]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  nextWeek.setHours(23, 59, 59, 999);

  const expiringSoon = allProjects
    .map(p => ({
      ...p,
      endDate: getEndDate(p.dates)
    }))
    .filter(p => p.endDate && p.endDate >= today && p.endDate <= nextWeek)
    .sort((a, b) => a.endDate - b.endDate);

  return {
    activeProjectsCount,
    completedTasksCount,
    expiringSoon,
    totalProjects,
  };
}

/**
 * Lấy thống kê đóng góp của từng thành viên trong các project của user
 */
async function getMemberContributions(userId) {
  // Lấy tất cả project mà user là thành viên
  const projects = await prisma.project.findMany({
    where: {
      members: { some: { id: userId } }
    },
    include: {
      members: { select: { id: true, name: true, email: true } },
      tasks: {
        include: {
          assignees: { select: { id: true, name: true, email: true } }
        }
      }
    }
  });

  const now = new Date();

  // Build per-project member contribution map
  const result = projects.map(project => {
    const memberStats = project.members.map(member => {
      const assignedTasks = project.tasks.filter(t =>
        t.assignees.some(a => a.id === member.id)
      );
      const doneTasks = assignedTasks.filter(t => t.status === 'Done');
      const overdueTasks = assignedTasks.filter(t => {
        if (t.status === 'Done') return false;
        // Check dueDate field first, fallback to due string
        if (t.dueDate) return new Date(t.dueDate) < now;
        return false;
      });
      const inProgressTasks = assignedTasks.filter(t => t.status === 'In Progress' || t.status === 'Reviewing');
      const completionRate = assignedTasks.length > 0
        ? Math.round((doneTasks.length / assignedTasks.length) * 100)
        : 0;

      return {
        member,
        totalAssigned: assignedTasks.length,
        done: doneTasks.length,
        overdue: overdueTasks.length,
        inProgress: inProgressTasks.length,
        completionRate,
      };
    });

    return {
      projectId: project.id,
      projectName: project.name,
      projectIcon: project.icon,
      members: memberStats,
    };
  });

  return result;
}

module.exports = {
  getDashboardStats,
  getMemberContributions,
};
