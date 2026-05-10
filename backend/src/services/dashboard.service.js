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

module.exports = {
  getDashboardStats
};
