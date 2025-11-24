import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { BookDetails } from './components/BookDetails';
import { TopBar } from './components/dashboard/TopBar';
import { User, Book, ViewState, Business } from './types';
import { MOCK_BUSINESSES } from './services/mockData';

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

  const handleBusinessChange = (business: Business) => {
    setCurrentBusiness(business);
    // If a book was selected, we might want to deselect it if it doesn't belong to the new business
    // But since the view is likely DASHBOARD when changing business, this is handled.
    // If we are in BOOK_DETAILS, this would force back to dashboard
    if (viewState === 'BOOK_DETAILS') {
      setViewState('DASHBOARD');
      setSelectedBook(null);
    }
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
        
        {/* Global TopBar */}
        {user && (
          <TopBar 
            user={user}
            currentBusiness={currentBusiness}
            onBusinessChange={handleBusinessChange}
            onLogout={handleLogout}
            onSidebarOpen={() => setIsSidebarOpen(true)}
          />
        )}

        <div className="flex-1 overflow-hidden relative">
          {viewState === 'DASHBOARD' && (
            <Dashboard 
              onBookSelect={handleBookSelect} 
              currentBusiness={currentBusiness}
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
    </div>
  );
};

export default App;