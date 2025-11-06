import React, { useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

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
  const [expanded, setExpanded] = useState(false);

  const handleToggle = () => {
    const newState = !isActive;
    onToggle(newState);
    if (!newState) {
      setExpanded(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const dateString = format(date, 'yyyy-MM-dd');
      onSelect(dateString);
    }
  };

  const clearDate = () => {
    onSelect('');
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between relative pb-2">
        <button
          onClick={handleToggle}
          className={`flex items-center gap-2 transition-all duration-200 relative ${
            isActive ? 'text-white' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Calendar className="h-4 w-4" />
          <span className="text-sm">Date</span>
          {isActive && (
            <div className="absolute bottom-0 left-0 h-0.5 bg-yellow-400 w-full"></div>
          )}
        </button>
      </div>

      {isActive && (
        <div className="bg-[#252525] border border-[#414141] rounded-[12px] p-3 space-y-3">
          <div className="flex justify-center">
            <CalendarComponent
              mode="single"
              selected={selectedDate ? new Date(selectedDate) : undefined}
              onSelect={handleDateSelect}
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
