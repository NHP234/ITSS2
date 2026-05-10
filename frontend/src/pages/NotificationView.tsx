import { useState, useEffect } from 'react';
import { Bell, Check, BellOff, ExternalLink, Trash2, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { getNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

export function NotificationView() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    if (notifications.filter(n => !n.read).length === 0) return;
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-full bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <Bell className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Thông báo</h1>
              <p className="text-gray-500 text-sm">Cập nhật những thay đổi mới nhất từ các dự án của bạn</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-transparent border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={handleMarkAllRead}
            >
              <Check className="w-4 h-4 mr-2" />
              Đánh dấu tất cả đã đọc
            </Button>
          </div>
        </header>

        <div className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
          {loading ? (
            <div className="p-20 text-center">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Đang tải thông báo...</p>
            </div>
          ) : notifications.length > 0 ? (
            <div className="divide-y divide-white/5">
              <AnimatePresence initial={false}>
                {notifications.map((n, index) => (
                  <motion.div 
                    key={n.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`p-6 flex gap-6 group transition-all hover:bg-white/[0.02] ${!n.read ? 'bg-blue-500/[0.03]' : ''}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl flex-shrink-0 flex items-center justify-center text-xl ${
                      n.type === 'ASSIGNED_TASK' ? 'bg-blue-500/10 text-blue-400' :
                      n.type === 'TASK_STATUS_CHANGE' ? 'bg-green-500/10 text-green-400' :
                      'bg-purple-500/10 text-purple-400'
                    }`}>
                      {n.type === 'ASSIGNED_TASK' ? '🎯' : n.type === 'TASK_STATUS_CHANGE' ? '✅' : '👥'}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className={`text-lg font-bold ${!n.read ? 'text-white' : 'text-gray-400'}`}>
                            {n.title}
                          </h3>
                          {!n.read && <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {new Date(n.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-gray-400 leading-relaxed text-sm max-w-2xl">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-4 pt-2">
                        {!n.read && (
                          <button 
                            onClick={() => handleMarkRead(n.id)}
                            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1.5 transition-colors"
                          >
                            <Check className="w-4 h-4" /> Đánh dấu đã đọc
                          </button>
                        )}
                        {n.link && (
                          <a 
                            href={n.link} 
                            className="text-xs text-gray-500 hover:text-white font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" /> Xem chi tiết
                          </a>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="p-24 text-center">
              <div className="w-20 h-20 bg-gray-800/30 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                <BellOff className="w-10 h-10 text-gray-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-300 mb-2">Hộp thư trống</h2>
              <p className="text-gray-500 max-w-xs mx-auto">Bạn không có thông báo nào vào lúc này. Chúng tôi sẽ cập nhật khi có tin mới!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
