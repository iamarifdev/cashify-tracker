
import React from 'react';
import { X, Cloud, Trash2, Edit2, ChevronDown, Plus, Pencil, CheckCircle2 } from 'lucide-react';
import { Transaction, TransactionType } from '../types';

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
  const iconColor = isCashIn ? 'text-[#059669]' : 'text-[#dc2626]';

  const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric'
  });

  // Mocking update time for the visual match
  const updatedTime = formattedDate + ", " + transaction.time;

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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500 rounded-full p-2 hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {/* Top Info Card */}
            <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        {isCashIn ? (
                            <Plus className={`w-4 h-4 ${iconColor}`} />
                        ) : (
                            <div className="w-3 h-0.5 bg-[#dc2626]" />
                        )}
                        <span className={`text-sm font-medium ${colorClass}`}>{typeLabel}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                        <span>On {formattedDate}, {transaction.time}</span>
                        <div className="text-[#059669]">
                             <Cloud className="w-4 h-4 fill-current" />
                             <div className="absolute top-0 right-0 -mr-1 -mt-1">
                                <CheckCircle2 className="w-2 h-2 text-white bg-white rounded-full" />
                             </div>
                        </div>
                    </div>
                </div>
                
                <div className={`text-3xl font-bold ${colorClass} mb-6`}>
                    {transaction.amount.toLocaleString()}
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-xs text-gray-400 mb-1">Contact Name</p>
                        <p className="text-sm font-medium text-gray-900">
                            {transaction.contactName || 'No Contact'} 
                            {transaction.contactName && <span className="text-gray-400 font-normal ml-1">(supplier)</span>}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-400 mb-1">Remark</p>
                        <p className="text-sm text-gray-900 leading-relaxed font-medium">
                            {transaction.details}
                        </p>
                    </div>
                    
                    {/* Tags / Chips */}
                    <div className="flex flex-wrap gap-2">
                        {transaction.category && (
                            <span className="bg-[#eff6ff] text-blue-600 text-xs font-medium px-3 py-1.5 rounded-md">
                                {transaction.category}
                            </span>
                        )}
                         <span className="bg-[#eff6ff] text-blue-600 text-xs font-medium px-3 py-1.5 rounded-md">
                            {transaction.paymentMode}
                        </span>
                    </div>
                </div>
            </div>

            {/* Activities Timeline */}
            <div className="p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-6">Activities</h3>
                <div className="relative pl-2">
                    {/* Vertical Line */}
                    <div className="absolute top-2 bottom-8 left-[23px] w-[2px] bg-gray-100"></div>

                    {/* Timeline Item: Created */}
                    <div className="relative pl-10 mb-6 group">
                        {/* Icon Container */}
                        <div className="absolute left-0 top-0">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative z-10">
                                <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="pt-1">
                            <p className="text-sm text-gray-900">
                                <span className="font-semibold">Created</span> by {transaction.createdBy}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                On {formattedDate}, {transaction.time}
                            </p>
                        </div>
                    </div>

                    {/* Timeline Item: Last Updated (Visual Mock) */}
                    <div className="relative pl-10 mb-6 group">
                        {/* Icon Container */}
                        <div className="absolute left-0 top-0">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center relative z-10">
                                <Pencil className="w-3.5 h-3.5 text-gray-500" />
                            </div>
                        </div>
                        
                        {/* Content */}
                        <div className="pt-1">
                            <p className="text-sm text-gray-900">
                                <span className="font-semibold">Last Updated</span> by {transaction.createdBy}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                On {updatedTime}
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
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors"
             >
                <Trash2 className="w-4 h-4" /> Delete
             </button>

             <div className="flex items-center gap-3">
                <button className="flex items-center gap-1 text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-lg text-sm font-semibold border border-transparent hover:border-blue-100 transition-colors">
                    More Actions <ChevronDown className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => onEdit && onEdit(transaction)}
                    className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
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
