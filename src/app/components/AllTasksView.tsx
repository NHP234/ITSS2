import { useState } from 'react';
import { 
  CheckSquare, Target, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, 
  ChevronDown, Plus, Users, Calendar, AlignLeft, Cloud, FileText, ChevronRight
} from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface Project {
  id: string;
  name: string;
  icon: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  projectId: string;
  assignee?: string;
  due?: string;
  priority?: string;
  summary?: string;
  icon?: string;
}

interface AllTasksViewProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (projectId: string, status: string) => void;
}

export function AllTasksView({ projects, tasks, onUpdateTask, onCreateTask }: AllTasksViewProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(
    projects.reduce((acc, p) => ({ ...acc, [p.id]: true }), {})
  );

  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return (
          <div className="inline-flex items-center gap-1.5 bg-green-900/40 border border-green-800 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-green-100 font-medium">Done</span>
          </div>
        );
      case 'In Progress':
        return (
          <div className="inline-flex items-center gap-1.5 bg-blue-900/40 border border-blue-800 px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-xs text-blue-100 font-medium">In Progress</span>
          </div>
        );
      default:
        return (
          <div className="inline-flex items-center gap-1.5 bg-[#444] border border-[#555] px-2 py-0.5 rounded-full">
            <div className="w-2 h-2 rounded-full bg-gray-400" />
            <span className="text-xs text-white font-medium">Not Started</span>
          </div>
        );
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    if (priority === 'High') {
      return <Badge className="bg-red-900/60 text-red-200 hover:bg-red-900/60 rounded uppercase text-[10px] px-1.5 py-0">High</Badge>;
    }
    if (priority === 'Medium') {
      return <Badge className="bg-orange-900/60 text-orange-200 hover:bg-orange-900/60 rounded uppercase text-[10px] px-1.5 py-0">Medium</Badge>;
    }
    return <Badge className="bg-gray-800 text-gray-300 rounded uppercase text-[10px] px-1.5 py-0">{priority}</Badge>;
  };

  const getTaskIcon = (iconName?: string) => {
    if (iconName === 'calendar') return <Calendar className="w-4 h-4 text-blue-400" />;
    if (iconName === 'cloud') return <Cloud className="w-4 h-4 text-blue-400" />;
    return <FileText className="w-4 h-4 text-gray-400" />;
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
                    <span className="text-[10px] uppercase font-bold">Aa</span> Task name
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-32">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" /> Status
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-32">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5" /> Assignee
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-40">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" /> Due
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-28">
                  <div className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5" /> Priority
                  </div>
                </th>
                <th className="font-medium py-2 px-4">
                  <div className="flex items-center gap-2">
                    <AlignLeft className="w-3.5 h-3.5" /> Summary <Sparkles className="w-3 h-3 opacity-50" />
                  </div>
                </th>
                <th className="font-medium py-2 px-4 w-12 text-center text-gray-500">+ ...</th>
              </tr>
            </thead>
            <tbody>
              {projectTasks.map((task) => (
                <tr key={task.id} className="border-b border-gray-800/50 hover:bg-[#222] group">
                  <td className="py-2 pl-8 pr-4 border-r border-gray-800/50">
                    <div className="flex items-center gap-2">
                      {getTaskIcon(task.icon)}
                      <input
                        value={task.title}
                        onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                        className="bg-transparent border-none outline-none text-white w-full font-medium"
                      />
                    </div>
                  </td>
                  <td className="py-2 px-4 border-r border-gray-800/50">
                    {getStatusBadge(task.status)}
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
                    {task.due}
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
                  <td className="py-2 px-4"></td>
                </tr>
              ))}
              <tr>
                <td colSpan={7} className="py-2 pl-8 text-gray-500 hover:bg-[#222] cursor-pointer" onClick={() => onCreateTask(projectId, 'Not Started')}>
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

  return (
    <div className="flex-1 overflow-auto bg-[#191919] text-white p-8">
      <div className="flex items-center gap-3 mb-6">
        <CheckSquare className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-2">
        <div className="flex gap-1">
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-[#2a2a2a] text-white rounded-md">
            <Target className="w-4 h-4" /> By project
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors">
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-400 hover:text-white hover:bg-[#2a2a2a] rounded-md transition-colors">
            <List className="w-4 h-4" /> All tasks
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 text-gray-400">
            <button className="p-1.5 hover:bg-gray-800 rounded"><Filter className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-800 rounded"><ArrowUpDown className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-800 rounded"><Sparkles className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-800 rounded"><Search className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-gray-800 rounded"><SlidersHorizontal className="w-4 h-4" /></button>
          </div>
          
          <div className="flex items-center">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-r-none px-3 text-sm">
              Mới
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-l-none border-l border-blue-700 px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {projects.map(project => {
          const projectTasks = tasks.filter(t => t.projectId === project.id);
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
    </div>
  );
}
