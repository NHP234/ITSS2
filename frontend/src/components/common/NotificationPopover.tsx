import { useState, useEffect } from 'react';
import { Bell, Check, BellOff, ExternalLink } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { getNotifications, markNotificationRead, markAllNotificationsRead, type Notification } from '../../api';

export function NotificationPopover() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (err) {
      console.error('Lỗi tải thông báo:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh mỗi 30 giây
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333] p-0 shadow-2xl rounded-xl">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h4 className="text-sm font-bold text-gray-200">Thông báo</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-[10px] text-blue-400 hover:text-blue-300 h-6 px-2" onClick={handleMarkAllRead}>
              Đánh dấu tất cả đã đọc
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map(n => (
              <div 
                key={n.id} 
                className={`p-4 border-b border-gray-800/50 flex gap-3 group transition-colors hover:bg-gray-800/30 ${!n.read ? 'bg-blue-500/5' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                  n.type === 'ASSIGNED_TASK' ? 'bg-blue-500/20 text-blue-400' :
                  n.type === 'TASK_STATUS_CHANGE' ? 'bg-green-500/20 text-green-400' :
                  'bg-purple-500/20 text-purple-400'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-bold ${!n.read ? 'text-white' : 'text-gray-400'}`}>{n.title}</p>
                    <span className="text-[9px] text-gray-500 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">{n.message}</p>
                  <div className="flex items-center gap-2 pt-1">
                    {!n.read && (
                      <button 
                        onClick={() => handleMarkRead(n.id)}
                        className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <Check className="w-3 h-3" /> Đánh dấu đã đọc
                      </button>
                    )}
                    {n.link && (
                      <a 
                        href={n.link} 
                        className="text-[10px] text-gray-500 hover:text-white flex items-center gap-1"
                      >
                        <ExternalLink className="w-3 h-3" /> Chi tiết
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center">
              <BellOff className="w-8 h-8 text-gray-700 mx-auto mb-3" />
              <p className="text-xs text-gray-500">Chưa có thông báo nào</p>
            </div>
          )}
        </div>
        <div className="p-3 bg-[#252525]/30 text-center">
          <button className="text-[10px] text-gray-500 hover:text-gray-300">Xem tất cả</button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
