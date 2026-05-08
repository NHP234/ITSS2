export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  owner: string;
  dates: string;
  priority: string;
  completion: number;
  blockedBy: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  status: string;
  projectId: string;
  assignee: string;
  due: string;
  priority: string;
  summary: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

export type CreateProjectInput = {
  name: string;
  description?: string;
  status?: string;
  owner?: string;
  dates?: string;
  priority?: string;
  completion?: number;
  blockedBy?: string;
  icon?: string;
};

export type UpdateProjectInput = Partial<CreateProjectInput>;

export type CreateTaskInput = {
  title: string;
  projectId: string;
  status?: string;
  assignee?: string;
  due?: string;
  priority?: string;
  summary?: string;
  icon?: string;
};

export type UpdateTaskInput = Partial<Omit<CreateTaskInput, 'projectId'>>;

export type TaskStatus = 'Not Started' | 'In Progress' | 'Done';

export interface ApiError {
  error: string;
  details?: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  message?: string;
}
