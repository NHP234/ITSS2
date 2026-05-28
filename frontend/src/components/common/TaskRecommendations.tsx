import { useState, useEffect, useRef } from 'react';
import { AlertCircle, Users, TrendingUp, Loader2, Heart, X, Flag, Target, CheckCircle } from 'lucide-react';
import { getTaskRecommendations, TaskRecommendationsResponse } from '../../api';

interface TaskRecommendationsProps {
  taskId: string;
  taskTitle?: string;
  onClose?: () => void;
  position?: 'top' | 'bottom';
}

export function TaskRecommendations({ taskId, taskTitle, onClose, position = 'top' }: TaskRecommendationsProps) {
  const [data, setData] = useState<TaskRecommendationsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await getTaskRecommendations(taskId);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể lấy gợi ý');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [taskId]);

  // Check if popup goes off-screen and adjust position
  useEffect(() => {
    if (popupRef.current && !loading) {
      const rect = popupRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      
      if (rect.top < 0 && position === 'top') {
        setAdjustedPosition('bottom');
      } else if (rect.bottom > viewportHeight && position === 'bottom') {
        setAdjustedPosition('top');
      }
    }
  }, [loading, position, data]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose?.();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (loading) {
    return (
      <div 
        ref={popupRef}
        className="p-2 px-3 bg-[#252525] rounded-lg border border-gray-700 shadow-2xl flex items-center gap-2 text-xs"
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
        <span className="text-gray-300">Đang phân tích...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        ref={popupRef}
        className="p-2 px-3 bg-red-500/10 rounded-lg border border-red-500/30 flex items-center gap-2 text-xs"
      >
        <AlertCircle className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />
        <span className="text-red-300">{error}</span>
      </div>
    );
  }

  if (!data || !data.isOverdue) {
    return null;
  }

  const getScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-400';
    if (score >= 4) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getScoreBg = (score: number) => {
    if (score >= 7) return 'bg-green-500/10 border-green-500/30';
    if (score >= 4) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-orange-500/10 border-orange-500/30';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 7) return 'Rất sẵn sàng';
    if (score >= 4) return 'Có thể hỗ trợ';
    return 'Hơi bận';
  };

  const getComplexityColor = (weight: number) => {
    if (weight <= 3) return 'text-green-400';
    if (weight <= 5) return 'text-yellow-400';
    if (weight <= 8) return 'text-orange-400';
    return 'text-red-400';
  };

  const getComplexityLabel = (weight: number) => {
    if (weight <= 3) return 'Low';
    if (weight <= 5) return 'Medium';
    if (weight <= 8) return 'High';
    return 'Very High';
  };

  return (
    <div 
      ref={popupRef}
      className="w-80 bg-[#2a2a2a] rounded-lg border border-gray-600 shadow-2xl overflow-hidden z-50"
      style={{ boxShadow: '0 20px 35px -10px rgba(0,0,0,0.5)' }}
    >
      {/* Compact Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-red-500/10 border-b border-red-500/20">
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-red-400" />
          <span className="text-xs font-semibold text-red-300">
            Quá hạn {data.daysOverdue} ngày
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-0.5 hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-3 h-3 text-gray-400" />
          </button>
        )}
      </div>

      {/* Compact Task Info - Single line */}
      <div className="px-3 py-1.5 border-b border-gray-700 bg-gray-800/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] text-gray-500 font-medium">📋</span>
          <span className="text-xs font-medium text-gray-200 truncate flex-1">{taskTitle || data.task.title}</span>
          {data.task.priority && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium ${
              data.task.priority === 'Very High' ? 'bg-red-500/20 text-red-300' :
              data.task.priority === 'High' ? 'bg-orange-500/20 text-orange-300' :
              data.task.priority === 'Medium' ? 'bg-yellow-500/20 text-yellow-300' :
              'bg-green-500/20 text-green-300'
            }`}>
              <Flag className="w-2.5 h-2.5" />
              {data.task.priority === 'Very High' ? 'VH' : data.task.priority === 'Very Hard' ? 'VHd' : data.task.priority?.substring(0, 1)}
            </span>
          )}
          {data.task.weight !== undefined && (
            <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-gray-700/50 ${getComplexityColor(data.task.weight)}`}>
              <Target className="w-2.5 h-2.5" />
              {getComplexityLabel(data.task.weight)} ({data.task.weight})
            </span>
          )}
        </div>
      </div>

      {/* Content - More Compact */}
      <div className="px-3 py-2">
        <div className="mb-1.5 pb-1 border-b border-gray-700">
          <p className="text-[9px] text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1">
            <Heart className="w-2.5 h-2.5 text-red-400" />
            Đề xuất hỗ trợ ({data.recommendations.length})
          </p>
        </div>

        {data.recommendations.length > 0 ? (
          <div className="space-y-1.5 max-h-64 overflow-y-auto custom-scrollbar">
            {data.recommendations.map((person, index) => (
              <div
                key={person.id}
                className={`p-2 rounded-lg border transition-all ${getScoreBg(person.availabilityScore)} hover:scale-[1.01] cursor-pointer`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 shadow">
                    {person.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 flex-wrap">
                      <p className="text-xs font-semibold text-gray-200 truncate">{person.name}</p>
                      {index === 0 && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0 bg-yellow-500/20 rounded text-[8px] font-bold text-yellow-300">
                          TOP
                        </span>
                      )}
                      {person.canHandleCurrentTask && (
                        <span className="inline-flex items-center gap-0.5 px-1 py-0 bg-green-500/20 rounded text-[8px] font-bold text-green-300">
                          <CheckCircle className="w-2.5 h-2.5" />
                          Đủ khả năng
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-gray-500 truncate">{person.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className={`text-base font-bold ${getScoreColor(person.availabilityScore)}`}>
                      {typeof person.availabilityScore === 'number' ? person.availabilityScore.toFixed(1) : person.availabilityScore}
                    </p>
                  </div>
                </div>

                {/* Compact Stats - Horizontal */}
                <div className="mt-1.5 flex items-center gap-2 text-[9px]">
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800/50">
                    <span className="text-gray-500">✅</span>
                    <span className="font-medium text-gray-300">{person.completedTasks}</span>
                  </div>
                  <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-800/50">
                    <span className="text-gray-500">⚡</span>
                    <span className="font-medium text-gray-300">{person.avgWeight || '0'}</span>
                  </div>
                  {person.experienceBonus > 0 && (
                    <div className="flex items-center gap-0.5 text-blue-400">
                      <span>✨</span>
                      <span>+{person.experienceBonus}</span>
                    </div>
                  )}
                  <span className={`text-[8px] font-medium ml-auto ${getScoreColor(person.availabilityScore)}`}>
                    {getScoreLabel(person.availabilityScore)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center">
            <Users className="w-6 h-6 text-gray-600 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Không có gợi ý</p>
          </div>
        )}

        {/* Compact Footer */}
        <div className="mt-2 pt-1.5 border-t border-gray-700/50">
          <p className="text-[8px] text-gray-500 leading-relaxed text-center">
            ✨ Điểm dựa trên Weight (2-10) = Priority + Difficulty
          </p>
        </div>
      </div>
    </div>
  );
}