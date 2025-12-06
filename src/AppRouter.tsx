import React from "react";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
} from "react-router-dom";

import { Login, useAuth } from "@/features/auth";
import { Dashboard } from "@/features/cashbook";
import { BookDetails } from "@/features/transactions";
import { OnboardingPage } from "@/features/onboarding";
import { MOCK_BUSINESSES, MOCK_BOOKS } from "@/services/mockData";
import { Sidebar, TopBar } from "@/shared/components/layout";
import { ProtectedRoute } from "@/shared/router";
import { Business, Book } from "@/types";

// Layout component for authenticated pages
const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("bookkeeping");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [businesses, setBusinesses] = React.useState(MOCK_BUSINESSES);
  const [currentBusiness, setCurrentBusiness] = React.useState(
    MOCK_BUSINESSES[0]
  );

  const handleLogout = () => {
    localStorage.removeItem("cashify_user");
    localStorage.removeItem("cashify_token");
    globalThis.location.href = "/login";
  };

  const handleBusinessChange = (business: Business) => {
    setCurrentBusiness(business);
  };

  const handleCreateBusiness = (data: {
    name: string;
    category: string;
    type: string;
  }) => {
    const newBusiness: Business = {
      id: `biz_${Date.now()}`,
      name: data.name,
      role: "Owner",
    };

    const updatedBusinesses = [...businesses, newBusiness];
    setBusinesses(updatedBusinesses);
    setCurrentBusiness(newBusiness);
  };

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
        <TopBar
          user={user}
          currentBusiness={currentBusiness}
          businesses={businesses}
          onBusinessChange={handleBusinessChange}
          onCreateBusiness={handleCreateBusiness}
          onLogout={handleLogout}
          onSidebarOpen={() => setIsSidebarOpen(true)}
        />

        <div className="flex-1 overflow-hidden relative">{children}</div>
      </div>
    </div>
  );
};

// Dashboard wrapper component
const DashboardWrapper: React.FC = () => {
  const currentBusiness = MOCK_BUSINESSES[0];

  const handleBookSelect = (book: Book) => {
    // Navigate to book details
    globalThis.location.href = `/books/${book.id}`;
  };

  return (
    <Dashboard
      onBookSelect={handleBookSelect}
      currentBusiness={currentBusiness}
    />
  );
};

// BookDetails wrapper component
const BookDetailsWrapper: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const book = MOCK_BOOKS.find(b => b.id === bookId);

  const handleBack = () => {
    globalThis.location.href = "/";
  };

  if (!book) {
    return <div>Book not found</div>;
  }

  return <BookDetails book={book} onBack={handleBack} />;
};

// Onboarding wrapper component
const OnboardingWrapper: React.FC = () => {
  const { user } = useAuth();

  const handleOnboardingComplete = (businessName: string) => {
    // Navigate to dashboard after onboarding is complete
    globalThis.location.href = "/";
  };

  return (
    <OnboardingPage
      onComplete={handleOnboardingComplete}
      userName={user?.name}
    />
  );
};

// Main App Router component using createBrowserRouter
const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/onboarding",
    element: (
      <ProtectedRoute>
        <OnboardingWrapper />
      </ProtectedRoute>
    ),
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <DashboardWrapper />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/books/:bookId",
    element: (
      <ProtectedRoute>
        <AuthenticatedLayout>
          <BookDetailsWrapper />
        </AuthenticatedLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export const AppRouter: React.FC = () => {
  return <RouterProvider router={router} />;
};
