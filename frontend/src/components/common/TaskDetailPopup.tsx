import { useState, useEffect } from 'react';
import { AlertCircle, Users, TrendingUp, Loader2, Heart, Flag, Zap, Calendar, X } from 'lucide-react';
import { getTaskRecommendations, TaskRecommendationsResponse } from '../../api';

interface TaskDetailPopupProps {
  taskId: string;
  taskTitle: string;
  taskPriority: string;
  taskDifficulty: string;
  taskSummary?: string;
  taskDue?: string;
  taskWeight?: number;
  onClose?: () => void;
}

export function TaskDetailPopup({ 
  taskId, 
  taskTitle, 
  taskPriority, 
  taskDifficulty, 
  taskSummary, 
  taskDue,
  taskWeight,
  onClose 
}: TaskDetailPopupProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendationsResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoadingRecs(true);
        setError(null);
        const result = await getTaskRecommendations(taskId);
        setRecommendations(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Không thể lấy gợi ý');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [taskId]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Very High': return 'text-red-400 bg-red-500/10';
      case 'High': return 'text-orange-400 bg-orange-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Low': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Very Hard': return 'text-red-400 bg-red-500/10';
      case 'Hard': return 'text-orange-400 bg-orange-500/10';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10';
      case 'Easy': return 'text-green-400 bg-green-500/10';
      default: return 'text-gray-400 bg-gray-500/10';
    }
  };

  const normalizeScore = (score: number): number => {
    if (score > 10) return Math.min(score / 10, 10);
    return score;
  };

  const getAvailabilityColor = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'text-green-400';
    if (normalized >= 4) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getAvailabilityBg = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'bg-green-500/10 border-green-500/30';
    if (normalized >= 4) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-orange-500/10 border-orange-500/30';
  };

  const getAvailabilityLabel = (score: number) => {
    const normalized = normalizeScore(score);
    if (normalized >= 7) return 'Rất sẵn sàng';
    if (normalized >= 4) return 'Có thể hỗ trợ';
    return 'Hơi bận';
  };

  // Determine if task is overdue and if we should show recommendations
  const isOverdue = recommendations?.isOverdue || false;
  const showRecommendations = isOverdue && recommendations?.recommendations && recommendations.recommendations.length > 0;

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-gray-800 shadow-2xl overflow-hidden">
      {/* Recommendations Section - shown only if overdue */}
      {isOverdue && (
        <>
          {loadingRecs && (
            <div className="p-4 bg-[#252525] border-b border-gray-800 flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang kiểm tra gợi ý...
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-500/10 border-b border-red-500/30 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          {!loadingRecs && !error && (
            <div className="p-3 bg-red-500/10 border-b border-red-500/30">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-300">
                    ⚠️ Công việc quá hạn {recommendations?.daysOverdue} ngày
                  </p>
                  <p className="text-xs text-red-400/70 mt-1">
                    Xem gợi ý những thành viên có thể giúp
                  </p>
                </div>
              </div>

              {showRecommendations && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    Đề xuất hỗ trợ
                  </div>
                  {recommendations?.recommendations.map((person, index) => (
                    <div
                      key={person.id}
                      className={`p-2.5 rounded-lg border transition-all ${getAvailabilityBg(person.availabilityScore)} cursor-default text-xs`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 min-w-0 flex-1">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white flex-shrink-0 border border-blue-400/50">
                            {person.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-semibold text-gray-200">{person.name}</p>
                              {index === 0 && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded-full text-[9px] font-bold text-blue-300 flex-shrink-0">
                                  <TrendingUp className="w-3 h-3" />
                                  TOP
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-500 truncate">{person.email}</p>
                          </div>
                        </div>
                        <div className={`text-right flex-shrink-0 ${getAvailabilityColor(person.availabilityScore)}`}>
                          <p className="font-bold text-xs">{normalizeScore(person.availabilityScore).toFixed(1)}/10</p>
                          <p className="text-[9px] opacity-70 font-medium">{getAvailabilityLabel(person.availabilityScore)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Task Description Section - always shown */}
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-gray-200 line-clamp-2">{taskTitle}</h3>
          {taskDue && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {taskDue}
            </div>
          )}
        </div>

        {/* Priority and Difficulty */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getPriorityColor(taskPriority)}`}>
            <Flag className="w-3 h-3" />
            {taskPriority}
          </div>
          <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium border ${getDifficultyColor(taskDifficulty)}`}>
            <Zap className="w-3 h-3" />
            {taskDifficulty}
          </div>
          {taskWeight && (
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30">
              <Users className="w-3 h-3" />
              Weight: {taskWeight}
            </div>
          )}
        </div>

        {/* Task Summary/Description */}
        {taskSummary && (
          <div className="pt-2 border-t border-gray-700">
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {taskSummary}
            </p>
          </div>
        )}

        {/* Info footer for overdue tasks */}
        {isOverdue && (
          <div className="pt-2 text-[10px] text-gray-500 border-t border-gray-700">
            <p className="font-semibold mb-1">Gợi ý dựa trên:</p>
            <ul className="space-y-0.5 text-gray-400">
              <li>• Độ khó của các task đã hoàn thành (priority + weight)</li>
              <li>• Đã hoàn thành TẤT CẢ tasks của họ</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
