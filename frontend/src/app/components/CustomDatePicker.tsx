import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Input } from './ui/input';
import { Calendar } from './ui/calendar';
import { Switch } from './ui/switch';
import { ChevronRight } from 'lucide-react';
import { DateRange } from 'react-day-picker';

interface CustomDatePickerProps {
  date?: Date;
  range?: DateRange;
  onSelect?: (date: Date | undefined) => void;
  onRangeSelect?: (range: DateRange | undefined) => void;
  trigger: React.ReactNode;
  mode?: 'single' | 'range';
}

export function CustomDatePicker({ date, range, onSelect, onRangeSelect, trigger, mode = 'single' }: CustomDatePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(date);
  const [selectedRange, setSelectedRange] = useState<DateRange | undefined>(range);
  const [isRangeMode, setIsRangeMode] = useState(mode === 'range' || !!range);
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-[#1e1e1e] border-[#333] text-gray-200 p-0 shadow-xl rounded-xl" align="start">
        <div className="p-4 space-y-4">
          <div className="flex gap-2 mb-2">
            <div className="flex-1 space-y-1">
              <Input 
                className="h-9 bg-[#2a2a2a] border-gray-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                placeholder="Ngày bắt đầu"
                value={selectedRange?.from ? selectedRange.from.toLocaleDateString('vi-VN') : (selectedDate ? selectedDate.toLocaleDateString('vi-VN') : '')}
                readOnly
              />
            </div>
            {isRangeMode && (
              <div className="flex-1 space-y-1">
                <Input 
                  className="h-9 bg-[#2a2a2a] border-gray-700 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                  placeholder="Ngày kết thúc"
                  value={selectedRange?.to ? selectedRange.to.toLocaleDateString('vi-VN') : ''}
                  readOnly
                />
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between px-1 mb-2">
            <span className="text-sm font-bold">
              {isRangeMode ? 'Chọn khoảng ngày' : 'Chọn ngày'}
            </span>
            <div className="flex gap-2">
              <button className="text-xs text-gray-400 hover:text-white transition-colors">Hôm nay</button>
            </div>
          </div>
          
          <Calendar
            mode={isRangeMode ? "range" : "single"}
            selected={(isRangeMode ? selectedRange : selectedDate) as any}
            onSelect={(val: any) => {
              if (isRangeMode) {
                setSelectedRange(val);
                if (onRangeSelect) onRangeSelect(val);
              } else {
                setSelectedDate(val);
                if (onSelect) onSelect(val);
              }
            }}
            className="p-0"
            classNames={{
              day_selected: "bg-blue-500 text-white hover:bg-blue-600 focus:bg-blue-500 focus:text-white rounded-md",
              head_cell: "text-gray-400 font-normal text-xs w-9",
              cell: "text-center text-sm p-0 w-9 h-9 relative",
              day: "w-9 h-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-800 rounded-md",
              caption: "flex justify-between pt-1 relative items-center px-2 mb-4",
              caption_label: "text-sm font-bold",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-800 rounded-md flex items-center justify-center",
            }}
          />
          
          <div className="space-y-4 pt-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-200">Ngày kết thúc</span>
              <Switch 
                checked={isRangeMode}
                onCheckedChange={setIsRangeMode}
                className="data-[state=checked]:bg-blue-600" 
              />
            </div>
            
            <button className="flex items-center justify-between w-full hover:bg-gray-800 p-1 -mx-1 rounded">
              <span className="text-sm font-bold text-gray-200">Định dạng ngày</span>
              <div className="flex items-center text-gray-400 text-sm">
                Ngày tháng năm đầy đủ
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-gray-200">Bao gồm thời gian</span>
              <Switch className="data-[state=checked]:bg-blue-600" />
            </div>
            
            <button className="flex items-center justify-between w-full hover:bg-gray-800 p-1 -mx-1 rounded">
              <span className="text-sm font-bold text-gray-200">Lời nhắc</span>
              <div className="flex items-center text-gray-400 text-sm">
                Không
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </button>
          </div>
          
          <div className="pt-4 border-t border-gray-800">
            <button className="text-sm font-bold text-gray-200 hover:text-white" onClick={() => {
              setSelectedDate(undefined);
              setSelectedRange(undefined);
              if (onSelect) onSelect(undefined);
              if (onRangeSelect) onRangeSelect(undefined);
            }}>
              Xóa
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
