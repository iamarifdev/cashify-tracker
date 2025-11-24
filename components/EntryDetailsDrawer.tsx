
import React from 'react';
import { X, Cloud, Trash2, Edit2, ChevronDown, Plus } from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { Button } from './ui/Button';

interface EntryDetailsDrawerProps {
  transaction: Transaction | null;
  onClose: () => void;
  onDelete?: (id: string) => void;
  onEdit?: (transaction: Transaction) => void;
}

export const EntryDetailsDrawer: React.FC<EntryDetailsDrawerProps> = ({ 
  transaction, 
  onClose,
  onDelete,
  onEdit 
}) => {
  if (!transaction) return null;

  const isCashIn = transaction.type === TransactionType.CASH_IN;
  const colorClass = isCashIn ? 'text-[#059669]' : 'text-[#dc2626]';
  const typeLabel = isCashIn ? 'Cash In' : 'Cash Out';

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex pointer-events-none">
        <div className="pointer-events-auto relative w-full h-full flex flex-col bg-white shadow-xl animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">
              Entry Details
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 rounded-full p-1 hover:bg-gray-100">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Top Info Card */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                        {isCashIn ? <Plus className="w-4 h-4 text-[#059669]" /> : <div className="w-4 h-0.5 bg-[#dc2626]" />}
                        <span className={`text-sm font-medium ${colorClass}`}>{typeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{formattedDate}, {transaction.time}</span>
                        <Cloud className="w-4 h-4 text-[#059669]" />
                    </div>
                </div>
                <div className={`text-3xl font-bold ${colorClass} mb-6`}>
                    {transaction.amount.toLocaleString()}
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-gray-500 mb-1">Contact Name</p>
                        <p className="text-sm font-medium text-gray-900">
                            {transaction.contactName || 'No Contact'} 
                            {transaction.contactName && <span className="text-gray-400 font-normal ml-1">(supplier)</span>}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500 mb-1">Remark</p>
                        <p className="text-sm text-gray-900 leading-relaxed">
                            {transaction.details}
                        </p>
                    </div>
                    
                    {/* Tags / Chips */}
                    <div className="flex gap-2">
                        {transaction.category && (
                            <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                                {transaction.category}
                            </span>
                        )}
                         <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">
                            {transaction.paymentMode}
                        </span>
                    </div>
                </div>
            </div>

            {/* Activities Timeline */}
            <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Activities</h3>
                <div className="relative">
                    {/* Vertical Line */}
                    <div className="absolute top-0 bottom-0 left-[15px] w-[2px] bg-gray-100"></div>

                    {/* Timeline Item */}
                    <div className="relative pl-10 mb-6">
                        {/* Icon Container */}
                        <div className="absolute left-0 top-0 bg-white py-0.5">
                            <div className="w-8 h-8 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center relative z-10">
                                <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="pt-1.5">
                            <p className="text-sm text-gray-900">
                                <span className="font-semibold">Created</span> by {transaction.createdBy}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                On {formattedDate}, {transaction.time}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-gray-100 flex items-center justify-between bg-white gap-3">
             <button 
                onClick={() => onDelete && onDelete(transaction.id)}
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-sm font-medium transition-colors"
             >
                <Trash2 className="w-4 h-4" /> Delete
             </button>

             <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 transition-colors">
                    More Actions <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onEdit && onEdit(transaction)}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    <Edit2 className="w-4 h-4" /> Edit
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
