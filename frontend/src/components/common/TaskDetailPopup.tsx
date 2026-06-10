import { useState, useEffect } from 'react';
import { AlertCircle, Users, TrendingUp, Loader2, Heart, Flag, Zap, Calendar, X, FileText, Clock, CheckCircle, Circle, Star } from 'lucide-react';
import { getTaskRecommendations, TaskRecommendationsResponse } from '../../api';

interface TaskDetailPopupProps {
  taskId: string;
  taskTitle: string;
  taskPriority: string;
  taskDifficulty: string;
  taskSummary?: string;
  taskDue?: string;
  taskWeight?: number;
  taskStatus?: string;
  taskAssignees?: Array<{ id: string; name: string; email: string }>;
  taskCreatedAt?: string;
  taskUpdatedAt?: string;
  projectId?: string;
  onClose?: () => void;
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
    console.log('[TaskDetailPopup] Loading member details for project:', projectId);
    console.log('[TaskDetailPopup] Raw data:', existingData);
    const details = existingData ? JSON.parse(existingData) : {};
    console.log('[TaskDetailPopup] Parsed details:', details);
    return details;
  } catch (error) {
    console.error('[TaskDetailPopup] Failed to load member details:', error);
    return {};
  }
};

export function TaskDetailPopup({ 
  taskId, 
  taskTitle, 
  taskPriority, 
  taskDifficulty, 
  taskSummary, 
  taskDue,
  taskWeight,
  taskStatus,
  taskAssignees,
  taskCreatedAt,
  taskUpdatedAt,
  projectId,
  onClose 
}: TaskDetailPopupProps) {
  const [recommendations, setRecommendations] = useState<TaskRecommendationsResponse | null>(null);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFullSummary, setShowFullSummary] = useState(false);
  const [memberDetails, setMemberDetails] = useState<Record<string, MemberDetails>>({});

  // Load member details from localStorage when projectId is available
  useEffect(() => {
    if (projectId) {
      const details = loadMemberDetails(projectId);
      setMemberDetails(details);
    }
  }, [projectId]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!taskId) return;
      
      try {
        setLoadingRecs(true);
        setError(null);
        console.log('[TaskDetailPopup] Fetching recommendations for task:', taskId);
        console.log('[TaskDetailPopup] Project ID:', projectId);
        console.log('[TaskDetailPopup] Member details being sent:', memberDetails);
        
        // Pass member details to the API call
        const result = await getTaskRecommendations(taskId, memberDetails);
        console.log('[TaskDetailPopup] Recommendations result:', result);
        setRecommendations(result);
      } catch (err) {
        console.error('[TaskDetailPopup] Failed to fetch recommendations:', err);
        setError(err instanceof Error ? err.message : 'Không thể lấy gợi ý');
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecommendations();
  }, [taskId, projectId, memberDetails]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Very High': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'High': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Low': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Very Hard': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'Hard': return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'Medium': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'Easy': return 'text-green-400 bg-green-500/10 border-green-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Done': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'In Progress': return <Clock className="w-3 h-3 text-blue-400" />;
      default: return <Circle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Not Started': return 'Chưa bắt đầu';
      case 'In Progress': return 'Đang thực hiện';
      case 'Done': return 'Hoàn thành';
      default: return status;
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

  // Format text with line breaks
  const formatText = (text: string) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => (
      <p key={i} className="mb-2 last:mb-0">
        {line || <br />}
      </p>
    ));
  };

  const isOverdue = recommendations?.isOverdue || false;
  const showRecommendations = isOverdue && recommendations?.recommendations && recommendations.recommendations.length > 0;
  
  // Use props for display
  const displayTitle = taskTitle;
  const displayPriority = taskPriority;
  const displayDue = taskDue;
  const displayWeight = taskWeight;
  const displayStatus = taskStatus;
  const displayAssignees = taskAssignees;
  const displaySummary = taskSummary;
  const displayCreatedAt = taskCreatedAt;
  const displayUpdatedAt = taskUpdatedAt;

  return (
    <div className="bg-[#1e1e1e] rounded-lg border border-gray-800 shadow-2xl overflow-hidden w-[480px] max-w-[90vw] max-h-[85vh] flex flex-col">
      {/* Header with close button */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-[#252525] flex-shrink-0">
        <h3 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-400" />
          Chi tiết công việc
        </h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Loading state for recommendations */}
        {loadingRecs && (
          <div className="p-8 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        )}

        {error && !loadingRecs && (
          <div className="p-4 m-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-sm text-red-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {!loadingRecs && !error && recommendations && (
          <>
            {/* Recommendations Section - shown only if overdue */}
            {isOverdue && showRecommendations ? (
              <div className="p-4 bg-red-500/10 border-b border-red-500/30">
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

                <div className="space-y-2 mt-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider px-1">
                    <Heart className="w-3 h-3 text-red-400" />
                    Đề xuất hỗ trợ
                  </div>
                  {recommendations?.recommendations.map((person, index) => {
                    const memberDetail = memberDetails[person.id];
                    return (
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
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-semibold text-gray-200">{person.name}</p>
                                {index === 0 && (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-blue-500/20 border border-blue-500/50 rounded-full text-[9px] font-bold text-blue-300 flex-shrink-0">
                                    <TrendingUp className="w-3 h-3" />
                                    TOP
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-gray-500 truncate">{person.email}</p>
                              {/* Show availability and skill level from localStorage */}
                              {memberDetail && (
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="inline-flex items-center gap-0.5 text-[8px] text-yellow-400 bg-yellow-500/10 px-1 rounded">
                                    <Zap className="w-2.5 h-2.5" />
                                    {memberDetail.availability}/10
                                  </span>
                                  <span className="inline-flex items-center gap-0.5 text-[8px] text-blue-400 bg-blue-500/10 px-1 rounded">
                                    <Star className="w-2.5 h-2.5" />
                                    {memberDetail.skillLevel}/10
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className={`text-right flex-shrink-0 ${getAvailabilityColor(person.availabilityScore)}`}>
                            <p className="font-bold text-xs">{normalizeScore(person.availabilityScore).toFixed(1)}/10</p>
                            <p className="text-[9px] opacity-70 font-medium">{getAvailabilityLabel(person.availabilityScore)}</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : isOverdue && !showRecommendations ? (
              <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/30">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  <p className="text-sm text-yellow-300">Công việc quá hạn nhưng không có đề xuất phù hợp</p>
                </div>
              </div>
            ) : null}

            {/* Task Full Details */}
            <div className="p-4 space-y-4">
              {/* Title */}
              <div className="space-y-1">
                <h2 className="text-base font-bold text-white leading-relaxed">{displayTitle}</h2>
              </div>

              {/* Status, Priority, Difficulty badges */}
              <div className="flex flex-wrap items-center gap-2">
                {displayStatus && (
                  <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-medium border ${
                    displayStatus === 'Done' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                    displayStatus === 'In Progress' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                    'bg-gray-500/10 text-gray-400 border-gray-500/30'
                  }`}>
                    {getStatusIcon(displayStatus)}
                    {getStatusLabel(displayStatus)}
                  </div>
                )}
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${getPriorityColor(displayPriority)}`}>
                  <Flag className="w-3 h-3" />
                  {displayPriority}
                </div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${getDifficultyColor(taskDifficulty)}`}>
                  <Zap className="w-3 h-3" />
                  {taskDifficulty}
                </div>
                {displayWeight && (
                  <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/30">
                    <Users className="w-3 h-3" />
                    Độ phức tạp: {displayWeight}/10
                  </div>
                )}
              </div>

              {/* Due Date */}
              {displayDue && (
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span>Hạn chót: </span>
                  <span className={isOverdue ? 'text-red-400 font-medium' : 'text-gray-300'}>
                    {displayDue}
                    {isOverdue && <span className="ml-1 text-red-400">(Quá hạn)</span>}
                  </span>
                </div>
              )}

              {/* Assignees */}
              {displayAssignees && displayAssignees.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <Users className="w-3 h-3" />
                    Người được gán ({displayAssignees.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayAssignees.map(assignee => (
                      <div key={assignee.id} className="flex items-center gap-2 px-2 py-1 bg-gray-800 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                          {assignee.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-xs text-gray-200">{assignee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary/Description - Full with formatting */}
              {displaySummary && (
                <div className="space-y-2 pt-2 border-t border-gray-800">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    <FileText className="w-3 h-3" />
                    Mô tả chi tiết
                  </div>
                  <div className={`text-sm text-gray-300 leading-relaxed ${!showFullSummary && displaySummary.length > 500 ? 'max-h-48 overflow-hidden relative' : ''}`}>
                    <div className="whitespace-pre-wrap break-words">
                      {formatText(displaySummary)}
                    </div>
                    {!showFullSummary && displaySummary.length > 500 && (
                      <>
                        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#1e1e1e] to-transparent pointer-events-none" />
                        <button
                          onClick={() => setShowFullSummary(true)}
                          className="text-xs text-blue-400 hover:text-blue-300 mt-2 block"
                        >
                          Xem thêm...
                        </button>
                      </>
                    )}
                  </div>
                  {showFullSummary && displaySummary.length > 500 && (
                    <button
                      onClick={() => setShowFullSummary(false)}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Thu gọn
                    </button>
                  )}
                </div>
              )}

              {/* Metadata timestamps */}
              {(displayCreatedAt || displayUpdatedAt) && (
                <div className="pt-2 text-[10px] text-gray-500 border-t border-gray-800 space-y-0.5">
                  {displayCreatedAt && (
                    <p>Ngày tạo: {new Date(displayCreatedAt).toLocaleDateString('vi-VN')}</p>
                  )}
                  {displayUpdatedAt && displayUpdatedAt !== displayCreatedAt && (
                    <p>Cập nhật lần cuối: {new Date(displayUpdatedAt).toLocaleDateString('vi-VN')}</p>
                  )}
                </div>
              )}
            </div>
          </>
        )}
        
        {/* Show when no recommendations yet but not loading */}
        {!loadingRecs && !error && !recommendations && (
          <div className="p-8 text-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-400" />
            <p>Đang tải thông tin...</p>
          </div>
        )}
      </div>
    </div>
  );
}