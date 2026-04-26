import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { Target, Users, Calendar, ChevronDown, Sparkles, LayoutTemplate, AlignLeft, ArrowDownCircle, Tag, ListTodo } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string) => void;
}

export function CreateTaskDialog({ open, onClose, onCreate }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('Task');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onCreate(title);
      setTitle('Task');
      onClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-[#191919] text-white border-gray-800 sm:max-w-[50vw] w-3/4 p-0 overflow-hidden flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle className="text-white">Tạo nhiệm vụ mới</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="px-8 py-8 space-y-6">
              
              <div className="flex flex-col gap-2">
                <LayoutTemplate className="w-8 h-8 text-gray-400 mb-2" />
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-4xl font-bold font-sans tracking-tight border-b-2 border-dashed border-gray-600 pb-1 w-full bg-transparent outline-none focus:border-gray-400 transition-colors"
                  placeholder="Untitled"
                  autoFocus
                />
              </div>

              <div className="space-y-3 mt-8">
                <div className="grid grid-cols-[140px_1fr] gap-4 text-sm items-center">
                  
                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Assignee</span>
                  </div>
                  <div className="text-gray-400">
                    Trống
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#444] border border-[#555] px-3 py-0.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-gray-400" />
                      <span className="text-xs text-white font-medium">Not Started</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <AlignLeft className="w-4 h-4" />
                    <span>Summary</span>
                    <Sparkles className="w-3 h-3 ml-1 text-gray-500" />
                  </div>
                  <div className="text-gray-400">
                    Trống
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Due</span>
                  </div>
                  <div>
                    <CustomDatePicker trigger={
                      <button type="button" className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors">
                        Trống
                      </button>
                    } />
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>Project</span>
                  </div>
                  <div className="text-gray-400">
                    Trống
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <ArrowDownCircle className="w-4 h-4" />
                    <span>Priority</span>
                  </div>
                  <div className="text-gray-400">
                    Trống
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Tag className="w-4 h-4" />
                    <span>Tags</span>
                  </div>
                  <div className="text-gray-400">
                    Trống
                  </div>

                </div>

                <button type="button" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 pt-2">
                  <ChevronDown className="w-4 h-4" />
                  Thêm 1 thuộc tính
                </button>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-800">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Quan hệ</p>
                  <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
                    <ListTodo className="w-4 h-4" />
                    Thêm Sub-tasks
                  </button>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Bình luận</p>
                  <button type="button" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 group">
                    <div className="w-6 h-6 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center text-xs text-gray-300">
                      B
                    </div>
                    <span className="border-b border-transparent group-hover:border-gray-500">Thêm bình luận...</span>
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-gray-800">
                <h3 className="text-2xl font-bold font-sans tracking-tight border-b-2 border-dashed border-gray-600 pb-1 w-fit">Description</h3>
                <ul className="list-disc list-inside text-gray-400 pt-2 pl-2">
                  <li>Danh sách</li>
                </ul>
              </div>

            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
              Hủy
            </Button>
            <Button type="submit" disabled={!title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Tạo nhiệm vụ
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
