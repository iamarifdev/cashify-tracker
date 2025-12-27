import { businessService } from "@/features/business/services/businessService";
import { BusinessSummary } from "@/types";

/**
 * Create the first business for a new user during onboarding
 */
export const createFirstBusiness = async (
  businessName: string,
  userId: string
): Promise<BusinessSummary> => {
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