import React from 'react';
import { BookOpen, Settings, LayoutGrid, HelpCircle, ChevronDown, Book, Users } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange, isOpen, setIsOpen }) => {
  
  const menuItems = [
    { id: 'bookkeeping', label: 'Book Keeping', icon: BookOpen, hasSubmenu: true },
    { id: 'settings', label: 'Settings', icon: Settings, hasSubmenu: true },
    { id: 'others', label: 'Others', icon: LayoutGrid, hasSubmenu: true },
    { id: 'help', label: 'Help & Support', icon: HelpCircle, hasSubmenu: false },
  ];

  return (
    <div className={`w-64 h-full bg-white border-r border-gray-200 flex flex-col lg:relative`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-7 h-7 bg-blue-600 text-white rounded flex items-center justify-center font-bold text-lg">C</div>
            <span className="text-lg font-bold tracking-tight text-blue-600">CASHBOOK</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto flex-1">
          {menuItems.map((item) => (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors group ${
                  activeTab === item.id
                    ? 'text-gray-900 bg-gray-50'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-gray-700' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  {item.label}
                </div>
                {item.hasSubmenu && (
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${activeTab === item.id ? 'rotate-180' : ''}`} />
                )}
              </button>

              {item.id === 'bookkeeping' && activeTab === 'bookkeeping' && (
                <div className="mt-1 space-y-1">
                  <button className="flex items-center gap-3 w-full text-left px-3 py-2 pl-11 text-sm font-medium text-white bg-blue-600 rounded-lg shadow-sm">
                    <Book className="w-4 h-4" />
                    Cashbooks
                  </button>
                </div>
              )}

               {item.id === 'settings' && activeTab === 'settings' && (
                <div className="mt-1 space-y-1">
                  <button className="flex items-center gap-3 w-full text-left px-3 py-2 pl-11 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Users className="w-4 h-4" />
                    Team
                  </button>
                  <button className="flex items-center gap-3 w-full text-left px-3 py-2 pl-11 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg">
                    <Settings className="w-4 h-4" />
                    Business Settings
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="p-4 text-center">
            <p className="text-xs text-gray-400">© CashBook • Version 3.25.1</p>
        </div>
      </div>
  );
};
