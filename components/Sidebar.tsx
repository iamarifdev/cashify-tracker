import React from 'react';
import { BookOpen, Settings, Users, HelpCircle, LayoutGrid, ChevronDown, Menu } from 'lucide-react';

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
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 z-20 bg-gray-600 bg-opacity-50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center h-16 px-6 border-b border-gray-100">
          <div className="flex items-center gap-2 text-blue-600">
            <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl">C</div>
            <span className="text-xl font-bold tracking-tight">CASHIFY</span>
          </div>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <div key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  activeTab === item.id 
                    ? 'text-blue-600 bg-blue-50' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {item.label}
                </div>
                {item.hasSubmenu && <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              
              {/* Expanded Submenu for Book Keeping */}
              {item.id === 'bookkeeping' && activeTab === 'bookkeeping' && (
                <div className="pl-11 mt-1 space-y-1">
                  <button className="block w-full text-left px-2 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md">
                    Cashbooks
                  </button>
                </div>
              )}
               {/* Expanded Submenu for Settings */}
               {item.id === 'settings' && activeTab === 'settings' && (
                <div className="pl-11 mt-1 space-y-1">
                  <button className="block w-full text-left px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
                    Team
                  </button>
                  <button className="block w-full text-left px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-md">
                    Business Settings
                  </button>
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};