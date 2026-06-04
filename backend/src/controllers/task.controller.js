const taskService = require('../services/task.service');
const projectService = require('../services/project.service');
const prisma = require('../prisma/client');

async function verifyTaskAccess(taskId, userId) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true }
  });
  if (!task) {
    const err = new Error('Không tìm thấy công việc');
    err.statusCode = 404;
    throw err;
  }
  await projectService.checkProjectMembership(task.projectId, userId);
  return task;
}

// GET /api/tasks?projectId=xxx  hoặc  GET /api/projects/:id/tasks
async function getAll(req, res) {
  try {
    const projectId = req.query.projectId ?? req.params.id;
    if (projectId) {
      await projectService.checkProjectMembership(projectId, req.userId);
    }
    const tasks = await taskService.getAllTasks(projectId, req.userId);
    res.json(tasks);
  } catch (err) {
    console.error('[Task] getAll:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Không thể lấy danh sách công việc' });
  }
}

// GET /api/tasks/overdue
async function getOverdue(req, res) {
  try {
    const tasks = await taskService.getOverdueTasks(req.userId);
    res.json(tasks);
  } catch (err) {
    console.error('[Task] getOverdue:', err.message);
    res.status(500).json({ error: 'Không thể lấy danh sách công việc quá hạn' });
  }
}

// GET /api/tasks/:id
async function getOne(req, res) {
  try {
    await verifyTaskAccess(req.params.id, req.userId);
    const task = await taskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.json(task);
  } catch (err) {
    console.error('[Task] getOne:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    res.status(500).json({ error: 'Không thể lấy thông tin công việc' });
  }
}

// POST /api/tasks
async function create(req, res) {
  try {
    const { title, projectId } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ error: 'Tiêu đề công việc không được để trống' });
    }
    if (!projectId || typeof projectId !== 'string') {
      return res.status(400).json({ error: 'Thiếu projectId' });
    }
    await projectService.checkProjectMembership(projectId, req.userId);
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error('[Task] create:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    res.status(500).json({ error: 'Không thể tạo công việc' });
  }
}

// PUT /api/tasks/:id
async function update(req, res) {
  try {
    await verifyTaskAccess(req.params.id, req.userId);
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    console.error('[Task] update:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể cập nhật công việc' });
  }
}

// PATCH /api/tasks/:id/status
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu trường status' });
    await verifyTaskAccess(req.params.id, req.userId);
    const task = await taskService.updateTaskStatus(req.params.id, status);
    res.json(task);
  } catch (err) {
    console.error('[Task] updateStatus:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
  }
}

// PATCH /api/tasks/:id/progress
async function updateProgress(req, res) {
  try {
    const { progress } = req.body;
    if (progress === undefined) return res.status(400).json({ error: 'Thiếu trường progress' });
    await verifyTaskAccess(req.params.id, req.userId);
    const task = await taskService.updateTaskProgress(req.params.id, progress);
    res.json(task);
  } catch (err) {
    console.error('[Task] updateProgress:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể cập nhật tiến độ' });
  }
}

// DELETE /api/tasks/:id
async function remove(req, res) {
  try {
    await verifyTaskAccess(req.params.id, req.userId);
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Đã xoá công việc' });
  } catch (err) {
    console.error('[Task] remove:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể xoá công việc' });
  }
}

// GET /api/tasks/:id/recommendations
async function getRecommendations(req, res) {
  try {
    await verifyTaskAccess(req.params.id, req.userId);
    const recommendations = await taskService.getTaskRecommendations(req.params.id);
    res.json(recommendations);
  } catch (err) {
    console.error('[Task] getRecommendations:', err.message);
    if (err.statusCode === 403) return res.status(403).json({ error: err.message });
    if (err.statusCode === 404) return res.status(404).json({ error: err.message });
    if (err.message.includes('Không tìm thấy')) {
      return res.status(404).json({ error: 'Không tìm thấy công việc' });
    }
    res.status(500).json({ error: 'Không thể lấy gợi ý' });
  }
}

module.exports = { getAll, getOverdue, getOne, create, update, updateStatus, updateProgress, remove, getRecommendations };
