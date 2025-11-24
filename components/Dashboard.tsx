import React, { useState } from 'react';
import { Search, ChevronDown, User, LogOut, Book, Download, Users, Smartphone, Plus } from 'lucide-react';
import { Book as BookType, Business, User as UserType } from '../types';
import { MOCK_BOOKS } from '../services/mockData';
import { Button } from './ui/Button';

interface DashboardProps {
  onBookSelect: (book: BookType) => void;
  user: UserType;
  currentBusiness: Business;
  onLogout: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onBookSelect, user, currentBusiness, onLogout }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Helper to determine text color for balance
  const getBalanceColor = (balance: number) => {
    if (balance === 0) return 'text-gray-500';
    return balance > 0 ? 'text-green-600' : 'text-red-600';
  };

  const filteredBooks = MOCK_BOOKS.filter(b => b.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800 hidden lg:block">{currentBusiness.name}</h2>
        <div className="flex items-center gap-4 ml-auto">
          {/* Business Selector (Mock) */}
          <div className="relative hidden md:block">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200">
               <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs font-bold">A</span>
               {currentBusiness.name}
               <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-2 hover:bg-gray-50 p-1 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                {user.name.charAt(0)}
              </div>
              <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 hidden group-hover:block z-50">
               <div className="p-4 border-b border-gray-100">
                 <p className="text-sm font-bold text-gray-900">{user.name}</p>
                 <p className="text-xs text-gray-500">+8801793574440</p>
                 <a href="#" className="text-xs text-blue-600 mt-1 block">Your Profile &gt;</a>
               </div>
               <div className="p-2">
                 <button onClick={onLogout} className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-md">
                   <LogOut className="w-4 h-4" /> Logout
                 </button>
               </div>
               <div className="p-3 bg-gray-50 text-xs text-gray-400 text-center rounded-b-lg">
                 Version 3.25.1
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 lg:p-8">
        {/* Sub Header */}
        <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 mb-6 flex items-center gap-3">
          <div className="bg-emerald-500 text-white rounded-full p-1">
             <User className="w-4 h-4" />
          </div>
          <span className="text-sm text-emerald-900">Your Role: <span className="font-bold">Owner</span></span>
          <a href="#" className="text-sm text-emerald-700 underline font-medium">View</a>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by book name..." 
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative">
               <select className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-4 pr-8 rounded-lg text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                 <option>Sort By : Last Updated</option>
                 <option>Name (A to Z)</option>
                 <option>Balance (High to Low)</option>
               </select>
               <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
          
          <Button onClick={() => {}} className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm">
            <Plus className="w-4 h-4" /> Add New Book
          </Button>
        </div>

        {/* Book List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredBooks.map((book) => (
            <div 
              key={book.id} 
              onClick={() => onBookSelect(book)}
              className="flex items-center justify-between p-5 border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-200 transition-colors">
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
          ))}
          {filteredBooks.length === 0 && (
             <div className="p-12 text-center text-gray-500">
               No books found matching your search.
             </div>
          )}
        </div>
      </div>
      
      {/* Right Sidebar Promo (Desktop Only) */}
      <div className="fixed right-6 bottom-6 hidden xl:block w-80">
        <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
             <div className="bg-green-100 p-2 rounded-full">
               <Smartphone className="w-6 h-6 text-green-600" />
             </div>
             <h4 className="font-bold text-gray-900">Need help in business setup?</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">Our support team will help you.</p>
          <a href="#" className="text-blue-600 font-semibold text-sm hover:underline flex items-center gap-1">
            Contact Us <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          </a>
        </div>
      </div>

    </div>
  );
};