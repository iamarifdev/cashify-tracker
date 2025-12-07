import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { useState, useMemo } from 'react';
import { Transaction } from '@/types';
import { TransactionType } from '@/types';
import { format } from 'date-fns';
import { useDeleteTransaction } from '../api/transaction.query';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
  onView?: (transaction: Transaction) => void;
}

export function TransactionTable({ transactions, onEdit, onView }: TransactionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'date', desc: true },
    { id: 'time', desc: true }
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const deleteTransaction = useDeleteTransaction();

  const columns = useMemo<ColumnDef<Transaction>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Date',
        cell: ({ row }) => {
          const date = new Date(row.getValue('date'));
          return <div>{format(date, 'dd MMM yyyy')}</div>;
        },
        sortingFn: 'datetime',
      },
      {
        accessorKey: 'time',
        header: 'Time',
        cell: ({ row }) => <div>{row.getValue('time')}</div>,
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => {
          const type = row.getValue('type') as TransactionType;
          return (
            <span
              className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                type === TransactionType.CASH_IN
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {type.replace('_', ' ')}
            </span>
          );
        },
      },
      {
        accessorKey: 'details',
        header: 'Details',
        cell: ({ row }) => <div className="max-w-xs truncate">{row.getValue('details')}</div>,
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ row }) => <div>{row.getValue('category')}</div>,
      },
      {
        accessorKey: 'paymentMode',
        header: 'Payment Mode',
        cell: ({ row }) => <div>{row.getValue('paymentMode')}</div>,
      },
      {
        accessorKey: 'contactName',
        header: 'Contact',
        cell: ({ row }) => (
          <div>{row.getValue('contactName') || '-'}</div>
        ),
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
          const amount = row.getValue('amount') as number;
          const type = row.original.type;
          return (
            <div className={`text-right font-medium ${
              type === TransactionType.CASH_IN ? 'text-green-600' : 'text-red-600'
            }`}>
              {type === TransactionType.CASH_IN ? '+' : '-'}₹{amount.toLocaleString('en-IN')}
            </div>
          );
        },
      },
      {
        accessorKey: 'balanceAfter',
        header: 'Balance After',
        cell: ({ row }) => {
          const balance = row.getValue('balanceAfter') as number;
          return (
            <div className="text-right text-gray-600">
              ₹{balance.toLocaleString('en-IN')}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const transaction = row.original;
          return (
            <div className="flex space-x-2">
              {onView && (
                <button
                  onClick={() => onView(transaction)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  View
                </button>
              )}
              {onEdit && (
                <button
                  onClick={() => onEdit(transaction)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
              )}
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this transaction?')) {
                    deleteTransaction.mutate({
                      id: transaction.id,
                      bookId: transaction.bookId
                    });
                  }
                }}
                className="text-red-600 hover:text-red-900 text-sm font-medium"
                disabled={deleteTransaction.isPending}
              >
                {deleteTransaction.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          );
        },
      },
    ],
    [onEdit, onView, deleteTransaction]
  );

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      {/* Table Filters */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <label className="sr-only" htmlFor="search-transaction">
                Search transactions
              </label>
              <input
                type="text"
                name="search-transaction"
                id="search-transaction"
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Search transactions..."
                value={(table.getColumn('details')?.getFilterValue() as string) ?? ''}
                onChange={(e) =>
                  table.getColumn('details')?.setFilterValue(e.target.value)
                }
              />
            </div>
            <div>
              <select
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                value={(table.getColumn('type')?.getFilterValue() as string) ?? ''}
                onChange={(e) =>
                  table.getColumn('type')?.setFilterValue(e.target.value || undefined)
                }
              >
                <option value="">All types</option>
                <option value="CASH_IN">Cash In</option>
                <option value="CASH_OUT">Cash Out</option>
              </select>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            Showing {table.getFilteredRowModel().rows.length} of {transactions.length} transactions
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center space-x-1">
                        <span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        {header.column.getCanSort() && (
                          <span>
                            {header.column.getIsSorted() === 'asc' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                              </svg>
                            ) : header.column.getIsSorted() === 'desc' ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-sm text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Page{' '}
              <span className="font-medium">
                {table.getState().pagination.pageIndex + 1}
              </span>{' '}
              of{' '}
              <span className="font-medium">
                {table.getPageCount()}
              </span>
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Previous</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              {table.getPageCount() > 1 && (
                <div className="flex">
                  {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                    const pageIndex = i;
                    return (
                      <button
                        key={i}
                        onClick={() => table.setPageIndex(pageIndex)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageIndex === table.getState().pagination.pageIndex
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageIndex + 1}
                      </button>
                    );
                  })}
                </div>
              )}
              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Next</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}