
import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Paperclip, Settings } from 'lucide-react';
import { Transaction, TransactionType, Contact } from '../types';
import { Button } from './ui/Button';
import { SearchableDropdown } from './ui/SearchableDropdown';
import { AddContactModal } from './AddContactModal';
import { AddItemModal } from './AddItemModal';
import { MOCK_CONTACTS } from '../services/mockData';

interface EntryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  onSave: (data: any) => void;
  initialData?: Transaction | null;
}

const DEFAULT_CATEGORIES = ['Sales', 'Expense', 'Salary', 'Rent', 'General'];
const DEFAULT_PAYMENT_MODES = ['Cash', 'Online', 'bKash'];

export const EntryDrawer: React.FC<EntryDrawerProps> = ({ isOpen, onClose, type, onSave, initialData }) => {
  const [activeType, setActiveType] = useState(type);
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Custom Select States
  const [category, setCategory] = useState<string | null>('General');
  const [paymentMode, setPaymentMode] = useState<string | null>('Cash');
  const [contactName, setContactName] = useState<string | null>(null);

  // Dynamic Lists
  const [contacts, setContacts] = useState<Contact[]>(MOCK_CONTACTS);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [paymentModes, setPaymentModes] = useState<string[]>(DEFAULT_PAYMENT_MODES);
  
  // Modal States
  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);
  const [isAddPaymentModeModalOpen, setIsAddPaymentModeModalOpen] = useState(false);

  // Reset or populate form when drawer opens or initialData changes
  useEffect(() => {
    if (isOpen) {
        if (initialData) {
            setActiveType(initialData.type);
            setAmount(initialData.amount.toString());
            setRemarks(initialData.details);
            setCategory(initialData.category || null);
            setPaymentMode(initialData.paymentMode || null);
            setContactName(initialData.contactName || null);
        } else {
            setActiveType(type);
            setAmount('');
            setRemarks('');
            setCategory('General');
            setPaymentMode('Cash');
            setContactName(null);
        }
    }
  }, [isOpen, initialData, type]);

  if (!isOpen) return null;

  const isEditMode = !!initialData;
  const isCashIn = activeType === TransactionType.CASH_IN;
  const themeColor = isCashIn ? 'green' : 'red';
  const ThemeBtnClass = isCashIn 
    ? 'bg-green-600 text-white hover:bg-green-700' 
    : 'bg-red-600 text-white hover:bg-red-700';
  
  const displayDate = initialData 
    ? new Date(initialData.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    
  const displayTime = initialData ? initialData.time : new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleSave = () => {
      onSave({ 
          id: initialData?.id,
          amount, 
          remarks,
          category: category || 'General',
          paymentMode: paymentMode || 'Cash',
          contactName: contactName,
          type: activeType,
          date: initialData?.date,
          time: initialData?.time 
      });
  };

  // Handlers for adding new items
  const handleSaveNewContact = (newContact: Contact) => {
      setContacts([newContact, ...contacts]);
      setContactName(`${newContact.name} (${newContact.type})`);
  };

  const handleSaveNewCategory = (newCategory: string) => {
      setCategories(prev => [...prev, newCategory]);
      setCategory(newCategory);
  };

  const handleSaveNewPaymentMode = (newMode: string) => {
      setPaymentModes(prev => [...prev, newMode]);
      setPaymentMode(newMode);
  };

  // Convert lists to options for Dropdown
  const contactOptions = contacts.map(c => ({
      id: c.id,
      label: `${c.name} (${c.type})`, // Showing type in label for simplicity to match screenshot selection
      subLabel: c.type
  }));

  const categoryOptions = categories.map(c => ({ id: c, label: c }));
  const paymentModeOptions = paymentModes.map(m => ({ id: m, label: m }));

  return (
    <>
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />
      
      <div className="fixed inset-y-0 right-0 max-w-md w-full flex">
        <div className="relative w-full h-full flex flex-col bg-white shadow-xl animate-slide-in">
          
          {/* Header */}
          <div className="px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {isEditMode 
                ? (isCashIn ? 'Edit Cash In Entry' : 'Edit Cash Out Entry') 
                : (isCashIn ? 'Add Cash In Entry' : 'Add Cash Out Entry')
              }
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Toggle Type */}
          <div className="px-6 py-4 flex gap-3">
             <button 
               onClick={() => setActiveType(TransactionType.CASH_IN)}
               className={`flex-1 py-2 rounded-md font-medium text-sm border transition-colors ${activeType === TransactionType.CASH_IN ? 'bg-green-600 text-white border-green-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
             >
               Cash In
             </button>
             <button 
               onClick={() => setActiveType(TransactionType.CASH_OUT)}
               className={`flex-1 py-2 rounded-md font-medium text-sm border transition-colors ${activeType === TransactionType.CASH_OUT ? 'bg-red-600 text-white border-red-600' : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'}`}
             >
               Cash Out
             </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
            
            {/* Date Time Row */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input type="text" readOnly value={displayDate} className="block w-full pl-10 border border-gray-300 rounded-md py-2 text-sm focus:ring-blue-500 focus:border-blue-500 bg-gray-50" />
                </div>
              </div>
              <div className="w-1/3">
                 <label className="block text-xs font-medium text-gray-700 mb-1">Time</label>
                 <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <button className="block w-full pl-10 border border-gray-300 rounded-md py-2 text-sm text-left bg-gray-50">{displayTime}</button>
                 </div>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className={`block w-full border border-gray-300 rounded-md py-3 px-4 text-lg font-bold focus:ring-2 focus:ring-opacity-50 outline-none ${isCashIn ? 'text-green-600 focus:ring-green-500 focus:border-green-500' : 'text-red-600 focus:ring-red-500 focus:border-red-500'}`}
              />
            </div>

            {/* Contact Name (Custom Select) */}
            <div>
               <SearchableDropdown 
                  label="Contact Name"
                  value={contactName}
                  options={contactOptions}
                  onChange={setContactName}
                  placeholder="Search or Select"
                  variant="contact"
                  onAddNew={() => setIsAddContactModalOpen(true)}
                  addNewLabel="Add New Contact"
                  showImport={true}
               />
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
              <textarea 
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter details..."
              />
            </div>

            {/* Category & Payment Mode (Custom Selects) */}
            <div className="flex gap-4">
              <div className="flex-1">
                 <SearchableDropdown 
                    label="Category"
                    value={category}
                    options={categoryOptions}
                    onChange={setCategory}
                    placeholder="Select"
                    onAddNew={() => setIsAddCategoryModalOpen(true)}
                    addNewLabel="Add New Category"
                 />
              </div>
              <div className="flex-1">
                 <SearchableDropdown 
                    label="Payment Mode"
                    value={paymentMode}
                    options={paymentModeOptions}
                    onChange={setPaymentMode}
                    placeholder="Select"
                    onAddNew={() => setIsAddPaymentModeModalOpen(true)}
                    addNewLabel="Add New Payment Mode"
                 />
              </div>
            </div>

            {/* Attachments */}
            <div>
              <button className="flex items-center gap-2 text-blue-600 border border-blue-200 bg-blue-50 px-4 py-2 rounded-md text-sm hover:bg-blue-100 transition-colors w-full justify-center border-dashed">
                <Paperclip className="w-4 h-4" />
                Attach Bills
              </button>
              <p className="text-xs text-gray-500 mt-1 text-center">Attach up to 4 images or PDF files</p>
            </div>
            
          </div>

          {/* Footer */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <button 
              onClick={handleSave}
              className={`w-full py-3 rounded-md font-bold text-white shadow-sm transition-all transform active:scale-95 ${ThemeBtnClass}`}
            >
              {isEditMode ? 'Update' : 'Save'}
            </button>
          </div>

        </div>
      </div>
    </div>

    {/* Contact Modal */}
    <AddContactModal 
        isOpen={isAddContactModalOpen}
        onClose={() => setIsAddContactModalOpen(false)}
        onSave={handleSaveNewContact}
    />

    {/* Category Modal */}
    <AddItemModal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        onSave={handleSaveNewCategory}
        title="Add New Category"
        inputLabel="Category Name"
        placeholder="e.g. Salary, EMI, Food, Travel"
    />

    {/* Payment Mode Modal */}
    <AddItemModal
        isOpen={isAddPaymentModeModalOpen}
        onClose={() => setIsAddPaymentModeModalOpen(false)}
        onSave={handleSaveNewPaymentMode}
        title="Add New Payment Mode"
        inputLabel="Payment Mode Name"
        placeholder="e.g. Net Banking, Credit Card"
    />
    </>
  );
};
