
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { BookDetails } from './pages/BookDetails';
import { TopBar } from './components/layout/TopBar';
import { User, Book, ViewState, Business } from './types';
import { MOCK_BUSINESSES } from './services/mockData';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [viewState, setViewState] = useState<ViewState>('LOGIN');
  const [activeTab, setActiveTab] = useState('bookkeeping');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [businesses, setBusinesses] = useState<Business[]>(MOCK_BUSINESSES);
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
    // If we are in BOOK_DETAILS, this forces back to dashboard
    if (viewState === 'BOOK_DETAILS') {
      setViewState('DASHBOARD');
      setSelectedBook(null);
    }
  };

  const handleCreateBusiness = (data: { name: string; category: string; type: string }) => {
    const newBusiness: Business = {
        id: `biz_${Date.now()}`,
        name: data.name,
        role: 'Owner'
    };
    
    // In a real app, we would make an API call here.
    // For now, we update local state.
    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);
    setCurrentBusiness(newBusiness);
    
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
            businesses={businesses}
            onBusinessChange={handleBusinessChange}
            onCreateBusiness={handleCreateBusiness}
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
