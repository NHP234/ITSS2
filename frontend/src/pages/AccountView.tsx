import { User as UserIcon, Mail, Calendar, Shield, Activity, CheckCircle2, FolderKanban, Clock, Star, Award, ChevronRight } from 'lucide-react';
import { type User, type Project, type Task } from '../api';
import { motion } from 'framer-motion';

interface AccountViewProps {
  user: User | null;
  projects: Project[];
  tasks: Task[];
}

export function AccountView({ user, projects, tasks }: AccountViewProps) {
  if (!user) {
    return (
      <div className="min-h-full bg-[#121212] text-white p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400">Đang tải thông tin tài khoản...</p>
        </div>
      </div>
    );
  }

  // Calculate statistics
  const userProjects = projects.filter(p => 
    p.owner === user.name || 
    p.members?.some(m => m.id === user.id)
  );

  const userTasks = tasks.filter(t => 
    t.assignees?.some(m => m.id === user.id) || 
    t.assignee === user.name
  );

  const completedTasks = userTasks.filter(t => t.status === 'Done');
  const inProgressTasks = userTasks.filter(t => t.status === 'In Progress');
  const otherTasks = userTasks.filter(t => t.status !== 'Done' && t.status !== 'In Progress');

  const completionRate = userTasks.length > 0 
    ? Math.round((completedTasks.length / userTasks.length) * 100) 
    : 0;

  // Format creation date
  const formatJoinedDate = (dateStr?: string) => {
    if (!dateStr) return 'Thành viên lâu năm';
    try {
      const d = new Date(dateStr);
      return new Intl.DateTimeFormat('vi-VN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(d);
    } catch {
      return 'Thành viên lâu năm';
    }
  };

  // Get initials for Avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <div className="min-h-full bg-[#121212] text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <UserIcon className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Hồ sơ cá nhân</h1>
            <p className="text-gray-500 text-sm">Quản lý thông tin tài khoản và xem hiệu suất công việc của bạn</p>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Profile Card */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 p-8 relative overflow-hidden shadow-2xl"
            >
              {/* Background Glow */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -z-10" />

              <div className="flex flex-col items-center text-center space-y-6">
                {/* Avatar */}
                <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur opacity-60 group-hover:opacity-100 transition duration-500" />
                  <div className="relative w-28 h-28 bg-[#252525] rounded-full flex items-center justify-center text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 border border-white/10">
                    {getInitials(user.name)}
                  </div>
                </div>

                {/* Name & Email */}
                <div className="space-y-1.5">
                  <h2 className="text-2xl font-bold tracking-tight">{user.name}</h2>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Shield className="w-3.5 h-3.5" />
                    Thành viên
                  </span>
                </div>

                <div className="w-full border-t border-white/5 my-4" />

                {/* Profile Details */}
                <div className="w-full space-y-4 text-left">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="p-2 bg-white/[0.03] rounded-lg">
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Email</p>
                      <p className="text-white truncate font-medium">{user.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="p-2 bg-white/[0.03] rounded-lg">
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Đã tham gia</p>
                      <p className="text-white font-medium">{formatJoinedDate(user.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <div className="p-2 bg-white/[0.03] rounded-lg">
                      <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Trạng thái</p>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Đang hoạt động
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Performance Badge Card */}
            {userTasks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-[1.5rem] p-6 flex items-center gap-4"
              >
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl text-black">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Danh hiệu thành viên</h4>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {completionRate >= 80 ? 'Chiến binh Hoàn thành (>=80%)' : 'Thành viên Tích cực'}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Statistics & Active Tasks */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Dự án tham gia', value: userProjects.length, icon: FolderKanban, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                { label: 'Nhiệm vụ được giao', value: userTasks.length, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                { label: 'Đã hoàn thành', value: completedTasks.length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                { label: 'Tỉ lệ hoàn thành', value: `${completionRate}%`, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10' },
              ].map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className="bg-[#1e1e1e] rounded-[1.5rem] p-5 border border-white/5 flex flex-col justify-between h-32"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">{stat.label}</span>
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                  </div>
                  <span className="text-2xl font-black tracking-tight text-white mt-2">{stat.value}</span>
                </motion.div>
              ))}
            </div>

            {/* Active Tasks Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Nhiệm vụ của bạn</h3>
                  <p className="text-gray-500 text-xs mt-0.5">Danh sách công việc đang được gán cho bạn</p>
                </div>
                <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-semibold text-gray-400 border border-white/5">
                  {userTasks.length} nhiệm vụ
                </span>
              </div>

              {userTasks.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-white/10 rounded-2xl">
                  <span className="text-3xl">🎉</span>
                  <h4 className="font-bold text-gray-300 mt-3">Tất cả đã hoàn thành!</h4>
                  <p className="text-gray-500 text-xs mt-1">Không có nhiệm vụ nào được giao cho bạn vào lúc này.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {userTasks.map((task) => (
                    <div 
                      key={task.id}
                      className="group p-4 bg-[#252525]/60 hover:bg-[#252525] rounded-xl border border-white/5 flex items-center justify-between gap-4 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-xl flex-shrink-0">{task.icon || '📝'}</span>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm truncate group-hover:text-blue-400 transition-colors">
                            {task.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            {task.project && (
                              <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                <span>{task.project.icon}</span>
                                <span className="truncate max-w-[100px]">{task.project.name}</span>
                              </span>
                            )}
                            {task.due && (
                              <span className="text-[10px] text-gray-500">
                                • Hạn chót: {task.due}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          task.status === 'Done' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          task.status === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          task.status === 'Reviewing' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          'bg-gray-500/10 text-gray-400 border border-white/10'
                        }`}>
                          {task.status}
                        </span>
                        
                        {task.priority && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            task.priority === 'Very High' || task.priority === 'High' 
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                              : 'bg-white/5 text-gray-400 border border-white/10'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

          </div>
        </div>

      </div>
    </div>
  );
}
