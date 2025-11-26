import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Book } from '@/types';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, onBack }) => {
  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 shadow-lg">
      <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 p-2 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-gray-500 text-sm font-medium">Back</span>
          </button>
          <div className="text-lg font-bold text-gray-900">{book.name}</div>
        </div>
      </div>
      <div className="px-6 py-4 bg-gray-50 flex-1 overflow-auto">
        <div className="text-sm text-gray-600 mb-4">
          <div className="text-xs text-gray-500">Transaction Details</div>
        </div>
      </div>
    </div>
  );
};