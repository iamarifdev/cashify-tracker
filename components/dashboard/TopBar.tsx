import React, { useState, useRef, useEffect } from 'react';
import { LayoutGrid, ChevronDown, Plus, LogOut, Download, Menu } from 'lucide-react';
import { Business, User } from '../../types';
import { MOCK_BUSINESSES } from '../../services/mockData';

interface TopBarProps {
  user: User;
  currentBusiness: Business;
  onBusinessChange: (business: Business) => void;
  onLogout: () => void;
  onSidebarOpen: () => void;
}

// Hook for handling click outside
function useClickOutside(ref: React.RefObject<HTMLElement | null>, handler: (event: MouseEvent | TouchEvent) => void) {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
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

export const TopBar: React.FC<TopBarProps> = ({ user, currentBusiness, onBusinessChange, onLogout, onSidebarOpen }) => {
  const [isBusinessMenuOpen, setBusinessMenuOpen] = useState(false);
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const [businessSearch, setBusinessSearch] = useState('');

  const businessMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(businessMenuRef, () => setBusinessMenuOpen(false));
  useClickOutside(profileMenuRef, () => setProfileMenuOpen(false));

  const filteredBusinesses = MOCK_BUSINESSES.filter(b => 
    b.name.toLowerCase().includes(businessSearch.toLowerCase())
  );

  return (
    <div className="bg-white border-b border-gray-200 h-16 relative z-20 shadow-sm shrink-0">
      <div className="h-full px-4 lg:px-8 flex items-center justify-between relative">
          
          {/* Left Section (Sidebar Toggle & Spacer) */}
          <div className="w-1/3 flex items-center">
             <button 
                onClick={onSidebarOpen} 
                className="lg:hidden p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-md"
                aria-label="Open Sidebar"
             >
               <Menu className="w-6 h-6" />
             </button>
          </div>

          {/* Center - Business Selector */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-full md:w-auto flex justify-center pointer-events-none md:pointer-events-auto" ref={businessMenuRef}>
              <button 
                onClick={() => setBusinessMenuOpen(!isBusinessMenuOpen)}
                className="flex items-center justify-between gap-2 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 px-4 py-2.5 rounded border border-gray-200 transition-all shadow-sm min-w-[200px] md:min-w-[280px] max-w-[320px] pointer-events-auto"
              >
                 <div className="flex items-center gap-2 truncate">
                    <div className="p-0.5 rounded bg-blue-50 text-blue-600">
                      <LayoutGrid className="w-4 h-4" />
                    </div>
                    <span className="truncate">{currentBusiness.name}</span>
                 </div>
                 <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${isBusinessMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Business Dropdown */}
              {isBusinessMenuOpen && (
                <div className="absolute top-full mt-2 w-[320px] bg-white rounded shadow-xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-100 pointer-events-auto">
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
                className={`flex items-center gap-2 px-2 py-1.5 rounded transition-colors ${isProfileMenuOpen ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
              >
                <span className="text-sm font-medium text-gray-700 hidden md:block">{user.name}</span>
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm border border-blue-200">
                  {user.name.charAt(0)}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                 <div className="absolute right-0 mt-2 w-72 bg-white rounded shadow-xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in-95 duration-100 z-40">
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

                    <div className="py-1">
                      <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 text-gray-500" />
                        Logout
                      </button>
                    </div>

                    <div className="border-t border-gray-100 p-4">
                       <p className="text-xs text-gray-500 mb-3">Mobile App</p>
                       <button className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors">
                         <Download className="w-4 h-4" /> Download App
                       </button>
                    </div>

                    <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-400 text-center border-t border-gray-100">
                      © CashBook • Version 3.25.1
                    </div>
                 </div>
              )}
            </div>
          </div>
      </div>
    </div>
  );
};