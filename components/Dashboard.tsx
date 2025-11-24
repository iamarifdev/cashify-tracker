
import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, LogOut, Book, Plus, MessageSquare, LayoutGrid, Check, Smartphone, Download } from 'lucide-react';
import { Book as BookType, Business, User as UserType } from '../types';
import { MOCK_BOOKS, MOCK_BUSINESSES } from '../services/mockData';
import { Button } from './ui/Button';

interface DashboardProps {
  onBookSelect: (book: BookType) => void;
  user: UserType;
  currentBusiness: Business;
  onBusinessChange: (business: Business) => void;
  onLogout: () => void;
}

// Hook for handling click outside
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

export const Dashboard: React.FC<DashboardProps> = ({ onBookSelect, user, currentBusiness, onBusinessChange, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Dropdown States
  const [isBusinessMenuOpen, setBusinessMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [businessSearch, setBusinessSearch] = useState('');

  // Refs for click outside
  const businessMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(businessMenuRef, () => setBusinessMenuOpen(false));
  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));

  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-gray-900';
    return balance > 0 ? 'text-[#059669]' : 'text-[#dc2626]';
  };

  // Filter books based on current business and search term
  const filteredBooks = MOCK_BOOKS
    .filter(b => b.businessId === currentBusiness.id)
    .filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const filteredBusinesses = MOCK_BUSINESSES.filter(b => 
    b.name.toLowerCase().includes(businessSearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-[#f9fafb]">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 h-16 relative z-20">
        <div className="h-full px-4 lg:px-8 flex items-center justify-between relative">
            
            {/* Left Spacer / Search placeholder if needed */}
            <div className="w-1/3 flex justify-start">
               {/* Could put a global search here if needed later */}
            </div>

            {/* Center - Business Selector */}
            <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30" ref={businessMenuRef}>
                <button 
                  onClick={() => setBusinessMenuOpen(!isBusinessMenuOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:bg-gray-50 px-3 py-2 rounded-lg border border-transparent hover:border-gray-200 transition-all"
                >
                   <div className="p-1 rounded bg-blue-50 text-blue-600">
                     <LayoutGrid className="w-4 h-4" />
                   </div>
                   <span className="hidden md:inline-block max-w-[200px] truncate">{currentBusiness.name}</span>
                   <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isBusinessMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Business Dropdown */}
                {isBusinessMenuOpen && (
                  <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-[350px] bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-3 border-b border-gray-100">
                      <input 
                        type="text"
                        placeholder="Search Business"
                        value={businessSearch}
                        onChange={(e) => setBusinessSearch(e.target.value)}
                        className="w-full border border-blue-500 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto py-1">
                      {filteredBusinesses.map(biz => (
                        <button
                          key={biz.id}
                          onClick={() => {
                            onBusinessChange(biz);
                            setBusinessMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${currentBusiness.id === biz.id ? 'bg-blue-50' : ''}`}
                        >
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0 ${currentBusiness.id === biz.id ? 'border-blue-600' : 'border-gray-400'}`}>
                             {currentBusiness.id === biz.id && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                          </div>
                          <span className={`text-sm ${currentBusiness.id === biz.id ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                            {biz.name}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="p-3 border-t border-gray-100 bg-white">
                      <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                        <Plus className="w-4 h-4" /> Add New Business
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Right - Profile */}
            <div className="w-1/3 flex justify-end" ref={profileMenuRef}>
              <div className="relative">
                <button 
                  onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors ${isProfileMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                >
                  <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                    {user.name.charAt(0)}
                  </div>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {/* Profile Dropdown */}
                {isProfileMenuOpen && (
                   <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-100">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg flex-shrink-0">
                                {user.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 mb-1">+8801793574440</p>
                                <a href="#" className="text-xs text-blue-600 font-medium hover:underline flex items-center">
                                  Your Profile <ChevronDown className="w-3 h-3 -rotate-90 ml-0.5" />
                                </a>
                            </div>
                          </div>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button 
                          onClick={onLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 text-gray-500" />
                          Logout
                        </button>
                      </div>

                      {/* Mobile App Promo */}
                      <div className="border-t border-gray-100 p-4">
                         <p className="text-xs text-gray-500 mb-3">Mobile App</p>
                         <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                           <Download className="w-4 h-4" /> Download App
                         </button>
                      </div>

                      {/* Footer */}
                      <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 text-center border-t border-gray-100">
                        © CashBook • Version 3.25.1
                      </div>
                   </div>
                )}
              </div>
            </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        
        <h2 className="text-xl font-bold text-gray-900 mb-6">{currentBusiness.name}</h2>

        {/* Role Banner */}
        <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded-lg p-3 mb-6 flex items-center gap-3 max-w-4xl">
          <div className="bg-[#10b981] text-white rounded-full p-1 h-5 w-5 flex items-center justify-center">
             <span className="font-bold text-xs">i</span>
          </div>
          <span className="text-sm text-[#065f46]">Your Role: <span className="font-bold">{currentBusiness.role}</span></span>
          <a href="#" className="text-sm text-[#059669] font-semibold hover:underline">View</a>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 max-w-4xl">
          <div className="flex gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by book name..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
               <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-10 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 shadow-sm cursor-pointer hover:bg-gray-50">
                 <option>Sort By : Last Updated</option>
                 <option>Name (A to Z)</option>
               </select>
               <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row gap-6">
            {/* Book List */}
            <div className="flex-1 max-w-4xl">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 min-h-[200px]">
                {filteredBooks.length > 0 ? (
                  filteredBooks.map((book) => (
                      <div 
                      key={book.id} 
                      onClick={() => onBookSelect(book)}
                      className="flex items-center justify-between p-5 border-b border-gray-100 hover:bg-blue-50 cursor-pointer transition-colors group last:border-0"
                      >
                      <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <Book className="w-5 h-5" />
                          </div>
                          <div>
                          <h3 className="font-semibold text-gray-900 text-base">{book.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                              {book.membersCount} members • Updated {new Date(book.lastUpdated).toLocaleDateString()}
                          </p>
                          </div>
                      </div>
                      <div className="text-right">
                          <p className={`font-bold text-base ${getBalanceColor(book.netBalance)}`}>
                          {book.netBalance.toLocaleString()}
                          </p>
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

            {/* Right Sidebar Promo */}
            <div className="w-full xl:w-80 space-y-4">
                <Button fullWidth className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-sm gap-2">
                   <Plus className="w-5 h-5" /> Add New Book
                </Button>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-green-100 p-2 rounded-full">
                        <MessageSquare className="w-5 h-5 text-green-600" />
                        </div>
                        <h4 className="font-bold text-gray-900 text-sm">Need help in business setup?</h4>
                    </div>
                    <p className="text-xs text-gray-600 mb-4 leading-relaxed">Our support team will help you</p>
                    <a href="#" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                        Contact Us <ChevronDown className="w-4 h-4 -rotate-90" />
                    </a>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};
