import { useState, useEffect, useCallback } from 'react';
import { ProjectList } from '../pages/ProjectList';
import { TaskView } from '../pages/TaskView';
import { CreateProjectDialog } from '../components/project/CreateProjectDialog';
import { CreateTaskDialog } from '../components/task/CreateTaskDialog';
import { Sidebar } from '../components/common/Sidebar';
import { Home } from '../pages/Home';
import { AllTasksView } from '../pages/AllTasksView';
import { NotificationView } from '../pages/NotificationView';
import { Login } from '../pages/Login';
import {
  type Project,
  type Task,
  getProjects,
  getTasks,
  createProject,
  updateProject,
  deleteProject,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getMe,
} from '../api';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [currentProjectIdForTask, setCurrentProjectIdForTask] = useState<string | null>(null);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>('Not Started');

  // ─── Fetch initial data ──────────────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }
      
      const userData = await getMe();
      setUser(userData);
      setIsAuthenticated(true);

      const [projectsData, tasksData] = await Promise.all([
        getProjects(),
        getTasks(),
      ]);
      setProjects(projectsData);
      setTasks(tasksData);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu:', err);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ─── Project handlers ────────────────────────────────────────────────────────
  const handleUpdateProject = async (projectId: string, updates: Partial<Project>) => {
    try {
      const updated = await updateProject(projectId, updates);
      setProjects(prev => prev.map(p => p.id === projectId ? { ...p, ...updated } : p));
    } catch (err) {
      console.error('Lỗi cập nhật dự án:', err);
    }
  };

  const handleCreateProject = async (data: any) => {
    try {
      await createProject({
        ...data,
        status: 'Planning',
        owner: user?.name || '',
        priority: '',
        completion: 0,
        blockedBy: '',
        icon: '🎯',
      });
      const projectsData = await getProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error('Lỗi tạo dự án:', err);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá dự án này và tất cả nhiệm vụ liên quan?')) return;
    try {
      await deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setTasks(prev => prev.filter(t => t.projectId !== projectId));
      if (selectedProjectId === projectId) setSelectedProjectId(null);
    } catch (err) {
      console.error('Lỗi xoá dự án:', err);
    }
  };

  const handleAddLink = async (projectId: string, title: string, url: string) => {
    try {
      const { addProjectLink } = await import('../api');
      const newLink = await addProjectLink(projectId, { title, url });
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, links: [...(p.links || []), newLink] } : p
      ));
    } catch (err) {
      console.error('Lỗi thêm link:', err);
    }
  };
  
  const handleRemoveLink = async (projectId: string, linkId: string) => {
    try {
      const { removeProjectLink } = await import('../api');
      await removeProjectLink(projectId, linkId);
      setProjects(prev => prev.map(p => 
        p.id === projectId ? { ...p, links: (p.links || []).filter(l => l.id !== linkId) } : p
      ));
    } catch (err) {
      console.error('Lỗi xoá link:', err);
    }
  };

  // ─── Task handlers ───────────────────────────────────────────────────────────
  const handleCreateTask = (projectId: string, status: string) => {
    setCurrentProjectIdForTask(projectId);
    setCurrentTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleAddTask = async (data: any) => {
    if (!currentProjectIdForTask) return;
    try {
      const newTask = await createTask({
        ...data,
        projectId: currentProjectIdForTask,
      });
      setTasks(prev => [...prev, newTask]);
      const { getProject } = await import('../api');
      const updatedProject = await getProject(currentProjectIdForTask);
      setProjects(prev =>
        prev.map(p => p.id === currentProjectIdForTask ? { ...p, completion: updatedProject.completion } : p)
      );
    } catch (err) {
      console.error('Lỗi tạo công việc:', err);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      const updated = await updateTaskStatus(taskId, status);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: updated.status } : t));
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        const { getProject } = await import('../api');
        const updatedProject = await getProject(task.projectId);
        setProjects(prev =>
          prev.map(p => p.id === task.projectId ? { ...p, completion: updatedProject.completion } : p)
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
    }
  };

  const handleUpdateTask = async (taskId: string, updates: Partial<Task>) => {
    try {
      const updated = await updateTask(taskId, updates);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updated } : t));
      if (updates.weight !== undefined || updates.status !== undefined) {
        const { getProject } = await import('../api');
        const updatedProject = await getProject(updated.projectId);
        setProjects(prev =>
          prev.map(p => p.id === updated.projectId ? { ...p, completion: updatedProject.completion } : p)
        );
      }
    } catch (err) {
      console.error('Lỗi cập nhật công việc:', err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      await deleteTask(taskId);
      setTasks(prev => prev.filter(t => t.id !== taskId));
      if (task) {
        const { getProject } = await import('../api');
        const updatedProject = await getProject(task.projectId);
        setProjects(prev =>
          prev.map(p => p.id === task.projectId ? { ...p, completion: updatedProject.completion } : p)
        );
      }
    } catch (err) {
      console.error('Lỗi xoá công việc:', err);
    }
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : [];

  if (loading) {
    return (
      <div className="flex h-screen w-full bg-[#191919] items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Đang kết nối đến server...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLoginSuccess={fetchAll} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#191919] overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'logout') {
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          return;
        }
        setActiveTab(tab);
        setSelectedProjectId(null);
      }} />
      <div className="flex-1 h-full overflow-y-auto relative bg-[#191919]">
        {activeTab === 'home' && (
          <Home 
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setActiveTab('projects');
            }} 
            onTabChange={setActiveTab} 
          />
        )}

        {activeTab === 'projects' && (
          selectedProject ? (
            <TaskView
              project={selectedProject}
              tasks={projectTasks}
              onBack={() => setSelectedProjectId(null)}
              onCreateTask={handleCreateTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onUpdateTask={handleUpdateTask}
              onDeleteTask={handleDeleteTask}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onAddLink={handleAddLink}
              onRemoveLink={handleRemoveLink}
            />
          ) : (
            <ProjectList
              projects={projects}
              onSelectProject={setSelectedProjectId}
              onCreateProject={() => setIsCreateProjectOpen(true)}
              onDeleteProject={handleDeleteProject}
              selectedProjectId={selectedProjectId}
            />
          )
        )}

        {activeTab === 'tasks' && (
          <AllTasksView
            projects={projects}
            tasks={tasks}
            onUpdateTask={handleUpdateTask}
            onCreateTask={handleCreateTask}
            onDeleteTask={handleDeleteTask}
            onSelectProject={(id) => {
              setSelectedProjectId(id);
              setActiveTab('projects');
            }}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationView />
        )}

        {(activeTab === 'account' || activeTab === 'settings') && (
          <div className="flex-1 flex items-center justify-center bg-[#191919] text-gray-500">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-300 mb-2">Tính năng đang phát triển</h2>
              <p>Mục này sẽ sớm ra mắt trong tương lai.</p>
            </div>
          </div>
        )}

        <CreateProjectDialog
          open={isCreateProjectOpen}
          onClose={() => setIsCreateProjectOpen(false)}
          onCreate={handleCreateProject}
          currentUser={user}
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreate={handleAddTask}
          project={projects.find(p => p.id === currentProjectIdForTask)}
        />
      </div>
    </div>
  );
}