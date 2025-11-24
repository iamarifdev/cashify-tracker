import React from 'react';

interface RoleBannerProps {
  role: string;
}

export const RoleBanner: React.FC<RoleBannerProps> = ({ role }) => {
  return (
    <div className="bg-[#ecfdf5] border border-[#d1fae5] rounded p-3 mb-6 flex items-center gap-3 w-full">
      <div className="bg-[#10b981] text-white rounded-full p-1 h-5 w-5 flex items-center justify-center flex-shrink-0">
         <span className="font-bold text-xs">i</span>
      </div>
      <span className="text-sm text-[#065f46]">Your Role: <span className="font-bold">{role}</span></span>
      <a href="#" className="text-sm text-[#059669] font-semibold hover:underline ml-auto md:ml-0">View</a>
    </div>
  );
};