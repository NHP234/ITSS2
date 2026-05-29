const dashboardService = require('../services/dashboard.service');

async function getStats(req, res, next) {
  try {
    const stats = await dashboardService.getDashboardStats(req.userId);
    res.json(stats);
  } catch (error) {
    next(error);
  }
}

async function getContributions(req, res, next) {
  try {
    const data = await dashboardService.getMemberContributions(req.userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
  getContributions,
};
