import { useState, useMemo, memo } from 'react';
import { Plus, CircleDot, ChevronDown, Target, Filter, ArrowUpDown, Sparkles, Search, LayoutGrid, Calendar, Trash2, X, Check, Play, CheckCircle, Pause, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CustomDatePicker } from '../components/common/CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { useTaskProgress } from '../hooks/useTaskProgress';
import { type Project, type Task } from '../api';

interface ProjectListProps {
  projects: Project[];
  tasks?: Task[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: (status?: string) => void;
  onDeleteProject?: (projectId: string) => void;
  selectedProjectId: string | null;
  currentUserId?: string;
}

export const ProjectList = memo(function ProjectList({ 
  projects = [], 
  tasks = [],
  onSelectProject, 
  onCreateProject, 
  onDeleteProject, 
  selectedProjectId,
  currentUserId 
}: ProjectListProps) {
  const { getProjectCompletion } = useTaskProgress();
  const [activeTab, setActiveTab] = useState<'Active' | 'Timeline' | 'Board' | 'All'>('Board');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'completion' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [filterStatuses, setFilterStatuses] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showColumns, setShowColumns] = useState({
    owner: true,
    dates: true,
    priority: true,
    completion: true,
    blockedBy: true,
  });

  // Helper function to parse Vietnamese date string
  const parseVNDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const startDateStr = dateStr.split(' → ')[0];
    const match = startDateStr.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
    if (match) {
      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10);
      const year = parseInt(match[3], 10);
      return new Date(year, month - 1, day);
    }
    return null;
  };

  // Helper function to get project status based on dates and progress
  const getProjectStatus = (project: Project, completion: number): string => {
    if (completion >= 100) {
      return 'Finished';
    }
    
    const startDate = parseVNDate(project.dates);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (startDate) {
      startDate.setHours(0, 0, 0, 0);
      if (startDate > today) {
        return 'Planning';
      }
    }
    
    return 'In Progress';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-blue-600';
      case 'In Progress': return 'bg-yellow-600';
      case 'Finished': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Planning': return 'bg-blue-600/20 text-blue-400 border-blue-500/30';
      case 'In Progress': return 'bg-yellow-600/20 text-yellow-400 border-yellow-500/30';
      case 'Finished': return 'bg-green-600/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-600/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-600/80 text-red-100';
      case 'Medium': return 'bg-yellow-600/80 text-yellow-100';
      case 'Low': return 'bg-green-600/80 text-green-100';
      default: return 'bg-gray-600/80 text-gray-100';
    }
  };

  const getProjectCompletionWithTasks = (projectId: string) => {
    const projectTasks = tasks.filter(t => t?.projectId === projectId) || [];
    return getProjectCompletion(projectId, projectTasks);
  };

  // Process projects with computed status
  const processedProjects = useMemo(() => {
    let result = [...projects];

    const projectsWithComputedStatus = result.map(project => {
      const completion = getProjectCompletionWithTasks(project.id);
      const computedStatus = getProjectStatus(project, completion);
      return { ...project, computedStatus };
    });

    if (filterStatuses.length > 0) {
      result = projectsWithComputedStatus
        .filter(p => filterStatuses.includes(p.computedStatus))
        .map(({ computedStatus, ...project }) => project);
    } else {
      result = projectsWithComputedStatus.map(({ computedStatus, ...project }) => project);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name?.toLowerCase().includes(q) || 
        (p.owner && p.owner.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'completion') {
      result.sort((a, b) => {
        const completionA = getProjectCompletionWithTasks(a.id);
        const completionB = getProjectCompletionWithTasks(b.id);
        return sortOrder === 'asc' ? completionA - completionB : completionB - completionA;
      });
    } else if (sortBy === 'name') {
      result.sort((a, b) => {
        const valA = a.name?.toLowerCase() || '';
        const valB = b.name?.toLowerCase() || '';
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [projects, searchQuery, filterStatuses, sortBy, sortOrder, tasks]);

  const groupedProjects = useMemo(() => {
    return processedProjects.reduce((acc, project) => {
      const completion = getProjectCompletionWithTasks(project.id);
      const computedStatus = getProjectStatus(project, completion);
      if (!acc[computedStatus]) {
        acc[computedStatus] = [];
      }
      acc[computedStatus].push(project);
      return acc;
    }, {} as Record<string, typeof projects>);
  }, [processedProjects]);

  const isProjectOwner = (project: Project) => {
    if (!currentUserId || !project.owner) return false;
    return project.owner === currentUserId;
  };

  const parseVNDateRange = (dateStr: string) => {
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

  // Get available years from projects
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    projects.forEach(project => {
      if (project.dates) {
        const dateInfo = parseVNDateRange(project.dates);
        if (dateInfo) {
          years.add(dateInfo.start.getFullYear());
          years.add(dateInfo.end.getFullYear());
        }
      }
    });
    // Add current year if no projects
    if (years.size === 0) years.add(new Date().getFullYear());
    return Array.from(years).sort();
  }, [projects]);

  const changeYear = (delta: number) => {
    const currentIndex = availableYears.indexOf(selectedYear);
    const newIndex = currentIndex + delta;
    if (newIndex >= 0 && newIndex < availableYears.length) {
      setSelectedYear(availableYears[newIndex]);
    }
  };

  const renderTimelineView = () => {
    // Get all months for the selected year with their start dates
    const months = [];
    for (let i = 0; i < 12; i++) {
      months.push({
        name: new Date(selectedYear, i, 1).toLocaleDateString('vi-VN', { month: 'long' }),
        start: new Date(selectedYear, i, 1),
        end: new Date(selectedYear, i + 1, 0),
      });
    }
    
    const yearStart = new Date(selectedYear, 0, 1);
    const yearEnd = new Date(selectedYear, 11, 31);
    const totalDays = Math.ceil((yearEnd.getTime() - yearStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // Helper to get day of year (0-364/365)
    const getDayOfYear = (date: Date): number => {
      const start = new Date(date.getFullYear(), 0, 0);
      const diff = date.getTime() - start.getTime();
      const oneDay = 1000 * 60 * 60 * 24;
      return Math.floor(diff / oneDay);
    };

    // Format date safely
    const formatDate = (date: Date | undefined): string => {
      if (!date) return 'N/A';
      return `${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`;
    };

    // Filter projects that have dates within the selected year
    const projectsWithDates = processedProjects.filter(project => {
      const dateInfo = parseVNDateRange(project.dates);
      if (!dateInfo) return false;
      // Check if project overlaps with selected year
      const projectStart = dateInfo.start;
      const projectEnd = dateInfo.end;
      return (projectStart.getFullYear() <= selectedYear && projectEnd.getFullYear() >= selectedYear);
    });

    if (projectsWithDates.length === 0) {
      return (
        <div className="flex h-full border border-gray-800/60 rounded-xl overflow-hidden bg-[#1e1e1e]">
          <div className="flex-1 flex items-center justify-center py-20">
            <div className="text-center">
              <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Không có dự án nào trong năm {selectedYear}</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex h-full border border-gray-800/60 rounded-xl overflow-hidden bg-[#1e1e1e]">
        {/* Left Sidebar - Project List */}
        <div className="w-[300px] border-r border-gray-800/60 flex flex-col bg-[#1a1a1a] z-10 shadow-[2px_0_5px_rgba(0,0,0,0.2)]">
          <div className="h-14 border-b border-gray-800/60 flex items-center px-5 shrink-0">
            <span className="text-sm font-semibold text-gray-300">Dự án trong năm {selectedYear}</span>
          </div>
          <div className="flex-1 overflow-y-auto py-3">
            {projectsWithDates.map(project => {
              const completion = getProjectCompletionWithTasks(project.id);
              const projectStatus = getProjectStatus(project, completion);
              return (
                <div 
                  key={project.id} 
                  className="flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-[#2a2a2a] cursor-pointer transition-colors group"
                  onClick={() => onSelectProject(project.id)}
                >
                  <span className="text-base">{project.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="truncate font-medium text-gray-300 group-hover:text-white block">{project.name}</span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        projectStatus === 'Planning' ? 'bg-blue-500' : 
                        projectStatus === 'In Progress' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} />
                      <span className="text-[10px] text-gray-500">{projectStatus}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-500">{completion}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Timeline Grid */}
        <div className="flex-1 flex flex-col overflow-x-auto bg-[#141414]">
          {/* Header with Months */}
          <div className="h-14 border-b border-gray-800/60 flex min-w-max shrink-0 bg-[#1a1a1a] sticky top-0 z-10">
            {months.map((month, i) => {
              const daysInMonth = month.end.getDate();
              // Calculate width based on days in month (proportional)
              const widthPercent = (daysInMonth / totalDays) * 100;
              return (
                <div 
                  key={i} 
                  className="border-r border-gray-800/60 flex flex-col flex-shrink-0"
                  style={{ width: `${widthPercent}%`, minWidth: '80px' }}
                >
                  <div className="text-[13px] font-medium text-center text-gray-300 py-1.5">
                    {month.name}
                  </div>
                  <div className="flex border-t border-gray-800/60 text-[9px] text-gray-500 justify-center py-1">
                    {daysInMonth} ngày
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Timeline Rows */}
          <div className="flex-1 overflow-y-auto relative min-w-max">
            <div className="relative">
              {projectsWithDates.map((project) => {
                const dateInfo = parseVNDateRange(project.dates);
                let leftPercent = 0;
                let widthPercent = 0;
                const completion = getProjectCompletionWithTasks(project.id);
                const projectStatus = getProjectStatus(project, completion);

                if (dateInfo) {
                  // Get project start and end dates, clamped to selected year
                  let projectStart = dateInfo.start;
                  let projectEnd = dateInfo.end;
                  
                  // Clamp to selected year
                  if (projectStart.getFullYear() < selectedYear) {
                    projectStart = new Date(selectedYear, 0, 1);
                  }
                  if (projectEnd.getFullYear() > selectedYear) {
                    projectEnd = new Date(selectedYear, 11, 31);
                  }
                  
                  // Calculate day of year for start and end
                  const startDay = getDayOfYear(projectStart);
                  const endDay = getDayOfYear(projectEnd);
                  
                  // Calculate percentages
                  leftPercent = (startDay / (totalDays - 1)) * 100;
                  widthPercent = ((endDay - startDay + 1) / (totalDays - 1)) * 100;
                  
                  // Ensure minimum width for visibility
                  if (widthPercent < 2) widthPercent = 2;
                  if (leftPercent < 0) leftPercent = 0;
                  if (leftPercent + widthPercent > 100) widthPercent = 100 - leftPercent;
                }

                const statusColors = {
                  Planning: { bg: 'rgba(59, 130, 246, 0.15)', border: 'rgba(59, 130, 246, 0.5)', text: 'text-blue-400' },
                  'In Progress': { bg: 'rgba(234, 179, 8, 0.15)', border: 'rgba(234, 179, 8, 0.5)', text: 'text-yellow-400' },
                  Finished: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.5)', text: 'text-green-400' }
                };
                
                const colors = statusColors[projectStatus as keyof typeof statusColors] || statusColors['In Progress'];

                // Safely get formatted dates for tooltip
                const startDateStr = dateInfo ? formatDate(dateInfo.start) : 'N/A';
                const endDateStr = dateInfo ? formatDate(dateInfo.end) : 'N/A';

                return (
                  <div key={project.id} className="h-[52px] relative group border-b border-gray-800/40">
                    <div 
                      className="absolute h-[36px] rounded-lg flex items-center px-3 shadow-sm hover:shadow-md hover:brightness-110 transition-all cursor-pointer overflow-hidden"
                      style={{ 
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        minWidth: '120px',
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        top: '8px'
                      }}
                      onClick={() => onSelectProject(project.id)}
                      title={`${project.name}: ${startDateStr} → ${endDateStr}`}
                    >
                      <span className="text-sm mr-2 flex-shrink-0">{project.icon}</span>
                      <span className="truncate font-medium text-[12px] text-gray-200 mr-2 flex-1">{project.name}</span>
                      {completion > 0 && completion < 100 && widthPercent > 15 && (
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="w-12 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: `${completion}%` }} />
                          </div>
                          <span className="text-[10px] text-gray-400 flex-shrink-0">{completion}%</span>
                        </div>
                      )}
                      {completion >= 100 && widthPercent > 10 && (
                        <span className="text-[10px] text-green-400 flex-shrink-0">✓ Hoàn thành</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderActiveView = () => (
    <>
      {Object.entries(groupedProjects).map(([status, statusProjects]) => (
        <div key={status} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <ChevronDown className="w-4 h-4 text-gray-400" />
            <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${getStatusBadgeStyle(status)} border`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                status === 'Planning' ? 'bg-blue-400' : 
                status === 'In Progress' ? 'bg-yellow-400' : 
                'bg-green-400'
              }`} />
              <span className="text-xs font-medium">{status}</span>
            </div>
            <span className="text-gray-500 text-sm">{statusProjects.length}</span>
          </div>

          <div className="border border-gray-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800 bg-[#1a1a1a]">
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Project name</th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Status</th>
                  {showColumns.owner && <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Owner</th>}
                  {showColumns.dates && <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Dates</th>}
                  {showColumns.priority && <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Priority</th>}
                  {showColumns.completion && <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Completion</th>}
                  {showColumns.blockedBy && <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">Blocked By</th>}
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody>
                {statusProjects.map((project) => {
                  const completion = getProjectCompletionWithTasks(project.id);
                  const projectStatus = getProjectStatus(project, completion);
                  return (
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
                        <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${getStatusBadgeStyle(projectStatus)} border`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${
                            projectStatus === 'Planning' ? 'bg-blue-400' : 
                            projectStatus === 'In Progress' ? 'bg-yellow-400' : 
                            'bg-green-400'
                          }`} />
                          <span className="text-xs font-medium">
                            {projectStatus === 'In Progress' ? (
                              <Play className="w-2.5 h-2.5 inline mr-1" />
                            ) : projectStatus === 'Finished' ? (
                              <CheckCircle className="w-2.5 h-2.5 inline mr-1" />
                            ) : (
                              <Pause className="w-2.5 h-2.5 inline mr-1" />
                            )}
                            {projectStatus}
                          </span>
                        </div>
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
                          <span className="text-sm text-gray-300">{project.dates || 'Chưa có ngày'}</span>
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
                            <span className="text-sm text-gray-300 w-12">{completion}%</span>
                            <Progress value={completion} className="w-24 h-2 bg-gray-700" />
                          </div>
                        </td>
                      )}
                      {showColumns.blockedBy && (
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-400">{project.blockedBy}</span>
                        </td>
                      )}
                      <td className="px-4 py-3 text-center">
                        {isProjectOwner(project) && onDeleteProject && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject(project.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <button
              className="w-full px-4 py-3 text-left text-sm text-gray-500 hover:bg-gray-800/50 transition-colors flex items-center gap-2"
              onClick={() => onCreateProject()}
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
            <div key={status} className="flex-shrink-0 w-[320px] rounded-xl border p-4 flex flex-col shadow-sm"
              style={{
                backgroundColor: status === 'Planning' ? 'rgba(59, 130, 246, 0.05)' :
                                status === 'In Progress' ? 'rgba(234, 179, 8, 0.05)' :
                                status === 'Finished' ? 'rgba(34, 197, 94, 0.05)' :
                                '#1a1a1a',
                borderColor: status === 'Planning' ? 'rgba(59, 130, 246, 0.3)' :
                            status === 'In Progress' ? 'rgba(234, 179, 8, 0.3)' :
                            status === 'Finished' ? 'rgba(34, 197, 94, 0.3)' :
                            'rgba(75, 85, 99, 0.6)'
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    status === 'Planning' ? 'bg-blue-500' : 
                    status === 'In Progress' ? 'bg-yellow-500' : 
                    'bg-green-500'
                  }`} />
                  <span className="font-semibold text-sm text-gray-200">{status}</span>
                  <Badge className="bg-gray-800 text-gray-400 px-1.5 py-0 min-w-[20px] justify-center">{statusProjects.length}</Badge>
                </div>
                <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-300 h-6 w-8 p-0">...</Button>
              </div>
              
              <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                {statusProjects.map(project => {
                  const completion = getProjectCompletionWithTasks(project.id);
                  return (
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
                        {isProjectOwner(project) && onDeleteProject && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-gray-500 hover:text-red-400 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteProject(project.id);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                      
                      {project.dates && (
                        <div className="text-[13px] text-gray-400 mb-4 font-medium">{project.dates}</div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto">
                        {project.priority ? (
                          <Badge className={`${getPriorityColor(project.priority)} px-2 py-0.5 text-[11px] font-medium border-none`}>
                            {project.priority}
                          </Badge>
                        ) : <div />}
                        
                        <div className="flex items-center gap-2 w-28">
                          <span className="text-[11px] font-medium text-gray-400 w-9 text-right">{completion}%</span>
                          <Progress value={completion} className="h-1.5 bg-gray-800 flex-1" />
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button 
                  variant="ghost" 
                  className="w-full text-gray-500 hover:text-gray-300 hover:bg-[#2a2a2a] justify-start text-sm font-medium py-2 h-auto"
                  onClick={() => onCreateProject(status)}
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

  return (
    <div className="min-h-full bg-[#121212] text-white">
      <div className="flex items-center justify-between px-8 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Target className="w-7 h-7 text-gray-300" />
          <h1 className="text-2xl font-bold tracking-tight text-gray-100">Projects</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 px-8 py-3 border-b border-gray-800">
        <Button variant="ghost" size="sm" className={activeTab === 'Active' ? "bg-[#2a2a2a] text-white" : "text-gray-400 hover:bg-[#2a2a2a]"} onClick={() => setActiveTab('Active')}>
          <CircleDot className="w-4 h-4 mr-2" /> Active
        </Button>
        <Button variant="ghost" size="sm" className={activeTab === 'Timeline' ? "bg-[#2a2a2a] text-white" : "text-gray-400 hover:bg-[#2a2a2a]"} onClick={() => setActiveTab('Timeline')}>
          <Calendar className="w-4 h-4 mr-2" /> Timeline
        </Button>
        <Button variant="ghost" size="sm" className={activeTab === 'Board' ? "bg-[#2a2a2a] text-white" : "text-gray-400 hover:bg-[#2a2a2a]"} onClick={() => setActiveTab('Board')}>
          <LayoutGrid className="w-4 h-4 mr-2" /> Board
        </Button>
        <Button variant="ghost" size="sm" className={activeTab === 'All' ? "bg-[#2a2a2a] text-white" : "text-gray-400 hover:bg-[#2a2a2a]"} onClick={() => setActiveTab('All')}>
          All
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-1.5">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-8 ${filterStatuses.length > 0 ? 'text-blue-400' : 'text-gray-400'} hover:bg-[#2a2a2a]`}>
                <Filter className="w-4 h-4 mr-2" /> Lọc
                {filterStatuses.length > 0 && (
                  <span className="ml-1.5 w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] flex items-center justify-center font-bold">
                    {filterStatuses.length}
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
                        <div className={`w-2 h-2 rounded-full ${
                          status === 'Planning' ? 'bg-blue-500' : 
                          status === 'In Progress' ? 'bg-yellow-500' : 
                          'bg-green-500'
                        }`} />
                        <input type="checkbox" className="hidden" checked={filterStatuses.includes(status)} onChange={() => {
                          setFilterStatuses(prev => prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status])
                        }} />
                        {status}
                      </label>
                    ))}
                  </div>
                </div>
                {filterStatuses.length > 0 && (
                  <Button variant="ghost" size="sm" className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 mt-2 h-7" onClick={() => {setFilterStatuses([]);}}>
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className={`h-8 ${sortBy ? 'text-blue-400' : 'text-gray-400'} hover:bg-[#2a2a2a]`}>
                <ArrowUpDown className="w-4 h-4 mr-2" /> Sắp xếp
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 bg-[#1e1e1e] border-[#333] p-1 shadow-2xl rounded-xl">
              <div className="p-1.5 border-b border-gray-800 mb-1">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">Sắp xếp theo</span>
              </div>
              <div className="space-y-0.5">
                {[
                  { value: 'name', label: 'Tên dự án' },
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
                    {sortBy === option.value && <ArrowUpDown className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />}
                  </button>
                ))}
              </div>
              {sortBy && (
                <div className="mt-1 pt-1 border-t border-gray-800">
                  <button className="w-full text-left px-2 py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition-colors" onClick={() => setSortBy(null)}>
                    Bỏ sắp xếp
                  </button>
                </div>
              )}
            </PopoverContent>
          </Popover>

          {showSearch ? (
            <div className="relative flex items-center mx-1 animate-in slide-in-from-right-4 fade-in duration-200">
              <input autoFocus type="text" placeholder="Tên dự án, người dùng..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-[#1a1a1a] border border-gray-700 text-sm rounded-md pl-8 pr-8 py-1 outline-none focus:border-blue-500 w-56 text-white transition-all h-8" />
              <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5" />
              <button onClick={() => { setShowSearch(false); setSearchQuery(''); }} className="absolute right-2.5 text-gray-500 hover:text-gray-300 bg-[#1a1a1a]">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button variant="ghost" size="sm" className="h-8 text-gray-400 hover:bg-[#2a2a2a]" onClick={() => setShowSearch(true)}>
              <Search className="w-4 h-4 mr-2" /> Tìm kiếm
            </Button>
          )}

          <div className="flex ml-2">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-medium h-8 rounded-r-none px-3" onClick={() => onCreateProject()}>
              Mới
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white h-8 rounded-l-none border-l border-blue-700 px-2">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Year selector for Timeline view */}
      {activeTab === 'Timeline' && (
        <div className="flex items-center justify-between px-8 py-3 border-b border-gray-800 bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => changeYear(-1)}
                disabled={availableYears.indexOf(selectedYear) === 0}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-lg font-semibold text-white">{selectedYear}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white"
                onClick={() => changeYear(1)}
                disabled={availableYears.indexOf(selectedYear) === availableYears.length - 1}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            {availableYears.length > 1 && (
              <div className="flex gap-1">
                {availableYears.map(year => (
                  <button
                    key={year}
                    onClick={() => setSelectedYear(year)}
                    className={`px-3 py-1 text-xs rounded-md transition-colors ${
                      selectedYear === year
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {year}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-500">
            Hiển thị dự án trong năm {selectedYear}
          </div>
        </div>
      )}

      <div className="px-8 py-6">
        {activeTab === 'Active' && renderActiveView()}
        {activeTab === 'Board' && renderBoardView()}
        {activeTab === 'Timeline' && renderTimelineView()}
        {activeTab === 'All' && renderActiveView()}
      </div>
    </div>
  );
});