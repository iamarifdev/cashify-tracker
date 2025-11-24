import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BookDetails } from './components/BookDetails';
import { User, Book, ViewState, Business } from './types';
import { MOCK_BUSINESSES } from './services/mockData';
import { Menu } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>('LOGIN');
  const [activeTab, setActiveTab] = useState('bookkeeping');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentBusiness, setCurrentBusiness] = useState<Business>(MOCK_BUSINESSES[0]);

  useEffect(() => {
    // Check for existing session
    const storedUser = localStorage.getItem('cashify_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setViewState('DASHBOARD');
    }
  }, []);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setViewState('DASHBOARD');
  };

  const handleLogout = () => {
    localStorage.removeItem('cashify_user');
    localStorage.removeItem('cashify_token');
    setUser(null);
    setViewState('LOGIN');
  };

  const handleBookSelect = (book: Book) => {
    setSelectedBook(book);
    setViewState('BOOK_DETAILS');
  };

  const handleBackToDashboard = () => {
    setSelectedBook(null);
    setViewState('DASHBOARD');
  };

  if (viewState === 'LOGIN') {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar for Desktop */}
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Mobile Header Trigger */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
           <button onClick={() => setIsSidebarOpen(true)} className="text-gray-600">
             <Menu className="w-6 h-6" />
           </button>
           <span className="font-bold text-lg text-blue-600">CASHIFY</span>
           <div className="w-6" /> {/* Spacer for centering */}
        </div>

        {viewState === 'DASHBOARD' && user && (
          <Dashboard 
            onBookSelect={handleBookSelect} 
            user={user}
            currentBusiness={currentBusiness}
            onLogout={handleLogout}
          />
        )}

        {viewState === 'BOOK_DETAILS' && selectedBook && (
          <BookDetails 
            book={selectedBook} 
            onBack={handleBackToDashboard} 
          />
        )}
      </div>
    </div>
  );
};

export default App;