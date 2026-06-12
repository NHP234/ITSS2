import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Users, Loader2, X, Flag, TrendingUp, Heart, Calendar, Star, Zap } from 'lucide-react';
import { getTaskRecommendations, TaskRecommendationsResponse } from '../../api';

interface TaskRecommendationsProps {
  taskId: string;
  taskTitle?: string;
  taskDue?: string;
  projectId?: string;
  onClose?: () => void;
  position?: 'top' | 'bottom';
  triggerElement?: HTMLElement | null;
}

// Storage key for member details
const MEMBER_DETAILS_STORAGE_KEY = 'memberDetails';

interface MemberDetails {
  userId: string;
  availability: number;
  skillLevel: number;
  notes?: string;
  lastUpdated: string;
}

// Load member details from localStorage
const loadMemberDetails = (projectId: string): Record<string, MemberDetails> => {
  try {
    const storageKey = `${MEMBER_DETAILS_STORAGE_KEY}_${projectId}`;
    const existingData = localStorage.getItem(storageKey);
    console.log('Loading member details for project:', projectId, existingData);
    return existingData ? JSON.parse(existingData) : {};
  } catch (error) {
    console.error('Failed to load member details:', error);
    return {};
  }
};

export function TaskRecommendations({ 
  taskId, 
  taskTitle, 
  taskDue,
  projectId,
  onClose, 
  position = 'bottom', 
  triggerElement 
}: TaskRecommendationsProps) {
  const [data, setData] = useState<TaskRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<Record<string, MemberDetails>>({});
  const popupRef = useRef<HTMLDivElement>(null);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties>({});

  // Load member details from localStorage when projectId is available
  useEffect(() => {
    if (projectId) {
      const details = loadMemberDetails(projectId);
      console.log('Loaded member details:', details);
      setMemberDetails(details);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!taskId) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching recommendations for task:', taskId);
        console.log('With member details:', memberDetails);
        
        // Pass member details to the API call
        const result = await getTaskRecommendations(taskId, memberDetails);
        console.log('Recommendations result:', result);
        setData(result);
      } catch (err) {
        console.error('Failed to fetch recommendations:', err);
        setError(err instanceof Error ? err.message : 'Không thể lấy gợi ý');
      } finally {
        setLoading(false);
      }
    };

    // Wait for memberDetails to be loaded
    if (projectId && Object.keys(memberDetails).length >= 0) {
      fetchRecommendations();
    }
  }, [taskId, projectId, memberDetails]);

  // Calculate popup position relative to trigger element
  useEffect(() => {
    if (triggerElement && !loading && popupRef.current) {
      const triggerRect = triggerElement.getBoundingClientRect();
      const popupRect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;
      
      let top = 0;
      let left = 0;
      
      if (position === 'top') {
        top = triggerRect.top - popupRect.height - 8;
        if (top < 0) {
          top = triggerRect.bottom + 8;
        }
      } else {
        top = triggerRect.bottom + 8;
        if (top + popupRect.height > viewportHeight) {
          top = triggerRect.top - popupRect.height - 8;
        }
      }
      
      left = triggerRect.left + (triggerRect.width / 2) - (popupRect.width / 2);
      if (left < 8) left = 8;
      if (left + popupRect.width > viewportWidth - 8) {
        left = viewportWidth - popupRect.width - 8;
      }
      
      setPopupStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
        zIndex: 9999,
      });
    }
  }, [loading, data, triggerElement, position]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node) && 
          triggerElement && !triggerElement.contains(event.target as Node)) {
        onClose?.();
      }
    };

    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose, triggerElement]);

  // Check if task is overdue based on due date
  const isTaskOverdue = (dueDateStr?: string): boolean => {
    if (!dueDateStr) return false;
    const dateMatch = dueDateStr.match(/(\d+)\s+tháng\s+(\d+),\s+(\d+)/);
    let dueDate;
    if (dateMatch) {
      const day = parseInt(dateMatch[1], 10);
      const month = parseInt(dateMatch[2], 10);
      const year = parseInt(dateMatch[3], 10);
      dueDate = new Date(year, month - 1, day);
    } else {
      dueDate = new Date(dueDateStr);
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const overdue = isTaskOverdue(taskDue);

  if (loading) {
    return (
      <div 
        ref={popupRef} 
        style={triggerElement ? popupStyle : {}}
        className="p-3 px-4 bg-[#1e1e1e] rounded-lg border border-gray-700 shadow-2xl flex items-center gap-2 text-sm z-[9999]"
      >
        <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        <span className="text-gray-300">Đang phân tích...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        ref={popupRef} 
        style={triggerElement ? popupStyle : {}}
        className="p-3 px-4 bg-red-500/10 rounded-lg border border-red-500/30 flex items-center gap-2 text-sm max-w-[300px] z-[9999]"
      >
        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
        <span className="text-red-300 text-sm">{error}</span>
      </div>
    );
  }

  // If task is not overdue, show a different message
  if (!overdue && data && !data.isOverdue) {
    return (
      <div 
        ref={popupRef} 
        style={triggerElement ? popupStyle : {}}
        className="w-80 bg-[#1e1e1e] rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-[9999]"
      >
        <div className="flex items-center justify-between px-3 py-2.5 bg-blue-500/10 border-b border-blue-500/20">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-semibold text-blue-300">Công việc chưa quá hạn</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 hover:bg-gray-700 rounded transition-colors">
              <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
        <div className="p-4 text-center">
          <p className="text-sm text-gray-400">Công việc này hiện đang đúng tiến độ</p>
          <p className="text-xs text-gray-500 mt-1">Không có đề xuất hỗ trợ</p>
        </div>
      </div>
    );
  }

  if (!data || (!data.isOverdue && !overdue)) return null;

  // Normalize score to be out of 10
  const normalizeScore = (score: number): number => {
    if (score > 10) return Math.min(score / 10, 10);
    return score;
  };

  const getScoreColor = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'text-green-400';
    if (normalized >= 4) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'bg-green-500/10 border-green-500/30';
    if (normalized >= 4) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-orange-500/10 border-orange-500/30';
  };

  const getScoreLabel = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'Rất sẵn sàng';
    if (normalized >= 4) return 'Có thể hỗ trợ';
    return 'Hơi bận';
  };

  const getComplexityColor = (weight: number) => {
    if (weight <= 3) return 'text-green-400';
    if (weight <= 5) return 'text-yellow-400';
    if (weight <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'Very High': return 'bg-red-500/20 text-red-300';
      case 'High': return 'bg-orange-500/20 text-orange-300';
      case 'Medium': return 'bg-yellow-500/20 text-yellow-300';
      case 'Low': return 'bg-green-500/20 text-green-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  const getPriorityShort = (priority: string) => {
    switch (priority) {
      case 'Very High': return 'VH';
      case 'High': return 'H';
      case 'Medium': return 'M';
      case 'Low': return 'L';
      default: return '?';
    }
  };

  const daysOverdue = data?.daysOverdue || (taskDue ? Math.floor((new Date().getTime() - new Date(taskDue).getTime()) / (1000 * 60 * 60 * 24)) : 0);

  return (
    <div 
      ref={popupRef} 
      style={triggerElement ? popupStyle : {}}
      className="w-80 bg-[#1e1e1e] rounded-lg border border-gray-700 shadow-2xl overflow-hidden z-[9999]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-red-500/10 border-b border-red-500/20">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-400" />
          <div>
            <span className="text-xs font-semibold text-red-300">Quá hạn {daysOverdue} ngày</span>
            <p className="text-[9px] text-red-400/70 mt-0.5">Đề xuất thành viên hỗ trợ</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose} 
            className="p-1 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-400 hover:text-white" />
          </button>
        )}
      </div>

      {/* Task Info */}
      <div className="px-3 py-2 border-b border-gray-700 bg-[#252525]/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-gray-200 truncate flex-1">
            {taskTitle || data?.task?.title || 'Đang tải...'}
          </span>
          {data?.task?.complexityLevel && (
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getComplexityColor(data.task.weight || 4)} bg-gray-800`}>
              <TrendingUp className="w-2.5 h-2.5 inline mr-0.5" />
              {data.task.complexityLevel}
            </span>
          )}
          {data?.task?.priority && (
            <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-medium ${getPriorityBadge(data.task.priority)}`}>
              <Flag className="w-2.5 h-2.5 inline mr-0.5" />
              {getPriorityShort(data.task.priority)}
            </span>
          )}
        </div>
      </div>

      {/* Recommendations */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-1.5 mb-2">
          <Heart className="w-3 h-3 text-red-400" />
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider">
            Đề xuất ({data?.recommendations?.length || 0})
          </p>
        </div>

        {data?.recommendations && data.recommendations.length > 0 ? (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {data.recommendations.map((person, index) => {
              const normalizedScore = normalizeScore(person.availabilityScore);
              return (
                <div 
                  key={person.id} 
                  className={`p-2 rounded-lg border transition-all ${getScoreBg(person.availabilityScore)}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0 shadow-md">
                      {person.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-semibold text-gray-200 truncate">{person.name}</p>
                        {index === 0 && (
                          <span className="px-1.5 py-0.5 bg-yellow-500/20 rounded-full text-[8px] font-bold text-yellow-300">
                            ★ TOP
                          </span>
                        )}
                        {person.canHandleCurrentTask && (
                          <span className="px-1.5 py-0.5 bg-green-500/20 rounded-full text-[8px] font-bold text-green-400">
                            Phù hợp
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-[9px] text-gray-500 truncate">{person.email}</p>
                        {person.completedTasks > 0 && (
                          <span className="text-[8px] text-gray-600">
                            {person.completedTasks} task
                          </span>
                        )}
                      </div>
                      {/* Show availability and skill level if available from backend response */}
                      {(person.availability !== undefined || person.skillLevel !== undefined) && (
                        <div className="flex items-center gap-2 mt-1">
                          {person.availability !== undefined && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] text-yellow-400 bg-yellow-500/10 px-1 rounded">
                              <Zap className="w-2.5 h-2.5" />
                              {person.availability}/10
                            </span>
                          )}
                          {person.skillLevel !== undefined && (
                            <span className="inline-flex items-center gap-0.5 text-[8px] text-blue-400 bg-blue-500/10 px-1 rounded">
                              <Star className="w-2.5 h-2.5" />
                              {person.skillLevel}/10
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${getScoreColor(person.availabilityScore)}`}>
                        {normalizedScore.toFixed(1)}/10
                      </p>
                      <p className={`text-[8px] font-medium ${getScoreColor(person.availabilityScore)}`}>
                        {getScoreLabel(person.availabilityScore)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 text-center">
            <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-xs text-gray-400">Không có đề xuất nào</p>
            <p className="text-[9px] text-gray-500 mt-1">Tất cả thành viên đều đang bận hoặc đã được gán</p>
          </div>
        )}
      </div>
    </div>
  );
}