// ─── API Service Layer ────────────────────────────────────────────────────────
// Tập trung tất cả HTTP calls đến backend Express server

const API_BASE = (import.meta.env as any).VITE_API_URL ?? 'http://localhost:3001';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ProjectLink {
  id: string;
  title: string;
  url: string;
  projectId: string;
  createdAt?: string;
  updatedAt?: string;
}

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
  links?: ProjectLink[];
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
  priority?: 'Low' | 'Medium' | 'High' | 'Very High';
  summary?: string;
  icon?: string;
  weight?: number; // Combined complexity score (2-10)
  createdAt?: string;
  updatedAt?: string;
  assignees?: User[];
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface TaskRecommendationsResponse {
  task: { 
    id: string; 
    title: string; 
    status?: string;
    priority?: string;
    weight?: number;
    complexityLevel?: string;
  };
  isOverdue: boolean;
  daysOverdue?: number;
  currentTaskWeight?: number;
  recommendations: TaskRecommendation[];
}

export interface TaskRecommendation {
  id: string;
  name: string;
  email: string;
  completedTasks: number;
  avgWeight: string;
  experienceBonus: number;
  availabilityScore: number;
  canHandleCurrentTask: boolean;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const authHeaders = getAuthHeaders();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Only add Authorization header if it exists
  if (authHeaders['Authorization']) {
    headers['Authorization'] = authHeaders['Authorization'];
  }

  if (init?.headers) {
    const initHeaders = init.headers as Record<string, string>;
    Object.keys(initHeaders).forEach(key => {
      headers[key] = initHeaders[key];
    });
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    if (res.status === 401) {
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

export const addProjectLink = (projectId: string, data: { title: string; url: string }): Promise<ProjectLink> =>
  request<ProjectLink>(`/api/projects/${projectId}/links`, {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const removeProjectLink = (projectId: string, linkId: string): Promise<void> =>
  request<void>(`/api/projects/${projectId}/links/${linkId}`, {
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

export interface TaskRecommendation {
  id: string;
  name: string;
  email: string;
  completedTasks: number;
  availabilityScore: number;
}

export interface TaskRecommendationsResponse {
  task: { id: string; title: string; status?: string };
  isOverdue: boolean;
  daysOverdue?: number;
  recommendations: TaskRecommendation[];
}

export const getTaskRecommendations = (taskId: string): Promise<TaskRecommendationsResponse> =>
  request<TaskRecommendationsResponse>(`/api/tasks/${taskId}/recommendations`);

// ─── Notifications ────────────────────────────────────────────────────────────

export const getNotifications = (): Promise<Notification[]> =>
  request<Notification[]>('/api/notifications');

export const markNotificationRead = (id: string): Promise<Notification> =>
  request<Notification>(`/api/notifications/${id}/read`, { method: 'PATCH' });

export const markAllNotificationsRead = (): Promise<void> =>
  request<void>('/api/notifications/mark-all-read', { method: 'POST' });

// ─── Health ───────────────────────────────────────────────────────────────────

export const checkHealth = (): Promise<{ status: string; timestamp: string }> =>
  request('/api/health');
