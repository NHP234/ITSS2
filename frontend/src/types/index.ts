export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Project {
  id: string;
  name: string;
  status: string;
  owner: string;
  dates: string;
  icon: string;
  completion?: number;
  members?: User[];
}

export type TaskStatus = 'Not Started' | 'In Progress' | 'Done';

export interface Task {
  id: string;
  title: string;
  status: TaskStatus;
  projectId: string;
  assignee?: string;
  due?: string;
  priority?: string;
  summary?: string;
  icon?: string;
  assignees?: User[];
}
