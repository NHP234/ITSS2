import { useState } from 'react';
import { ProjectList } from './components/ProjectList';
import { TaskView } from './components/TaskView';
import { CreateProjectDialog } from './components/CreateProjectDialog';
import { CreateTaskDialog } from './components/CreateTaskDialog';
import { Sidebar } from './components/Sidebar';
import { Home } from './components/Home';
import { AllTasksView } from './components/AllTasksView';

interface Project {
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
}

interface Task {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  projectId: string;
  assignee?: string;
  due?: string;
  priority?: string;
  summary?: string;
  icon?: string;
}

export default function App() {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Bài tập cá nhân Nguyên lí Hệ điều hành',
      description: '',
      status: 'Planning',
      owner: 'Bình',
      dates: '17 tháng 9, 2025 → 19 tháng 11, 2025',
      priority: 'High',
      completion: 20.0,
      blockedBy: '',
      icon: '📝',
    },
    {
      id: '2',
      name: 'Bài tập nhóm Công nghệ Web',
      description: '',
      status: 'Planning',
      owner: 'Bình',
      dates: '17 tháng 9, 2025 → 22 tháng 11, 2025',
      priority: 'High',
      completion: 44.44,
      blockedBy: 'Bài tập cá nhân Nguyên lí Hệ điều hành',
      icon: '🌐',
    },
    {
      id: '3',
      name: 'New Project',
      description: '',
      status: 'Planning',
      owner: '',
      dates: '',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '4',
      name: 'Bài tập CNXH',
      description: '',
      status: 'Planning',
      owner: 'Bình',
      dates: '19 tháng 9, 2025',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '5',
      name: 'New Project',
      description: '',
      status: 'Planning',
      owner: '',
      dates: '',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '6',
      name: 'New Project',
      description: '',
      status: 'Planning',
      owner: '',
      dates: '',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '7',
      name: 'New Project',
      description: '',
      status: 'Planning',
      owner: '',
      dates: '',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '8',
      name: 'New Project',
      description: '',
      status: 'Planning',
      owner: '',
      dates: '26 tháng 9, 2025 → 9 tháng 10, 2025',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
    {
      id: '9',
      name: 'Getting started with Projects & Tasks',
      description: '',
      status: 'In Progress',
      owner: 'Bình',
      dates: '15 tháng 5, 2023 → 21 tháng 5, 2023',
      priority: 'High',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    },
  ]);

  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Đăng kí chủ đề', status: 'Done', projectId: '1', assignee: 'Bình', due: '17 tháng 9, 2025', priority: 'Medium', summary: 'Đăng kí chủ đề trong link', icon: 'calendar' },
    { id: '2', title: 'Tìm tài liệu', status: 'In Progress', projectId: '1', assignee: 'Bình', due: '21 tháng 9, 2025', priority: 'High', icon: 'cloud' },
    { id: '3', title: 'Đọc tài liệu', status: 'Not Started', projectId: '1', assignee: 'Bình', due: '15 tháng 10, 2025', priority: 'High', summary: 'Đọc các tài liệu' },
    { id: '4', title: 'Viết báo cáo', status: 'Not Started', projectId: '1' },
    { id: '5', title: 'Nộp bài', status: 'Not Started', projectId: '1' },
    { id: '6', title: 'Chọn nhóm', status: 'In Progress', projectId: '4' },
    { id: '7', title: 'Chọn chủ đề', status: 'Not Started', projectId: '4' },
    { id: '8', title: 'Đăng kí', status: 'Not Started', projectId: '4' },
  ]);

  const [activeTab, setActiveTab] = useState('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [currentProjectIdForTask, setCurrentProjectIdForTask] = useState<string | null>(null);
  const [currentTaskStatus, setCurrentTaskStatus] = useState<string>('Not Started');

  const handleUpdateProject = (projectId: string, updates: Partial<Project>) => {
    setProjects(projects.map(p => p.id === projectId ? { ...p, ...updates } : p));
  };

  const handleCreateProject = (name: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      status: 'Planning',
      owner: 'Bình',
      dates: '',
      priority: '',
      completion: 0,
      blockedBy: '',
      icon: '🎯',
    };
    setProjects([...projects, newProject]);
  };

  const handleCreateTask = (projectId: string, status: string) => {
    setCurrentProjectIdForTask(projectId);
    setCurrentTaskStatus(status);
    setIsCreateTaskOpen(true);
  };

  const handleAddTask = (title: string) => {
    if (!currentProjectIdForTask) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      status: currentTaskStatus as 'Not Started' | 'In Progress' | 'Done',
      projectId: currentProjectIdForTask,
    };

    setTasks([...tasks, newTask]);
  };

  const handleUpdateTaskStatus = (taskId: string, status: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, status: status as 'Not Started' | 'In Progress' | 'Done' } : task
    ));
  };

  const handleUpdateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => task.id === taskId ? { ...task, ...updates } : task));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  const selectedProject = projects.find(p => p.id === selectedProjectId);
  const projectTasks = selectedProjectId
    ? tasks.filter(t => t.projectId === selectedProjectId)
    : [];

  return (
    <div className="flex h-screen w-full bg-[#191919] overflow-hidden">
      <Sidebar activeTab={activeTab} onTabChange={(tab) => {
        setActiveTab(tab);
        if (tab !== 'projects') setSelectedProjectId(null);
      }} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {activeTab === 'home' && <Home />}
        
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
            />
          ) : (
            <ProjectList
              projects={projects}
              onSelectProject={setSelectedProjectId}
              onCreateProject={() => setIsCreateProjectOpen(true)}
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
          />
        )}

        {(activeTab === 'account' || activeTab === 'notifications' || activeTab === 'settings') && (
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
        />

        <CreateTaskDialog
          open={isCreateTaskOpen}
          onClose={() => setIsCreateTaskOpen(false)}
          onCreate={handleAddTask}
        />
      </div>
    </div>
  );
}