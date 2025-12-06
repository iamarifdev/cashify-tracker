import { Business } from "@/types";
import { businessService } from "@/features/business/services/businessService";

export const createFirstBusiness = async (
  businessName: string,
  userId: string
): Promise<Business> => {
  try {
    const businessData = {
      name: businessName,
      category: "General", // Default category
      type: "Small Business", // Default type
    };

    const business = await businessService.createBusiness(businessData);
    return business;
  } catch (error) {
    console.error("Failed to create first business:", error);
    throw new Error("Failed to create business. Please try again.");
  }
};

export const checkUserHasBusinesses = (userId: string): boolean => {
  // For now, check localStorage. In a real app, this would be an API call
  const businesses = localStorage.getItem(`businesses_${userId}`);
  if (!businesses) return false;

  try {
    const parsedBusinesses = JSON.parse(businesses);
    return Array.isArray(parsedBusinesses) && parsedBusinesses.length > 0;
  } catch {
    return false;
  }
};

export const markOnboardingComplete = (userId: string): void => {
  localStorage.setItem(`onboarding_complete_${userId}`, "true");
};

export const hasCompletedOnboarding = (userId: string): boolean => {
  return localStorage.getItem(`onboarding_complete_${userId}`) === "true";
};