
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (value: string) => void;
  title: string;
  inputLabel: string;
  placeholder: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  title, 
  inputLabel, 
  placeholder 
}) => {
  const [value, setValue] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!value.trim()) return;
    onSave(value);
    setValue('');
    onClose();
  };

  const handleClose = () => {
    setValue('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />
        
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all text-left">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <button onClick={handleClose} className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <label className="block text-xs font-bold text-gray-700 mb-2">
                {inputLabel}
            </label>
            <input 
                type="text" 
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                autoFocus
                onKeyDown={(e) => {
                    if(e.key === 'Enter') handleSave();
                }}
            />
          </div>

          <div className="p-6 pt-0 flex justify-end">
            <Button onClick={handleSave} disabled={!value.trim()}>
                Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
