import { prisma } from '../prisma/client';
import type { CreateProjectInput, UpdateProjectInput } from '../types';

// ─── Lấy tất cả projects (kèm số task) ────────────────────────────────────────
export async function getAllProjects() {
  return prisma.project.findMany({
    include: {
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ─── Lấy một project theo id (kèm tasks) ────────────────────────────────────────
export async function getProjectById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      tasks: { orderBy: { createdAt: 'asc' } },
      _count: { select: { tasks: true } },
    },
  });
}

// ─── Tạo project mới ────────────────────────────────────────────────────────────
export async function createProject(data: CreateProjectInput) {
  return prisma.project.create({
    data: {
      name: data.name.trim(),
      description: data.description ?? '',
      status: data.status ?? 'Planning',
      owner: data.owner ?? '',
      dates: data.dates ?? '',
      priority: data.priority ?? '',
      completion: data.completion ?? 0,
      blockedBy: data.blockedBy ?? '',
      icon: data.icon ?? '🎯',
    },
  });
}

// ─── Cập nhật project ────────────────────────────────────────────────────────────
export async function updateProject(id: string, data: UpdateProjectInput) {
  return prisma.project.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name.trim() }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.owner !== undefined && { owner: data.owner }),
      ...(data.dates !== undefined && { dates: data.dates }),
      ...(data.priority !== undefined && { priority: data.priority }),
      ...(data.completion !== undefined && { completion: data.completion }),
      ...(data.blockedBy !== undefined && { blockedBy: data.blockedBy }),
      ...(data.icon !== undefined && { icon: data.icon }),
    },
  });
}

// ─── Xoá project (và tất cả tasks) ────────────────────────────────────────────
export async function deleteProject(id: string) {
  await prisma.task.deleteMany({ where: { projectId: id } });
  return prisma.project.delete({ where: { id } });
}

// ─── Tính lại completion % sau khi task thay đổi ──────────────────────────────
export async function recalculateCompletion(projectId: string) {
  const tasks = await prisma.task.findMany({ where: { projectId } });
  if (tasks.length === 0) {
    return prisma.project.update({
      where: { id: projectId },
      data: { completion: 0 },
    });
  }
  const done = tasks.filter(t => t.status === 'Done').length;
  const completion = Math.round((done / tasks.length) * 10000) / 100;
  return prisma.project.update({
    where: { id: projectId },
    data: { completion },
  });
}
