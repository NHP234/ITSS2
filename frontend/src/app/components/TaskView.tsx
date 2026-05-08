import { useState, useEffect } from 'react';
import { Plus, Target, Users, Calendar, ChevronDown, MessageSquare, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, Check, Maximize2, Zap, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CustomDatePicker } from './CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Search as SearchIcon, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { searchUsers, addProjectMember, removeProjectMember, updateTask } from '../../api';

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
  assignees?: { id: string; name: string; email: string }[];
}

interface Project {
  id: string;
  name: string;
  status: string;
  owner: string;
  dates: string;
  icon: string;
  members?: { id: string; name: string; email: string }[];
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
  onDeleteProject?: (projectId: string) => void;
}

export function TaskView({ project, tasks, onBack, onCreateTask, onUpdateTask, onDeleteTask, onUpdateProject, onDeleteProject }: TaskViewProps) {
  const [projectName, setProjectName] = useState(project.name);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

  const handleSearchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      // Lọc bỏ những người đã là thành viên
      const filtered = results.filter(u => !project.members?.some(m => m.id === u.id));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const updatedProject = await addProjectMember(project.id, userId);
      if (onUpdateProject) {
        onUpdateProject(project.id, { members: updatedProject.members });
      }
      setUserSearch('');
      setSearchResults([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm thành viên');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const updatedProject = await removeProjectMember(project.id, userId);
      if (onUpdateProject) {
        onUpdateProject(project.id, { members: updatedProject.members });
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xoá thành viên');
    }
  };

  const handleToggleAssignee = async (taskId: string, userId: string, isAssigned: boolean) => {
    if (!onUpdateTask) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    let newAssigneeIds = task.assignees?.map(a => a.id) || [];
    if (isAssigned) {
      newAssigneeIds = newAssigneeIds.filter(id => id !== userId);
    } else {
      newAssigneeIds = [...newAssigneeIds, userId];
    }

    try {
      await onUpdateTask(taskId, { assigneeIds: newAssigneeIds } as any);
    } catch (err) {
      console.error(err);
    }
  };

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
    <div className="min-h-full bg-[#191919] text-white">
      <div className="px-8 py-6 space-y-6 flex-shrink-0">
        <div className="flex flex-col gap-2">
          <Target className="w-8 h-8 text-gray-400 mb-2" />
          <div className="flex items-center justify-between w-full">
            <input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameBlur}
              className="text-4xl font-bold font-sans tracking-tight border-b-2 border-dashed border-gray-600 pb-1 flex-1 bg-transparent outline-none focus:border-gray-400 transition-colors"
            />
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-500 hover:text-red-400 ml-4 h-9 w-9 p-0"
              onClick={() => onDeleteProject?.(project.id)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
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
            <div className="text-gray-400 flex items-center gap-2">
              {project.owner || 'Trống'}
              <div className="w-px h-3 bg-gray-700 mx-1" />
              <div className="flex -space-x-2">
                {project.members?.map(m => (
                  <div key={m.id} title={m.name} className="w-6 h-6 rounded-full bg-blue-600 border border-[#191919] flex items-center justify-center text-[10px] font-bold">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <button className="p-1 hover:bg-gray-800 rounded transition-colors text-blue-400">
                    <UserPlus className="w-4 h-4" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 bg-[#1e1e1e] border-[#333] p-0 shadow-2xl rounded-xl">
                  <div className="p-3 border-b border-gray-800">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thành viên dự án</h4>
                  </div>
                  <div className="max-h-48 overflow-y-auto p-1">
                    {project.members?.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-gray-200">{m.name}</span>
                            <span className="text-[10px] text-gray-500">{m.email}</span>
                          </div>
                        </div>
                        <button onClick={() => handleRemoveMember(m.id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(!project.members || project.members.length === 0) && (
                      <div className="p-4 text-center text-xs text-gray-500 italic">Chưa có thành viên nào</div>
                    )}
                  </div>
                  <div className="p-2 border-t border-gray-800 bg-[#252525]/30">
                    <div className="relative">
                      <SearchIcon className="absolute left-2 top-2 w-3 h-3 text-gray-500" />
                      <input 
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-1.5 pl-7 pr-2 text-xs outline-none focus:border-blue-500"
                        placeholder="Tìm theo email hoặc tên..."
                        value={userSearch}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {searchResults.map(u => (
                          <button 
                            key={u.id} 
                            onClick={() => handleAddMember(u.id)}
                            className="w-full flex items-center gap-2 p-1.5 hover:bg-blue-600 rounded text-left transition-colors"
                          >
                            <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[9px]">{u.name.charAt(0).toUpperCase()}</div>
                            <div className="flex flex-col">
                              <span className="text-xs">{u.name}</span>
                              <span className="text-[10px] opacity-70">{u.email}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
              <Calendar className="w-4 h-4" />
              <span>Dates</span>
            </div>
            <div>
              <CustomDatePicker 
                trigger={
                  <button className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors">
                    {project.dates || 'Trống'}
                  </button>
                }
                mode="range"
                onRangeSelect={(range) => {
                  if (range?.from && onUpdateProject) {
                    const fromStr = `${range.from.getDate()} tháng ${range.from.getMonth() + 1}, ${range.from.getFullYear()}`;
                    const toStr = range.to ? ` → ${range.to.getDate()} tháng ${range.to.getMonth() + 1}, ${range.to.getFullYear()}` : '';
                    onUpdateProject(project.id, { dates: `${fromStr}${toStr}` });
                  } else if (!range && onUpdateProject) {
                    onUpdateProject(project.id, { dates: '' });
                  }
                }}
              />
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

      <div className="flex-shrink-0 border-t border-gray-800">
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
                        className="bg-[#1a1a1a] rounded-lg p-3 text-sm hover:bg-[#252525] shadow-sm border border-gray-800/50 focus-within:ring-1 focus-within:ring-gray-600 transition-shadow space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            value={task.title}
                            onChange={(e) => onUpdateTask?.(task.id, { title: e.target.value })}
                            className="bg-transparent border-none outline-none flex-1 text-white cursor-text font-medium"
                          />
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-600 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all"
                            onClick={() => onDeleteTask(task.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2">
                          <CustomDatePicker 
                            trigger={
                              <button className="flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-300 transition-colors">
                                <Calendar className="w-3 h-3" />
                                {task.due || 'Thêm ngày'}
                              </button>
                            }
                            onSelect={(date) => {
                              if (date && onUpdateTask) {
                                const formattedDate = `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                                onUpdateTask(task.id, { due: formattedDate });
                              }
                            }}
                          />
                          <div className="flex-1" />
                          <Popover>
                            <PopoverTrigger asChild>
                              <button className="flex -space-x-1 hover:bg-gray-800 p-0.5 rounded transition-colors">
                                {task.assignees && task.assignees.length > 0 ? (
                                  task.assignees.map(a => (
                                    <div key={a.id} className="w-5 h-5 rounded-full bg-blue-600 border border-[#1a1a1a] flex items-center justify-center text-[8px] font-bold" title={a.name}>
                                      {a.name.charAt(0).toUpperCase()}
                                    </div>
                                  ))
                                ) : (
                                  <div className="w-5 h-5 rounded-full border border-dashed border-gray-600 flex items-center justify-center text-gray-500">
                                    <Users className="w-3 h-3" />
                                  </div>
                                )}
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-48 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-xl">
                              <div className="p-2 border-b border-gray-800 mb-1">
                                <span className="text-[10px] font-bold text-gray-500 uppercase">Gán cho...</span>
                              </div>
                              {project.members?.map(m => {
                                const isAssigned = task.assignees?.some(a => a.id === m.id);
                                return (
                                  <button 
                                    key={m.id} 
                                    onClick={() => handleToggleAssignee(task.id, m.id, !!isAssigned)}
                                    className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors group"
                                  >
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">
                                        {m.name.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-xs text-gray-300">{m.name}</span>
                                    </div>
                                    {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                                  </button>
                                );
                              })}
                              {(!project.members || project.members.length === 0) && (
                                <div className="p-3 text-[10px] text-gray-500 text-center italic">Hãy thêm thành viên vào dự án trước</div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </div>
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
