import { useState, useMemo, memo } from 'react';
import { Plus, CircleDot, ChevronDown, Target, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, LayoutGrid, Calendar, Trash2, X, Check, Play, CheckCircle, Pause } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

import { type Project } from '../api';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject?: (projectId: string) => void;
  selectedProjectId: string | null;
}

export const ProjectList = memo(function ProjectList({ projects, onSelectProject, onCreateProject, onDeleteProject, selectedProjectId }: ProjectListProps) {
  const [activeTab, setActiveTab] = useState<'Active' | 'Timeline' | 'Board' | 'All'>('Board');

  // Toolbar States
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'completion' | 'priority' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [filterPriorities, setFilterPriorities] = useState<string[]>([]);
  const [showColumns, setShowColumns] = useState({
    owner: true,
    dates: true,
    priority: true,
    completion: true,
    blockedBy: true,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-600';
      case 'In Progress':
        return 'bg-yellow-600';
      case 'Finished':
        return 'bg-green-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-600/80 text-red-100 hover:bg-red-600/80';
      case 'Medium':
        return 'bg-yellow-600/80 text-yellow-100 hover:bg-yellow-600/80';
      case 'Low':
        return 'bg-green-600/80 text-green-100 hover:bg-green-600/80';
      default:
        return 'bg-gray-600/80 text-gray-100 hover:bg-gray-600/80';
    }
  };

  const processedProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.owner && p.owner.toLowerCase().includes(q))
      );
    }

    if (filterStatuses.length > 0) {
      result = result.filter(p => filterStatuses.includes(p.status));
    }
    if (filterPriorities.length > 0) {
      result = result.filter(p => filterPriorities.includes(p.priority));
    }

    if (sortBy) {
      result.sort((a, b) => {
        let valA: any = a[sortBy];
        let valB: any = b[sortBy];
        
        if (sortBy === 'priority') {
          const pOrder = { 'High': 3, 'Medium': 2, 'Low': 1, '': 0 };
          valA = pOrder[a.priority as keyof typeof pOrder] || 0;
          valB = pOrder[b.priority as keyof typeof pOrder] || 0;
        }
        if (sortBy === 'name') {
          valA = valA.toLowerCase();
          valB = valB.toLowerCase();
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [projects, searchQuery, filterStatuses, filterPriorities, sortBy, sortOrder]);

  const groupedProjects = useMemo(() => {
    return processedProjects.reduce((acc, project) => {
      if (!acc[project.status]) {
        acc[project.status] = [];
      }
      acc[project.status].push(project);
      return acc;
    }, {} as Record<string, typeof projects>);
  }, [processedProjects]);

  const renderActiveView = () => (
    <>
      {Object.entries(groupedProjects).map(([status, statusProjects]) => (
        <div key={status} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ChevronDown className="w-4 h-4 text-gray-400" />
            <Badge className={`${getStatusColor(status)} text-white px-2 py-0.5 text-xs`}>
              {status}
            </Badge>
            <span className="text-gray-500 text-sm">{statusProjects.length}</span>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1a1a1a]">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Project name</div>
                  </th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Status</div>
                  </th>
                  {showColumns.owner && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">Owner</div>
                    </th>
                  )}
                  {showColumns.dates && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">Dates</div>
                    </th>
                  )}
                  {showColumns.priority && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">Priority</div>
                    </th>
                  )}
                  {showColumns.completion && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">Completion</div>
                    </th>
                  )}
                  {showColumns.blockedBy && (
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">Blocked By</div>
                    </th>
                  )}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {statusProjects.map((project) => (
                  <tr
                    key={project.id}
                    className="border-b border-gray-800 hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{project.icon}</span>
                        <span className="text-sm font-medium">{project.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge className={`${getStatusColor(project.status)} text-white px-2 py-0.5 text-xs`}>
                        {project.status === 'In Progress' ? (
                          <Play className="w-2.5 h-2.5 inline mr-1" />
                        ) : project.status === 'Finished' ? (
                          <CheckCircle className="w-2.5 h-2.5 inline mr-1" />
                        ) : (
                          <Pause className="w-2.5 h-2.5 inline mr-1" />
                        )}
                        {project.status}
                      </Badge>
                    </td>
                    {showColumns.owner && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-xs">
                            {project.owner?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span className="text-sm text-gray-300">{project.owner}</span>
                        </div>
                      </td>
                    )}
                    {showColumns.dates && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300">{project.dates}</span>
                      </td>
                    )}
                    {showColumns.priority && (
                      <td className="px-4 py-3">
                        {project.priority && (
                          <Badge className={`${getPriorityColor(project.priority)} px-2 py-0.5 text-xs border-none`}>
                            {project.priority}
                          </Badge>
                        )}
                      </td>
                    )}
                    {showColumns.completion && (
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300 w-12">{project.completion}%</span>
                          <Progress value={project.completion} className="w-24 h-2 bg-gray-700" />
                        </div>
                      </td>
                    )}
                    {showColumns.blockedBy && (
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{project.blockedBy}</span>
                      </td>
                    )}
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteProject?.(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-800/50 transition-colors flex items-center gap-2"
              onClick={onCreateProject}
            >
              <Plus className="w-4 h-4" />
              Dự án mới
            </button>
          </div>
        </div>
      ))}
    </>
  );

  const renderBoardView = () => {
    const boardStatuses = ['Planning', 'In Progress', 'Finished'];
    const allStatuses = Array.from(new Set([...boardStatuses, ...Object.keys(groupedProjects)]));

    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {allStatuses.map(status => {
          const statusProjects = groupedProjects[status] || [];
          if (statusProjects.length === 0 && !boardStatuses.includes(status)) return null;

          return (
            <div key={status} className="flex-shrink-0 w-[320px] bg-[#1a1a1a] rounded-xl border border-gray-800/60 p-4 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(status).replace('bg-', 'bg-').replace('-600', '-500')}`} />
                  <span className="font-semibold text-sm text-gray-200">{status}</span>
                  <Badge className="bg-gray-800 text-gray-400 hover:bg-gray-800 px-1.5 py-0 min-w-[20px] justify-center">{statusProjects.length}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-6 w-8 p-0">
                  ...
                </Button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {statusProjects.map(project => (
                  <div 
                    key={project.id} 
                    className="bg-[#222222] rounded-lg border border-gray-800/80 p-4 cursor-pointer hover:border-gray-600 transition-all shadow-sm hover:shadow-md"
                    onClick={() => onSelectProject(project.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <span className="text-xl leading-none mt-0.5">{project.icon}</span>
                        <h3 className="font-medium text-[15px] leading-snug text-gray-100">{project.name}</h3>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject?.(project.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    
                    {project.dates && (
                      <div className="text-[13px] text-gray-400 mb-4 font-medium">
                        {project.dates}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-auto">
                      {project.priority ? (
                        <Badge className={`${getPriorityColor(project.priority)} px-2 py-0.5 text-[11px] font-medium border-none`}>
                          {project.priority}
                        </Badge>
                      ) : <div />}
                      
                      {project.completion !== undefined && (
                        <div className="flex items-center gap-2 w-28">
                          <span className="text-[11px] font-medium text-gray-400 w-9 text-right">{project.completion}%</span>
                          <Progress value={project.completion} className="h-1.5 bg-gray-800 flex-1" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] justify-start text-sm font-medium py-2 h-auto"
                  onClick={onCreateProject}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Dự án mới
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // ... (keep parseVNDate and renderTimelineView functions, but update status colors to use Finished)

  const parseVNDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split(' → ');
    
    const parseSingle = (s: string) => {
      const match = s.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
      if (match) {
        return new Date(parseInt(match[3]), parseInt(match[2]) - 1, parseInt(match[1]));
      }
      return null;
    };

    const start = parseSingle(parts[0]);
    const end = parts[1] ? parseSingle(parts[1]) : start;
    
    if (!start || !end) return null;
    return { start, end };
  };

  const renderTimelineView = () => {
    const timelineStart = new Date(2025, 7, 1);
    const timelineEnd = new Date(2025, 11, 31);
    const totalMs = timelineEnd.getTime() - timelineStart.getTime();

    return (
      <div className="flex h-full border border-gray-800/60 rounded-xl overflow-hidden bg-[#1e1e1e]">
        {/* Left Sidebar */}
        <div className="w-[300px] border-r border-gray-800/60 flex flex-col bg-[#1a1a1a] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
          <div className="h-14 border-b border-gray-800/60 flex items-center px-5 shrink-0">
            <span className="text-sm font-semibold text-gray-300">Quản lý trong Lịch</span>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            {Object.entries(groupedProjects).map(([status, statusProjects]) => (
              <div key={status} className="mb-4">
                <div className="flex items-center gap-2 px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-gray-300 cursor-pointer group">
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                  {status} <span className="text-xs text-gray-600">{statusProjects.length}</span>
                </div>
                {statusProjects.map(project => (
                  <div key={project.id} className="flex items-center gap-3 px-8 py-2.5 text-sm hover:bg-[#2a2a2a] cursor-pointer transition-colors group">
                    <span className="text-base">{project.icon}</span>
                    <span className="truncate font-medium text-gray-300 group-hover:text-white">{project.name}</span>
                  </div>
                ))}
              </div>
            ))}
            <Button 
              variant="ghost" 
              className="ml-8 text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] justify-start text-sm py-1 h-8"
              onClick={onCreateProject}
            >
              <Plus className="w-3.5 h-3.5 mr-2" />
              Mới
            </Button>
          </div>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 flex flex-col overflow-x-auto bg-[#141414]">
          <div className="h-14 border-b border-gray-800/60 flex min-w-max shrink-0 bg-[#1a1a1a]">
            {['Tháng 8 2025', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'].map((month, i) => (
              <div key={i} className="w-[200px] border-r border-gray-800/60 flex flex-col">
                <div className="text-[13px] font-medium text-center text-gray-300 py-1.5">{month}</div>
                <div className="flex border-t border-gray-800/60 flex-1">
                  {[1, 8, 15, 22].map((day, j) => (
                    <div key={j} className="flex-1 text-[11px] font-medium flex items-center justify-center text-gray-500 border-r border-gray-800/40 last:border-0">
                      {day}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto relative min-w-max py-3">
            <div className="absolute inset-0 flex pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="w-[50px] border-r border-gray-800/20" />
              ))}
            </div>
            
            <div className="relative z-10">
              {Object.entries(groupedProjects).map(([status, statusProjects]) => (
                <div key={status} className="mb-4">
                  <div className="h-[34px]" />
                  {statusProjects.map((project) => {
                    const dateInfo = parseVNDate(project.dates);
                    let left = '0%';
                    let width = '0%';

                    if (dateInfo) {
                      const startOffset = dateInfo.start.getTime() - timelineStart.getTime();
                      const endOffset = dateInfo.end.getTime() - timelineStart.getTime();
                      
                      const leftPercent = Math.max(0, Math.min(100, (startOffset / totalMs) * 100));
                      const rightPercent = Math.max(0, Math.min(100, (endOffset / totalMs) * 100));
                      
                      left = `${leftPercent}%`;
                      width = `${Math.max(2, rightPercent - leftPercent)}%`;
                    }
                    
                    return (
                      <div key={project.id} className="h-[44px] relative group flex items-center">
                        <div 
                          className={`absolute h-[28px] rounded-full flex items-center px-3 shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer whitespace-nowrap bg-[#2a2a2a] border border-gray-700/50`}
                          style={{ left, width, minWidth: '220px' }}
                          onClick={() => onSelectProject(project.id)}
                        >
                          <span className="text-sm mr-2">{project.icon}</span>
                          <span className="truncate font-medium text-[13px] text-gray-200 mr-3">{project.name}</span>
                          <Badge className={`${getStatusColor(project.status)}/80 text-white border-none px-2 py-0 h-[20px] text-[11px] mr-auto font-medium`}>
                            {status}
                          </Badge>
                          {project.completion !== undefined && project.completion > 0 && (
                            <div className="flex items-center gap-2 ml-2">
                              <span className="text-[11px] font-medium text-gray-400">B</span>
                              <span className="text-[11px] font-medium text-gray-400">{project.completion}%</span>
                              <div className="w-8 h-1 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500" style={{ width: `${project.completion}%` }} />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="h-[32px]" />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#121212] text-white">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Target className="w-7 h-7 text-gray-300" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">Projects</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 px-8 py-3 border-b border-gray-800">
        <Button 
          variant="ghost" 
          size="sm" 
          className={activeTab === 'Active' ? "bg-[#2a2a2a] text-white hover:bg-[#333] font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium"}
          onClick={() => setActiveTab('Active')}
        >
          <CircleDot className="w-4 h-4 mr-2" />
          Active
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={activeTab === 'Timeline' ? "bg-[#2a2a2a] text-white hover:bg-[#333] font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium"}
          onClick={() => setActiveTab('Timeline')}
        >
          <Calendar className="w-4 h-4 mr-2" />
          Timeline
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={activeTab === 'Board' ? "bg-[#2a2a2a] text-white hover:bg-[#333] font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium"}
          onClick={() => setActiveTab('Board')}
        >
          <LayoutGrid className="w-4 h-4 mr-2" />
          Board
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          className={activeTab === 'All' ? "bg-[#2a2a2a] text-white hover:bg-[#333] font-medium" : "text-gray-400 hover:bg-[#2a2a2a] hover:text-white font-medium"}
          onClick={() => setActiveTab('All')}
        >
          All
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white" onClick={onCreateProject}>
          <Plus className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-8 ${filterStatuses.length > 0 || filterPriorities.length > 0 ? 'text-blue-400' : 'text-gray-400 hover:text-white'} hover:bg-[#2a2a2a]`}>
                <Filter className="w-4 h-4 mr-2" />
                Lọc
                {(filterStatuses.length > 0 || filterPriorities.length > 0) && (
                  <span className="ml-1.5 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">
                    {filterStatuses.length + filterPriorities.length}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-60 bg-[#1e1e1e] border-[#333] p-3 shadow-2xl rounded-xl">
              <div className="space-y-4">
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Trạng thái</h4>
                  <div className="space-y-1">
                    {['Planning', 'In Progress', 'Finished'].map(status => (
                      <label key={status} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer group py-1 rounded px-2 hover:bg-gray-800">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${filterStatuses.includes(status) ? 'bg-blue-600 border-blue-600' : 'border-gray-600 group-hover:border-gray-400'}`}>
                          {filterStatuses.includes(status) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" 
                          checked={filterStatuses.includes(status)} 
                          onChange={() => {
                            setFilterStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
                          }} 
                        />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Độ ưu tiên</h4>
                  <div className="space-y-1">
                    {['High', 'Medium', 'Low'].map(prio => (
                      <label key={prio} className="flex items-center gap-2 text-sm text-gray-300 hover:text-white cursor-pointer group py-1 rounded px-2 hover:bg-gray-800">
                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-colors ${filterPriorities.includes(prio) ? 'bg-blue-600 border-blue-600' : 'border-gray-600 group-hover:border-gray-400'}`}>
                          {filterPriorities.includes(prio) && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <input type="checkbox" className="hidden" 
                          checked={filterPriorities.includes(prio)} 
                          onChange={() => {
                            setFilterPriorities(prev => prev.includes(prio) ? prev.filter(p => p !== prio) : [...prev, prio])
                          }} 
                        />
                        {prio}
                      </label>
                    ))}
                  </div>
                </div>
                {(filterStatuses.length > 0 || filterPriorities.length > 0) && (
                  <Button variant="ghost" size="sm" className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-2 h-7" onClick={() => {setFilterStatuses([]); setFilterPriorities([]);}}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-8 ${sortBy ? 'text-blue-400' : 'text-gray-400 hover:text-white'} hover:bg-[#2a2a2a]`}>
                <ArrowUpDown className="w-4 h-4 mr-2" />
                Sắp xếp
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-xl">
              <div className="p-1.5 border-b border-gray-800 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Sắp xếp theo</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { value: 'name', label: 'Tên dự án' },
                  { value: 'priority', label: 'Độ ưu tiên' },
                  { value: 'completion', label: 'Tiến độ' }
                ].map(option => (
                  <button
                    key={option.value}
                    className={`w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-[#2a2a2a] transition-colors ${sortBy === option.value ? 'text-blue-400 font-medium bg-blue-500/10' : 'text-gray-300'}`}
                    onClick={() => {
                      if (sortBy === option.value) {
                        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                      } else {
                        setSortBy(option.value as any);
                        setSortOrder('asc');
                      }
                    }}
                  >
                    {option.label}
                    {sortBy === option.value && (
                      <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                    )}
                  </button>
                ))}
              </div>
              {sortBy && (
                <div className="mt-1 pt-1 border-t border-gray-800">
                  <button 
                    className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors"
                    onClick={() => setSortBy(null)}
                  >
                    Bỏ sắp xếp
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI
          </Button>

          {showSearch ? (
            <div className="relative flex items-center mx-1 animate-in slide-in-from-right-4 fade-in duration-200">
              <input
                autoFocus
                type="text"
                placeholder="Tên dự án, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#1a1a1a] border border-gray-700 text-sm rounded-md pl-8 pr-8 py-1 outline-none focus:border-blue-500 w-56 text-white transition-all h-8"
              />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5" />
              <button 
                onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                className="absolute right-2.5 text-gray-500 hover:text-gray-300 bg-[#1a1a1a]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className={`h-8 ${searchQuery ? 'text-blue-400' : 'text-gray-400 hover:text-white'} hover:bg-[#2a2a2a]`} onClick={() => setShowSearch(true)}>
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Tùy chỉnh
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-[#1e1e1e] border-[#333] shadow-2xl rounded-xl">
              <div className="p-1.5 border-b border-gray-800 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Hiển thị cột</span>
              </div>
              <DropdownMenuCheckboxItem checked={showColumns.owner} onCheckedChange={(c) => setShowColumns(prev => ({...prev, owner: c}))} className="text-gray-300 focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-1.5">
                Người phụ trách
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showColumns.dates} onCheckedChange={(c) => setShowColumns(prev => ({...prev, dates: c}))} className="text-gray-300 focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-1.5">
                Ngày (Dates)
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showColumns.priority} onCheckedChange={(c) => setShowColumns(prev => ({...prev, priority: c}))} className="text-gray-300 focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-1.5">
                Độ ưu tiên
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showColumns.completion} onCheckedChange={(c) => setShowColumns(prev => ({...prev, completion: c}))} className="text-gray-300 focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-1.5">
                Tiến độ
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked={showColumns.blockedBy} onCheckedChange={(c) => setShowColumns(prev => ({...prev, blockedBy: c}))} className="text-gray-300 focus:bg-[#2a2a2a] focus:text-white cursor-pointer py-1.5">
                Bị chặn bởi
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="flex ml-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-8 rounded-r-none px-3" onClick={onCreateProject}>
              Mới
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-l-none border-l border-blue-700 px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {activeTab === 'Active' && renderActiveView()}
        {activeTab === 'Board' && renderBoardView()}
        {activeTab === 'Timeline' && renderTimelineView()}
        {activeTab === 'All' && renderActiveView()}
      </div>
    </div>
  );
});
