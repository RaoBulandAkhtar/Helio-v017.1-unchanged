import React, { useState } from 'react';
import { Calendar, X, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { format, parse, isWithinInterval, addMonths, subMonths, isValid } from 'date-fns';

interface InlineDateFilterProps {
  isActive: boolean;
  selectedDate: string;
  onToggle: (checked: boolean) => void;
  onSelect: (date: string) => void;
}

const InlineDateFilter: React.FC<InlineDateFilterProps> = ({
  isActive,
  selectedDate,
  onToggle,
  onSelect
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
  };

  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const threeMonthsAhead = addMonths(today, 3);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: threeMonthsAgo, end: threeMonthsAhead });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && isDateInRange(date)) {
      const dateString = format(date, 'yyyy-MM-dd');
      onSelect(dateString);
      setSearchInput('');
      setSearchError('');
    }
  };

  const handleSearchInput = (value: string) => {
    setSearchInput(value);
    setSearchError('');

    if (!value.trim()) {
      return;
    }

    const formats = ['MM/dd/yyyy', 'yyyy-MM-dd', 'MM-dd-yyyy', 'dd/MM/yyyy'];
    let parsedDate: Date | null = null;

    for (const fmt of formats) {
      const parsed = parse(value, fmt, new Date());
      if (isValid(parsed)) {
        parsedDate = parsed;
        break;
      }
    }

    if (parsedDate) {
      if (isDateInRange(parsedDate)) {
        const dateString = format(parsedDate, 'yyyy-MM-dd');
        onSelect(dateString);
        setSearchInput('');
        setSearchError('');
      } else {
        setSearchError('Date must be within 3 months');
      }
    }
  };

  const clearDate = () => {
    onSelect('');
    setSearchInput('');
    setSearchError('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-300 text-sm">Date</span>
        <IconToggle
          icon={Calendar}
          checked={isActive}
          onCheckedChange={handleToggle}
        />
      </div>

      {isActive && (
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchInput(e.target.value)}
            placeholder="Search date..."
            className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
          />
          {searchError && (
            <p className="text-xs text-red-400">{searchError}</p>
          )}

          <div className="flex justify-center scale-90 origin-top -my-2">
            <CalendarComponent
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          {selectedDate && (
            <Button
              onClick={clearDate}
              variant="ghost"
              size="sm"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-[#414141] rounded-[8px] text-xs"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default InlineDateFilter;
