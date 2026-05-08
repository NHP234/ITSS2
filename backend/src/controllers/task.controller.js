const taskService = require('../services/task.service');

// GET /api/tasks?projectId=xxx  hoặc  GET /api/projects/:id/tasks
async function getAll(req, res) {
  try {
    const projectId = req.query.projectId ?? req.params.id;
    const tasks = await taskService.getAllTasks(projectId);
    res.json(tasks);
  } catch (err) {
    console.error('[Task] getAll:', err.message);
    res.status(500).json({ error: 'Không thể lấy danh sách công việc' });
  }
}

// GET /api/tasks/:id
async function getOne(req, res) {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.json(task);
  } catch (err) {
    console.error('[Task] getOne:', err.message);
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
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error('[Task] create:', err.message);
    res.status(500).json({ error: 'Không thể tạo công việc' });
  }
}

// PUT /api/tasks/:id
async function update(req, res) {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err) {
    console.error('[Task] update:', err.message);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể cập nhật công việc' });
  }
}

// PATCH /api/tasks/:id/status
async function updateStatus(req, res) {
  try {
    const { status } = req.body;
    if (!status) return res.status(400).json({ error: 'Thiếu trường status' });

    const task = await taskService.updateTaskStatus(req.params.id, status);
    res.json(task);
  } catch (err) {
    console.error('[Task] updateStatus:', err.message);
    if (err.statusCode === 400) return res.status(400).json({ error: err.message });
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
  }
}

// DELETE /api/tasks/:id
async function remove(req, res) {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Đã xoá công việc' });
  } catch (err) {
    console.error('[Task] remove:', err.message);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy công việc' });
    res.status(500).json({ error: 'Không thể xoá công việc' });
  }
}

module.exports = { getAll, getOne, create, update, updateStatus, remove };
