import { Request, Response } from 'express';
import * as taskService from '../services/task.service';

// GET /api/tasks?projectId=xxx   hoặc  GET /api/projects/:id/tasks
export async function getAll(req: Request, res: Response): Promise<void> {
  try {
    const projectId = (req.query.projectId ?? req.params.id) as string | undefined;
    const tasks = await taskService.getAllTasks(projectId);
    res.json(tasks);
  } catch (err) {
    console.error('[Task] getAll:', err);
    res.status(500).json({ error: 'Không thể lấy danh sách công việc' });
  }
}

// GET /api/tasks/:id
export async function getOne(req: Request, res: Response): Promise<void> {
  try {
    const task = await taskService.getTaskById(req.params.id);
    if (!task) {
      res.status(404).json({ error: 'Không tìm thấy công việc' });
      return;
    }
    res.json(task);
  } catch (err) {
    console.error('[Task] getOne:', err);
    res.status(500).json({ error: 'Không thể lấy thông tin công việc' });
  }
}

// POST /api/tasks
export async function create(req: Request, res: Response): Promise<void> {
  try {
    const { title, projectId } = req.body;
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Tiêu đề công việc không được để trống' });
      return;
    }
    if (!projectId || typeof projectId !== 'string') {
      res.status(400).json({ error: 'Thiếu projectId' });
      return;
    }
    const task = await taskService.createTask(req.body);
    res.status(201).json(task);
  } catch (err) {
    console.error('[Task] create:', err);
    res.status(500).json({ error: 'Không thể tạo công việc' });
  }
}

// PUT /api/tasks/:id
export async function update(req: Request, res: Response): Promise<void> {
  try {
    const task = await taskService.updateTask(req.params.id, req.body);
    res.json(task);
  } catch (err: unknown) {
    console.error('[Task] update:', err);
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy công việc' });
      return;
    }
    res.status(500).json({ error: 'Không thể cập nhật công việc' });
  }
}

// PATCH /api/tasks/:id/status
export async function updateStatus(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.body;
    if (!status) {
      res.status(400).json({ error: 'Thiếu trường status' });
      return;
    }
    const task = await taskService.updateTaskStatus(req.params.id, status);
    res.json(task);
  } catch (err: unknown) {
    console.error('[Task] updateStatus:', err);
    const msg = (err as Error).message;
    if (msg?.includes('không hợp lệ')) {
      res.status(400).json({ error: msg });
      return;
    }
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy công việc' });
      return;
    }
    res.status(500).json({ error: 'Không thể cập nhật trạng thái' });
  }
}

// DELETE /api/tasks/:id
export async function remove(req: Request, res: Response): Promise<void> {
  try {
    await taskService.deleteTask(req.params.id);
    res.json({ message: 'Đã xoá công việc' });
  } catch (err: unknown) {
    console.error('[Task] remove:', err);
    const code = (err as { code?: string }).code;
    if (code === 'P2025') {
      res.status(404).json({ error: 'Không tìm thấy công việc' });
      return;
    }
    res.status(500).json({ error: 'Không thể xoá công việc' });
  }
}
