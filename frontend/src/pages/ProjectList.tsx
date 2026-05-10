import { useState } from 'react';
import { Plus, CircleDot, ChevronDown, Target, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, LayoutGrid, Calendar, Trash2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { CustomDatePicker } from '../components/common/CustomDatePicker';

import { type Project } from '../api';

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  onDeleteProject?: (projectId: string) => void;
  selectedProjectId: string | null;
}

export function ProjectList({ projects, onSelectProject, onCreateProject, onDeleteProject, selectedProjectId }: ProjectListProps) {
  const [activeTab, setActiveTab] = useState<'Active' | 'Timeline' | 'Board' | 'All'>('Board');

  const groupedProjects = projects.reduce((acc, project) => {
    if (!acc[project.status]) {
      acc[project.status] = [];
    }
    acc[project.status].push(project);
    return acc;
  }, {} as Record<string, typeof projects>);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-600';
      case 'In Progress':
        return 'bg-yellow-600';
      case 'Done':
        return 'bg-green-600';
      case 'Backlog':
        return 'bg-gray-600';
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
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Owner</div>
                  </th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Dates</div>
                  </th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Priority</div>
                  </th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Completion</div>
                  </th>
                  <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                    <div className="flex items-center gap-1">Blocked By</div>
                  </th>
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
                        {project.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-xs">B</div>
                        <span className="text-sm text-gray-300">{project.owner}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-300">{project.dates}</span>
                    </td>
                    <td className="px-4 py-3">
                      {project.priority && (
                        <Badge className={`${getPriorityColor(project.priority)} px-2 py-0.5 text-xs border-none`}>
                          {project.priority}
                        </Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-300 w-12">{project.completion}%</span>
                        <Progress value={project.completion} className="w-24 h-2 bg-gray-700" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400">{project.blockedBy}</span>
                    </td>
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
    // Ensure we show Planning, In Progress, Backlog even if empty for the board view
    const boardStatuses = ['Planning', 'In Progress', 'Backlog'];
    const allStatuses = Array.from(new Set([...boardStatuses, ...Object.keys(groupedProjects)]));

    return (
      <div className="flex gap-6 h-full overflow-x-auto pb-4">
        {allStatuses.map(status => {
          const statusProjects = groupedProjects[status] || [];
          // Skip empty statuses unless they are one of the main board columns
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

  const parseVNDate = (dateStr: string) => {
    if (!dateStr) return null;
    const parts = dateStr.split(' → ');
    
    const parseSingle = (s: string) => {
      // Format: "17 tháng 9, 2025"
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
    const timelineStart = new Date(2025, 7, 1); // 1/8/2025
    const timelineEnd = new Date(2025, 11, 31); // 31/12/2025
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
          {/* Grid lines */}
          <div className="absolute inset-0 flex pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div key={i} className="w-[50px] border-r border-gray-800/20" />
            ))}
          </div>
          
          {/* Project bars */}
          <div className="relative z-10">
            {Object.entries(groupedProjects).map(([status, statusProjects]) => (
              <div key={status} className="mb-4">
                <div className="h-[34px]" /> {/* Status header space */}
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
                      {project.status && (
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
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="h-[32px]" /> {/* Add space for 'Mới' button in sidebar */}
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
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <Filter className="w-4 h-4 mr-2" />
            Lọc
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sắp xếp
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <Sparkles className="w-4 h-4 mr-2" />
            AI
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a] hover:text-white h-8">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Tùy chỉnh
          </Button>
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
}
