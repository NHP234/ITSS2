import { useEffect, useState } from 'react';
import { Target, CheckCircle2, Clock, Zap, TrendingUp, ChevronRight, AlertCircle, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getDashboardStats, DashboardStats } from '../api/dashboard';

interface HomeProps {
  onSelectProject: (id: string) => void;
  onTabChange: (tab: string) => void;
}

export function Home({ onSelectProject, onTabChange }: HomeProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  } as const;

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  } as const;

  return (
    <div className="min-h-full bg-[#121212] text-white p-6 md:p-10 font-sans selection:bg-blue-500/30">
      <motion.div 
        className="max-w-6xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.header className="space-y-4" variants={itemVariants}>
          <div className="flex items-center gap-3 text-blue-400 mb-2">
            <div className="p-2 bg-blue-400/10 rounded-xl">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase">Dashboard Overview</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
            Chào mừng trở lại, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">Bình</span>!
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
            Hệ thống quản lý dự án thông minh giúp bạn theo dõi tiến độ và tối ưu hóa hiệu suất làm việc của nhóm.
          </p>
        </motion.header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            variants={itemVariants}
            className="bg-[#1e1e1e] p-8 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Target className="w-24 h-24 text-blue-400" />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Dự án hoạt động</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-white">
                {loading ? '...' : stats?.activeProjectsCount}
              </h3>
              <span className="text-green-400 text-sm font-bold mb-2 flex items-center gap-1">
                <TrendingUp className="w-4 h-4" /> Live
              </span>
            </div>
          </motion.div>
          
          <motion.div 
            variants={itemVariants}
            className="bg-[#1e1e1e] p-8 rounded-[2rem] border border-white/5 hover:border-indigo-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CheckCircle2 className="w-24 h-24 text-indigo-400" />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Nhiệm vụ hoàn thành</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-white">
                {loading ? '...' : stats?.completedTasksCount}
              </h3>
              <span className="text-indigo-400 text-sm font-bold mb-2">Success</span>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            className="bg-[#1e1e1e] p-8 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Clock className="w-24 h-24 text-purple-400" />
            </div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-4">Tổng số dự án</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-white">
                {loading ? '...' : stats?.totalProjects}
              </h3>
              <span className="text-purple-400 text-sm font-bold mb-2">All time</span>
            </div>
          </motion.div>
        </div>

        {/* Expiring Soon Section */}
        <AnimatePresence>
          {!loading && stats && stats.expiringSoon.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-orange-400" />
                <h2 className="text-2xl font-bold">Dự án sắp đến hạn</h2>
                <span className="px-3 py-1 bg-orange-400/10 text-orange-400 text-xs font-bold rounded-full border border-orange-400/20">
                  Cần chú ý
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.expiringSoon.map((project) => (
                  <button 
                    key={project.id} 
                    onClick={() => onSelectProject(project.id)}
                    className="flex items-center justify-between p-6 bg-[#1e1e1e] rounded-2xl border border-orange-400/10 hover:border-orange-400/30 hover:bg-[#252525] transition-all group text-left w-full cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-400/10 flex items-center justify-center text-2xl">
                        {project.icon || '🎯'}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">
                          {project.name}
                        </h4>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span>Hết hạn: {project.dates.split('→').pop()?.trim()}</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-orange-400 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Section */}
        <motion.div 
          variants={itemVariants}
          className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-[3rem] p-12 relative overflow-hidden shadow-2xl shadow-blue-500/20"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full -ml-32 -mb-32 blur-[80px]" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-6 text-center md:text-left">
              <h2 className="text-4xl font-black text-white max-w-md leading-tight">
                Sẵn sàng bắt đầu một dự án mới?
              </h2>
              <p className="text-blue-100/80 text-lg max-w-sm">
                Đừng để ý tưởng của bạn bị lãng quên. Hãy bắt đầu hiện thực hóa nó ngay hôm nay.
              </p>
            </div>
            <button 
              onClick={() => onTabChange('projects')}
              className="bg-white text-blue-600 px-10 py-5 rounded-2xl font-black hover:bg-gray-100 hover:scale-105 transition-all flex items-center gap-3 shadow-2xl shadow-black/20 group cursor-pointer"
            >
              Tạo dự án mới
              <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
