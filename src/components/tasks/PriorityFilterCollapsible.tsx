import React, { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { AlertCircle, X, ChevronDown } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from "@/lib/utils";

interface PriorityFilterCollapsibleProps {
  selectedPriorities: string[];
  onSelect: (priorities: string[]) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CustomPriorityData {
  name: string;
  color: string;
}

const PriorityFilterCollapsible: React.FC<PriorityFilterCollapsibleProps> = ({
  selectedPriorities,
  onSelect,
  isOpen,
  onOpenChange
}) => {
  const [searchInput, setSearchInput] = useState('');
  const [customPriorities] = useState<CustomPriorityData[]>(() => {
    const saved = localStorage.getItem('kario-custom-priorities');
    return saved ? JSON.parse(saved) : [];
  });

  const presetPriorities = [
    { name: 'Priority 1', color: 'text-red-500' },
    { name: 'Priority 2', color: 'text-orange-500' },
    { name: 'Priority 3', color: 'text-yellow-500' },
    { name: 'Priority 4', color: 'text-green-500' },
    { name: 'Priority 5', color: 'text-blue-500' },
    { name: 'Priority 6', color: 'text-purple-500' }
  ];

  const filteredCustom = useMemo(() => {
    return customPriorities.filter(p =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [customPriorities, searchInput]);

  const filteredPreset = useMemo(() => {
    return presetPriorities.filter(p =>
      p.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  }, [searchInput]);

  const togglePriority = (priority: string) => {
    if (selectedPriorities.includes(priority)) {
      onSelect(selectedPriorities.filter(p => p !== priority));
    } else {
      onSelect([...selectedPriorities, priority]);
    }
  };

  const clearAll = () => {
    onSelect([]);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger className="flex items-center justify-between w-full mb-3">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-gray-400" />
          <span className="text-gray-300 text-sm">Priority</span>
          {selectedPriorities.length > 0 && (
            <span className="text-xs bg-[#252525] text-gray-300 px-2 py-1 rounded border border-[#414141]">
              {selectedPriorities.length}
            </span>
          )}
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 pb-3">
        {/* Search Input */}
        <div className="mb-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search priority..."
            className="w-full bg-[#252525] text-white text-sm px-3 py-2 outline-none placeholder-gray-500 border border-[#414141] rounded-[8px]"
          />
        </div>

        {/* Priority List */}
        <div className="space-y-2 max-h-[250px] overflow-y-auto">
          {/* Custom Priorities */}
          {customPriorities.length > 0 && filteredCustom.length > 0 && (
            <>
              <div className="text-xs text-gray-500 mb-2">Custom</div>
              {filteredCustom.map((priority) => (
                <Button
                  key={priority.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePriority(priority.name)}
                  className={cn(
                    "w-full justify-start text-left bg-[#252525] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[8px] h-8 text-xs transition-all duration-200",
                    selectedPriorities.includes(priority.name) && "bg-[#2e2e2e] text-white"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-2", priority.color)}></div>
                  <span className="flex-1">{priority.name}</span>
                  {selectedPriorities.includes(priority.name) && (
                    <span className="text-green-400">✓</span>
                  )}
                </Button>
              ))}
            </>
          )}

          {/* Preset Priorities */}
          {filteredPreset.length > 0 && (
            <>
              {customPriorities.length > 0 && filteredCustom.length > 0 && (
                <div className="border-t border-[#414141] my-2"></div>
              )}
              <div className="text-xs text-gray-500 mb-2">Default</div>
              {filteredPreset.map((priority) => (
                <Button
                  key={priority.name}
                  variant="ghost"
                  size="sm"
                  onClick={() => togglePriority(priority.name)}
                  className={cn(
                    "w-full justify-start text-left bg-[#252525] text-gray-300 hover:bg-[#2e2e2e] hover:text-white border border-[#414141] rounded-[8px] h-8 text-xs transition-all duration-200",
                    selectedPriorities.includes(priority.name) && "bg-[#2e2e2e] text-white"
                  )}
                >
                  <div className={cn("w-2 h-2 rounded-full mr-2", priority.color)}></div>
                  <span className="flex-1">{priority.name}</span>
                  {selectedPriorities.includes(priority.name) && (
                    <span className="text-green-400">✓</span>
                  )}
                </Button>
              ))}
            </>
          )}

          {filteredCustom.length === 0 && filteredPreset.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-4">
              No priorities found
            </div>
          )}
        </div>

        {/* Clear Button */}
        {selectedPriorities.length > 0 && (
          <div className="pt-2 border-t border-[#414141]">
            <Button
              onClick={clearAll}
              variant="ghost"
              size="sm"
              className="w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 border border-[#414141] rounded-[8px] text-xs h-8"
            >
              <X className="h-3 w-3 mr-1" />
              Clear
            </Button>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
};

export default PriorityFilterCollapsible;
