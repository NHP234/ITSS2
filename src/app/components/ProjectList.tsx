import { Plus, CircleDot, ChevronDown, Target, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

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

interface ProjectListProps {
  projects: Project[];
  onSelectProject: (projectId: string) => void;
  onCreateProject: () => void;
  selectedProjectId: string | null;
}

export function ProjectList({ projects, onSelectProject, onCreateProject, selectedProjectId }: ProjectListProps) {
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
      default:
        return 'bg-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-600 text-white';
      case 'Medium':
        return 'bg-yellow-600 text-white';
      case 'Low':
        return 'bg-green-600 text-white';
      default:
        return 'bg-gray-600 text-white';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#191919] text-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6" />
          <h1 className="text-xl">Projects</h1>
        </div>
      </div>

      <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800">
        <Button variant="ghost" size="sm" className="bg-gray-800 text-white hover:bg-gray-700">
          <CircleDot className="w-4 h-4 mr-2" />
          Active
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
          Timeline
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
          Board
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
          All
        </Button>
        <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
          <Plus className="w-4 h-4" />
        </Button>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
            <Filter className="w-4 h-4 mr-2" />
            Lọc
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
            <ArrowUpDown className="w-4 h-4 mr-2" />
            Sắp xếp
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
            <Sparkles className="w-4 h-4 mr-2" />
            AI
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
            <Search className="w-4 h-4 mr-2" />
            Tìm kiếm
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-gray-800 hover:text-white">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Tùy chỉnh
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={onCreateProject}>
            Mới
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto px-6 py-4">
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
                      <div className="flex items-center gap-1">
                        Project name
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Status
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Owner
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Dates
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Priority
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Completion
                      </div>
                    </th>
                    <th className="text-left px-4 py-2 text-xs text-gray-400 font-normal">
                      <div className="flex items-center gap-1">
                        Blocked By
                      </div>
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
                          <span className="text-sm">{project.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`${getStatusColor(project.status)} text-white px-2 py-0.5 text-xs`}>
                          {project.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-xs">
                            B
                          </div>
                          <span className="text-sm text-gray-300">{project.owner}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-300">{project.dates}</span>
                      </td>
                      <td className="px-4 py-3">
                        {project.priority && (
                          <Badge className={`${getPriorityColor(project.priority)} px-2 py-0.5 text-xs`}>
                            {project.priority}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300 w-12">{project.completion}%</span>
                          <Progress value={project.completion} className="w-24 h-2" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-gray-400">{project.blockedBy}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Plus className="w-4 h-4" />
                        </Button>
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
      </div>
    </div>
  );
}
