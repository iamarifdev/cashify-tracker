import React, { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { Button } from "@/shared/components/ui";
import { defaultBusinessName, OnboardingPageProps } from "../types/onboarding.types";
import { createFirstBusiness } from "../services/onboardingService";

export const OnboardingPage: React.FC<OnboardingPageProps> = ({
  onComplete,
  userName,
}) => {
  const { user } = useAuth();
  const [businessName, setBusinessName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default business name from user's name
    if (userName || user?.name) {
      const defaultName = defaultBusinessName(userName || user?.name);
      setBusinessName(defaultName);
    } else {
      setBusinessName("My Business");
    }
  }, [userName, user?.name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!businessName.trim()) {
      setError("Please enter a business name");
      return;
    }

    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create the first business
      await createFirstBusiness(businessName.trim(), user.id);

      // Call onComplete callback - route handler will update onboarding status
      onComplete(businessName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create business");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Let's get you started
          </h1>
          <p className="text-gray-600">
            Create your first business to begin managing your finances
          </p>
        </div>

        {/* Onboarding Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Business Name
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your business name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                disabled={loading}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
              loading={loading}
            >
              {loading ? "Creating..." : "Get Started"}
            </Button>
          </form>
        </div>

        {/* Footer text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          You can always change this later in your settings
        </p>
      </div>
    </div>
  );
};