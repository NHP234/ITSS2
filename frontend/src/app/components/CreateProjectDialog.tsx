import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from './ui/sheet';
import { Button } from './ui/button';
import { Plus, Target, Users, Calendar, ChevronDown, MessageSquare, LayoutGrid, List, Filter, ArrowUpDown, Sparkles, Search, SlidersHorizontal, Check, Maximize2, Zap, Image as ImageIcon, LayoutTemplate } from 'lucide-react';
import { CustomDatePicker } from './CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { searchUsers } from '../../api';
import { UserPlus, X, CheckCircle2 } from 'lucide-react';

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  currentUser?: { name: string };
}

export function CreateProjectDialog({ open, onClose, onCreate, currentUser }: CreateProjectDialogProps) {
  const [name, setName] = useState('New Project');
  const [description, setDescription] = useState('');
  const [dates, setDates] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate({
        name,
        description,
        dates,
        memberIds: members.map(m => m.id)
      });
      setName('New Project');
      setDescription('');
      setDates('');
      setMembers([]);
      onClose();
    }
  };

  const handleSearchUsers = async (q: string) => {
    setUserSearch(q);
    if (q.length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsers(q);
      setSearchResults(results.filter(u => !members.some(m => m.id === u.id)));
    } catch (err) {
      console.error(err);
    }
  };

  const addMember = (user: any) => {
    setMembers([...members, user]);
    setUserSearch('');
    setSearchResults([]);
  };

  const removeMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const tasksByStatus = {
    'Not Started': [],
    'In Progress': [],
    'Done': [],
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-[#191919] text-white border-gray-800 sm:max-w-[50vw] w-3/4 p-0 overflow-hidden flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle className="text-white">Tạo dự án mới</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="flex-1 overflow-auto">
            <div className="px-8 py-8 space-y-6">
              
              <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="sm" className="bg-[#2a2a2a] hover:bg-[#333] text-gray-400">
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Thêm ảnh bìa
                </Button>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:bg-[#2a2a2a]">
                  <LayoutTemplate className="w-4 h-4 mr-2" />
                  Tùy chỉnh bố cục
                </Button>
              </div>

              <div className="flex flex-col gap-2">
                <Target className="w-8 h-8 text-gray-400 mb-2" />
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-4xl font-bold font-sans tracking-tight border-b-2 border-dashed border-gray-600 pb-1 w-full bg-transparent outline-none focus:border-gray-400 transition-colors"
                  placeholder="Untitled"
                  autoFocus
                />
              </div>

              <div className="space-y-3 mt-8">
                <div className="grid grid-cols-[140px_1fr] gap-4 text-sm items-center">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Status</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 bg-[#2563EB]/40 border border-[#2563EB]/50 px-3 py-0.5 rounded-full">
                      <div className="w-2 h-2 rounded-full bg-[#60A5FA]" />
                      <span className="text-xs text-white font-medium">Planning</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Users className="w-4 h-4" />
                    <span>Owner</span>
                  </div>
                  <div className="text-gray-400">
                    {currentUser?.name || 'Trống'}
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <UserPlus className="w-4 h-4" />
                    <span>Members</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {members.map(m => (
                        <div key={m.id} className="w-6 h-6 rounded-full bg-blue-600 border border-[#191919] flex items-center justify-center text-[10px] font-bold">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="p-1 hover:bg-gray-800 rounded transition-colors text-blue-400">
                          <UserPlus className="w-4 h-4" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 bg-[#1e1e1e] border-[#333] p-0 shadow-2xl rounded-xl">
                        <div className="p-3 border-b border-gray-800">
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thêm thành viên</h4>
                        </div>
                        <div className="p-2">
                          <div className="relative">
                            <Search className="absolute left-2 top-2 w-3 h-3 text-gray-500" />
                            <input 
                              className="w-full bg-[#1a1a1a] border border-gray-700 rounded-md py-1.5 pl-7 pr-2 text-xs outline-none focus:border-blue-500"
                              placeholder="Tìm theo email hoặc tên..."
                              value={userSearch}
                              onChange={(e) => handleSearchUsers(e.target.value)}
                            />
                          </div>
                          <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                            {searchResults.map(u => (
                              <button 
                                key={u.id} 
                                type="button"
                                onClick={() => addMember(u)}
                                className="w-full flex items-center gap-2 p-1.5 hover:bg-blue-600 rounded text-left transition-colors"
                              >
                                <div className="w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center text-[9px]">{u.name.charAt(0).toUpperCase()}</div>
                                <div className="flex flex-col">
                                  <span className="text-xs">{u.name}</span>
                                  <span className="text-[10px] opacity-70">{u.email}</span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                        {members.length > 0 && (
                          <div className="p-2 border-t border-gray-800 max-h-32 overflow-y-auto">
                            {members.map(m => (
                              <div key={m.id} className="flex items-center justify-between p-1">
                                <span className="text-[10px] text-gray-400">{m.email}</span>
                                <button type="button" onClick={() => removeMember(m.id)}><X className="w-3 h-3 text-gray-500 hover:text-red-400" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex items-center gap-2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                    <span>Dates</span>
                  </div>
                  <div>
                    <CustomDatePicker 
                      mode="range"
                      trigger={
                        <button type="button" className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-2 py-1 rounded -ml-2 transition-colors">
                          {dates || 'Trống'}
                        </button>
                      } 
                      onRangeSelect={(range) => {
                        if (range?.from) {
                          const fromStr = `${range.from.getDate()} tháng ${range.from.getMonth() + 1}, ${range.from.getFullYear()}`;
                          const toStr = range.to ? ` → ${range.to.getDate()} tháng ${range.to.getMonth() + 1}, ${range.to.getFullYear()}` : '';
                          setDates(`${fromStr}${toStr}`);
                        } else {
                          setDates('');
                        }
                      }}
                    />
                  </div>
                </div>

                <button type="button" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-400 pt-2">
                  <ChevronDown className="w-4 h-4" />
                  Thêm 5 thuộc tính
                </button>
              </div>

              <div className="space-y-6 pt-6 border-t border-gray-800">
                <div>
                  <p className="text-sm font-semibold text-gray-300 mb-2">Quan hệ</p>
                  <button type="button" className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300">
                    <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                    Thêm Tasks
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
                <h3 className="text-xl font-bold">About this project</h3>
                <ul className="list-disc list-inside text-gray-400 pt-2 pl-2">
                  <li>Danh sách</li>
                </ul>
              </div>

              <div className="pt-8">
                <h2 className="text-2xl font-bold mb-4">Project tasks</h2>

                <div className="flex items-center gap-2 mb-4 pb-3">
                  <Button variant="ghost" size="sm" className="bg-[#333333] text-white hover:bg-[#444444] rounded-full px-4">
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    Board
                    <ChevronDown className="w-4 h-4 ml-1 text-gray-400" />
                  </Button>

                  <div className="flex-1" />

                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-400 hover:bg-gray-800 hover:text-blue-300">
                      <Filter className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                      <Zap className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-blue-400 hover:bg-gray-800 hover:text-blue-300">
                      <Sparkles className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                      <Search className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                      <Maximize2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="w-8 h-8 text-gray-400 hover:bg-gray-800 hover:text-white">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                    
                    <div className="flex items-center ml-2 rounded-md overflow-hidden bg-blue-600">
                      <button type="button" className="px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                        Mới
                      </button>
                      <div className="w-px h-full bg-blue-500/50"></div>
                      <button type="button" className="px-2 py-1.5 text-white hover:bg-blue-700 transition-colors">
                        <ChevronDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(tasksByStatus).map(([status, statusTasks]) => {
                    const isNotStarted = status === 'Not Started';
                    const isInProgress = status === 'In Progress';
                    const isDone = status === 'Done';

                    return (
                      <div key={status} className="flex flex-col bg-[#222] rounded-xl p-3 border border-gray-800/40">
                        <div className="mb-3">
                          <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-sm font-medium ${
                            isNotStarted ? 'bg-gray-500/20 text-gray-300' :
                            isInProgress ? 'bg-blue-500/20 text-blue-200' :
                            'bg-green-500/20 text-green-200'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              isNotStarted ? 'bg-gray-400' :
                              isInProgress ? 'bg-blue-400' :
                              'bg-green-400'
                            }`} />
                            {status}
                          </div>
                        </div>

                        <div className="space-y-2 flex-1">
                          <button
                            type="button"
                            className={`w-full text-left px-3 py-2.5 text-sm rounded-lg flex items-center gap-2 transition-colors border ${
                              isNotStarted ? 'text-gray-300 border-gray-700 hover:bg-gray-800/50' :
                              isInProgress ? 'text-blue-400 border-blue-900/60 hover:bg-blue-900/20' :
                              'text-green-400 border-green-900/60 hover:bg-green-900/20'
                            }`}
                          >
                            <Plus className="w-4 h-4" />
                            Nhiệm vụ mới
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800">
              Hủy
            </Button>
            <Button type="submit" disabled={!name.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
              Tạo dự án
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
