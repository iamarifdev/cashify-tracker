
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X, Settings, Plus, CloudUpload } from 'lucide-react';

export interface DropdownOption {
  id: string;
  label: string;
  subLabel?: string;
  value?: string;
}

interface SearchableDropdownProps {
  label: string;
  value: string | null;
  options: DropdownOption[];
  onChange: (value: string | null) => void;
  placeholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  showImport?: boolean;
  variant?: 'simple' | 'contact';
}

export const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Search or Select",
  onAddNew,
  addNewLabel = "Add New",
  showImport = false,
  variant = 'simple'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(opt => 
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (opt.subLabel && opt.subLabel.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedOption = options.find(opt => opt.label === value || opt.id === value);

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-xs font-medium text-gray-700">{label}</label>
        <button className="text-blue-600 hover:text-blue-700">
          <Settings className="w-3 h-3" />
        </button>
      </div>
      
      <div 
        onClick={() => {
            setIsOpen(!isOpen);
            setSearchTerm('');
        }}
        className="relative cursor-pointer"
      >
        <div className={`flex items-center justify-between w-full border rounded-md py-2 px-3 text-sm bg-white ${isOpen ? 'ring-1 ring-blue-500 border-blue-500' : 'border-gray-300'}`}>
           <span className={`${value ? 'text-gray-900' : 'text-gray-500'} truncate mr-6`}>
             {value || placeholder}
           </span>
           <div className="absolute right-2 flex items-center gap-1">
             {value && (
               <div 
                 onClick={(e) => {
                   e.stopPropagation();
                   onChange(null);
                 }}
                 className="p-0.5 hover:bg-gray-100 rounded cursor-pointer"
               >
                 <X className="w-4 h-4 text-gray-400" />
               </div>
             )}
             <div className={`pl-1 ${value ? 'border-l border-gray-200' : ''}`}>
                <ChevronDown className="w-4 h-4 text-gray-400" />
             </div>
           </div>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          <div className="p-2 border-b border-gray-100">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3 w-3 text-gray-400" />
              <input 
                type="text" 
                autoFocus
                className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white transition-colors"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => {
                    onChange(opt.label);
                    setIsOpen(false);
                  }}
                  className={`flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer ${value === opt.label ? 'bg-blue-50' : ''}`}
                >
                   {variant === 'contact' && (
                     <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${value === opt.label ? 'border-blue-600' : 'border-gray-400'}`}>
                        {value === opt.label && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                     </div>
                   )}
                   <div>
                     <p className={`text-sm ${value === opt.label ? 'text-blue-600 font-medium' : 'text-gray-900'}`}>{opt.label}</p>
                     {opt.subLabel && <p className="text-xs text-gray-500">{opt.subLabel}</p>}
                   </div>
                </div>
              ))
            ) : (
                <div className="px-3 py-4 text-center text-xs text-gray-500">
                    No results found
                </div>
            )}
          </div>

          <div className="border-t border-gray-100 bg-gray-50 p-1 space-y-1">
             {onAddNew && (
                <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onAddNew();
                      setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2 text-blue-600 hover:bg-blue-50 rounded text-sm font-medium transition-colors"
                >
                   <Plus className="w-4 h-4" /> {addNewLabel}
                </button>
             )}
             
             {showImport && (
                 <button className="w-full flex items-center justify-center gap-2 py-2 text-[#059669] bg-green-50 hover:bg-green-100 rounded text-xs font-medium transition-colors border border-green-200 border-dashed">
                    <CloudUpload className="w-3 h-3" /> Import Bulk contacts from CSV
                 </button>
             )}
          </div>
        </div>
      )}
    </div>
  );
};
