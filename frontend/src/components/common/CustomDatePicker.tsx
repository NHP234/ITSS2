import { useState, useEffect } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { X, Calendar as CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, parse, isValid } from 'date-fns';

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
  const [isOpen, setIsOpen] = useState(false);

  // Format date to Vietnamese format
  const formatToVietnamese = (d: Date): string => {
    return `${d.getDate()} tháng ${d.getMonth() + 1}, ${d.getFullYear()}`;
  };

  const handleDateSelect = (val: Date | undefined) => {
    if (isRangeMode) return;
    setSelectedDate(val);
    if (onSelect) onSelect(val);
    setIsOpen(false);
  };

  const handleRangeSelect = (val: DateRange | undefined) => {
    if (!isRangeMode) return;
    setSelectedRange(val);
    if (onRangeSelect) onRangeSelect(val);
    if (val?.from && val?.to) {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    if (isRangeMode) {
      setSelectedRange(undefined);
      if (onRangeSelect) onRangeSelect(undefined);
    } else {
      setSelectedDate(undefined);
      if (onSelect) onSelect(undefined);
    }
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    if (isRangeMode) {
      const newRange = { from: today, to: undefined };
      setSelectedRange(newRange);
      if (onRangeSelect) onRangeSelect(newRange);
    } else {
      setSelectedDate(today);
      if (onSelect) onSelect(today);
    }
  };

  // Common classNames for both modes
  const classNames = {
    months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
    month: "space-y-3",
    caption: "flex justify-center pt-1 relative items-center",
    caption_label: "text-sm font-medium text-gray-200",
    nav: "space-x-1 flex items-center",
    nav_button: "h-6 w-6 bg-transparent p-0 opacity-50 hover:opacity-100 hover:bg-gray-800 rounded-md flex items-center justify-center text-gray-400",
    nav_button_previous: "absolute left-1",
    nav_button_next: "absolute right-1",
    table: "w-full border-collapse space-y-1",
    head_row: "flex",
    head_cell: "text-gray-500 rounded-md w-8 font-normal text-[0.8rem]",
    row: "flex w-full mt-1",
    cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
    day: "h-8 w-8 p-0 font-normal text-gray-300 aria-selected:opacity-100 hover:bg-gray-800 rounded-md transition-colors",
    day_selected: "bg-blue-600 text-white hover:bg-blue-700 focus:bg-blue-600 focus:text-white rounded-md",
    day_today: "bg-gray-800 text-white font-bold",
    day_outside: "text-gray-600",
    day_disabled: "text-gray-700 opacity-50",
    day_range_middle: "aria-selected:bg-gray-800 aria-selected:text-gray-200 rounded-none",
    day_hidden: "invisible",
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-gray-700 shadow-xl rounded-lg" align="start" sideOffset={5}>
        <div className="p-3 space-y-3">
          {/* Mode Toggle */}
          <div className="flex items-center justify-between px-1">
            <div className="flex gap-1 bg-[#2a2a2a] rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setIsRangeMode(false)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  !isRangeMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Ngày
              </button>
              <button
                type="button"
                onClick={() => setIsRangeMode(true)}
                className={`px-3 py-1 text-xs rounded-md transition-colors ${
                  isRangeMode ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                Khoảng
              </button>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              Xóa
            </button>
          </div>

          {/* Calendar - Conditional rendering based on mode */}
          {!isRangeMode ? (
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              className="rounded-lg"
              classNames={classNames}
            />
          ) : (
            <Calendar
              mode="range"
              selected={selectedRange}
              onSelect={handleRangeSelect}
              className="rounded-lg"
              classNames={classNames}
            />
          )}

          {/* Today Button */}
          <div className="flex justify-center pt-2 border-t border-gray-800">
            <button
              type="button"
              onClick={handleToday}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
            >
              <CalendarIcon className="w-3 h-3" />
              Hôm nay
            </button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}