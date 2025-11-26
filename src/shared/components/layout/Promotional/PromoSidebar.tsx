import React from 'react';
import { Plus, MessageSquare, ChevronDown, Smartphone } from 'lucide-react';
import { Button } from '@/shared/components/ui/Button';

export const PromoSidebar: React.FC = () => {
  return (
    <div className="space-y-4">
        <Button fullWidth className="py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded shadow-sm gap-2">
           <Plus className="w-5 h-5" /> Add New Book
        </Button>

        <div className="bg-white p-5 rounded shadow-sm border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-100 p-2 rounded-full">
                <MessageSquare className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="font-bold text-gray-900 text-sm">Need help in business setup?</h4>
            </div>
            <p className="text-xs text-gray-600 mb-4 leading-relaxed">Our support team will help you</p>
            <a href="#" className="text-blue-600 font-bold text-sm hover:underline flex items-center gap-1">
                Contact Us <ChevronDown className="w-4 h-4 -rotate-90" />
            </a>
        </div>
    </div>
  );
};