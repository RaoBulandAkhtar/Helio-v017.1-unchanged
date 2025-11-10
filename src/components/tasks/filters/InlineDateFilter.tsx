import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { parseFlexibleDate, formatDateRange } from '@/utils/dateParser';

interface InlineDateFilterProps {
  isActive: boolean;
  selectedDates: { startDate: string; endDate: string };
  onToggle: (checked: boolean) => void;
  onSelect: (dates: { startDate: string; endDate: string }) => void;
}

const InlineDateFilter: React.FC<InlineDateFilterProps> = ({
  isActive,
  selectedDates,
  onToggle,
  onSelect
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [searchError, setSearchError] = useState('');
  const [selectingEndDate, setSelectingEndDate] = useState(false);

  const handleToggle = (checked: boolean) => {
    onToggle(checked);
    if (!checked) {
      setSearchInput('');
      setSearchError('');
      setSelectingEndDate(false);
    }
  };

  const today = new Date();
  const threeMonthsAgo = subMonths(today, 3);
  const threeMonthsAhead = addMonths(today, 3);

  const isDateInRange = (date: Date): boolean => {
    return isWithinInterval(date, { start: threeMonthsAgo, end: threeMonthsAhead });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    if (!isDateInRange(date)) {
      setSearchError('Date must be within 3 months');
      return;
    }

    const dateString = format(date, 'yyyy-MM-dd');

    if (!selectingEndDate) {
      onSelect({ startDate: dateString, endDate: dateString });
      setSelectingEndDate(true);
      setSearchInput('');
      setSearchError('');
    } else {
      const startDate = selectedDates.startDate ? new Date(selectedDates.startDate) : date;
      if (date < startDate) {
        onSelect({ startDate: dateString, endDate: format(startDate, 'yyyy-MM-dd') });
      } else {
        onSelect({ startDate: format(startDate, 'yyyy-MM-dd'), endDate: dateString });
      }
      setSelectingEndDate(false);
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

    const parsed = parseFlexibleDate(value);

    if (!parsed.startDate) {
      return;
    }

    if (!isDateInRange(parsed.startDate) || (parsed.endDate && !isDateInRange(parsed.endDate))) {
      setSearchError('Dates must be within 3 months');
      return;
    }

    const startDateString = format(parsed.startDate, 'yyyy-MM-dd');
    const endDateString = format(parsed.endDate || parsed.startDate, 'yyyy-MM-dd');

    onSelect({ startDate: startDateString, endDate: endDateString });
    setSearchInput('');
    setSearchError('');
    setSelectingEndDate(false);
  };

  const clearDates = () => {
    onSelect({ startDate: '', endDate: '' });
    setSearchInput('');
    setSearchError('');
    setSelectingEndDate(false);
  };

  const displayText = formatDateRange(
    selectedDates.startDate ? new Date(selectedDates.startDate) : null,
    selectedDates.endDate ? new Date(selectedDates.endDate) : null
  );

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
            placeholder="Type date (e.g., 3 nov, 11/3/2025, nov 10 - nov 22)..."
            className="w-full bg-transparent text-white text-sm px-0 py-2 outline-none placeholder-gray-500 border-none"
          />
          {searchError && (
            <p className="text-xs text-red-400">{searchError}</p>
          )}

          {displayText && (
            <p className="text-xs text-gray-400">
              {selectingEndDate ? 'Select end date' : `Selected: ${displayText}`}
            </p>
          )}

          <div className="flex justify-center scale-90 origin-top -my-2">
            <CalendarComponent
              mode="single"
              selected={
                selectingEndDate && selectedDates.startDate
                  ? new Date(selectedDates.startDate)
                  : selectedDates.endDate
                  ? new Date(selectedDates.endDate)
                  : undefined
              }
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          {(selectedDates.startDate || selectedDates.endDate) && (
            <Button
              onClick={clearDates}
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
