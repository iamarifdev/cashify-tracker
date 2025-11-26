import React, { useState } from 'react';
import { Search, Book, Pencil, Copy, UserPlus, CornerUpRight } from 'lucide-react';
import { Book as BookType, Business } from '../types';
import { MOCK_BOOKS } from '../services/mockData';
import { RoleBanner } from '../components/layout/RoleBanner';
import { PromoSidebar } from '../components/layout/PromoSidebar';
import { FilterDropdown } from '../components/ui/FilterDropdown';

interface DashboardProps {
  onBookSelect: (book: BookType) => void;
  currentBusiness: Business;
}

const SORT_OPTIONS = [
  'Last Updated',
  'Name (A to Z)',
  'Net Balance (High to Low)',
  'Net Balance (Low to High)',
  'Last Created'
];

export const Dashboard: React.FC<DashboardProps> = ({ onBookSelect, currentBusiness }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState('Last Updated');
  const [isSortOpen, setIsSortOpen] = useState(false);

  // Filter & Sort logic
  const filteredBooks = MOCK_BOOKS
    .filter(b => b.businessId === currentBusiness.id)
    .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      switch(sortOption) {
        case 'Name (A to Z)': return a.name.localeCompare(b.name);
        case 'Net Balance (High to Low)': return b.netBalance - a.netBalance;
        case 'Net Balance (Low to High)': return a.netBalance - b.netBalance;
        case 'Last Created': return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
        default: return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
      }
    });

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-gray-900';
    return balance > 0 ? 'text-[#059669]' : 'text-[#dc2626]';
  };

  const FilterFooter = ({ onClear, onDone }: { onClear: () => void, onDone: () => void }) => (
    <div className="flex items-center justify-between p-2 border-t border-gray-100 bg-gray-50">
      <button onClick={onClear} className="px-3 py-1 text-xs font-medium text-gray-500 hover:text-gray-700">Clear</button>
      <button onClick={onDone} className="px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700">Done</button>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">{currentBusiness.name}</h2>

        <RoleBanner role={currentBusiness.role} />

        <div className="flex flex-col xl:flex-row gap-6 items-start">
            
            {/* Left Column: Search, Filters & List */}
            <div className="flex-1 w-full">
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 w-full">
                <div className="flex gap-4 w-full">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input 
                      type="text" 
                      placeholder="Search by book name..." 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm h-[38px]"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  
                  <FilterDropdown
                    label={`Sort By : ${sortOption}`}
                    isOpen={isSortOpen}
                    onToggle={() => setIsSortOpen(!isSortOpen)}
                    onClose={() => setIsSortOpen(false)}
                    width="w-64"
                  >
                    <div className="py-2">
                      {SORT_OPTIONS.map((opt) => (
                        <label key={opt} className={`flex items-center w-full px-4 py-2 cursor-pointer hover:bg-gray-50 ${sortOption === opt ? 'bg-blue-50' : ''}`}>
                          <div className={`flex items-center justify-center w-4 h-4 rounded-full border mr-3 ${sortOption === opt ? 'border-blue-600' : 'border-gray-400'}`}>
                             {sortOption === opt && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                          </div>
                          <span className={`text-sm ${sortOption === opt ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                            {opt}
                          </span>
                          <input 
                            type="radio" 
                            name="sort" 
                            className="hidden"
                            checked={sortOption === opt}
                            onChange={() => setSortOption(opt)}
                          />
                        </label>
                      ))}
                    </div>
                    <FilterFooter onClear={() => setSortOption('Last Updated')} onDone={() => setIsSortOpen(false)} />
                  </FilterDropdown>
                </div>
              </div>

              {/* Book List */}
              <div className="bg-white rounded shadow-sm border border-gray-200 overflow-hidden mb-6 min-h-[200px]">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                      <div 
                        key={book.id} 
                        onClick={() => onBookSelect(book)}
                        className="flex items-center justify-between p-5 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors group last:border-0"
                      >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-gray-200">
                              <Book className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900 text-base">{book.name}</h3>
                              <p className="text-xs text-gray-500 mt-0.5">
                                  {book.membersCount} members • Updated {new Date(book.lastUpdated).toLocaleDateString()}
                              </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <div className="text-right">
                                <p className={`font-bold text-base ${getBalanceColor(book.netBalance)}`}>
                                {book.netBalance.toLocaleString()}
                                </p>
                            </div>

                            {/* Hover Actions */}
                            <div className="hidden group-hover:flex items-center gap-1 animate-in slide-in-from-right-4 duration-200">
                                <button 
                                    onClick={(e) => { e.stopPropagation(); }} 
                                    className="p-2 text-blue-600 hover:bg-white hover:shadow-sm rounded-full transition-all"
                                    title="Edit"
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); }} 
                                    className="p-2 text-blue-600 hover:bg-white hover:shadow-sm rounded-full transition-all"
                                    title="Duplicate"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); }} 
                                    className="p-2 text-blue-600 hover:bg-white hover:shadow-sm rounded-full transition-all"
                                    title="Add Member"
                                >
                                    <UserPlus className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); }} 
                                    className="p-2 text-red-600 hover:bg-white hover:shadow-sm rounded-full transition-all"
                                    title="Move"
                                >
                                    <CornerUpRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                      </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-48 text-gray-500">
                    <Book className="w-8 h-8 mb-2 opacity-20" />
                    <p className="text-sm">No books found for this business</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="w-full xl:w-80 flex-shrink-0">
                <PromoSidebar />
            </div>
        </div>

      </div>
    </div>
  );
};