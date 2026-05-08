import { prisma } from '../prisma/client';
import { recalculateCompletion } from './project.service';
import type { CreateTaskInput, UpdateTaskInput, TaskStatus } from '../types';

const VALID_STATUSES: TaskStatus[] = ['Not Started', 'In Progress', 'Done'];

// ─── Lấy tất cả tasks (tuỳ chọn filter theo projectId) ────────────────────────
export async function getAllTasks(projectId?: string) {
  return prisma.task.findMany({
    where: projectId ? { projectId } : undefined,
    orderBy: { createdAt: 'asc' },
  });
}

// ─── Lấy tasks theo project ────────────────────────────────────────────────────
export async function getTasksByProject(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: 'asc' },
  });
}

// ─── Lấy một task theo id ──────────────────────────────────────────────────────
export async function getTaskById(id: string) {
  return prisma.task.findUnique({ where: { id } });
}

// ─── Tạo task mới ─────────────────────────────────────────────────────────────
export async function createTask(data: CreateTaskInput) {
  const task = await prisma.task.create({
    data: {
      title: data.title.trim(),
      status: data.status ?? 'Not Started',
      projectId: data.projectId,
      assignee: data.assignee ?? '',
      due: data.due ?? '',
      priority: data.priority ?? '',
      summary: data.summary ?? '',
      icon: data.icon ?? 'calendar',
    },
  });
  await recalculateCompletion(task.projectId);
  return task;
}

// ─── Cập nhật task ─────────────────────────────────────────────────────────────
export async function updateTask(id: string, data: UpdateTaskInput) {
  const task = await prisma.task.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title.trim() }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.assignee !== undefined && { assignee: data.assignee }),
      ...(data.due !== undefined && { due: data.due }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.summary !== undefined && { summary: data.summary }),
      ...(data.icon !== undefined && { icon: data.icon }),
    },
  });
  await recalculateCompletion(task.projectId);
  return task;
}

// ─── Cập nhật nhanh status ─────────────────────────────────────────────────────
export async function updateTaskStatus(id: string, status: string) {
  if (!VALID_STATUSES.includes(status as TaskStatus)) {
    throw new Error(`Status không hợp lệ. Phải là: ${VALID_STATUSES.join(', ')}`);
  }
  const task = await prisma.task.update({
    where: { id },
    data: { status },
  });
  await recalculateCompletion(task.projectId);
  return task;
}

// ─── Xoá task ──────────────────────────────────────────────────────────────────
export async function deleteTask(id: string) {
  const task = await prisma.task.delete({ where: { id } });
  await recalculateCompletion(task.projectId);
  return task;
}
