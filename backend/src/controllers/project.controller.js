const projectService = require('../services/project.service');

// GET /api/projects
async function getAll(req, res) {
  try {
    const projects = await projectService.getAllProjects(req.userId);
    res.json(projects);
  } catch (err) {
    console.error('[Project] getAll:', err.message);
    res.status(500).json({ error: 'Không thể lấy danh sách dự án' });
  }
}

// GET /api/projects/:id
async function getOne(req, res) {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Không tìm thấy dự án' });
    res.json(project);
  } catch (err) {
    console.error('[Project] getOne:', err.message);
    res.status(500).json({ error: 'Không thể lấy thông tin dự án' });
  }
}

// POST /api/projects
async function create(req, res) {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      return res.status(400).json({ error: 'Tên dự án không được để trống' });
    }
    const project = await projectService.createProject(req.body, req.userId);
    res.status(201).json(project);
  } catch (err) {
    console.error('[Project] create:', err.message);
    res.status(500).json({ error: 'Không thể tạo dự án' });
  }
}

// PUT /api/projects/:id
async function update(req, res) {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    console.error('[Project] update:', err.message);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy dự án' });
    res.status(500).json({ error: 'Không thể cập nhật dự án' });
  }
}

// DELETE /api/projects/:id
async function remove(req, res) {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ message: 'Đã xoá dự án' });
  } catch (err) {
    console.error('[Project] remove:', err.message);
    if (err.code === 'P2025') return res.status(404).json({ error: 'Không tìm thấy dự án' });
    res.status(500).json({ error: 'Không thể xoá dự án' });
  }
}

// POST /api/projects/:id/members
async function addMember(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Thiếu userId' });
    const project = await projectService.addMember(req.params.id, userId);
    res.json(project);
  } catch (err) {
    console.error('[Project] addMember:', err.message);
    res.status(500).json({ error: 'Không thể thêm thành viên' });
  }
}

// DELETE /api/projects/:id/members/:userId
async function removeMember(req, res) {
  try {
    const project = await projectService.removeMember(req.params.id, req.params.userId);
    res.json(project);
  } catch (err) {
    console.error('[Project] removeMember:', err.message);
    res.status(500).json({ error: 'Không thể xoá thành viên' });
  }
}

// POST /api/projects/:id/links
async function addLink(req, res) {
  try {
    const { title, url } = req.body;
    if (!title || !url) return res.status(400).json({ error: 'Thiếu tiêu đề hoặc URL' });
    const link = await projectService.addLink(req.params.id, { title, url });
    res.status(201).json(link);
  } catch (err) {
    console.error('[Project] addLink:', err.message);
    res.status(500).json({ error: 'Không thể thêm link' });
  }
}

// DELETE /api/projects/:id/links/:linkId
async function removeLink(req, res) {
  try {
    await projectService.removeLink(req.params.linkId);
    res.json({ message: 'Đã xoá link' });
  } catch (err) {
    console.error('[Project] removeLink:', err.message);
    res.status(500).json({ error: 'Không thể xoá link' });
  }
}

module.exports = { getAll, getOne, create, update, remove, addMember, removeMember, addLink, removeLink };
