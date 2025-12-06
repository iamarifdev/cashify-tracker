export interface OnboardingData {
  businessName: string;
}

export interface OnboardingPageProps {
  onComplete: (businessName: string) => void;
  userName?: string;
}

export const defaultBusinessName = (userName?: string): string => {
  if (!userName) return "My Business";
  // Remove any trailing 's from the name and add 's Business
  const cleanedName = userName.replace(/s$/, '');
  return `${cleanedName}'s Business`;
};