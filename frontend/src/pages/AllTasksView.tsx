import { useState, memo, useMemo } from 'react';
import { 
  CheckSquare, Target, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, 
  ChevronDown, Plus, Users, Calendar, AlignLeft, Cloud, FileText, ChevronRight, Trash2, TrendingUp, Activity,
  UserCircle
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { MembersList } from '../components/task/MembersList';

import { type Project, type Task } from '../api';

interface AllTasksViewProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (projectId: string, status: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectProject?: (projectId: string) => void;
  onUpdateTaskStatus?: (taskId: string, status: "Not Started" | "In Progress" | "Done") => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  currentUserId?: string;
}

// Helper to get status label in Vietnamese
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Not Started': return 'Chưa bắt đầu';
    case 'In Progress': return 'Đang thực hiện';
    case 'Done': return 'Hoàn thành';
    default: return status;
  }
};

// Priority labels stay in English to sync with backend
const getPriorityBadge = (priority?: string) => {
  if (!priority) return null;
  if (priority === 'High') {
    return <Badge className="bg-red-900/80 text-red-100 hover:bg-red-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">High</Badge>;
  }
  if (priority === 'Medium') {
    return <Badge className="bg-orange-900/80 text-orange-100 hover:bg-orange-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">Medium</Badge>;
  }
  if (priority === 'Low') {
    return <Badge className="bg-green-900/80 text-green-100 hover:bg-green-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">Low</Badge>;
  }
  if (priority === 'Very High') {
    return <Badge className="bg-purple-900/80 text-purple-100 hover:bg-purple-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">Very High</Badge>;
  }
  return <Badge className="bg-gray-800 text-gray-300 rounded uppercase text-[10px] px-1.5 py-0 border-none">{priority}</Badge>;
};

const getTaskIcon = (iconName?: string) => {
  if (iconName === 'calendar') return <Calendar className="w-4 h-4 text-blue-400" />;
  if (iconName === 'cloud') return <Cloud className="w-4 h-4 text-blue-400" />;
  if (iconName === 'activity') return <Activity className="w-4 h-4 text-green-400" />;
  return <FileText className="w-4 h-4 text-gray-400" />;
};

export const AllTasksView = memo(function AllTasksView({ 
  projects, 
  tasks, 
  onUpdateTask, 
  onCreateTask, 
  onDeleteTask, 
  onSelectProject,
  onUpdateTaskStatus,
  onUpdateProject,
  currentUserId
}: AllTasksViewProps) {
  const { getTaskProgress, setTaskProgress } = useTaskProgress();
  const [activeTab, setActiveTab] = useState<'By project' | 'Board' | 'All tasks' | 'Members'>('Board');
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(
    projects.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );
  const [taskSearch, setTaskSearch] = useState('');
  const [selectedProjectForMembers, setSelectedProjectForMembers] = useState<Project | null>(null);

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const isOverdue = (task: Task): boolean => {
    if (task.status === 'Done') return false;
    if ((task as any).dueDate) return new Date((task as any).dueDate) < new Date();
    if (task.due) {
      const match = task.due.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/i);
      if (match) {
        const [_, d, m, y] = match;
        return new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 23, 59, 59) < new Date();
      }
    }
    return false;
  };

  const getProgress = (taskId: string, taskStatus: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return taskStatus === 'Done' ? 100 : 0;
    return getTaskProgress(task.projectId, taskId, taskStatus);
  };

  const handleProgressUpdate = async (taskId: string, newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      setTaskProgress(task.projectId, taskId, clampedProgress);
      
      let newStatus = task.status;
      if (clampedProgress >= 100 && task.status !== 'Done') {
        newStatus = 'Done';
      } else if (clampedProgress > 0 && task.status === 'Not Started') {
        newStatus = 'In Progress';
      } else if (clampedProgress === 0 && task.status === 'In Progress') {
        newStatus = 'Not Started';
      }
      
      if (newStatus !== task.status) {
        if (onUpdateTaskStatus) {
          onUpdateTaskStatus(taskId, newStatus as any);
        } else {
          onUpdateTask(taskId, { status: newStatus });
        }
      }
    }
  };

  const handleMoveTask = (taskId: string, newStatus: "Not Started" | "In Progress" | "Done") => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (newStatus === 'Done') {
        setTaskProgress(task.projectId, taskId, 100);
      } else {
        const currentProgress = getTaskProgress(task.projectId, taskId);
        if (currentProgress === 100) {
          setTaskProgress(task.projectId, taskId, 0);
        }
      }
    }
    if (onUpdateTaskStatus) {
      onUpdateTaskStatus(taskId, newStatus);
    } else {
      onUpdateTask(taskId, { status: newStatus });
    }
  };

  // Filter tasks based on search
  const filteredTasks = useMemo(() => {
    if (!taskSearch) return tasks;
    return tasks.filter(t => 
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.summary && t.summary.toLowerCase().includes(taskSearch.toLowerCase()))
    );
  }, [tasks, taskSearch]);

  // Filter tasks by project for By project view
  const getFilteredProjectTasks = (projectId: string) => {
    return filteredTasks.filter(t => t.projectId === projectId);
  };

  const renderTable = (projectId: string, projectTasks: Task[]) => {
    if (!expandedProjects[projectId]) return null;

    const completedCount = projectTasks.filter(t => t.status === 'Done').length;

    return (
      <div className="mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="font-medium py-2 pl-8 pr-4 w-1/4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold">Aa</span> Tên nhiệm vụ
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-32">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Trạng thái
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-32">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Người được gán
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-40">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Hạn chót
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-28">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Ưu tiên
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-24">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5" /> Tiến độ
                  </div>
                </th>
                <th className="font-medium py-2 px-4">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5" /> Tóm tắt
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-12 text-center text-gray-500">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map((task) => {
                const overdue = isOverdue(task);
                const progress = getProgress(task.id, task.status);
                return (
                  <tr key={task.id} className={`border-b border-gray-800/50 group ${overdue ? 'bg-red-950/10 hover:bg-red-950/20' : 'hover:bg-[#222]'}`}>
                    <td className="py-2 pl-8 pr-4 border-r border-gray-800/50">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1">
                          {overdue && <span title="Quá hạn" className="text-red-400">⚠️</span>}
                          {getTaskIcon(task.icon)}
                          <input
                            value={task.title}
                            onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                            className="bg-transparent border-none outline-none text-white w-full font-medium"
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-r border-gray-800/50">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                            task.status === 'Not Started' ? 'bg-gray-700 text-gray-300' :
                            task.status === 'In Progress' ? 'bg-blue-900/50 text-blue-200' :
                            'bg-green-900/50 text-green-200'
                          }`}>
                            {getStatusLabel(task.status)}
                            <ChevronDown className="w-3 h-3 inline ml-1" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-36 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                          {['Not Started', 'In Progress', 'Done'].map(status => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleMoveTask(task.id, status as any)}
                              className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                status === task.status ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'
                              }`}
                            >
                              {getStatusLabel(status)}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </td>
                    <td className="py-2 px-4 border-r border-gray-800/50 text-gray-300">
                      {task.assignees && task.assignees.length > 0 ? (
                        <div className="flex -space-x-1">
                          {task.assignees.map(a => (
                            <div key={a.id} title={a.name} className="w-6 h-6 rounded-full bg-blue-600 border border-[#191919] flex items-center justify-center text-[9px] font-bold">
                              {a.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                        </div>
                      ) : task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">{task.assignee.charAt(0)}</div>
                          {task.assignee}
                        </div>
                      ) : null}
                    </td>
                    <td className={`py-2 px-4 border-r border-gray-800/50 ${overdue ? 'text-red-400' : 'text-gray-300'}`}>
                      <CustomDatePicker
                        trigger={
                          <button type="button" className="hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors w-full text-left">
                            {task.due || 'Trống'}
                          </button>
                        }
                        onSelect={(date) => {
                          if (date) {
                            const formattedDate = `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                            onUpdateTask(task.id, { due: formattedDate });
                          } else {
                            onUpdateTask(task.id, { due: '' });
                          }
                        }}
                      />
                    </td>
                    <td className="py-2 px-4 border-r border-gray-800/50">
                      {getPriorityBadge(task.priority)}
                    </td>
                    <td className="py-2 px-4 border-r border-gray-800/50">
                      <div className="flex items-center gap-1.5">
                        <div 
                          className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const width = rect.width;
                            const newProgress = Math.round((x / width) * 100);
                            handleProgressUpdate(task.id, newProgress);
                          }}
                        >
                          <div
                            className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : progress >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <input
                          type="text"
                          value={progress}
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 0;
                            handleProgressUpdate(task.id, Math.min(100, Math.max(0, val)));
                          }}
                          className="w-10 px-1 py-0.5 text-center text-[10px] rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                        />
                        <span className="text-[10px] text-gray-500">%</span>
                      </div>
                    </td>
                    <td className="py-2 px-4 border-r border-gray-800/50 text-gray-300">
                      <input
                        value={task.summary || ''}
                        onChange={(e) => onUpdateTask(task.id, { summary: e.target.value })}
                        className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600"
                        placeholder="Thêm tóm tắt..."
                      />
                    </td>
                    <td className="py-2 px-4">
                      <button 
                        onClick={() => onDeleteTask?.(task.id)}
                        className="text-gray-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td colSpan={8} className="py-2 pl-8 text-gray-500 hover:bg-[#222] cursor-pointer" onClick={() => onCreateTask(projectId, 'Not Started')}>
                  <div className="flex items-center gap-2 text-sm">
                    <Plus className="w-4 h-4" /> Nhiệm vụ mới
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="text-[10px] text-gray-500 uppercase tracking-widest pl-8 mt-2 font-medium">
          HOÀN TẤT {completedCount}/{projectTasks.length}
        </div>
      </div>
    );
  };

  const renderByProjectView = () => (
    <div className="space-y-6">
      {projects.map(project => {
        const projectTasks = getFilteredProjectTasks(project.id);
        if (projectTasks.length === 0) return null;

        return (
          <div key={project.id}>
            <div 
              className="flex items-center gap-2 cursor-pointer hover:bg-[#222] p-1 rounded w-fit mb-2 group"
              onClick={() => toggleProject(project.id)}
            >
              {expandedProjects[project.id] ? (
                <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white" />
              )}
              <span className="text-xl">{project.icon}</span>
              <h2 className="font-semibold">{project.name}</h2>
              <span className="text-gray-500 text-sm">{projectTasks.length}</span>
            </div>
            
            {renderTable(project.id, projectTasks)}
          </div>
        );
      })}
    </div>
  );

  // Render all tasks in a single table (no grouping by project)
  const renderAllTasksView = () => {
    const allTasks = filteredTasks;
    const completedCount = allTasks.filter(t => t.status === 'Done').length;

    return (
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-800 text-gray-400">
              <th className="font-medium py-2 pl-8 pr-4 w-1/4">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold">Aa</span> Tên nhiệm vụ
                </div>
              </th>
              <th className="font-medium py-2 px-4 w-32">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" /> Trạng thái
                </div>
              </th>
              <th className="font-medium py-2 px-4 w-32">
                <div className="flex items-center gap-2">
                  <Users className="w-3.5 h-3.5" /> Người được gán
                </div>
              </th>
              <th className="font-medium py-2 px-4 w-40">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" /> Hạn chót
                </div>
              </th>
              <th className="font-medium py-2 px-4 w-28">
                <div className="flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" /> Ưu tiên
                </div>
              </th>
              <th className="font-medium py-2 px-4">
                <div className="flex items-center gap-2">
                  <AlignLeft className="w-3.5 h-3.5" /> Tóm tắt
                </div>
              </th>
              <th className="font-medium py-2 px-4 w-12 text-center text-gray-500">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {allTasks.map((task) => {
              const project = projects.find(p => p.id === task.projectId);
              const progress = getProgress(task.id, task.status);
              return (
                <tr key={task.id} className="border-b border-gray-800/50 hover:bg-[#222] group">
                  <td className="py-2 pl-8 pr-4 border-r border-gray-800/50">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getTaskIcon(task.icon)}
                        <div className="flex flex-col flex-1">
                          <input
                            value={task.title}
                            onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                            className="bg-transparent border-none outline-none text-white w-full font-medium"
                          />
                          {project && (
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs">{project.icon}</span>
                              <span className="text-[10px] text-gray-500">{project.name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteTask?.(task.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          task.status === 'Not Started' ? 'bg-gray-700 text-gray-300' :
                          task.status === 'In Progress' ? 'bg-blue-900/50 text-blue-200' :
                          'bg-green-900/50 text-green-200'
                        }`}>
                          {getStatusLabel(task.status)}
                          <ChevronDown className="w-3 h-3 inline ml-1" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-36 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                        {['Not Started', 'In Progress', 'Done'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleMoveTask(task.id, status as any)}
                            className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${
                              status === task.status ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'
                            }`}
                          >
                            {getStatusLabel(status)}
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50 text-gray-300">
                    {task.assignee ? (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                          {task.assignee.charAt(0)}
                        </div>
                        {task.assignee}
                      </div>
                    ) : null}
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50 text-gray-300">
                    <CustomDatePicker 
                      trigger={
                        <button type="button" className="text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors w-full text-left">
                          {task.due || 'Thêm ngày'}
                        </button>
                      }
                      onSelect={(date) => {
                        if (date) {
                          const formattedDate = `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                          onUpdateTask(task.id, { due: formattedDate });
                        } else {
                          onUpdateTask(task.id, { due: '' });
                        }
                      }}
                    />
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50">
                    {getPriorityBadge(task.priority)}
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50 text-gray-300">
                    <input
                      value={task.summary || ''}
                      onChange={(e) => onUpdateTask(task.id, { summary: e.target.value })}
                      className="bg-transparent border-none outline-none text-white w-full placeholder:text-gray-600"
                      placeholder="Thêm tóm tắt..."
                    />
                  </td>
                  <td className="py-2 px-4">
                    <button 
                      onClick={() => onDeleteTask?.(task.id)}
                      className="text-gray-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {allTasks.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-gray-500">
                  Không tìm thấy nhiệm vụ nào
                </td>
              </tr>
            )}
            <tr>
              <td colSpan={7} className="py-2 pl-8 text-gray-500 hover:bg-[#222] cursor-pointer" onClick={() => onCreateTask(projects[0]?.id || '', 'Not Started')}>
                <div className="flex items-center gap-2 text-sm">
                  <Plus className="w-4 h-4" /> Nhiệm vụ mới
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {allTasks.length > 0 && (
          <div className="text-[10px] text-gray-500 uppercase tracking-widest pl-8 mt-2 font-medium">
            HOÀN TẤT {completedCount}/{allTasks.length}
          </div>
        )}
      </div>
    );
  };

  const groupedTasks = useMemo(() => {
    return filteredTasks.reduce((acc, task) => {
      if (!acc[task.status]) {
        acc[task.status] = [];
      }
      acc[task.status].push(task);
      return acc;
    }, {} as Record<string, typeof filteredTasks>);
  }, [filteredTasks]);

  const renderBoardView = () => {
    const statuses = ['Not Started', 'In Progress', 'Done'];
    const statusLabels = ['Chưa bắt đầu', 'Đang thực hiện', 'Hoàn thành'];
    
    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {statuses.map((status, index) => {
          const statusTasks = groupedTasks[status] || [];
          const statusLabel = statusLabels[index];
          
          let headerColor = 'bg-gray-800 text-gray-300';
          let bgColor = 'bg-[#1e1e1e] border-gray-800/60';
          let dotColor = 'bg-gray-400';

          if (status === 'In Progress') {
            headerColor = 'bg-blue-900/50 text-blue-300';
            bgColor = 'bg-[#1a202c]/30 border-blue-900/30';
            dotColor = 'bg-blue-500';
          } else if (status === 'Done') {
            headerColor = 'bg-green-900/50 text-green-300';
            bgColor = 'bg-[#1a2c1f]/30 border-green-900/30';
            dotColor = 'bg-green-500';
          }

          return (
            <div key={status} className={`flex-shrink-0 w-[340px] rounded-2xl border p-4 flex flex-col ${bgColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${headerColor} text-xs font-semibold`}>
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  {statusLabel}
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-6 w-8 p-0">
                  <Plus className="w-4 h-4" onClick={() => onCreateTask(projects[0]?.id || '', status)} />
                </Button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {statusTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
                  const progress = getProgress(task.id, task.status);
                  return (
                    <div 
                      key={task.id} 
                      className="bg-[#222222] rounded-xl border border-gray-800/80 p-4 cursor-pointer hover:border-gray-600 transition-all shadow-sm hover:shadow-md group"
                      onClick={() => onSelectProject?.(task.projectId)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <span className="text-lg leading-none mt-0.5">{getTaskIcon(task.icon)}</span>
                          <h3 className="font-medium text-[15px] leading-snug text-gray-100">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); onDeleteTask?.(task.id); }}><Trash2 className="w-3.5 h-3.5 text-red-500/70" /></button>
                        </div>
                      </div>
                      
                      {project && (
                        <div className="flex items-center gap-2 mb-3 bg-[#1a1a1a] rounded p-1.5 px-2">
                          <span className="text-sm leading-none">{project.icon}</span>
                          <span className="text-[12px] text-gray-300 truncate font-medium">{project.name}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2">
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-16 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400">{progress}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderMembersView = () => {
    // Show members for the selected project or first project
    const projectToShow = selectedProjectForMembers || projects[0];
    
    if (!projectToShow) {
      return (
        <div className="text-center py-12">
          <UserCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có dự án nào</p>
        </div>
      );
    }

    return (
      <div>
        {/* Project selector for members view */}
        {projects.length > 1 && (
          <div className="mb-6 flex items-center gap-3">
            <label className="text-sm text-gray-400">Chọn dự án:</label>
            <select
              value={projectToShow.id}
              onChange={(e) => {
                const selected = projects.find(p => p.id === e.target.value);
                setSelectedProjectForMembers(selected || null);
              }}
              className="bg-[#1a1a1a] border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-200 focus:outline-none focus:border-blue-500"
            >
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.icon} {project.name}
                </option>
              ))}
            </select>
          </div>
        )}
        
        <MembersList
          project={projectToShow}
          onUpdateProject={onUpdateProject}
          currentUserId={currentUserId}
        />
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#121212] text-white p-8">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <CheckSquare className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Nhiệm vụ</h1>
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-3 shrink-0">
        <div className="flex gap-1">
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'By project' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('By project')}
          >
            <Target className="w-4 h-4" /> Theo dự án
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'Board' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('Board')}
          >
            <LayoutGrid className="w-4 h-4" /> Bảng
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'All tasks' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('All tasks')}
          >
            <List className="w-4 h-4" /> Tất cả nhiệm vụ
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'Members' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('Members')}
          >
            <Users className="w-4 h-4" /> Thành viên
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm nhiệm vụ..."
              value={taskSearch}
              onChange={(e) => setTaskSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3 text-sm font-medium"
            onClick={() => onCreateTask(projects[0]?.id || '', 'Not Started')}
          >
            <Plus className="w-4 h-4 mr-1" />
            Nhiệm vụ mới
          </Button>
        </div>
      </div>

      <div>
        {activeTab === 'By project' && renderByProjectView()}
        {activeTab === 'Board' && renderBoardView()}
        {activeTab === 'All tasks' && renderAllTasksView()}
        {activeTab === 'Members' && renderMembersView()}
      </div>
    </div>
  );
});