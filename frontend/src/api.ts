// ─── API Service Layer ────────────────────────────────────────────────────────
// Tập trung tất cả HTTP calls đến backend Express server

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  createdAt?: string;
  updatedAt?: string;
  _count?: { tasks: number };
  members?: { id: string; name: string; email: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  projectId: string;
  assignee?: string;
  due?: string;
  priority?: string;
  summary?: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  assignees?: User[];
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeaders(),
    ...(init?.headers || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
      // Có thể xử lý logout ở đây nếu muốn
      localStorage.removeItem('token');
    }
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Đăng nhập thất bại');
  }
  const result = await res.json();
  localStorage.setItem('token', result.token);
  return result;
};

export const register = async (data: any) => {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'Đăng ký thất bại');
  }
  const result = await res.json();
  localStorage.setItem('token', result.token);
  return result;
};

export const getMe = () => request<any>('/api/auth/me');

// ─── Users ────────────────────────────────────────────────────────────────────

export const searchUsers = (q: string): Promise<User[]> =>
  request<User[]>(`/api/users/search?q=${encodeURIComponent(q)}`);

// ─── Projects ─────────────────────────────────────────────────────────────────

export const getProjects = (): Promise<Project[]> =>
  request<Project[]>('/api/projects');

export const getProject = (id: string): Promise<Project & { tasks: Task[] }> =>
  request(`/api/projects/${id}`);

export const createProject = (data: Partial<Project>): Promise<Project> =>
  request<Project>('/api/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateProject = (id: string, data: Partial<Project>): Promise<Project> =>
  request<Project>(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const deleteProject = (id: string): Promise<void> =>
  request<void>(`/api/projects/${id}`, { method: 'DELETE' });

export const addProjectMember = (projectId: string, userId: string): Promise<Project> =>
  request<Project>(`/api/projects/${projectId}/members`, {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });

export const removeProjectMember = (projectId: string, userId: string): Promise<Project> =>
  request<Project>(`/api/projects/${projectId}/members/${userId}`, {
    method: 'DELETE',
  });

// ─── Tasks ────────────────────────────────────────────────────────────────────

export const getTasks = (projectId?: string): Promise<Task[]> => {
  const qs = projectId ? `?projectId=${projectId}` : '';
  return request<Task[]>(`/api/tasks${qs}`);
};

export const getProjectTasks = (projectId: string): Promise<Task[]> =>
  request<Task[]>(`/api/projects/${projectId}/tasks`);

export const createTask = (data: Partial<Task>): Promise<Task> =>
  request<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const updateTask = (id: string, data: Partial<Task>): Promise<Task> =>
  request<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });

export const updateTaskStatus = (id: string, status: string): Promise<Task> =>
  request<Task>(`/api/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });

export const deleteTask = (id: string): Promise<void> =>
  request<void>(`/api/tasks/${id}`, { method: 'DELETE' });

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = (): Promise<{ status: string; timestamp: string }> =>
  request('/api/health');
