import { request } from './index';

export interface DashboardStats {
  activeProjectsCount: number;
  completedTasksCount: number;
  expiringSoon: any[];
  totalProjects: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  return request<DashboardStats>('/api/dashboard/stats');
};
