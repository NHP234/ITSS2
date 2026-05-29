<<<<<<< HEAD
import { useState, useEffect, memo, useMemo } from 'react';
import { Plus, Target, Users, Calendar, ChevronDown, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, Check, Maximize2, Zap, Trash2, Link as LinkIcon, ExternalLink, AlertTriangle, TrendingUp, Award } from 'lucide-react';
=======
import { useState, useEffect, memo, useMemo, useRef } from 'react';
import { 
  Plus, Target, Users, Calendar, ChevronDown, MessageSquare, LayoutGrid, List, 
  Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, Check, Maximize2, 
  Zap, Trash2, Link as LinkIcon, ExternalLink, Flag, TrendingUp, AlertCircle, 
  Circle, CircleCheck, LoaderCircle
} from 'lucide-react';
>>>>>>> feature/recommendation
import { Button } from '../components/ui/button';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { TaskDetailPopup } from '../components/common/TaskDetailPopup';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
<<<<<<< HEAD
import { Search as SearchIcon, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { searchUsers, addProjectMember, removeProjectMember, getMemberContributions } from '../api';
import type { ProjectContribution } from '../api';
=======
import { Search as SearchIcon, X, UserPlus, CheckCircle2, Loader2 } from 'lucide-react';
import { searchUsers, addProjectMember, removeProjectMember, updateTask } from '../api';
>>>>>>> feature/recommendation

import { type Project, type Task } from '../api';

type TaskPriority = "Low" | "Medium" | "High" | "Very High";
type TaskStatus = "Not Started" | "In Progress" | "Done";

interface TaskViewProps {
  project: Project;
  tasks: Task[];
  onBack: () => void;
  onCreateTask: (projectId: string, status: string) => void;
  onUpdateTaskStatus: (taskId: string, status: TaskStatus) => void;
  onUpdateTask?: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  onDeleteProject?: (projectId: string) => void;
  onAddLink?: (projectId: string, title: string, url: string) => void;
  onRemoveLink?: (projectId: string, linkId: string) => void;
  onUpdateTaskProgress?: (taskId: string, progress: number) => void;
}

<<<<<<< HEAD
// ─── Priority badge ───────────────────────────────────────────────────────────
function PriorityBadge({ priority }: { priority?: string }) {
  if (!priority) return null;
  const map: Record<string, { label: string; cls: string }> = {
    'Very High': { label: 'Very High', cls: 'bg-purple-900/80 text-purple-100 border-purple-700' },
    'High':      { label: 'High',      cls: 'bg-red-900/80 text-red-100 border-red-700' },
    'Medium':    { label: 'Medium',    cls: 'bg-orange-900/80 text-orange-100 border-orange-700' },
    'Low':       { label: 'Low',       cls: 'bg-green-900/80 text-green-100 border-green-700' },
  };
  const cfg = map[priority];
  if (!cfg) return <span className="text-[10px] text-gray-500 px-1.5 py-0.5 rounded border border-gray-700 bg-gray-800">{priority}</span>;
  return (
    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Check if task is overdue ─────────────────────────────────────────────────
function isOverdue(task: Task): boolean {
  if (task.status === 'Done') return false;
  if (task.dueDate) return new Date(task.dueDate) < new Date();
  // Fallback: parse due string "d tháng m, yyyy"
  if (task.due) {
    const match = task.due.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/i);
    if (match) {
      const [_, d, m, y] = match;
      const due = new Date(parseInt(y), parseInt(m) - 1, parseInt(d), 23, 59, 59);
      return due < new Date();
    }
  }
  return false;
}

const STATUSES = ['Not Started', 'In Progress', 'Reviewing', 'Done'] as const;

const STATUS_CONFIG = {
  'Not Started': {
    dot: 'bg-gray-400',
    badge: 'bg-gray-500/20 text-gray-300',
    border: 'text-gray-300 border-gray-700 hover:bg-gray-800/50',
    addBtn: 'text-gray-400 border-blue-900/60 hover:bg-gray-900/20',
  },
  'In Progress': {
    dot: 'bg-blue-400',
    badge: 'bg-blue-500/20 text-blue-200',
    border: 'text-blue-400 border-blue-900/60 hover:bg-blue-900/20',
    addBtn: 'text-blue-400 border-blue-900/60 hover:bg-blue-900/20',
  },
  'Reviewing': {
    dot: 'bg-amber-400',
    badge: 'bg-amber-500/20 text-amber-200',
    border: 'text-amber-400 border-amber-900/60 hover:bg-amber-900/20',
    addBtn: 'text-amber-400 border-amber-900/60 hover:bg-amber-900/20',
  },
  'Done': {
    dot: 'bg-green-400',
    badge: 'bg-green-500/20 text-green-200',
    border: 'text-green-400 border-green-900/60 hover:bg-green-900/20',
    addBtn: 'text-green-400 border-green-900/60 hover:bg-green-900/20',
  },
};

export const TaskView = memo(function TaskView({ project, tasks, onBack, onCreateTask, onUpdateTaskStatus, onUpdateTask, onDeleteTask, onUpdateProject, onDeleteProject, onAddLink, onRemoveLink }: TaskViewProps) {
=======
// Helper functions
const getPriorityFromWeight = (weight: number): string => {
  if (weight <= 3) return 'Low';
  if (weight <= 5) return 'Medium';
  if (weight <= 8) return 'High';
  return 'Very High';
};

const getDifficultyFromWeight = (weight: number): string => {
  if (weight <= 3) return 'Easy';
  if (weight <= 5) return 'Medium';
  if (weight <= 8) return 'Hard';
  return 'Very Hard';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Very High': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/30';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Very Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
    case 'Hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
    case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
    case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
    default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
  }
};

const isTaskOverdue = (dueDateStr?: string): boolean => {
  if (!dueDateStr) return false;
  const dateMatch = dueDateStr.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
  let dueDate;
  if (dateMatch) {
    const day = parseInt(dateMatch[1], 10);
    const month = parseInt(dateMatch[2], 10);
    const year = parseInt(dateMatch[3], 10);
    dueDate = new Date(year, month - 1, day);
  } else {
    dueDate = new Date(dueDateStr);
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today;
};

const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'Not Started': return 'Chưa bắt đầu';
    case 'In Progress': return 'Đang thực hiện';
    case 'Done': return 'Hoàn thành';
    default: return status;
  }
};

const getProgressColor = (progress: number): string => {
  if (progress >= 100) return 'bg-green-500';
  if (progress >= 70) return 'bg-emerald-500';
  if (progress >= 40) return 'bg-blue-500';
  if (progress >= 10) return 'bg-yellow-500';
  return 'bg-gray-500';
};

// Horizontal Progress Bar Component with Number Input
const HorizontalProgressBar = ({ progress, onChange, taskId, disabled }: { progress: number; onChange: (value: number) => void; taskId: string; disabled?: boolean }) => {
  const [inputValue, setInputValue] = useState<string>(progress.toString());
  
  useEffect(() => {
    setInputValue(progress.toString());
  }, [progress]);
  
  const handleBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;
    const newProgress = Math.round((x / width) * 100);
    onChange(Math.min(100, Math.max(0, newProgress)));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleInputBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue)) numValue = 0;
    numValue = Math.min(100, Math.max(0, numValue));
    setInputValue(numValue.toString());
    onChange(numValue);
  };
  
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };
  
  return (
    <div className="flex items-center gap-2 w-full">
      <div 
        className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden cursor-pointer"
        onClick={handleBarClick}
      >
        <div 
          className={`h-full transition-all duration-300 ${getProgressColor(progress)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleInputBlur}
        onKeyDown={handleInputKeyDown}
        disabled={disabled}
        className={`w-12 px-1 py-0.5 text-center text-xs rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      />
      <span className="text-[10px] text-gray-500">%</span>
    </div>
  );
};

export const TaskView = memo(function TaskView({ 
  project, 
  tasks, 
  onBack, 
  onCreateTask, 
  onUpdateTaskStatus, 
  onUpdateTask, 
  onDeleteTask, 
  onUpdateProject, 
  onDeleteProject, 
  onAddLink, 
  onRemoveLink,
  onUpdateTaskProgress
}: TaskViewProps) {
>>>>>>> feature/recommendation
  const [projectName, setProjectName] = useState(project.name);
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
<<<<<<< HEAD
  const [showContributions, setShowContributions] = useState(false);
  const [contributions, setContributions] = useState<ProjectContribution | null>(null);
  const [loadingContributions, setLoadingContributions] = useState(false);
=======
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'board' | 'table'>('board');
  const [taskSearch, setTaskSearch] = useState('');

  const [taskProgress, setTaskProgress] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.status === 'Done') {
        initial[task.id] = 100;
      } else {
        initial[task.id] = (task as any).progress || 0;
      }
    });
    return initial;
  });
>>>>>>> feature/recommendation

  useEffect(() => {
    setProjectName(project.name);
  }, [project.name]);

<<<<<<< HEAD
  const { localCompletion } = useMemo(() => {
=======
  useEffect(() => {
    const newProgress: Record<string, number> = {};
    tasks.forEach(task => {
      if (task.status === 'Done') {
        newProgress[task.id] = 100;
      } else if (taskProgress[task.id] !== undefined) {
        newProgress[task.id] = taskProgress[task.id];
      } else {
        newProgress[task.id] = (task as any).progress || 0;
      }
    });
    setTaskProgress(prev => ({ ...prev, ...newProgress }));
  }, [tasks]);

  const { totalWeight, doneWeight, localCompletion } = useMemo(() => {
>>>>>>> feature/recommendation
    const totalW = tasks.reduce((sum, t) => sum + (t.weight || 1), 0);
    const doneW = tasks.filter(t => t.status === 'Done').reduce((sum, t) => sum + (t.weight || 1), 0);
    const localC = totalW > 0 ? Math.round((doneW / totalW) * 100) : 0;
    return { localCompletion: localC };
  }, [tasks]);

  const overdueCount = useMemo(() => tasks.filter(isOverdue).length, [tasks]);

  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = { 'Not Started': [], 'In Progress': [], 'Reviewing': [], 'Done': [] };
    tasks.forEach(t => {
      if (map[t.status]) map[t.status].push(t);
      else map['Not Started'].push(t);
    });
    return map;
  }, [tasks]);

  const fetchContributions = async () => {
    if (contributions) { setShowContributions(v => !v); return; }
    setLoadingContributions(true);
    try {
      const all = await getMemberContributions();
      const found = all.find(p => p.projectId === project.id) || null;
      setContributions(found);
      setShowContributions(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingContributions(false);
    }
  };

  const handleSearchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) { setSearchResults([]); return; }
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
<<<<<<< HEAD
      setSearchResults(results.filter(u => !project.members?.some(m => m.id === u.id)));
    } catch (err) { console.error(err); }
    finally { setIsSearching(false); }
=======
      const filtered = results.filter(u => !project.members?.some(m => m.id === u.id));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
>>>>>>> feature/recommendation
  };

  const handleAddMember = async (userId: string) => {
    try {
      const updatedProject = await addProjectMember(project.id, userId);
      onUpdateProject?.(project.id, { members: updatedProject.members });
      setUserSearch(''); setSearchResults([]);
    } catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi thêm thành viên'); }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const updatedProject = await removeProjectMember(project.id, userId);
      onUpdateProject?.(project.id, { members: updatedProject.members });
    } catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi xoá thành viên'); }
  };

  const handleToggleAssignee = async (taskId: string, userId: string, isAssigned: boolean) => {
    if (!onUpdateTask) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    let newAssigneeIds = task.assignees?.map(a => a.id) || [];
    newAssigneeIds = isAssigned ? newAssigneeIds.filter(id => id !== userId) : [...newAssigneeIds, userId];
    try { await onUpdateTask(taskId, { assigneeIds: newAssigneeIds } as any); }
    catch (err) { console.error(err); }
  };

  const handleUpdatePriority = async (taskId: string, newPriority: TaskPriority) => {
    if (!onUpdateTask) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const priorityWeightMap: Record<TaskPriority, number> = { 
      Low: 2, 
      Medium: 4, 
      High: 7, 
      'Very High': 10 
    };
    const priorityWeight = priorityWeightMap[newPriority];
    const difficultyWeightMap: Record<string, number> = { Easy: 2, Medium: 4, Hard: 7, 'Very Hard': 10 };
    const currentDifficulty = getDifficultyFromWeight(task.weight || 4);
    const difficultyWeight = difficultyWeightMap[currentDifficulty] || 4;
    const newWeight = Math.round((priorityWeight + difficultyWeight) / 2);
    
    await onUpdateTask(taskId, { 
      priority: newPriority, 
      weight: newWeight 
    });
  };

  const handleUpdateDifficulty = async (taskId: string, newDifficulty: string) => {
    if (!onUpdateTask) return;
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const currentPriority = task.priority || 'Medium';
    const priorityWeightMap: Record<string, number> = { Low: 2, Medium: 4, High: 7, 'Very High': 10 };
    const priorityWeight = priorityWeightMap[currentPriority] || 4;
    const difficultyWeightMap: Record<string, number> = { Easy: 2, Medium: 4, Hard: 7, 'Very Hard': 10 };
    const difficultyWeight = difficultyWeightMap[newDifficulty] || 4;
    const newWeight = Math.round((priorityWeight + difficultyWeight) / 2);
    
    await onUpdateTask(taskId, { difficulty: newDifficulty, weight: newWeight } as any);
  };

  const handleProgressUpdate = async (taskId: string, newProgress: number) => {
    const clampedProgress = Math.min(100, Math.max(0, newProgress));
    setTaskProgress(prev => ({ ...prev, [taskId]: clampedProgress }));
    if (onUpdateTaskProgress) {
      onUpdateTaskProgress(taskId, clampedProgress);
    }
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      if (clampedProgress >= 100 && task.status !== 'Done') {
        onUpdateTaskStatus(taskId, 'Done');
        if (onUpdateTask) {
          await onUpdateTask(taskId, { status: 'Done', progress: 100 } as any);
        }
      } else if (clampedProgress < 100 && task.status === 'Done') {
        onUpdateTaskStatus(taskId, 'In Progress');
        if (onUpdateTask) {
          await onUpdateTask(taskId, { status: 'In Progress', progress: clampedProgress } as any);
        }
      } else if (clampedProgress > 0 && task.status === 'Not Started') {
        onUpdateTaskStatus(taskId, 'In Progress');
        if (onUpdateTask) {
          await onUpdateTask(taskId, { status: 'In Progress', progress: clampedProgress } as any);
        }
      }
    }
  };

  const handleNameBlur = () => {
    if (projectName.trim() !== project.name && onUpdateProject) {
      onUpdateProject(project.id, { name: projectName });
    }
  };
<<<<<<< HEAD
=======

  const handleTaskClick = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleMoveTask = (taskId: string, newStatus: TaskStatus) => {
    if (newStatus === 'Done') {
      setTaskProgress(prev => ({ ...prev, [taskId]: 100 }));
      if (onUpdateTaskProgress) {
        onUpdateTaskProgress(taskId, 100);
      }
    }
    const currentProgress = taskProgress[taskId];
    if (newStatus !== 'Done' && currentProgress === 100) {
      setTaskProgress(prev => ({ ...prev, [taskId]: 0 }));
      if (onUpdateTaskProgress) {
        onUpdateTaskProgress(taskId, 0);
      }
    }
    onUpdateTaskStatus(taskId, newStatus);
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => 
      t.title.toLowerCase().includes(taskSearch.toLowerCase()) ||
      (t.summary && t.summary.toLowerCase().includes(taskSearch.toLowerCase()))
    );
  }, [tasks, taskSearch]);

  const tasksByStatus = useMemo(() => ({
    'Not Started': filteredTasks.filter(t => t.status === 'Not Started'),
    'In Progress': filteredTasks.filter(t => t.status === 'In Progress'),
    'Done': filteredTasks.filter(t => t.status === 'Done'),
  }), [filteredTasks]);

  const priorityOptions: TaskPriority[] = ['Low', 'Medium', 'High', 'Very High'];
  const difficultyOptions = ['Easy', 'Medium', 'Hard', 'Very Hard'];
  const statusOptions: TaskStatus[] = ['Not Started', 'In Progress', 'Done'];
>>>>>>> feature/recommendation

  return (
    <div className="min-h-full bg-[#191919] text-white">
      {/* ── Project Header ── */}
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
              variant="ghost" size="sm"
              className="text-gray-500 hover:text-red-400 ml-4 h-9 w-9 p-0"
              onClick={() => onDeleteProject?.(project.id)}
            >
              <Trash2 className="w-5 h-5" />
            </Button>
          </div>
<<<<<<< HEAD

          {/* Progress Bar */}
=======
          
>>>>>>> feature/recommendation
          <div className="mt-4 flex items-center gap-4">
            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${localCompletion}%` }}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-bold text-white">{localCompletion}%</span>
              <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Hoàn thành</span>
            </div>
            {overdueCount > 0 && (
              <div className="flex items-center gap-1.5 bg-red-900/30 border border-red-700/50 px-2.5 py-1 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs text-red-300 font-bold">{overdueCount} quá hạn</span>
              </div>
            )}
          </div>
        </div>

        {/* Project Meta */}
        <div className="space-y-3 mt-8">
          <div className="grid grid-cols-[140px_1fr] gap-4 text-sm items-center">
            <div className="flex items-center gap-2 text-gray-400">
<<<<<<< HEAD
              <Sparkles className="w-4 h-4" /><span>Status</span>
=======
              <Sparkles className="w-4 h-4" />
              <span>Trạng thái</span>
>>>>>>> feature/recommendation
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 bg-[#2563EB]/40 border border-[#2563EB]/50 px-3 py-0.5 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                <span className="text-xs text-white font-medium">
                  {project.status === 'In Progress' ? 'Đang thực hiện' : project.status === 'Not Started' ? 'Chưa bắt đầu' : 'Hoàn thành'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
<<<<<<< HEAD
              <Users className="w-4 h-4" /><span>Owner</span>
=======
              <Users className="w-4 h-4" />
              <span>Chủ sở hữu</span>
>>>>>>> feature/recommendation
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
                <PopoverContent className="w-80 sm:w-96 bg-[#1e1e1e] border-[#333] p-0 shadow-2xl rounded-xl z-50">
                  <div className="p-3 border-b border-gray-800">
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thành viên dự án</h4>
                  </div>
                  <div className="max-h-64 overflow-y-auto p-2">
                    {project.members && project.members.length > 0 ? (
                      <div className="space-y-1">
                        {project.members.map(m => (
                          <div key={m.id} className="flex items-center justify-between p-2 hover:bg-gray-800 rounded group transition-colors">
                            <div className="flex items-center gap-3 min-w-0 flex-1">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex flex-col min-w-0 flex-1">
                                <span className="text-sm font-medium text-gray-200 truncate">{m.name}</span>
                                <span className="text-xs text-gray-500 truncate">{m.email}</span>
                              </div>
                            </div>
                            <button 
                              onClick={() => handleRemoveMember(m.id)} 
                              className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-all flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center">
                        <Users className="w-10 h-10 text-gray-600 mx-auto mb-2" />
                        <p className="text-sm text-gray-500">Chưa có thành viên nào</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-gray-800 bg-[#252525]/30">
                    <div className="relative">
<<<<<<< HEAD
                      <SearchIcon className="absolute left-2 top-2 w-3 h-3 text-gray-500" />
                      <input
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-1.5 pl-7 pr-2 text-xs outline-none focus:border-blue-500"
=======
                      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input 
                        className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
>>>>>>> feature/recommendation
                        placeholder="Tìm theo email hoặc tên..."
                        value={userSearch}
                        onChange={(e) => handleSearchUsers(e.target.value)}
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                        {searchResults.map(u => (
                          <button
                            key={u.id}
                            onClick={() => handleAddMember(u.id)}
                            className="w-full flex items-center gap-3 p-2 hover:bg-blue-600 rounded-lg transition-colors text-left"
                          >
                            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-sm font-medium text-gray-200 truncate">{u.name}</span>
                              <span className="text-xs text-gray-400 truncate">{u.email}</span>
                            </div>
                            <UserPlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    )}
                    {isSearching && (
                      <div className="mt-2 flex justify-center py-2">
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-center gap-2 text-gray-400">
<<<<<<< HEAD
              <Calendar className="w-4 h-4" /><span>Dates</span>
=======
              <Calendar className="w-4 h-4" />
              <span>Ngày</span>
>>>>>>> feature/recommendation
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
        </div>

<<<<<<< HEAD
        {/* ── Member Contributions Section ── */}
        <div className="pt-4 border-t border-gray-800">
          <button
            onClick={fetchContributions}
            className="flex items-center gap-2 text-sm font-semibold text-gray-300 hover:text-white transition-colors group"
          >
            <Award className="w-5 h-5 text-blue-400 group-hover:text-blue-300" />
            Đóng góp thành viên
            {loadingContributions && <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin ml-1" />}
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showContributions ? 'rotate-180' : ''}`} />
          </button>

          {showContributions && contributions && (
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-gray-800 text-gray-500 text-xs uppercase tracking-wider">
                    <th className="py-2 pr-4 text-left font-bold">Thành viên</th>
                    <th className="py-2 px-3 text-center font-bold">Giao việc</th>
                    <th className="py-2 px-3 text-center font-bold">Hoàn thành</th>
                    <th className="py-2 px-3 text-center font-bold">Quá hạn</th>
                    <th className="py-2 px-3 text-left font-bold w-36">Tiến độ</th>
                    <th className="py-2 px-3 text-center font-bold">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {contributions.members.map(({ member, totalAssigned, done, overdue, completionRate }) => {
                    const status = overdue > 0 ? 'at-risk' : completionRate >= 80 ? 'on-track' : 'behind';
                    return (
                      <tr key={member.id} className="border-b border-gray-800/50 hover:bg-[#222]">
                        <td className="py-2.5 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-gray-200 text-xs">{member.name}</div>
                              <div className="text-[10px] text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center text-gray-300 font-mono text-xs">{totalAssigned}</td>
                        <td className="py-2.5 px-3 text-center text-green-400 font-mono text-xs">{done}</td>
                        <td className="py-2.5 px-3 text-center">
                          {overdue > 0 ? (
                            <span className="text-red-400 font-bold font-mono text-xs">{overdue}</span>
                          ) : (
                            <span className="text-gray-600 font-mono text-xs">0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${completionRate >= 80 ? 'bg-green-500' : completionRate >= 40 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400 w-7 text-right">{completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {status === 'on-track' && <span className="text-[10px] bg-green-900/50 text-green-300 border border-green-700/50 px-2 py-0.5 rounded-full">On track</span>}
                          {status === 'behind' && <span className="text-[10px] bg-blue-900/50 text-blue-300 border border-blue-700/50 px-2 py-0.5 rounded-full">Behind</span>}
                          {status === 'at-risk' && <span className="text-[10px] bg-red-900/50 text-red-300 border border-red-700/50 px-2 py-0.5 rounded-full">At risk ⚠️</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          {showContributions && !contributions && !loadingContributions && (
            <p className="text-xs text-gray-500 mt-2 italic">Chưa có dữ liệu đóng góp cho dự án này.</p>
          )}
        </div>

        {/* Links */}
=======
>>>>>>> feature/recommendation
        <div className="space-y-4 pt-4 border-t border-gray-800">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-200">
              <LinkIcon className="w-5 h-5 text-blue-400" />
              Liên kết & Tài liệu
            </h3>
            <Button
              variant="ghost" size="sm"
              className="text-xs text-blue-400 hover:text-blue-300 h-8"
              onClick={() => setIsAddingLink(!isAddingLink)}
            >
              {isAddingLink ? 'Huỷ' : 'Thêm liên kết'}
            </Button>
          </div>

          {isAddingLink && (
            <div className="bg-[#222] border border-gray-700 rounded-lg p-3 space-y-3">
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Tiêu đề</label>
                <input
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                  placeholder="VD: Repo dự án, Figma..."
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">URL</label>
                <input
                  className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md px-3 py-1.5 text-sm outline-none focus:border-blue-500"
                  placeholder="https://..."
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                />
              </div>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9"
                disabled={!newLinkTitle || !newLinkUrl}
                onClick={() => {
                  if (onAddLink) {
                    onAddLink(project.id, newLinkTitle, newLinkUrl);
                    setNewLinkTitle(''); setNewLinkUrl(''); setIsAddingLink(false);
                  }
                }}
              >
                Lưu liên kết
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {project.links && project.links.length > 0 ? (
              project.links.map(link => (
                <div key={link.id} className="group flex items-center justify-between bg-[#222] hover:bg-[#2a2a2a] border border-gray-800 rounded-lg p-3 transition-all">
                  <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-medium text-gray-200 truncate">{link.title}</span>
                      <span className="text-[10px] text-gray-500 truncate">{link.url}</span>
                    </div>
                  </a>
                  <button onClick={() => onRemoveLink?.(project.id, link.id)} className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-500 hover:text-red-400 transition-opacity">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))
            ) : !isAddingLink && (
              <div className="col-span-full py-4 text-center border border-dashed border-gray-800 rounded-xl">
                <p className="text-sm text-gray-500">Chưa có liên kết nào. Thêm các tài liệu liên quan tại đây.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Task Board ── */}
      <div className="flex-shrink-0 border-t border-gray-800">
        <div className="px-8 py-6">
          <h2 className="text-xl mb-4 text-white">Nhiệm vụ dự án</h2>

          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-800">
<<<<<<< HEAD
            <Button variant="ghost" size="sm" className="bg-[#333333] text-white hover:bg-[#444444] rounded-full px-4">
              <LayoutGrid className="w-4 h-4 mr-2" />Board
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white rounded-full px-4">
              <List className="w-4 h-4 mr-2" />Tasks
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-400 hover:bg-gray-800"><Filter className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800"><ArrowUpDown className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800"><Search className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800"><Maximize2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800"><SlidersHorizontal className="w-4 h-4" /></Button>
              <div className="flex items-center ml-2 rounded-md overflow-hidden bg-blue-600">
                <button
                  className="px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
                  onClick={() => onCreateTask(project.id, 'Not Started')}
                >
                  Mới
                </button>
                <div className="w-px h-full bg-blue-500/50" />
                <button className="px-2 py-1.5 text-white hover:bg-blue-700 transition-colors">
                  <ChevronDown className="w-4 h-4" />
                </button>
=======
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full px-4 ${viewMode === 'board' ? 'bg-[#333333] text-white hover:bg-[#444444]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              onClick={() => setViewMode('board')}
            >
              <LayoutGrid className="w-4 h-4 mr-2" />
              Bảng
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`rounded-full px-4 ${viewMode === 'table' ? 'bg-[#333333] text-white hover:bg-[#444444]' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4 mr-2" />
              Danh sách
            </Button>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <div className="relative">
                <SearchIcon className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhiệm vụ..."
                  value={taskSearch}
                  onChange={(e) => setTaskSearch(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-sm rounded-lg bg-gray-800 border border-gray-700 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
>>>>>>> feature/recommendation
              </div>
              <button 
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center gap-2"
                onClick={() => onCreateTask(project.id, 'Not Started')}
              >
                <Plus className="w-4 h-4" />
                Thêm nhiệm vụ
              </button>
            </div>
          </div>

<<<<<<< HEAD
          {/* 4-column Kanban */}
          <div className="grid grid-cols-4 gap-4">
            {STATUSES.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const statusTasks = tasksByStatus[status] || [];
              return (
                <div key={status} className="flex flex-col bg-[#222] rounded-xl p-3 border border-gray-800/40">
                  <div className="mb-3">
                    <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${cfg.badge}`}>
                      <div className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                      {status}
                      <span className="text-[10px] opacity-60 font-normal">({statusTasks.length})</span>
                    </div>
                  </div>

                  <div className="space-y-2 flex-1">
                    {statusTasks.map((task) => {
                      const overdue = isOverdue(task);
                      return (
                        <div
                          key={task.id}
                          className={`bg-[#1a1a1a] rounded-lg p-3 text-sm hover:bg-[#252525] shadow-sm border transition-shadow space-y-2 group ${
                            overdue
                              ? 'border-red-800/60 bg-red-950/10 hover:bg-red-950/20'
                              : 'border-gray-800/50 focus-within:ring-1 focus-within:ring-gray-600'
                          }`}
                        >
                          {/* Title row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 flex-1 min-w-0">
                              {overdue && <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                              <input
                                value={task.title}
                                onChange={(e) => onUpdateTask?.(task.id, { title: e.target.value })}
                                className="bg-transparent border-none outline-none flex-1 text-white cursor-text font-medium truncate"
                              />
                            </div>
                            <Button
                              variant="ghost" size="sm"
                              className="text-gray-600 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all"
                              onClick={() => onDeleteTask(task.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>

                          {/* Priority + Due row */}
                          <div className="flex items-center gap-2 flex-wrap">
                            <PriorityBadge priority={task.priority} />
                            <CustomDatePicker
                              trigger={
                                <button className={`flex items-center gap-1.5 text-[11px] transition-colors ${overdue ? 'text-red-400 hover:text-red-300' : 'text-gray-500 hover:text-gray-300'}`}>
                                  <Calendar className="w-3 h-3" />
                                  {task.due || 'Thêm ngày'}
                                </button>
                              }
=======
          {viewMode === 'board' ? (
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                const isNotStarted = status === 'Not Started';
                const isInProgress = status === 'In Progress';
                const isDone = status === 'Done';
                const statusLabel = getStatusLabel(status);
                return (
                  <div key={status} className="flex flex-col bg-[#222] rounded-xl p-3 border border-gray-800/40">
                    <div className="mb-3">
                      <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                        isNotStarted ? 'bg-gray-500/20 text-gray-300' : isInProgress ? 'bg-blue-500/20 text-blue-200' : 'bg-green-500/20 text-green-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${isNotStarted ? 'bg-gray-400' : isInProgress ? 'bg-blue-400' : 'bg-green-400'}`} />
                        {statusLabel}
                      </div>
                    </div>
                    <div className="space-y-2 flex-1">
                      {statusTasks.map((task) => {
                        const taskPriority = task.priority || getPriorityFromWeight(task.weight || 4);
                        const taskDifficulty = getDifficultyFromWeight(task.weight || 4);
                        const isOverdue = isTaskOverdue(task.due) && task.status !== 'Done';
                        const progress = taskProgress[task.id] ?? (task.status === 'Done' ? 100 : 0);
                        return (
                          <div key={task.id} className="relative group">
                            <div className={`rounded-lg p-3 text-sm hover:bg-[#252525] shadow-sm border transition-all duration-200 space-y-2 ${
                              isOverdue ? 'bg-red-950/30 border-red-500/50 shadow-red-500/20 hover:bg-red-950/40' : 'bg-[#1a1a1a] border-gray-800/50 hover:bg-[#252525]'
                            }`}>
                              <div className="flex items-center justify-between gap-2">
                                <input
                                  value={task.title}
                                  onChange={(e) => onUpdateTask?.(task.id, { title: e.target.value })}
                                  className={`bg-transparent border-none outline-none flex-1 cursor-text font-medium ${isOverdue ? 'text-red-200' : 'text-white'}`}
                                />
                                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-all" onClick={() => onDeleteTask(task.id)}>
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                              <div className="py-1">
                                <HorizontalProgressBar 
                                  progress={progress}
                                  onChange={(value) => handleProgressUpdate(task.id, value)}
                                  taskId={task.id}
                                  disabled={task.status === 'Done'}
                                />
                              </div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getPriorityColor(taskPriority)}`}>
                                      <Flag className="w-3 h-3" />
                                      {taskPriority}
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-32 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                    {priorityOptions.map(p => (
                                      <button key={p} type="button" onClick={() => handleUpdatePriority(task.id, p)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${p === taskPriority ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                        {p}
                                      </button>
                                    ))}
                                  </PopoverContent>
                                </Popover>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${getDifficultyColor(taskDifficulty)}`}>
                                      <TrendingUp className="w-3 h-3" />
                                      {taskDifficulty}
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-32 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                    {difficultyOptions.map(d => (
                                      <button key={d} type="button" onClick={() => handleUpdateDifficulty(task.id, d)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${d === taskDifficulty ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                        {d}
                                      </button>
                                    ))}
                                  </PopoverContent>
                                </Popover>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                                      task.status === 'Done' ? 'bg-green-900/50 text-green-200 border-green-700' : task.status === 'In Progress' ? 'bg-blue-900/50 text-blue-200 border-blue-700' : 'bg-gray-700 text-gray-300 border-gray-600'
                                    }`}>
                                      <Sparkles className="w-3 h-3" />
                                      {getStatusLabel(task.status)}
                                      <ChevronDown className="w-3 h-3" />
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-40 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                    {statusOptions.map(s => (
                                      <button key={s} type="button" onClick={() => handleMoveTask(task.id, s)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${s === task.status ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                        {getStatusLabel(s)}
                                      </button>
                                    ))}
                                  </PopoverContent>
                                </Popover>
                                <CustomDatePicker 
                                  trigger={<button className={`flex items-center gap-1.5 text-[11px] transition-colors ${isOverdue ? 'text-red-400 hover:text-red-300' : 'text-gray-500 hover:text-gray-300'}`}>
                                    <Calendar className="w-3 h-3" />
                                    {task.due || 'Thêm ngày'}
                                  </button>}
                                  onSelect={(date) => {
                                    if (date && onUpdateTask) {
                                      const formattedDate = `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                                      onUpdateTask(task.id, { due: formattedDate });
                                    }
                                  }}
                                />
                                {isOverdue && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-red-500/30 text-red-300 border border-red-500/50">
                                    <AlertCircle className="w-3 h-3" />
                                    Quá hạn
                                  </span>
                                )}
                                <div className="flex-1" />
                                <button onClick={() => handleTaskClick(task.id)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-200 transition-colors hover:bg-gray-800 px-2 py-1 rounded">
                                  <Maximize2 className="w-3 h-3" />
                                </button>
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
                                  <PopoverContent className="w-48 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-xl z-50">
                                    <div className="p-2 border-b border-gray-800 mb-1">
                                      <span className="text-[10px] font-bold text-gray-500 uppercase">Gán cho...</span>
                                    </div>
                                    {project.members?.map(m => {
                                      const isAssigned = task.assignees?.some(a => a.id === m.id);
                                      return (
                                        <button key={m.id} type="button" onClick={() => handleToggleAssignee(task.id, m.id, !!isAssigned)} className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors group">
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-[10px]">{m.name.charAt(0).toUpperCase()}</div>
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
                            {expandedTaskId === task.id && (
                              <div className="absolute left-1/2 transform -translate-x-1/2 z-[100]" style={{ bottom: '100%', marginBottom: '8px', minWidth: 'min(340px, 90vw)', maxWidth: '90vw' }}>
                                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                                  <div className="w-3 h-3 bg-[#1e1e1e] rotate-45 border-r border-b border-gray-700"></div>
                                </div>
                                <TaskDetailPopup 
                                  taskId={task.id} 
                                  taskTitle={task.title}
                                  taskPriority={taskPriority}
                                  taskDifficulty={taskDifficulty}
                                  taskSummary={task.summary}
                                  taskDue={task.due}
                                  taskWeight={task.weight}
                                  onClose={() => setExpandedTaskId(null)}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                      <button onClick={() => onCreateTask(project.id, status)} className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors border ${
                        isNotStarted ? 'text-gray-300 border-gray-700 hover:bg-gray-800/50' : isInProgress ? 'text-blue-400 border-blue-900/60 hover:bg-blue-900/20' : 'text-green-400 border-green-900/60 hover:bg-green-900/20'
                      }`}>
                        <Plus className="w-4 h-4" />
                        Nhiệm vụ mới
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-[#1a1a1a] rounded-lg border border-gray-800 overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800 bg-[#222]">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tên nhiệm vụ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Tiến độ</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Trạng thái</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Ưu tiên</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Độ khó</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Hạn chót</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Người được gán</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-300">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">Không có nhiệm vụ nào</td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const taskPriority = task.priority || getPriorityFromWeight(task.weight || 4);
                      const taskDifficulty = getDifficultyFromWeight(task.weight || 4);
                      const isOverdue = isTaskOverdue(task.due) && task.status !== 'Done';
                      const progress = taskProgress[task.id] ?? (task.status === 'Done' ? 100 : 0);
                      return (
                        <tr key={task.id} className={`border-b border-gray-800 hover:bg-[#252525] transition-colors ${isOverdue ? 'bg-red-950/20' : ''}`}>
                          <td className="px-4 py-3 text-sm text-gray-200">
                            <div className="flex items-center gap-2">
                              {isOverdue && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                              <input value={task.title} onChange={(e) => onUpdateTask?.(task.id, { title: e.target.value })} className="bg-transparent border-none outline-none text-white w-full" />
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm min-w-[180px]">
                            <HorizontalProgressBar 
                              progress={progress}
                              onChange={(value) => handleProgressUpdate(task.id, value)}
                              taskId={task.id}
                              disabled={task.status === 'Done'}
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                                  task.status === 'Not Started' ? 'bg-gray-700 text-gray-300' : task.status === 'In Progress' ? 'bg-blue-900/50 text-blue-200' : 'bg-green-900/50 text-green-200'
                                }`}>
                                  {getStatusLabel(task.status)}
                                  <ChevronDown className="w-3 h-3 inline ml-1" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-36 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                {statusOptions.map(status => (
                                  <button key={status} type="button" onClick={() => handleMoveTask(task.id, status)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${status === task.status ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                    {getStatusLabel(status)}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getPriorityColor(taskPriority)}`}>
                                  {taskPriority}
                                  <ChevronDown className="w-3 h-3 inline ml-1" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-32 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                {priorityOptions.map(p => (
                                  <button key={p} type="button" onClick={() => handleUpdatePriority(task.id, p)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${p === taskPriority ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                    {p}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={`px-2 py-1 rounded text-xs font-medium transition-colors ${getDifficultyColor(taskDifficulty)}`}>
                                  {taskDifficulty}
                                  <ChevronDown className="w-3 h-3 inline ml-1" />
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-32 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-lg z-50">
                                {difficultyOptions.map(d => (
                                  <button key={d} type="button" onClick={() => handleUpdateDifficulty(task.id, d)} className={`w-full text-left px-2 py-1.5 rounded text-xs transition-colors ${d === taskDifficulty ? 'bg-blue-500/20 text-blue-400' : 'text-gray-300 hover:bg-gray-800'}`}>
                                    {d}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">
                            <CustomDatePicker 
                              trigger={<button className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors">{task.due || 'Thêm ngày'}</button>}
>>>>>>> feature/recommendation
                              onSelect={(date) => {
                                if (date && onUpdateTask) {
                                  const formattedDate = `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
                                  onUpdateTask(task.id, { due: formattedDate });
                                }
                              }}
<<<<<<< HEAD
                            />
                            <div className="flex items-center gap-1 bg-gray-800/50 px-1.5 py-0.5 rounded border border-gray-700/50">
                              <span className="text-[10px] text-gray-500 font-medium">W</span>
                              <input
                                type="number" min="1" max="100"
                                value={task.weight || 1}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  if (!isNaN(val) && onUpdateTask) onUpdateTask(task.id, { weight: val });
                                }}
                                className="w-7 bg-transparent text-[10px] text-blue-400 font-bold outline-none border-none p-0 text-center"
                              />
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-gray-500">Tiến độ</span>
                              <span className="text-[10px] text-blue-400 font-bold">{task.progress ?? 0}%</span>
                            </div>
                            <div className="relative h-1.5 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  (task.progress ?? 0) >= 100 ? 'bg-green-500' :
                                  (task.progress ?? 0) >= 50 ? 'bg-blue-500' : 'bg-orange-500'
                                }`}
                                style={{ width: `${task.progress ?? 0}%` }}
                              />
                            </div>
                            <input
                              type="range" min="0" max="100"
                              value={task.progress ?? 0}
                              onChange={(e) => {
                                if (onUpdateTask) onUpdateTask(task.id, { progress: parseInt(e.target.value) });
                              }}
                              className="w-full h-1 accent-blue-500 cursor-pointer"
                            />
                          </div>

                          {/* Assignees */}
                          <div className="flex items-center justify-between">
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
                                      className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
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

                            {/* Status change dropdown */}
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${STATUS_CONFIG[task.status as keyof typeof STATUS_CONFIG]?.badge || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
                                  {task.status}
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-40 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-xl">
                                {STATUSES.map(s => (
                                  <button
                                    key={s}
                                    onClick={() => onUpdateTaskStatus(task.id, s)}
                                    className={`w-full flex items-center gap-2 p-2 hover:bg-gray-800 rounded text-xs transition-colors ${task.status === s ? 'opacity-50 cursor-default' : ''}`}
                                  >
                                    <div className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                    {s}
                                    {task.status === s && <Check className="w-3 h-3 ml-auto text-blue-400" />}
                                  </button>
                                ))}
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      );
                    })}

                    <button
                      onClick={() => onCreateTask(project.id, status)}
                      className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors border ${cfg.border}`}
                    >
                      <Plus className="w-4 h-4" />
                      Nhiệm vụ mới
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
=======
                            />
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex -space-x-2">
                              {task.assignees && task.assignees.length > 0 ? (
                                task.assignees.map(a => (
                                  <div key={a.id} className="w-6 h-6 rounded-full bg-blue-600 border border-[#1a1a1a] flex items-center justify-center text-[8px] font-bold text-white" title={a.name}>
                                    {a.name.charAt(0).toUpperCase()}
                                  </div>
                                ))
                              ) : <span className="text-xs text-gray-500">-</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <div className="flex items-center gap-1">
                              <button onClick={() => handleTaskClick(task.id)} className="p-1 text-gray-400 hover:text-gray-200 hover:bg-gray-800 rounded transition-colors" title="Xem chi tiết">
                                <Maximize2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => onDeleteTask(task.id)} className="p-1 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded transition-colors" title="Xoá">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
>>>>>>> feature/recommendation
        </div>
      </div>

      {expandedTaskId && viewMode === 'table' && (
        <div className="fixed inset-0 flex items-center justify-center z-[200] bg-black/50 backdrop-blur-sm" onClick={() => setExpandedTaskId(null)}>
          <div onClick={(e) => e.stopPropagation()}>
            <TaskDetailPopup 
              taskId={expandedTaskId} 
              taskTitle={tasks.find(t => t.id === expandedTaskId)?.title || ''}
              taskPriority={getPriorityFromWeight(tasks.find(t => t.id === expandedTaskId)?.weight || 4)}
              taskDifficulty={getDifficultyFromWeight(tasks.find(t => t.id === expandedTaskId)?.weight || 4)}
              taskSummary={tasks.find(t => t.id === expandedTaskId)?.summary}
              taskDue={tasks.find(t => t.id === expandedTaskId)?.due}
              taskWeight={tasks.find(t => t.id === expandedTaskId)?.weight}
              onClose={() => setExpandedTaskId(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
});