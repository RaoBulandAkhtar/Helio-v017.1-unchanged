import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { IconToggle } from '@/components/ui/icon-toggle';
import { format, addMonths, subMonths, isWithinInterval } from 'date-fns';
import { DateRange } from 'react-day-picker';

interface InlineDateFilterProps {
  isActive: boolean;
  selectedDateRange: string;
  onToggle: (checked: boolean) => void;
  onSelect: (dateRange: string) => void;
}

const InlineDateFilter: React.FC<InlineDateFilterProps> = ({
  isActive,
  selectedDateRange,
  onToggle,
  onSelect
}) => {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (!selectedDateRange) return undefined;
    try {
      const parsed = JSON.parse(selectedDateRange);
      return {
        from: parsed.from ? new Date(parsed.from) : undefined,
        to: parsed.to ? new Date(parsed.to) : undefined
      };
    } catch {
      return undefined;
    }
  });
  const [clickCount, setClickCount] = useState(0);

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
    if (!date || !isDateInRange(date)) return;

    if (clickCount === 0) {
      setRange({ from: date, to: undefined });
      setClickCount(1);
    } else if (clickCount === 1) {
      if (range?.from) {
        let startDate = range.from;
        let endDate = date;

        if (endDate < startDate) {
          [startDate, endDate] = [endDate, startDate];
        }

        const rangeData = {
          from: format(startDate, 'yyyy-MM-dd'),
          to: format(endDate, 'yyyy-MM-dd')
        };

        setRange({ from: startDate, to: endDate });
        onSelect(JSON.stringify(rangeData));
        setClickCount(0);
      }
    }
  };

  const clearDate = () => {
    onSelect('');
    setRange(undefined);
    setClickCount(0);
  };

  const getRangeDisplay = (): string => {
    if (!range?.from && !range?.to) return 'Select range';
    if (range?.from && !range?.to) return format(range.from, 'MMM dd') + ' → ?';
    if (range?.from && range?.to) return format(range.from, 'MMM dd') + ' → ' + format(range.to, 'MMM dd');
    return 'Select range';
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
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-3">
          <div className="text-xs text-gray-400 text-center">
            {clickCount === 0 ? 'Click two dates to select range' : 'Click second date to complete range'}
          </div>

          <div className="flex justify-center scale-90 origin-top -my-2">
            <CalendarComponent
              mode="range"
              selected={range}
              onSelect={handleDateSelect}
              disabled={(date) => !isDateInRange(date)}
              className="rounded-[8px]"
            />
          </div>

          {(range?.from || range?.to) && (
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
