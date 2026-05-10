import { useState } from 'react';
import { 
  CheckSquare, Target, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, 
  ChevronDown, Plus, Users, Calendar, AlignLeft, Cloud, FileText, ChevronRight, Trash2
} from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { CustomDatePicker } from '../components/common/CustomDatePicker';

import { type Project, type Task } from '../api';

interface AllTasksViewProps {
  projects: Project[];
  tasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onCreateTask: (projectId: string, status: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onSelectProject?: (projectId: string) => void;
}

export function AllTasksView({ projects, tasks, onUpdateTask, onCreateTask, onDeleteTask, onSelectProject }: AllTasksViewProps) {
  const [activeTab, setActiveTab] = useState<'By project' | 'Board' | 'All tasks'>('Board');
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
      return <Badge className="bg-red-900/80 text-red-100 hover:bg-red-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">High</Badge>;
    }
    if (priority === 'Medium') {
      return <Badge className="bg-orange-900/80 text-orange-100 hover:bg-orange-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">Medium</Badge>;
    }
    if (priority === 'Low') {
      return <Badge className="bg-green-900/80 text-green-100 hover:bg-green-900/80 rounded uppercase text-[10px] px-1.5 py-0 border-none">Low</Badge>;
    }
    return <Badge className="bg-gray-800 text-gray-300 rounded uppercase text-[10px] px-1.5 py-0 border-none">{priority}</Badge>;
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
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1">
                        {getTaskIcon(task.icon)}
                        <input
                          value={task.title}
                          onChange={(e) => onUpdateTask(task.id, { title: e.target.value })}
                          className="bg-transparent border-none outline-none text-white w-full font-medium"
                        />
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
                    <CustomDatePicker 
                      trigger={
                        <button type="button" className="text-gray-300 hover:text-white hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors w-full text-left">
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

  const renderByProjectView = () => (
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
  );

  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, typeof tasks>);

  const renderBoardView = () => {
    const statuses = ['Not Started', 'In Progress', 'Done'];
    
    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {statuses.map(status => {
          const statusTasks = groupedTasks[status] || [];
          
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
          } else {
            headerColor = 'bg-gray-800 text-gray-300';
            bgColor = 'bg-[#1a1a1a] border-gray-800/60';
            dotColor = 'bg-gray-400';
          }

          return (
            <div key={status} className={`flex-shrink-0 w-[340px] rounded-2xl border p-4 flex flex-col ${bgColor} shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${headerColor} text-xs font-semibold`}>
                  <div className={`w-2 h-2 rounded-full ${dotColor}`} />
                  {status}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-6 w-8 p-0">
                    ...
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-6 w-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {statusTasks.map(task => {
                  const project = projects.find(p => p.id === task.projectId);
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
                          <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700"><AlignLeft className="w-3.5 h-3.5" /></button>
                          <button className="text-gray-500 hover:text-white p-1 rounded hover:bg-gray-700">...</button>
                        </div>
                      </div>
                      
                      {task.assignee && (
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-[10px] text-gray-300">
                            {task.assignee.charAt(0)}
                          </div>
                          <span className="text-[13px] text-gray-400 font-medium">{task.assignee}</span>
                        </div>
                      )}
                      
                      {project && (
                        <div className="flex items-center gap-2 mb-3 bg-[#1a1a1a] rounded p-1.5 px-2">
                          <span className="text-sm leading-none">{project.icon}</span>
                          <span className="text-[12px] text-gray-300 truncate font-medium">{project.name}</span>
                          <span className="text-[10px] text-gray-500 ml-auto uppercase bg-gray-800 px-1 rounded">Project</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-1">
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] justify-start text-sm font-medium py-2 h-auto mt-2 border border-dashed border-gray-700/50"
                  onClick={() => onCreateTask(projects[0]?.id || '', status)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nhiệm vụ mới
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#121212] text-white p-8">
      <div className="flex items-center gap-3 mb-6 shrink-0">
        <CheckSquare className="w-8 h-8" />
        <h1 className="text-3xl font-bold">Tasks</h1>
      </div>

      <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-3 shrink-0">
        <div className="flex gap-1">
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'By project' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('By project')}
          >
            <Target className="w-4 h-4" /> By project
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'Board' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('Board')}
          >
            <LayoutGrid className="w-4 h-4" /> Board
          </button>
          <button 
            className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === 'All tasks' ? 'bg-[#2a2a2a] text-white' : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'}`}
            onClick={() => setActiveTab('All tasks')}
          >
            <List className="w-4 h-4" /> All tasks
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 mr-2 text-gray-400">
            <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"><Filter className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"><ArrowUpDown className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"><Sparkles className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"><Search className="w-4 h-4" /></button>
            <button className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"><SlidersHorizontal className="w-4 h-4" /></button>
          </div>
          
          <div className="flex items-center">
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-r-none px-3 text-sm font-medium"
              onClick={() => onCreateTask(projects[0]?.id || '', 'Not Started')}
            >
              Mới
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-l-none border-l border-blue-700 px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div>
        {activeTab === 'By project' && renderByProjectView()}
        {activeTab === 'Board' && renderBoardView()}
        {activeTab === 'All tasks' && renderByProjectView()}
      </div>
    </div>
  );
}
