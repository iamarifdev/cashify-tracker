
import React, { useState, useMemo } from 'react';
import { 
  ArrowLeft, Settings, UserPlus, CloudUpload, Download, Search, Plus, Minus, 
  ChevronLeft, ChevronRight, Check, FileText, ChevronDown, Pencil, Trash2
} from 'lucide-react';
import { Book, Transaction, TransactionType } from '../types';
import { Button } from './ui/Button';
import { FilterDropdown } from './ui/FilterDropdown';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import { EntryDrawer } from './EntryDrawer';
import { EntryDetailsDrawer } from './EntryDetailsDrawer';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

// Mock constants for filters
const DURATION_OPTIONS = ['All Time', 'Today', 'Yesterday', 'This Month', 'Last Month', 'Custom'];
const TYPE_OPTIONS = [
  { id: 'all', label: 'All' },
  { id: 'in', label: 'Cash In' },
  { id: 'out', label: 'Cash Out' }
];
const PAYMENT_MODES = ['Cash', 'Online', 'bKash'];
const CATEGORIES = ['Sales', 'Expense', 'Salary', 'Rent', 'General'];
const MEMBERS = ['You', 'MD SAIFUL ISLAM', 'Md. Shoriful Islam'];

interface FilterState {
  duration: string;
  type: string;
  member: string | null;
  modes: string[];
  categories: string[];
}

const DEFAULT_FILTERS: FilterState = {
  duration: 'All Time',
  type: 'All',
  member: null,
  modes: [],
  categories: []
};

export const BookDetails: React.FC<BookDetailsProps> = ({ book, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  
  // Drawer States
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
  const [entryType, setEntryType] = useState<TransactionType>(TransactionType.CASH_IN);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Filter States
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  
  // appliedFilters: The filters actually affecting the list view
  const [appliedFilters, setAppliedFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  // tempFilters: The state inside the dropdown before clicking "Done"
  const [tempFilters, setTempFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  const [searchTerm, setSearchTerm] = useState('');

  // Handle opening/closing filters and syncing temp state
  const handleToggleFilter = (filterName: string) => {
    if (openFilter === filterName) {
      setOpenFilter(null);
    } else {
      // Sync temp filters with applied filters when opening
      setTempFilters({ ...appliedFilters });
      setOpenFilter(filterName);
    }
  };

  const handleApplyFilter = () => {
    setAppliedFilters({ ...tempFilters });
    setOpenFilter(null);
  };

  const handleClearFilter = (key: keyof FilterState) => {
    const newFilters = { ...appliedFilters, [key]: DEFAULT_FILTERS[key] };
    setAppliedFilters(newFilters);
    // Also update temp filters to avoid stale state if immediately reopened
    setTempFilters(newFilters);
    setOpenFilter(null);
  };

  // Helper to update temp state
  const updateTempFilter = (key: keyof FilterState, value: any) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const toggleMultiSelect = (item: string, currentList: string[], key: keyof FilterState) => {
    const newList = currentList.includes(item)
      ? currentList.filter(i => i !== item)
      : [...currentList, item];
    updateTempFilter(key, newList);
  };

  // Derived State: Filtered Transactions based on APPLIED filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // 1. Search Term
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          tx.details.toLowerCase().includes(term) || 
          tx.amount.toString().includes(term) ||
          (tx.category && tx.category.toLowerCase().includes(term));
        if (!matches) return false;
      }

      // 2. Type Filter
      if (appliedFilters.type !== 'All') {
        const requiredType = appliedFilters.type === 'Cash In' ? TransactionType.CASH_IN : TransactionType.CASH_OUT;
        if (tx.type !== requiredType) return false;
      }

      // 3. Payment Modes
      if (appliedFilters.modes.length > 0) {
        if (!appliedFilters.modes.includes(tx.paymentMode)) return false;
      }

      // 4. Categories
      if (appliedFilters.categories.length > 0) {
        if (!appliedFilters.categories.includes(tx.category)) return false;
      }

      // 5. Members
      if (appliedFilters.member && appliedFilters.member !== 'All') {
        // Checking both createdBy (typical) or contactName
        if (tx.createdBy !== appliedFilters.member && tx.contactName !== appliedFilters.member) return false;
      }

      // 6. Duration
      if (appliedFilters.duration !== 'All Time') {
        const txDate = new Date(tx.date);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        if (appliedFilters.duration === 'Today') {
            if (txDate < startOfToday) return false;
        } else if (appliedFilters.duration === 'Yesterday') {
            const startOfYesterday = new Date(startOfToday);
            startOfYesterday.setDate(startOfYesterday.getDate() - 1);
            if (txDate < startOfYesterday || txDate >= startOfToday) return false;
        } else if (appliedFilters.duration === 'This Month') {
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (txDate < startOfMonth) return false;
        } else if (appliedFilters.duration === 'Last Month') {
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            if (txDate < startOfLastMonth || txDate >= startOfThisMonth) return false;
        }
      }

      return true;
    });
  }, [transactions, searchTerm, appliedFilters]);

  // Derived State: Summary Calculations based on Filtered View
  const summary = useMemo(() => {
    const cashIn = filteredTransactions
      .filter(t => t.type === TransactionType.CASH_IN)
      .reduce((sum, t) => sum + t.amount, 0);
    const cashOut = filteredTransactions
      .filter(t => t.type === TransactionType.CASH_OUT)
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      cashIn,
      cashOut,
      net: cashIn - cashOut
    };
  }, [filteredTransactions]);

  const handleOpenEntryDrawer = (type: TransactionType) => {
    setEntryType(type);
    setIsEntryDrawerOpen(true);
  };

  const handleSaveTransaction = (newTx: Partial<Transaction>) => {
    const type = entryType;
    const amount = Number(newTx.amount) || 0;
    
    // In a real app, balanceAfter needs to be recalculated for all subsequent transactions
    // For mock, we just prepend and use a simple running calc logic or backend logic
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: book.id,
      type: type,
      date: newTx.date || new Date().toISOString(),
      time: newTx.time || '12:00',
      amount: amount,
      details: newTx.details || '',
      category: newTx.category || 'General',
      paymentMode: newTx.paymentMode || 'Cash',
      balanceAfter: (transactions[0]?.balanceAfter || 0) + (type === TransactionType.CASH_IN ? amount : -amount),
      attachments: [],
      createdBy: 'You'
    };
    setTransactions([tx, ...transactions]);
    setIsEntryDrawerOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
        setTransactions(prev => prev.filter(t => t.id !== id));
        if (selectedTransaction?.id === id) {
            setSelectedTransaction(null);
        }
    }
  };

  const formatCurrency = (val: number) => Math.abs(val).toLocaleString();

  // Helper UI Components
  const FilterFooter = ({ onClear, onDone }: { onClear: () => void, onDone: () => void }) => (
    <div className="grid grid-cols-2 gap-3 p-3 border-t border-gray-100 bg-gray-50">
      <button 
        onClick={(e) => { e.stopPropagation(); onClear(); }}
        className="flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
      >
        Clear
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onDone(); }}
        className="flex items-center justify-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors shadow-sm"
      >
        Done
      </button>
    </div>
  );

  const FilterSearch = ({ placeholder }: { placeholder: string }) => (
    <div className="p-2 border-b border-gray-100">
       <input 
        type="text" 
        placeholder={placeholder}
        className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:border-blue-500"
        onClick={(e) => e.stopPropagation()}
       />
    </div>
  );

  const RadioItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex items-center w-full px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${checked ? 'bg-blue-50' : ''}`}
    >
      <div className={`flex items-center justify-center w-4 h-4 rounded-full border mr-3 flex-shrink-0 transition-colors ${checked ? 'border-blue-600' : 'border-gray-400'}`}>
          {checked && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
      </div>
      <span className={`text-sm ${checked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
  );

  const CheckboxItem = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <div 
      onClick={(e) => {
        e.stopPropagation();
        onChange();
      }}
      className={`flex items-center w-full px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors ${checked ? 'bg-blue-50' : ''}`}
    >
      <div className={`flex items-center justify-center w-4 h-4 rounded border mr-3 flex-shrink-0 transition-colors ${checked ? 'bg-blue-600 border-blue-600' : 'border-gray-400 bg-white'}`}>
          {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className={`text-sm ${checked ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
        {label}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="hover:bg-gray-100 rounded-full p-1 -ml-1 text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              {book.name}
              <Settings className="w-4 h-4 text-blue-600 cursor-pointer hover:text-blue-800" />
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button className="text-blue-600 hover:bg-blue-50 p-1 rounded-md">
                <UserPlus className="w-5 h-5" />
              </button>
            </h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm" className="gap-2 hidden md:inline-flex text-blue-600 border-blue-200 hover:bg-blue-50">
             <CloudUpload className="w-4 h-4" /> Add Bulk Entries
           </Button>
           <Button variant="secondary" size="sm" className="gap-2 text-blue-600 border-blue-200 bg-white hover:bg-blue-50">
             <Download className="w-4 h-4" /> Reports
           </Button>
        </div>
      </div>

      {/* Filters & Actions Section */}
      <div className="bg-white px-4 lg:px-6 py-4 border-b border-gray-200">
        
        {/* Filter Row */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Duration Filter */}
          <FilterDropdown 
            label={`Duration: ${appliedFilters.duration}`} 
            isOpen={openFilter === 'duration'} 
            onToggle={() => handleToggleFilter('duration')}
            onClose={() => setOpenFilter(null)}
            width="w-56"
          >
            <div className="py-2">
              {DURATION_OPTIONS.map(opt => (
                <RadioItem 
                  key={opt}
                  label={opt}
                  checked={tempFilters.duration === opt}
                  onChange={() => updateTempFilter('duration', opt)}
                />
              ))}
            </div>
            <FilterFooter 
                onClear={() => handleClearFilter('duration')} 
                onDone={handleApplyFilter} 
            />
          </FilterDropdown>

          {/* Types Filter */}
          <FilterDropdown 
            label={`Types: ${appliedFilters.type}`} 
            active={appliedFilters.type !== 'All'}
            isOpen={openFilter === 'types'} 
            onToggle={() => handleToggleFilter('types')}
            onClose={() => setOpenFilter(null)}
            width="w-48"
          >
            <div className="py-2">
              {TYPE_OPTIONS.map(opt => (
                <RadioItem 
                  key={opt.id}
                  label={opt.label}
                  checked={tempFilters.type === opt.label}
                  onChange={() => updateTempFilter('type', opt.label)}
                />
              ))}
            </div>
            <FilterFooter 
                onClear={() => handleClearFilter('type')} 
                onDone={handleApplyFilter} 
            />
          </FilterDropdown>

          {/* Contacts Filter */}
          <FilterDropdown 
            label={`Contacts: All`} 
            isOpen={openFilter === 'contacts'} 
            onToggle={() => handleToggleFilter('contacts')}
            onClose={() => setOpenFilter(null)}
          >
             <div className="p-4 text-center">
                <p className="text-sm font-bold text-gray-900 mb-1">No Contact Added!</p>
                <p className="text-xs text-gray-500 mb-3">You can add Contacts for this book from <span className="text-blue-600 cursor-pointer">book settings page</span>.</p>
                <button onClick={() => setOpenFilter(null)} className="text-xs bg-blue-600 text-white px-3 py-1 rounded">Ok, Got it</button>
             </div>
          </FilterDropdown>

          {/* Members Filter */}
          <FilterDropdown 
            label={`Members: ${appliedFilters.member ? appliedFilters.member : 'All'}`} 
            isOpen={openFilter === 'members'} 
            onToggle={() => handleToggleFilter('members')}
            onClose={() => setOpenFilter(null)}
            width="w-64"
          >
            <FilterSearch placeholder="Search Members" />
            <div className="max-h-56 overflow-y-auto py-2">
              {MEMBERS.map(member => (
                <RadioItem 
                  key={member}
                  label={member}
                  checked={tempFilters.member === member}
                  onChange={() => updateTempFilter('member', member)}
                />
              ))}
            </div>
            <FilterFooter 
                onClear={() => handleClearFilter('member')} 
                onDone={handleApplyFilter} 
            />
          </FilterDropdown>

           {/* Payment Modes Filter */}
           <FilterDropdown 
            label={`Payment Modes: ${appliedFilters.modes.length ? appliedFilters.modes.length : 'All'}`} 
            isOpen={openFilter === 'modes'} 
            onToggle={() => handleToggleFilter('modes')}
            onClose={() => setOpenFilter(null)}
            width="w-64"
          >
            <FilterSearch placeholder="Search Payment Modes..." />
            <div className="max-h-56 overflow-y-auto py-2">
              {PAYMENT_MODES.map(mode => (
                <CheckboxItem 
                  key={mode}
                  label={mode}
                  checked={tempFilters.modes.includes(mode)}
                  onChange={() => toggleMultiSelect(mode, tempFilters.modes, 'modes')}
                />
              ))}
            </div>
            <FilterFooter 
                onClear={() => handleClearFilter('modes')} 
                onDone={handleApplyFilter} 
            />
          </FilterDropdown>

           {/* Categories Filter */}
           <FilterDropdown 
            label={`Categories: ${appliedFilters.categories.length ? appliedFilters.categories.length : 'All'}`} 
            isOpen={openFilter === 'categories'} 
            onToggle={() => handleToggleFilter('categories')}
            onClose={() => setOpenFilter(null)}
            width="w-64"
          >
            <FilterSearch placeholder="Search Categories..." />
            <div className="max-h-56 overflow-y-auto py-2">
              {CATEGORIES.map(cat => (
                <CheckboxItem 
                  key={cat}
                  label={cat}
                  checked={tempFilters.categories.includes(cat)}
                  onChange={() => toggleMultiSelect(cat, tempFilters.categories, 'categories')}
                />
              ))}
            </div>
            <FilterFooter 
                onClear={() => handleClearFilter('categories')} 
                onDone={handleApplyFilter} 
            />
          </FilterDropdown>
        </div>

        {/* Search & Actions Row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-sm h-[40px]" 
              placeholder="Search by remark or amount..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
              onClick={() => handleOpenEntryDrawer(TransactionType.CASH_IN)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#059669] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#047857] transition-colors shadow-sm whitespace-nowrap h-[40px]"
             >
               <Plus className="w-4 h-4" /> Cash In
             </button>
             <button 
               onClick={() => handleOpenEntryDrawer(TransactionType.CASH_OUT)}
               className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-[#dc2626] text-white px-6 py-2.5 rounded font-bold text-sm hover:bg-[#b91c1c] transition-colors shadow-sm whitespace-nowrap h-[40px]"
             >
               <Minus className="w-4 h-4" /> Cash Out
             </button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="px-4 lg:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 border border-gray-200 rounded bg-white overflow-hidden shadow-sm">
           <div className="flex items-center gap-4 p-4 border-r border-gray-100 last:border-0 relative overflow-hidden group">
             <div className="p-2 bg-emerald-50 rounded-full text-[#059669]">
               <Plus className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-semibold mb-0.5">Cash In</p>
               <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.cashIn)}</p>
             </div>
           </div>
           
           <div className="flex items-center gap-4 p-4 border-r border-gray-100 last:border-0 relative overflow-hidden group">
             <div className="p-2 bg-red-50 rounded-full text-[#dc2626]">
               <Minus className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-semibold mb-0.5">Cash Out</p>
               <p className="text-xl font-bold text-gray-900">{formatCurrency(summary.cashOut)}</p>
             </div>
           </div>

           <div className="flex items-center gap-4 p-4 relative overflow-hidden group bg-blue-50/30">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600">
               <FileText className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-semibold mb-0.5">Net Balance</p>
               <p className={`text-xl font-bold ${summary.net >= 0 ? 'text-gray-900' : 'text-gray-900'}`}>
                 {summary.net < 0 ? '-' : ''}{formatCurrency(summary.net)}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="flex-1 overflow-auto bg-gray-50 px-4 lg:px-6 pb-4">
        <div className="bg-white rounded border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-600 bg-gray-50 border-b border-gray-200 font-semibold">
                <tr>
                  <th scope="col" className="p-4 w-4">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  </th>
                  <th scope="col" className="px-6 py-3 whitespace-nowrap">Date & Time</th>
                  <th scope="col" className="px-6 py-3 whitespace-nowrap">Details</th>
                  <th scope="col" className="px-6 py-3 whitespace-nowrap">Category</th>
                  <th scope="col" className="px-6 py-3 whitespace-nowrap text-center">Mode</th>
                  <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Amount</th>
                  <th scope="col" className="px-6 py-3 text-right whitespace-nowrap">Balance</th>
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.length > 0 ? (
                  filteredTransactions.map((tx) => {
                    const isCashOut = tx.type === TransactionType.CASH_OUT;
                    const amountColor = isCashOut ? 'text-[#dc2626]' : 'text-[#059669]'; 
                    
                    return (
                      <tr 
                        key={tx.id} 
                        onClick={() => setSelectedTransaction(tx)}
                        className="bg-white border-b hover:bg-gray-50 transition-colors group cursor-pointer"
                      >
                        <td className="w-4 p-4" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-semibold text-gray-900">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          <div className="text-xs text-gray-400 mt-0.5">{tx.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 line-clamp-2">{tx.details}</div>
                          <div className="text-xs text-gray-400 mt-0.5">by {tx.createdBy}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded border border-gray-200">
                            {tx.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-700">{tx.paymentMode}</td>
                        <td className={`px-6 py-4 text-right font-bold ${amountColor} whitespace-nowrap`}>
                          {Math.abs(tx.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-right whitespace-nowrap relative">
                          <span className="font-semibold text-gray-900 block">{formatCurrency(tx.balanceAfter)}</span>
                          
                          <div className="hidden group-hover:flex items-center gap-1 absolute right-2 top-1/2 -translate-y-1/2 bg-gray-50 pl-2 shadow-sm border border-gray-100 rounded py-0.5 z-10 bg-white">
                              <button 
                                  onClick={(e) => { 
                                      e.stopPropagation(); 
                                      // Edit logic placeholder
                                  }}
                                  className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                                  title="Edit"
                              >
                                  <Pencil className="w-4 h-4" />
                              </button>
                              <button 
                                  onClick={(e) => { 
                                      e.stopPropagation();
                                      handleDeleteTransaction(tx.id);
                                  }}
                                  className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                                  title="Delete"
                              >
                                  <Trash2 className="w-4 h-4" />
                              </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-500">
                       No transactions found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-end p-3 border-t border-gray-200 bg-white gap-2">
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-600">Page</span>
               <select className="border-gray-300 text-sm rounded py-1 px-2 focus:ring-blue-500 focus:border-blue-500">
                 <option>1</option>
               </select>
               <span className="text-sm text-gray-600">of 1</span>
             </div>
             <div className="flex gap-1 ml-4">
                <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-500 disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="p-1.5 border border-gray-300 rounded hover:bg-gray-50 text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      </div>
      
      {/* Create Transaction Drawer */}
      <EntryDrawer 
        isOpen={isEntryDrawerOpen} 
        onClose={() => setIsEntryDrawerOpen(false)}
        type={entryType}
        onSave={handleSaveTransaction}
      />

      {/* View Transaction Details Drawer */}
      <EntryDetailsDrawer
        transaction={selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        onDelete={handleDeleteTransaction}
      />
    </div>
  );
};
