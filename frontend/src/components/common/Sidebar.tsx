import { Target, ListTodo, User, Bell, Settings, Search, Home, LogOut } from 'lucide-react';
import { NotificationPopover } from './NotificationPopover';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const navItemClass = (tabId: string) => 
    `w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors shadow-sm ${
      activeTab === tabId 
        ? 'bg-[#2a2a2a] text-white' 
        : 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]'
    }`;

  const iconColor = (tabId: string) => activeTab === tabId ? 'text-blue-400' : 'text-gray-400';

  return (
    <div className="w-56 h-full bg-[#1e1e1e] border-r border-gray-800 flex flex-col text-gray-300 shrink-0">
      <div className="p-3 flex items-center justify-between mb-1 m-1.5 rounded-md transition-colors">
        <div className="flex items-center gap-2.5 cursor-pointer hover:bg-[#2a2a2a] p-1.5 rounded-md transition-colors" onClick={() => onTabChange('home')}>
          <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center text-white text-sm font-bold shadow-sm">
            W
          </div>
          <span className="font-semibold text-white truncate text-sm">Workspace</span>
        </div>
        <NotificationPopover />
      </div>

      <div className="px-3 mb-4">
        <div className="relative group">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
          <input 
            type="text" 
            placeholder="Tìm kiếm..." 
            className="w-full bg-[#2a2a2a] text-white border border-transparent focus:border-gray-600 rounded-md py-1.5 pl-8 pr-2 text-xs outline-none transition-colors placeholder:text-gray-500"
          />
        </div>
      </div>

      <div className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="mb-6 space-y-1">
          <button className={navItemClass('home')} onClick={() => onTabChange('home')}>
            <Home className={`w-4 h-4 ${iconColor('home')}`} />
            Trang chủ
          </button>
        </div>

        <div className="mb-6 space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Công việc</p>
          <button className={navItemClass('projects')} onClick={() => onTabChange('projects')}>
            <Target className={`w-4 h-4 ${iconColor('projects')}`} />
            Dự án (Projects)
          </button>
          <button className={navItemClass('tasks')} onClick={() => onTabChange('tasks')}>
            <ListTodo className={`w-4 h-4 ${iconColor('tasks')}`} />
            Nhiệm vụ (Tasks)
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-3">Cá nhân</p>
          <button className={navItemClass('account')} onClick={() => onTabChange('account')}>
            <User className={`w-4 h-4 ${iconColor('account')}`} />
            Tài khoản cá nhân
          </button>
          <button className={navItemClass('notifications')} onClick={() => onTabChange('notifications')}>
            <Bell className={`w-4 h-4 ${iconColor('notifications')}`} />
            Thông báo
          </button>
        </div>
      </div>

      <div className="p-3 border-t border-gray-800 mt-auto">
        <button className={navItemClass('settings')} onClick={() => onTabChange('settings')}>
          <Settings className={`w-4 h-4 ${iconColor('settings')}`} />
          Cài đặt
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-md text-sm transition-colors text-red-400 hover:text-red-300 hover:bg-[#2a2a2a]" onClick={() => onTabChange('logout')}>
          <LogOut className="w-4 h-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}
