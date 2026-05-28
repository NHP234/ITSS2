import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { Button } from '../ui/button';
import { Target, Users, Calendar, Sparkles, LayoutTemplate, AlignLeft, X, Flag, TrendingUp } from 'lucide-react';
import { CustomDatePicker } from '../common/CustomDatePicker';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CheckCircle2 } from 'lucide-react';

interface CreateTaskDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  project?: { id: string; members?: { id: string; name: string; email: string }[] };
}

const PRIORITIES = [
  { value: 'Low', label: 'Low', color: 'bg-green-500', textColor: 'text-green-400', weight: 2 },
  { value: 'Medium', label: 'Medium', color: 'bg-yellow-500', textColor: 'text-yellow-400', weight: 4 },
  { value: 'High', label: 'High', color: 'bg-orange-500', textColor: 'text-orange-400', weight: 7 },
  { value: 'Very High', label: 'Very High', color: 'bg-red-500', textColor: 'text-red-400', weight: 10 }
];

const DIFFICULTIES = [
  { value: 'Easy', label: 'Easy', weight: 2, icon: '😊' },
  { value: 'Medium', label: 'Medium', weight: 4, icon: '🤔' },
  { value: 'Hard', label: 'Hard', weight: 7, icon: '😤' },
  { value: 'Very Hard', label: 'Very Hard', weight: 10, icon: '💀' }
];

export function CreateTaskDialog({ open, onClose, onCreate, project }: CreateTaskDialogProps) {
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'Not Started' | 'In Progress' | 'Done'>('Not Started');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [priority, setPriority] = useState('Medium');
  const [difficulty, setDifficulty] = useState('Medium');
  const [due, setDue] = useState('');
  const [summary, setSummary] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Calculate combined weight
  const getCombinedWeight = () => {
    const priorityWeight = PRIORITIES.find(p => p.value === priority)?.weight || 4;
    const difficultyWeight = DIFFICULTIES.find(d => d.value === difficulty)?.weight || 4;
    return Math.round((priorityWeight + difficultyWeight) / 2);
  };

  const combinedWeight = getCombinedWeight();
  
  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setTitle('');
      setStatus('Not Started');
      setAssigneeIds([]);
      setPriority('Medium');
      setDifficulty('Medium');
      setDue('');
      setSummary('');
      setIsSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        status,
        assigneeIds,
        priority,
        due,
        summary,
        weight: combinedWeight,
      });
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleAssignee = (id: string) => {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(uid => uid !== id) : [...prev, id]);
  };

  const removeAssignee = (id: string) => {
    setAssigneeIds(prev => prev.filter(uid => uid !== id));
  };

  const getComplexityColor = () => {
    if (combinedWeight <= 3) return 'text-green-400';
    if (combinedWeight <= 5) return 'text-yellow-400';
    if (combinedWeight <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplexityLabel = () => {
    if (combinedWeight <= 3) return 'Low complexity';
    if (combinedWeight <= 5) return 'Medium complexity';
    if (combinedWeight <= 8) return 'High complexity';
    return 'Very High complexity';
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-[#191919] text-white border-gray-800 w-full sm:max-w-lg md:max-w-xl p-0 overflow-visible flex flex-col">
        <SheetHeader className="sr-only">
          <SheetTitle className="text-white">Tạo nhiệm vụ mới</SheetTitle>
        </SheetHeader>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-visible">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Tạo nhiệm vụ mới</h2>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
            <div className="space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tiêu đề <span className="text-red-400">*</span>
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-lg font-medium border-b-2 border-dashed border-gray-600 pb-2 bg-transparent outline-none focus:border-blue-500 transition-colors"
                  placeholder="Nhập tiêu đề nhiệm vụ..."
                  autoFocus
                />
              </div>

              <div className="space-y-5 mt-6">
                {/* Status */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm">Status</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {(['Not Started', 'In Progress', 'Done'] as const).map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(s)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            status === s
                              ? s === 'Done'
                                ? 'bg-green-500/20 text-green-300 border border-green-500/50'
                                : s === 'In Progress'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                                : 'bg-gray-500/20 text-gray-300 border border-gray-500/50'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              s === 'Done' ? 'bg-green-400' : s === 'In Progress' ? 'bg-blue-400' : 'bg-gray-400'
                            }`} />
                            {s}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Priority */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <Flag className="w-4 h-4" />
                    <span className="text-sm">Priority</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {PRIORITIES.map(p => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => setPriority(p.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                            priority === p.value
                              ? `${p.textColor} bg-${p.color.split('-')[1]}-500/20 border border-${p.color.split('-')[1]}-500/50`
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm">Difficulty</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2">
                      {DIFFICULTIES.map(d => (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => setDifficulty(d.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1 ${
                            difficulty === d.value
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/50'
                              : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          <span>{d.icon}</span>
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Combined Complexity Score */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <Target className="w-4 h-4" />
                    <span className="text-sm">Complexity</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 rounded-full ${
                            combinedWeight <= 3 ? 'bg-green-500' :
                            combinedWeight <= 5 ? 'bg-yellow-500' :
                            combinedWeight <= 8 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${(combinedWeight / 10) * 100}%` }}
                        />
                      </div>
                      <span className={`text-sm font-mono font-bold ${getComplexityColor()}`}>
                        {combinedWeight}/10
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {getComplexityLabel()} (Priority + Difficulty)
                    </p>
                  </div>
                </div>

                {/* Assignee */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Assignee</span>
                  </div>
                  <div className="flex-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button type="button" className="flex items-center gap-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-2 py-1 rounded transition-colors">
                          <div className="flex -space-x-1">
                            {assigneeIds.length > 0 ? (
                              assigneeIds.map(id => {
                                const m = project?.members?.find(mem => mem.id === id);
                                return m ? (
                                  <div key={id} className="w-7 h-7 rounded-full bg-blue-600 border border-[#191919] flex items-center justify-center text-xs font-bold" title={m.name}>
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                ) : null;
                              })
                            ) : (
                              <span className="text-sm">Chọn người được gán</span>
                            )}
                          </div>
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 bg-[#1e1e1e] border-[#333] p-2 shadow-2xl rounded-xl z-50">
                        <div className="p-2 border-b border-gray-800 mb-2">
                          <span className="text-xs font-bold text-gray-500 uppercase">Chọn người được gán</span>
                        </div>
                        <div className="max-h-64 overflow-y-auto space-y-1">
                          {project?.members?.map(m => {
                            const isAssigned = assigneeIds.includes(m.id);
                            return (
                              <button 
                                key={m.id} 
                                type="button"
                                onClick={() => toggleAssignee(m.id)}
                                className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-xs font-medium">
                                    {m.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="text-left">
                                    <div className="text-sm text-gray-200">{m.name}</div>
                                    <div className="text-xs text-gray-500">{m.email}</div>
                                  </div>
                                </div>
                                {isAssigned && <CheckCircle2 className="w-4 h-4 text-blue-500" />}
                              </button>
                            );
                          })}
                          {(!project?.members || project.members.length === 0) && (
                            <div className="p-4 text-center text-xs text-gray-500">
                              Chưa có thành viên trong dự án
                            </div>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                    
                    {assigneeIds.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {assigneeIds.map(id => {
                          const m = project?.members?.find(mem => mem.id === id);
                          return m ? (
                            <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 rounded-full text-xs text-blue-300">
                              {m.name}
                              <button type="button" onClick={() => removeAssignee(id)} className="hover:text-red-400 ml-1">
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Due Date - Fixed to allow calendar popup to show */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 relative">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Due date</span>
                  </div>
                  <div className="flex-1 relative">
                    <CustomDatePicker 
                      mode="single"
                      trigger={
                        <button type="button" className="text-gray-400 hover:text-gray-300 hover:bg-gray-800 px-3 py-1.5 rounded transition-colors text-sm">
                          {due || 'Chọn ngày'}
                        </button>
                      } 
                      onSelect={(date) => {
                        if (date) {
                          setDue(`${date.getDate()} tháng ${date.getMonth() + 1}, ${date.getFullYear()}`);
                        } else {
                          setDue('');
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <div className="flex items-center gap-2 text-gray-400 w-28">
                    <AlignLeft className="w-4 h-4" />
                    <span className="text-sm">Summary</span>
                  </div>
                  <div className="flex-1">
                    <textarea 
                      value={summary}
                      onChange={(e) => setSummary(e.target.value)}
                      className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-gray-300 text-sm focus:outline-none focus:border-blue-500 transition-colors resize-none"
                      placeholder="Mô tả chi tiết nhiệm vụ..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-gray-800 bg-[#1a1a1a] flex flex-col-reverse sm:flex-row justify-end gap-2 flex-shrink-0">
            <Button type="button" variant="outline" onClick={onClose} className="bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800 w-full sm:w-auto">
              Hủy
            </Button>
            <Button type="submit" disabled={!title.trim() || isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
              {isSubmitting ? 'Đang tạo...' : 'Tạo nhiệm vụ'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}