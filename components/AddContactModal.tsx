
import React, { useState } from 'react';
import { X, FileSpreadsheet } from 'lucide-react';
import { Button } from './ui/Button';
import { Contact } from '../types';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (contact: Contact) => void;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({ isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [type, setType] = useState<'Customer' | 'Supplier'>('Customer');

  if (!isOpen) return null;

  const handleSave = () => {
      if (!name.trim()) return;
      
      const newContact: Contact = {
          id: `c_${Date.now()}`,
          name: name,
          mobile: mobile,
          type: type
      };
      
      onSave(newContact);
      onClose();
      // Reset form
      setName('');
      setMobile('');
      setType('Customer');
  };

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
        
        <div className="relative w-full max-w-md bg-white rounded-lg shadow-xl transform transition-all">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900">Add New Contact</h3>
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
             {/* Import Button */}
             <button className="w-full flex items-center justify-between px-4 py-3 bg-[#f0fdf4] border border-green-200 rounded-lg group hover:bg-green-50 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-green-800">Import all contacts in bulk via CSV</span>
                </div>
                <span className="bg-green-600 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">New</span>
             </button>

             {/* Form */}
             <div className="space-y-4">
                <div>
                   <label className="block text-xs font-bold text-gray-700 mb-2">
                     Contact Name <span className="text-red-500">*</span>
                   </label>
                   <input 
                     type="text" 
                     value={name}
                     onChange={(e) => setName(e.target.value)}
                     placeholder="e.g. Rajesh, Vivek, Saif, John"
                     className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                   />
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-700 mb-2">
                     Mobile Number(Optional)
                   </label>
                   <div className="flex rounded-md shadow-sm">
                      <div className="flex items-center px-3 border border-r-0 border-gray-300 rounded-l-md bg-gray-50">
                         <span className="text-xl">🇧🇩</span>
                         <span className="ml-2 text-gray-500 text-sm">▼</span>
                      </div>
                      <input 
                        type="text" 
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="e.g. 8772321230"
                        className="flex-1 min-w-0 block w-full px-3 py-2.5 rounded-none rounded-r-md border border-gray-300 text-sm focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
                      />
                   </div>
                </div>

                <div>
                   <label className="block text-xs font-medium text-gray-700 mb-2">
                     Contact Type
                   </label>
                   <div className="flex p-1 bg-gray-100 rounded-lg">
                      <button 
                        onClick={() => setType('Customer')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'Customer' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Customer
                      </button>
                      <button 
                        onClick={() => setType('Supplier')}
                        className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${type === 'Supplier' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        Supplier
                      </button>
                   </div>
                </div>
             </div>
          </div>

          <div className="p-6 pt-2">
            <Button fullWidth onClick={handleSave} disabled={!name.trim()}>
                Save
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};
