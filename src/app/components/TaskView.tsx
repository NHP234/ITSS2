import { useState, useEffect } from 'react';
import { Plus, Target, Users, Calendar, ChevronDown, MessageSquare, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, Check, Maximize2, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Task {
  id: string;
  title: string;
  status: 'Not Started' | 'In Progress' | 'Done';
  projectId: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  owner: string;
  dates: string;
  icon: string;
}

interface TaskViewProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onCreateTask: (projectId: string, status: string) => void;
  onUpdateTaskStatus: (taskId: string, status: string) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
}

export function TaskView({ project, tasks, onBack, onCreateTask, onUpdateTask, onUpdateProject }: TaskViewProps) {
  const [projectName, setProjectName] = useState(project.name);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  const handleNameBlur = () => {
    if (projectName.trim() !== project.name && onUpdateProject) {
      onUpdateProject(project.id, { name: projectName });
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-600';
      case 'In Progress':
        return 'bg-yellow-600';
      case 'Done':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const tasksByStatus = {
    'Not Started': tasks.filter(t => t.status === 'Not Started'),
    'In Progress': tasks.filter(t => t.status === 'In Progress'),
    'Done': tasks.filter(t => t.status === 'Done'),
  };

  return (
    <div className="flex flex-col h-full bg-[#191919] text-white">
      <div className="px-8 py-6 space-y-6">
        <div className="flex flex-col gap-2">
          <Target className="w-8 h-8 text-gray-400 mb-2" />
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            onBlur={handleNameBlur}
            className="text-4xl font-bold font-sans tracking-tight border-b-2 border-dashed border-gray-600 pb-1 w-full bg-transparent outline-none focus:border-gray-400 transition-colors"
          />
        </div>

        <div className="space-y-3 mt-8">
          <div className="grid grid-cols-[140px_1fr] gap-4 text-sm items-center">
            <div className="flex items-center gap-2 text-gray-400">
              <Sparkles className="w-4 h-4" />
              <span>Status</span>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#2563EB]/40 border border-[#2563EB]/50 px-3 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                <span className="text-xs text-white font-medium">{project.status}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Users className="w-4 h-4" />
              <span>Owner</span>
            </div>
            <div className="text-gray-400">
              {project.owner || 'Trống'}
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Dates</span>
            </div>
            <div className="text-gray-400">
              {project.dates || 'Trống'}
            </div>
          </div>

          <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 pt-2">
            <ChevronDown className="w-4 h-4" />
            Thêm 5 thuộc tính
          </button>
        </div>

        <div className="space-y-6 pt-6 border-t border-gray-800">
          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Quan hệ</p>
            <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
              <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                <Check className="w-3 h-3" />
              </div>
              Thêm Tasks
            </button>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-300 mb-2">Bình luận</p>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 group">
              <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300">
                B
              </div>
              <span className="border-b border-transparent group-hover:border-gray-500">Thêm bình luận...</span>
            </button>
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t border-gray-800">
          <h3 className="text-lg">About this project</h3>
          <ul className="list-disc list-inside text-sm text-gray-400">
            <li>Danh sách</li>
          </ul>
        </div>
      </div>

      <div className="flex-1 border-t border-gray-800 overflow-auto">
        <div className="px-8 py-6">
          <h2 className="text-xl mb-4">Project tasks</h2>

          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
            <Button variant="ghost" size="sm" className="bg-[#333333] text-white hover:bg-[#444444] rounded-full px-4">
              <LayoutGrid className="w-4 h-4 mr-2" />
              Board
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white rounded-full px-4">
              <List className="w-4 h-4 mr-2" />
              Tasks
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-400 hover:bg-gray-800 hover:text-blue-300">
                <Filter className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                <ArrowUpDown className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                <Zap className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-400 hover:bg-gray-800 hover:text-blue-300">
                <Sparkles className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
              
              <div className="flex items-center ml-2 rounded-md overflow-hidden bg-blue-600">
                <button 
                  className="px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  onClick={() => onCreateTask(project.id, 'Not Started')}
                >
                  Mới
                </button>
                <div className="w-px h-full bg-blue-500/50"></div>
                <button className="px-2 py-1.5 text-white hover:bg-blue-700 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
              const isNotStarted = status === 'Not Started';
              const isInProgress = status === 'In Progress';
              const isDone = status === 'Done';

              return (
                <div key={status} className="flex flex-col bg-[#222] rounded-xl p-3 border border-gray-800/40">
                  <div className="mb-3">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                      isNotStarted ? 'bg-gray-500/20 text-gray-300' :
                      isInProgress ? 'bg-blue-500/20 text-blue-200' :
                      'bg-green-500/20 text-green-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${
                        isNotStarted ? 'bg-gray-400' :
                        isInProgress ? 'bg-blue-400' :
                        'bg-green-400'
                      }`} />
                      {status}
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {statusTasks.map((task) => (
                      <div
                        key={task.id}
                        className="bg-[#1a1a1a] rounded-lg p-3 text-sm hover:bg-[#252525] shadow-sm border border-gray-800/50 focus-within:ring-1 focus-within:ring-gray-600 transition-shadow"
                      >
                        <input
                          value={task.title}
                          onChange={(e) => onUpdateTask?.(task.id, { title: e.target.value })}
                          className="bg-transparent border-none outline-none w-full text-white cursor-text"
                        />
                      </div>
                    ))}

                    <button
                      onClick={() => onCreateTask(project.id, status)}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors border ${
                        isNotStarted ? 'text-gray-300 border-gray-700 hover:bg-gray-800/50' :
                        isInProgress ? 'text-blue-400 border-blue-900/60 hover:bg-blue-900/20' :
                        'text-green-400 border-green-900/60 hover:bg-green-900/20'
                      }`}
                    >
                      <Plus className="w-4 h-4" />
                      Nhiệm vụ mới
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
