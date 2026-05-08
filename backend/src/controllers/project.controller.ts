import { Request, Response } from 'express';
import * as projectService from '../services/project.service';

// GET /api/projects
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    console.error('[Project] getAll:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách dự án' });
  }
}

// GET /api/projects/:id
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) {
      res.status(404).json({ error: 'Không tìm thấy dự án' });
      return;
    }
    res.json(project);
  } catch (err) {
    console.error('[Project] getOne:', err);
    res.status(500).json({ error: 'Không thể lấy thông tin dự án' });
  }
}

// POST /api/projects
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Tên dự án không được để trống' });
      return;
    }
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    console.error('[Project] create:', err);
    res.status(500).json({ error: 'Không thể tạo dự án' });
  }
}

// PUT /api/projects/:id
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err: unknown) {
    console.error('[Project] update:', err);
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy dự án' });
      return;
    }
    res.status(500).json({ error: 'Không thể cập nhật dự án' });
  }
}

// DELETE /api/projects/:id
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await projectService.deleteProject(req.params.id);
    res.json({ message: 'Đã xoá dự án' });
  } catch (err: unknown) {
    console.error('[Project] remove:', err);
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy dự án' });
      return;
    }
    res.status(500).json({ error: 'Không thể xoá dự án' });
  }
}
