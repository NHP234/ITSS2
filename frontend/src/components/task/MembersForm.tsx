import { useState, useEffect } from 'react';
import { X, Zap, Star, FileText, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { MemberDetails } from './MembersList';

interface MembersFormProps {
  memberId: string;
  memberName: string;
  memberEmail: string;
  initialDetails?: MemberDetails;
  onSave: (details: MemberDetails) => void;
  onClose: () => void;
}

export function MembersForm({ 
  memberId, 
  memberName, 
  memberEmail, 
  initialDetails, 
  onSave, 
  onClose 
}: MembersFormProps) {
  const [availability, setAvailability] = useState<number>(initialDetails?.availability || 5);
  const [skillLevel, setSkillLevel] = useState<number>(initialDetails?.skillLevel || 5);
  const [notes, setNotes] = useState<string>(initialDetails?.notes || '');
  const [availabilityInput, setAvailabilityInput] = useState<string>(String(initialDetails?.availability || 5));
  const [skillInput, setSkillInput] = useState<string>(String(initialDetails?.skillLevel || 5));

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleAvailabilityChange = (value: number) => {
    const clamped = Math.min(10, Math.max(0, value));
    setAvailability(clamped);
    setAvailabilityInput(String(clamped));
  };

  const handleAvailabilityInput = (val: string) => {
    setAvailabilityInput(val);
    let num = parseInt(val);
    if (!isNaN(num)) {
      handleAvailabilityChange(num);
    }
  };

  const handleSkillChange = (value: number) => {
    const clamped = Math.min(10, Math.max(0, value));
    setSkillLevel(clamped);
    setSkillInput(String(clamped));
  };

  const handleSkillInput = (val: string) => {
    setSkillInput(val);
    let num = parseInt(val);
    if (!isNaN(num)) {
      handleSkillChange(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      userId: memberId,
      availability,
      skillLevel,
      notes: notes.trim() || undefined,
      lastUpdated: new Date().toISOString()
    });
  };

  const getAvailabilityColor = (score: number) => {
    if (score >= 7) return 'bg-green-500';
    if (score >= 4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAvailabilityLabel = (score: number) => {
    if (score >= 8) return 'Rất sẵn sàng';
    if (score >= 6) return 'Sẵn sàng';
    if (score >= 4) return 'Có thể hỗ trợ';
    if (score >= 2) return 'Hơi bận';
    return 'Rất bận';
  };

  const getSkillColor = (score: number) => {
    if (score >= 8) return 'bg-purple-500';
    if (score >= 6) return 'bg-blue-500';
    if (score >= 4) return 'bg-cyan-500';
    return 'bg-gray-500';
  };

  const getSkillLabel = (score: number) => {
    if (score >= 9) return 'Chuyên gia';
    if (score >= 7) return 'Cao cấp';
    if (score >= 5) return 'Trung cấp';
    if (score >= 3) return 'Sơ cấp';
    return 'Thực tập';
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md">
        <div className="bg-[#1e1e1e] rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 bg-[#252525]">
            <div>
              <h3 className="text-base font-semibold text-white">Đánh giá thành viên</h3>
              <p className="text-xs text-gray-400 mt-0.5">{memberName} · {memberEmail}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Availability Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                <label className="text-sm font-medium text-gray-200">Mức độ sẵn sàng</label>
                <span className="text-xs text-gray-500">(0-10)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={availability}
                  onChange={(e) => handleAvailabilityChange(parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, ${getAvailabilityColor(availability)} 0%, ${getAvailabilityColor(availability)} ${availability * 10}%, #374151 ${availability * 10}%, #374151 100%)`
                  }}
                />
                <input
                  type="text"
                  value={availabilityInput}
                  onChange={(e) => handleAvailabilityInput(e.target.value)}
                  className="w-14 px-2 py-1 text-center text-sm rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-red-400">0 (Rất bận)</span>
                <span className="text-yellow-400">5 (Trung bình)</span>
                <span className="text-green-400">10 (Rất sẵn sàng)</span>
              </div>
              
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-300">
                  <span className="font-semibold">Hiện tại: </span>
                  <span className={`font-medium ${availability >= 7 ? 'text-green-400' : availability >= 4 ? 'text-yellow-400' : 'text-red-400'}`}>
                    {availability}/10 - {getAvailabilityLabel(availability)}
                  </span>
                </p>
              </div>
            </div>

            {/* Skill Level Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-purple-400" />
                <label className="text-sm font-medium text-gray-200">Trình độ kỹ năng</label>
                <span className="text-xs text-gray-500">(0-10)</span>
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={skillLevel}
                  onChange={(e) => handleSkillChange(parseInt(e.target.value))}
                  className="flex-1 h-2 rounded-full appearance-none cursor-pointer bg-gray-700"
                  style={{
                    background: `linear-gradient(to right, ${getSkillColor(skillLevel)} 0%, ${getSkillColor(skillLevel)} ${skillLevel * 10}%, #374151 ${skillLevel * 10}%, #374151 100%)`
                  }}
                />
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => handleSkillInput(e.target.value)}
                  className="w-14 px-2 py-1 text-center text-sm rounded bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">0 (Thực tập)</span>
                <span className="text-cyan-400">5 (Trung cấp)</span>
                <span className="text-purple-400">10 (Chuyên gia)</span>
              </div>
              
              <div className="p-2 bg-gray-800/50 rounded-lg">
                <p className="text-xs text-gray-300">
                  <span className="font-semibold">Đánh giá: </span>
                  <span className={`font-medium ${skillLevel >= 8 ? 'text-purple-400' : skillLevel >= 6 ? 'text-blue-400' : skillLevel >= 4 ? 'text-cyan-400' : 'text-gray-400'}`}>
                    {skillLevel}/10 - {getSkillLabel(skillLevel)}
                  </span>
                </p>
              </div>
            </div>

            {/* Notes Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <label className="text-sm font-medium text-gray-200">Ghi chú (tuỳ chọn)</label>
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Nhận xét về hiệu suất, điểm mạnh, lĩnh vực chuyên môn..."
                rows={3}
                className="w-full bg-[#2a2a2a] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
              />
            </div>

            {/* Info note */}
            <div className="flex items-start gap-2 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-300">
                Thông tin này chỉ áp dụng cho dự án hiện tại và sẽ ảnh hưởng đến đề xuất hỗ trợ khi có công việc quá hạn.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Lưu đánh giá
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}