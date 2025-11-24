import React, { useState } from 'react';
import { ArrowLeft, Settings, UserPlus, FileText, Download, Filter, Search, Plus, Minus, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Book, Transaction, TransactionType } from '../types';
import { Button } from './ui/Button';
import { MOCK_TRANSACTIONS } from '../services/mockData';
import { EntryDrawer } from './EntryDrawer';

interface BookDetailsProps {
  book: Book;
  onBack: () => void;
}

export const BookDetails: React.FC<BookDetailsProps> = ({ book, onBack }) => {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isEntryDrawerOpen, setIsEntryDrawerOpen] = useState(false);
  const [entryType, setEntryType] = useState<TransactionType>(TransactionType.CASH_IN);
  const [filterType, setFilterType] = useState<'All' | 'Cash In' | 'Cash Out'>('All');

  const handleOpenDrawer = (type: TransactionType) => {
    setEntryType(type);
    setIsEntryDrawerOpen(true);
  };

  const handleSaveTransaction = (newTx: Partial<Transaction>) => {
    const tx: Transaction = {
      id: Math.random().toString(36).substr(2, 9),
      bookId: book.id,
      date: newTx.date || new Date().toISOString(),
      time: newTx.time || '12:00',
      amount: newTx.amount || 0,
      details: newTx.details || '',
      category: newTx.category || 'General',
      paymentMode: newTx.paymentMode || 'Cash',
      balanceAfter: (transactions[0]?.balanceAfter || 0) + (entryType === TransactionType.CASH_IN ? (newTx.amount || 0) : -(newTx.amount || 0)),
      attachments: [],
      createdBy: 'You'
    };
    setTransactions([tx, ...transactions]);
    setIsEntryDrawerOpen(false);
  };

  // Derived stats
  const totalCashIn = transactions.reduce((sum, t) => sum + (t.category === 'Sales' || t.details.includes('In') || t.amount > 0 ? t.amount : 0), 0); // Simplified logic for demo
  const totalCashOut = transactions.reduce((sum, t) => sum + (t.category === 'Expense' || t.details.includes('Out') || t.amount < 0 ? Math.abs(t.amount) : 0), 0);
  
  // Format currency
  const formatCurrency = (val: number) => Math.abs(val).toLocaleString();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              {book.name}
              <Settings className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600" />
            </h1>
          </div>
          <button className="text-blue-600 p-1.5 hover:bg-blue-50 rounded-full">
            <UserPlus className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex items-center gap-3">
           <Button variant="outline" size="sm" className="gap-2">
             <FileText className="w-4 h-4" /> Add Bulk Entries
           </Button>
           <Button variant="secondary" size="sm" className="gap-2 text-blue-600 border-blue-100 bg-blue-50">
             <Download className="w-4 h-4" /> Reports
           </Button>
        </div>
      </div>

      {/* Filters & Stats */}
      <div className="bg-white p-4 border-b border-gray-200 space-y-4">
        {/* Filter Rows */}
        <div className="flex flex-wrap items-center gap-3">
          <select className="bg-gray-50 border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2">
            <option>Duration: All Time</option>
            <option>Today</option>
            <option>Yesterday</option>
            <option>This Month</option>
          </select>

          <div className="flex border border-gray-200 rounded-md overflow-hidden">
             {['All', 'Cash In', 'Cash Out'].map(type => (
               <button 
                key={type}
                onClick={() => setFilterType(type as any)}
                className={`px-3 py-1.5 text-sm font-medium ${filterType === type ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
               >
                 {type}
               </button>
             ))}
          </div>

          {['Contacts', 'Members', 'Payment Modes', 'Categories'].map(filter => (
            <select key={filter} className="bg-white border border-gray-300 text-gray-700 text-sm rounded-md focus:ring-blue-500 focus:border-blue-500 block p-2 min-w-[100px]">
              <option>{filter}: All</option>
            </select>
          ))}
        </div>

        {/* Search & Action Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text" 
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5" 
              placeholder="Search by remark or amount..." 
            />
          </div>
          
          <div className="flex items-center gap-3">
             <button 
              onClick={() => handleOpenDrawer(TransactionType.CASH_IN)}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 font-medium transition-colors"
             >
               <Plus className="w-4 h-4" /> Cash In
             </button>
             <button 
               onClick={() => handleOpenDrawer(TransactionType.CASH_OUT)}
               className="flex items-center gap-2 bg-red-600 text-white px-4 py-2.5 rounded-md hover:bg-red-700 font-medium transition-colors"
             >
               <Minus className="w-4 h-4" /> Cash Out
             </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border border-gray-200 rounded-lg p-4 bg-white">
           <div className="flex items-center gap-3 border-r border-gray-100 last:border-0">
             <div className="p-2 bg-green-100 rounded-full text-green-600">
               <Plus className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-medium uppercase">Cash In</p>
               <p className="text-lg font-bold text-gray-900">0</p>
             </div>
           </div>
           <div className="flex items-center gap-3 border-r border-gray-100 last:border-0">
             <div className="p-2 bg-red-100 rounded-full text-red-600">
               <Minus className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-medium uppercase">Cash Out</p>
               <p className="text-lg font-bold text-gray-900">{formatCurrency(Math.abs(book.netBalance))}</p>
             </div>
           </div>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-blue-100 rounded-full text-blue-600">
               <FileText className="w-5 h-5" />
             </div>
             <div>
               <p className="text-xs text-gray-500 font-medium uppercase">Net Balance</p>
               <p className={`text-lg font-bold ${book.netBalance >= 0 ? 'text-green-600' : 'text-gray-900'}`}>
                 {book.netBalance < 0 ? '-' : ''}{formatCurrency(book.netBalance)}
               </p>
             </div>
           </div>
        </div>
      </div>

      {/* Transaction Table */}
      <div className="flex-1 overflow-auto p-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th scope="col" className="p-4 w-4">
                  <div className="flex items-center">
                    <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                  </div>
                </th>
                <th scope="col" className="px-6 py-3">Date & Time</th>
                <th scope="col" className="px-6 py-3">Details</th>
                <th scope="col" className="px-6 py-3">Category</th>
                <th scope="col" className="px-6 py-3">Mode</th>
                <th scope="col" className="px-6 py-3 text-right">Amount</th>
                <th scope="col" className="px-6 py-3 text-right">Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => {
                const isPositive = !tx.details.includes('Purchase') && !tx.details.includes('Expense') && tx.paymentMode !== 'Out';
                // Mock logic for color since data is generated randomly
                const amountColor = tx.amount > 0 ? 'text-red-600' : 'text-green-600'; // Based on screenshot, seems red is negative/cash out
                
                return (
                  <tr key={tx.id} className="bg-white border-b hover:bg-gray-50 transition-colors">
                    <td className="w-4 p-4">
                      <div className="flex items-center">
                        <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="font-medium text-gray-900">{new Date(tx.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                       <div className="text-xs text-gray-500">{tx.time}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{tx.details}</div>
                      <div className="text-xs text-gray-500">by {tx.createdBy}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded border border-gray-200">
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">{tx.paymentMode}</td>
                    <td className={`px-6 py-4 text-right font-bold ${amountColor}`}>
                      {tx.amount}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-gray-900">
                      {formatCurrency(tx.balanceAfter)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {/* Pagination */}
          <div className="flex items-center justify-end p-4 border-t border-gray-200 bg-white rounded-b-lg gap-2">
             <span className="text-sm text-gray-700 mr-2">Page 1 of 6</span>
             <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-500 disabled:opacity-50">
               <ChevronLeft className="w-4 h-4" />
             </button>
             <button className="p-2 border border-gray-300 rounded hover:bg-gray-50 text-gray-500">
               <ChevronRight className="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>
      
      {/* Slide Over / Modal */}
      <EntryDrawer 
        isOpen={isEntryDrawerOpen} 
        onClose={() => setIsEntryDrawerOpen(false)}
        type={entryType}
        onSave={handleSaveTransaction}
      />
    </div>
  );
};