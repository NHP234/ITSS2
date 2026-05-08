import { Target, ListTodo, Clock, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';

export function Home() {
  return (
    <div className="min-h-full bg-[#191919] text-white p-8">
      <h1 className="text-3xl font-bold mb-2">Trang chủ</h1>
      <p className="text-gray-400 mb-8">Chào mừng bạn quay lại. Dưới đây là tổng quan công việc của bạn.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#222] p-6 rounded-xl border border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-gray-400 text-sm">Dự án đang chạy</p>
            </div>
          </div>
        </div>

        <div className="bg-[#222] p-6 rounded-xl border border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-yellow-500/20 text-yellow-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">5</p>
              <p className="text-gray-400 text-sm">Nhiệm vụ đến hạn</p>
            </div>
          </div>
        </div>

        <div className="bg-[#222] p-6 rounded-xl border border-gray-800 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold">28</p>
              <p className="text-gray-400 text-sm">Đã hoàn thành</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#222] rounded-xl border border-gray-800 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <ListTodo className="w-5 h-5 text-gray-400" />
              Nhiệm vụ của tôi
            </h2>
          </div>
          <div className="p-4 flex-1">
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#2a2a2a] hover:bg-[#333] cursor-pointer border border-gray-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full border border-gray-500" />
                    <span className="text-sm">Hoàn thiện giao diện trang chủ {i}</span>
                  </div>
                  <span className="text-xs text-red-400 bg-red-400/10 px-2 py-1 rounded">Hôm nay</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#222] rounded-xl border border-gray-800 overflow-hidden flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-800">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-gray-400" />
              Lịch trình
            </h2>
          </div>
          <div className="p-8 flex-1 flex flex-col items-center justify-center text-gray-500">
            <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
            <p>Không có sự kiện nào sắp tới</p>
          </div>
        </div>
      </div>
    </div>
  );
}
