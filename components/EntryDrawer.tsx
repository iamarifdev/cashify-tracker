import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Paperclip, Check, ChevronDown } from 'lucide-react';
import { TransactionType } from '../types';
import { Button } from './ui/Button';

interface EntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  onSave: (data: any) => void;
}

export const EntryDrawer: React.FC<EntryDrawerProps> = ({ isOpen, onClose, type, onSave }) => {
  const [activeType, setActiveType] = useState(type);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    setActiveType(type);
  }, [type]);

  if (!isOpen) return null;

  const isCashIn = activeType === TransactionType.CASH_IN;
  const themeColor = isCashIn ? 'green' : 'red';
  const ThemeBtnClass = isCashIn 
    ? 'bg-green-600 text-white hover:bg-green-700' 
    : 'bg-red-600 text-white hover:bg-red-700';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="relative w-full h-full flex flex-col bg-white shadow-xl animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isCashIn ? 'Add Cash In Entry' : 'Add Cash Out Entry'}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Toggle Type */}
          <div className="px-6 py-4 flex gap-3">
             <button 
               onClick={() => setActiveType(TransactionType.CASH_IN)}
               className={`flex-1 py-2 rounded-md font-medium text-sm border transition-colors ${activeType === TransactionType.CASH_IN ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
             >
               Cash In
             </button>
             <button 
               onClick={() => setActiveType(TransactionType.CASH_OUT)}
               className={`flex-1 py-2 rounded-md font-medium text-sm border transition-colors ${activeType === TransactionType.CASH_OUT ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
             >
               Cash Out
             </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
            
            {/* Date Time Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" readOnly value="13 May, 2023" className="block w-full pl-10 border border-gray-300 rounded-md py-2 text-sm focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="w-1/3">
                 <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <button className="block w-full pl-10 border border-gray-300 rounded-md py-2 text-sm text-left">07:05 PM</button>
                 </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`block w-full border border-gray-300 rounded-md py-3 px-4 text-lg font-bold focus:ring-2 focus:ring-opacity-50 outline-none ${isCashIn ? 'text-green-600 focus:ring-green-500 focus:border-green-500' : 'text-red-600 focus:ring-red-500 focus:border-red-500'}`}
              />
            </div>

            {/* Contact Name */}
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Contact Name</label>
               <div className="relative">
                 <input type="text" placeholder="Search or Select" className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500" />
                 <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
               </div>
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter details..."
              />
            </div>

            {/* Category & Payment Mode */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
                <div className="relative">
                   <select className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm appearance-none bg-white">
                     <option>General</option>
                     <option>Sales</option>
                     <option>Rent</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Mode</label>
                <div className="relative">
                   <select className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm appearance-none bg-white">
                     <option>Cash</option>
                     <option>Online</option>
                     <option>bKash</option>
                   </select>
                   <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <button className="flex items-center gap-2 text-blue-600 border border-blue-200 bg-blue-50 px-4 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors w-full justify-center border-dashed">
                <Paperclip className="w-4 h-4" />
                Attach Bills
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">Attach up to 4 images or PDF files</p>
            </div>

          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button 
              onClick={() => onSave({ amount, remarks })}
              className={`w-full py-3 rounded-md font-bold text-white shadow-sm transition-all transform active:scale-95 ${ThemeBtnClass}`}
            >
              Save
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};