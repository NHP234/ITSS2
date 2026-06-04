import { useState } from 'react';
import { Settings, Globe, Palette, Bell, Shield, Info, Save, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export function SettingsView() {
  const [language, setLanguage] = useState('vi');
  const [accentColor, setAccentColor] = useState('blue');
  const [emailNotify, setEmailNotify] = useState(true);
  const [browserNotify, setBrowserNotify] = useState(true);
  const [overdueNotify, setOverdueNotify] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Đã lưu cấu hình cài đặt thành công!');
    }, 800);
  };

  const accentColors = [
    { id: 'blue', label: 'Xanh dương', class: 'bg-blue-500' },
    { id: 'purple', label: 'Tím', class: 'bg-purple-500' },
    { id: 'emerald', label: 'Lục bảo', class: 'bg-emerald-500' },
    { id: 'rose', label: 'Hoa hồng', class: 'bg-rose-500' },
  ];

  return (
    <div className="min-h-full bg-[#121212] text-white p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl">
            <Settings className="w-8 h-8 text-blue-500" />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight">Cài đặt hệ thống</h1>
            <p className="text-gray-500 text-sm">Tùy chỉnh giao diện, ngôn ngữ và cấu hình thông báo cá nhân của bạn</p>
          </div>
        </header>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sidebar Menu */}
          <div className="md:col-span-1 space-y-2">
            {[
              { id: 'general', label: 'Cài đặt chung', icon: Globe },
              { id: 'appearance', label: 'Giao diện', icon: Palette },
              { id: 'notifications', label: 'Thông báo', icon: Bell },
              { id: 'security', label: 'Bảo mật', icon: Shield },
            ].map((tab, idx) => (
              <button
                key={tab.id}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  idx === 0 
                    ? 'bg-[#2a2a2a] text-white shadow-lg border border-white/5' 
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.02]'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form Content */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Section 1: General */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Globe className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold">Cài đặt chung</h3>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Ngôn ngữ hiển thị</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="bg-[#252525] border border-white/5 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="vi">Tiếng Việt (Vietnamese)</option>
                    <option value="en">English (Tiếng Anh)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            {/* Section 2: Appearance */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h3 className="text-lg font-bold">Giao diện</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs text-gray-400 font-bold uppercase tracking-wider">Màu sắc chủ đạo (Accent Color)</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {accentColors.map(color => (
                      <button
                        key={color.id}
                        onClick={() => setAccentColor(color.id)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-semibold transition-all ${
                          accentColor === color.id 
                            ? 'border-blue-500/50 bg-blue-500/5' 
                            : 'border-white/5 bg-[#252525] hover:bg-[#2e2e2e]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`w-3.5 h-3.5 rounded-full ${color.class}`} />
                          <span className="text-xs">{color.label}</span>
                        </div>
                        {accentColor === color.id && <Check className="w-3.5 h-3.5 text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Section 3: Notifications */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1e1e1e] rounded-[2rem] border border-white/5 p-6 space-y-6 shadow-2xl"
            >
              <div className="flex items-center gap-2 pb-4 border-b border-white/5">
                <Bell className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Thông báo</h3>
              </div>

              <div className="space-y-4">
                {[
                  { id: 'email', title: 'Thông báo Email', desc: 'Nhận email cập nhật khi có thay đổi từ dự án hoặc gán task', val: emailNotify, set: setEmailNotify },
                  { id: 'browser', title: 'Thông báo trình duyệt', desc: 'Bật thông báo đẩy trực tiếp trên màn hình trình duyệt', val: browserNotify, set: setBrowserNotify },
                  { id: 'overdue', title: 'Thông báo nhắc hạn nhiệm vụ', desc: 'Thông báo khi nhiệm vụ còn 1 ngày hoặc đã quá hạn', val: overdueNotify, set: setOverdueNotify },
                ].map(notify => (
                  <div key={notify.id} className="flex items-start justify-between gap-4 p-3 hover:bg-white/[0.01] rounded-xl transition-colors">
                    <div>
                      <h4 className="text-sm font-bold text-gray-200">{notify.title}</h4>
                      <p className="text-xs text-gray-500 mt-1">{notify.desc}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input 
                        type="checkbox" 
                        checked={notify.val} 
                        onChange={(e) => notify.set(e.target.checked)} 
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-checked:after:bg-white"></div>
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-between gap-4 pt-4">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Info className="w-4 h-4" />
                <span>Phiên bản v1.2.0 (Productive Release)</span>
              </div>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/10 cursor-pointer"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                Lưu cấu hình
              </Button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
