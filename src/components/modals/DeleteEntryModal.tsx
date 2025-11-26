
import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '../../types';

interface DeleteEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  transaction: Transaction | null;
}

export const DeleteEntryModal: React.FC<DeleteEntryModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  transaction 
}) => {
  if (!isOpen || !transaction) return null;

  const isCashIn = transaction.type === TransactionType.CASH_IN;
  const formattedDate = new Date(transaction.date).toLocaleDateString('en-GB', {
    day: '2-digit', 
    month: 'short', 
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform w-full max-w-lg rounded-lg bg-white text-left shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Delete Entry</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-6">
            {/* Warning Alert */}
            <div className="flex gap-3 bg-orange-50 border border-orange-100 rounded-lg p-4 mb-6">
              <div className="flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-orange-600 fill-orange-100" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Once deleted, this entry cannot be restored.
                  <br />
                  Are you sure you want to Delete ?
                </p>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-gray-900 mb-4">Review Details</h4>

            {/* Details Grid */}
            <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
               <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Type</p>
                    <p className={`text-sm font-bold ${isCashIn ? 'text-[#059669]' : 'text-[#dc2626]'}`}>
                        {isCashIn ? 'Cash In' : 'Cash Out'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Amount</p>
                    <p className="text-sm font-bold text-gray-900">{transaction.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Date</p>
                    <p className="text-sm font-bold text-gray-900">{formattedDate}</p>
                  </div>
               </div>
               <div>
                  <p className="text-xs text-gray-500 mb-1">Remark</p>
                  <p className="text-sm text-gray-900 font-medium">{transaction.details || '-'}</p>
               </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-white px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-100">
             <button 
                onClick={onConfirm}
                className="flex items-center justify-center gap-2 px-6 py-2.5 border border-red-200 text-red-600 font-bold text-sm rounded-lg hover:bg-red-50 transition-colors"
             >
               <Trash2 className="w-4 h-4" />
               Yes, Delete
             </button>
             <button 
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-8 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 transition-colors"
             >
               <X className="w-4 h-4" />
               Cancel
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};
