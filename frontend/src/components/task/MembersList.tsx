import { useState, memo, useEffect } from 'react';
import { Users, UserPlus, X, Edit2, Star, Zap, Calendar, AlertCircle, Loader2, Search as SearchIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { searchUsers, addProjectMember, removeProjectMember } from '../../api';
import { MembersForm } from './MembersForm';
import { type Project } from '../../api';

interface MembersListProps {
  project: Project;
  onUpdateProject?: (projectId: string, updates: Partial<Project>) => void;
  currentUserId?: string;
}

export interface MemberDetails {
  userId: string;
  availability: number;
  skillLevel: number;
  notes?: string;
  lastUpdated: string;
}

// Storage key for member details
const MEMBER_DETAILS_STORAGE_KEY = 'memberDetails';

// Helper functions for localStorage
const loadMemberDetails = (projectId: string): Record<string, MemberDetails> => {
  try {
    const storageKey = `${MEMBER_DETAILS_STORAGE_KEY}_${projectId}`;
    const existingData = localStorage.getItem(storageKey);
    return existingData ? JSON.parse(existingData) : {};
  } catch (error) {
    console.error('Failed to load member details:', error);
    return {};
  }
};

const saveMemberDetails = (projectId: string, details: Record<string, MemberDetails>) => {
  try {
    const storageKey = `${MEMBER_DETAILS_STORAGE_KEY}_${projectId}`;
    localStorage.setItem(storageKey, JSON.stringify(details));
  } catch (error) {
    console.error('Failed to save member details:', error);
  }
};

export const MembersList = memo(function MembersList({ 
  project, 
  onUpdateProject,
  currentUserId 
}: MembersListProps) {
  const [userSearch, setUserSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [editingMember, setEditingMember] = useState<string | null>(null);
  const [memberDetails, setMemberDetails] = useState<Record<string, MemberDetails>>(() => 
    loadMemberDetails(project.id)
  );

  const handleSearchUsers = async (query: string) => {
    setUserSearch(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchUsers(query);
      const filtered = results.filter(u => !project.members?.some(m => m.id === u.id));
      setSearchResults(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddMember = async (userId: string) => {
    try {
      const updatedProject = await addProjectMember(project.id, userId);
      if (onUpdateProject) {
        onUpdateProject(project.id, { members: updatedProject.members });
      }
      setUserSearch('');
      setSearchResults([]);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi thêm thành viên');
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      const updatedProject = await removeProjectMember(project.id, userId);
      if (onUpdateProject) {
        onUpdateProject(project.id, { members: updatedProject.members });
      }
      const newDetails = { ...memberDetails };
      delete newDetails[userId];
      setMemberDetails(newDetails);
      saveMemberDetails(project.id, newDetails);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi khi xoá thành viên');
    }
  };

  const handleSaveMemberDetails = (userId: string, details: MemberDetails) => {
    const newDetails = {
      ...memberDetails,
      [userId]: details
    };
    setMemberDetails(newDetails);
    saveMemberDetails(project.id, newDetails);
    setEditingMember(null);
  };

  const getAvailabilityColor = (score: number) => {
    if (score >= 7) return 'text-green-400 bg-green-500/10';
    if (score >= 4) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
  };

  const getAvailabilityLabel = (score: number) => {
    if (score >= 8) return 'Rất sẵn sàng';
    if (score >= 6) return 'Sẵn sàng';
    if (score >= 4) return 'Có thể hỗ trợ';
    if (score >= 2) return 'Hơi bận';
    return 'Rất bận';
  };

  const getSkillLevelColor = (score: number) => {
    if (score >= 8) return 'text-purple-400 bg-purple-500/10';
    if (score >= 6) return 'text-blue-400 bg-blue-500/10';
    if (score >= 4) return 'text-cyan-400 bg-cyan-500/10';
    return 'text-gray-400 bg-gray-500/10';
  };

  const getSkillLevelLabel = (score: number) => {
    if (score >= 9) return 'Chuyên gia';
    if (score >= 7) return 'Cao cấp';
    if (score >= 5) return 'Trung cấp';
    if (score >= 3) return 'Sơ cấp';
    return 'Thực tập';
  };

  const isProjectOwner = () => {
    return currentUserId === project.ownerId;
  };

  if (!project) return null;

  return (
    <div className="space-y-6">
      {/* Header with Add Member button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-semibold text-white">Thành viên dự án</h2>
          <Badge className="bg-gray-800 text-gray-300">
            {project.members?.length || 0} thành viên
          </Badge>
        </div>
        
        {isProjectOwner() && (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                <UserPlus className="w-4 h-4 mr-2" />
                Thêm thành viên
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333] p-0 shadow-2xl rounded-xl z-50">
              <div className="p-3 border-b border-gray-800">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Thêm thành viên</h4>
              </div>
              <div className="p-3">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    className="w-full bg-[#1a1a1a] border border-gray-700 rounded-lg py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 transition-colors placeholder:text-gray-600"
                    placeholder="Tìm theo email hoặc tên..."
                    value={userSearch}
                    onChange={(e) => handleSearchUsers(e.target.value)}
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {searchResults.map(u => (
                      <button 
                        key={u.id} 
                        onClick={() => handleAddMember(u.id)}
                        className="w-full flex items-center gap-3 p-2 hover:bg-blue-600 rounded-lg transition-colors text-left"
                      >
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-sm font-medium text-gray-200 truncate">{u.name}</span>
                          <span className="text-xs text-gray-400 truncate">{u.email}</span>
                        </div>
                        <UserPlus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
                {isSearching && (
                  <div className="mt-2 flex justify-center py-2">
                    <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.members?.map((member) => {
          const details = memberDetails[member.id];
          const isOwner = member.id === project.ownerId;
          const isCurrentUser = member.id === currentUserId;
          
          return (
            <div
              key={member.id}
              className="bg-[#1e1e1e] rounded-xl border border-gray-800 p-4 hover:border-gray-700 transition-all group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-base font-bold text-white shadow-lg">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-200">{member.name}</h3>
                      {isOwner && (
                        <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-[9px] px-1.5">
                          Chủ sở hữu
                        </Badge>
                      )}
                      {isCurrentUser && (
                        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-[9px] px-1.5">
                          Bạn
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{member.email}</p>
                  </div>
                </div>
                
                {(isProjectOwner() || isCurrentUser) && (
                  <button
                    onClick={() => setEditingMember(member.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-3 mt-4">
                {/* Availability */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Zap className="w-4 h-4" />
                    <span>Sẵn sàng</span>
                  </div>
                  {details ? (
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getAvailabilityColor(details.availability)}`}>
                        {details.availability}/10
                      </div>
                      <span className="text-xs text-gray-400">{getAvailabilityLabel(details.availability)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Chưa đánh giá</span>
                  )}
                </div>

                {/* Skill Level */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Star className="w-4 h-4" />
                    <span>Kỹ năng</span>
                  </div>
                  {details ? (
                    <div className="flex items-center gap-2">
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSkillLevelColor(details.skillLevel)}`}>
                        {details.skillLevel}/10
                      </div>
                      <span className="text-xs text-gray-400">{getSkillLevelLabel(details.skillLevel)}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-gray-500 italic">Chưa đánh giá</span>
                  )}
                </div>

                {/* Last Updated */}
                {details && (
                  <div className="flex items-center gap-2 text-[10px] text-gray-600 pt-2 border-t border-gray-800">
                    <Calendar className="w-3 h-3" />
                    <span>Cập nhật: {new Date(details.lastUpdated).toLocaleDateString('vi-VN')}</span>
                  </div>
                )}

                {/* Notes */}
                {details?.notes && (
                  <div className="mt-2 p-2 bg-gray-800/50 rounded-lg">
                    <p className="text-xs text-gray-400 italic">"{details.notes}"</p>
                  </div>
                )}
              </div>

              {/* Remove button for owners */}
              {isProjectOwner() && !isOwner && (
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="mt-3 w-full py-1.5 text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Xoá khỏi dự án
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {(!project.members || project.members.length === 0) && (
        <div className="text-center py-12 border border-dashed border-gray-800 rounded-xl">
          <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-500">Chưa có thành viên nào</p>
          {isProjectOwner() && (
            <p className="text-sm text-gray-600 mt-1">Nhấn "Thêm thành viên" để mời người tham gia</p>
          )}
        </div>
      )}

      {/* Edit Member Form Modal */}
      {editingMember && (
        <MembersForm
          memberId={editingMember}
          memberName={project.members?.find(m => m.id === editingMember)?.name || ''}
          memberEmail={project.members?.find(m => m.id === editingMember)?.email || ''}
          initialDetails={memberDetails[editingMember]}
          onSave={(details) => handleSaveMemberDetails(editingMember, details)}
          onClose={() => setEditingMember(null)}
        />
      )}
    </div>
  );
});