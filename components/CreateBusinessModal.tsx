
import React, { useState } from 'react';
import { 
  X, Tractor, Hammer, GraduationCap, Zap, Banknote, Utensils, Shirt, 
  Wrench, Gem, Activity, ShoppingBasket, Truck, LayoutGrid, Check,
  Store, Factory, Briefcase, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from './ui/Button';

interface CreateBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; category: string; type: string }) => void;
}

const CATEGORIES = [
  { id: 'agriculture', label: 'Agriculture', icon: Tractor, color: 'text-green-600', bg: 'bg-green-100' },
  { id: 'construction', label: 'Construction', icon: Hammer, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-teal-600', bg: 'bg-teal-100' },
  { id: 'electronics', label: 'Electronics', icon: Zap, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'financial', label: 'Financial Services', icon: Banknote, color: 'text-green-700', bg: 'bg-green-100' },
  { id: 'food', label: 'Food/Restaurant', icon: Utensils, color: 'text-orange-500', bg: 'bg-orange-100' },
  { id: 'fashion', label: 'Clothes/Fashion', icon: Shirt, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'hardware', label: 'Hardware', icon: Wrench, color: 'text-gray-600', bg: 'bg-gray-100' },
  { id: 'jewellery', label: 'Jewellery', icon: Gem, color: 'text-pink-600', bg: 'bg-pink-100' },
  { id: 'health', label: 'Healthcare & Fitness', icon: Activity, color: 'text-red-500', bg: 'bg-red-100' },
  { id: 'grocery', label: 'Kirana/Grocery', icon: ShoppingBasket, color: 'text-green-500', bg: 'bg-green-100' },
  { id: 'transport', label: 'Transport', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'other', label: 'Other', icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-100' },
];

const TYPES = [
  { id: 'retailer', label: 'Retailer', icon: Store, color: 'text-blue-600', bg: 'bg-blue-100' },
  { id: 'distributor', label: 'Distributor', icon: Truck, color: 'text-blue-500', bg: 'bg-blue-100' },
  { id: 'manufacturer', label: 'Manufacturer', icon: Factory, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { id: 'service', label: 'Service Provider', icon: Wrench, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { id: 'trader', label: 'Trader', icon: Briefcase, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { id: 'other', label: 'Other', icon: LayoutGrid, color: 'text-purple-600', bg: 'bg-purple-100' },
];

export const CreateBusinessModal: React.FC<CreateBusinessModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isCategoryExpanded, setIsCategoryExpanded] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSubmit({ name, category: selectedCategory, type: selectedType });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center md:p-4 text-center">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative transform flex flex-col w-full h-full md:h-auto md:max-h-[90vh] md:rounded-lg bg-white text-left shadow-xl transition-all md:max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
            <h3 className="text-xl font-semibold text-gray-900">Add New Business</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Business Name */}
            <div className="mb-8">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Business Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Add Business Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                autoFocus
              />
            </div>

            {/* Categories */}
            <div className="mb-8 rounded-lg border border-gray-100 p-4 bg-white shadow-sm">
              <button 
                className="flex items-center justify-between w-full mb-2"
                onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
              >
                <div className="text-left">
                    <label className="block text-base font-medium text-gray-900">Select Business Category</label>
                    <p className="text-xs text-gray-500 mt-1">This will help us personalize your business</p>
                </div>
                {isCategoryExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              
              {isCategoryExpanded && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    {CATEGORIES.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group relative overflow-hidden ${
                        selectedCategory === cat.id 
                            ? 'border-blue-600 bg-white ring-1 ring-blue-600 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                        }`}
                    >
                        <div className={`p-2 rounded-lg ${cat.bg} ${cat.color} bg-opacity-20`}>
                            <cat.icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-semibold text-gray-700 leading-tight">{cat.label}</span>
                        {selectedCategory === cat.id && (
                             <div className="absolute top-0 right-0 p-0.5 bg-blue-600 rounded-bl-lg">
                                <Check className="w-3 h-3 text-white" />
                             </div>
                        )}
                    </button>
                    ))}
                </div>
              )}
            </div>

             {/* Business Types */}
             <div className="mb-4 rounded-lg border border-gray-100 p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                 <div className="text-left">
                    <label className="block text-base font-medium text-gray-900">Select Business Type</label>
                    <p className="text-xs text-gray-500 mt-1">This will help us personalize your business</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {TYPES.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all text-left group relative overflow-hidden ${
                      selectedType === type.id 
                        ? 'border-blue-600 bg-blue-50/10 ring-1 ring-blue-600 shadow-sm' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50 bg-white'
                    }`}
                  >
                     <div className={`p-2 rounded-lg ${type.bg} ${type.color} bg-opacity-20`}>
                        <type.icon className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 leading-tight">{type.label}</span>
                     {selectedType === type.id && (
                        <div className="absolute top-0 right-0 p-0.5 bg-blue-600 rounded-bl-lg">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="bg-white px-6 py-4 flex items-center justify-end border-t border-gray-200 shrink-0">
             <Button 
                onClick={handleSubmit} 
                disabled={!name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-8 py-2.5 h-auto text-sm"
             >
               Create Business
             </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
