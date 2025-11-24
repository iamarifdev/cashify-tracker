import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface FilterDropdownProps {
  label: string;
  active?: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
  rightAligned?: boolean;
}

export const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  active,
  isOpen,
  onToggle,
  onClose,
  children,
  width = 'w-64',
  rightAligned = false
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        onClick={onToggle}
        className={`flex items-center justify-between gap-2 px-3 py-2 text-sm font-medium border rounded transition-colors w-full whitespace-nowrap ${
          active ? 'border-blue-500 text-blue-600 bg-blue-50' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <span className="truncate">{label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''} ${active ? 'text-blue-500' : 'text-gray-400'}`} />
      </button>

      {isOpen && (
        <div 
          className={`absolute top-full mt-1 ${width} bg-white border border-gray-200 rounded shadow-xl z-50 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-100 ${rightAligned ? 'right-0' : 'left-0'}`}
        >
          {children}
        </div>
      )}
    </div>
  );
};