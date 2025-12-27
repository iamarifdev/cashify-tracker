import { BusinessSummary } from '@/types';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';
import { useBusinessStats } from '../api/business.query';

interface BusinessTableProps {
  businesses: BusinessSummary[];
  onSelect?: (business: BusinessSummary) => void;
  onEdit?: (business: BusinessSummary) => void;
  onDelete?: (businessId: string) => void;
}

export function BusinessTable({ businesses, onSelect, onEdit, onDelete }: BusinessTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false }
  ]);

  const columns = useMemo<ColumnDef<BusinessSummary>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Business Name',
        cell: ({ row }) => (
          <div className="text-sm font-medium text-gray-900">
            {row.getValue('name')}
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Your Role',
        cell: ({ row }) => {
          const role = row.getValue('role') as string;
          return (
            <span
              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold leading-5 ${
                role === 'Owner'
                  ? 'bg-purple-100 text-purple-800'
                  : role === 'Editor'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role}
            </span>
          );
        },
      },
      {
        id: 'stats',
        header: 'Books',
        cell: ({ row }) => {
          const business = row.original;
          const { data: stats } = useBusinessStats(business.id);

          if (!stats) {
            return <div className="text-sm text-gray-500">Loading...</div>;
          }

          return (
            <div className="text-sm text-gray-900">
              {stats.totalBooks} book{stats.totalBooks !== 1 ? 's' : ''}
            </div>
          );
        },
      },
      {
        id: 'balance',
        header: 'Net Balance',
        cell: ({ row }) => {
          const business = row.original;
          const { data: stats } = useBusinessStats(business.id);

          if (!stats) {
            return <div className="text-sm text-gray-500">-</div>;
          }

          return (
            <div className={`text-sm font-medium ${
              stats.totalBalance >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₹{Math.abs(stats.totalBalance).toLocaleString('en-IN')}
              {stats.totalBalance < 0 && ' (dr)'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const business = row.original;
          return (
            <div className="flex space-x-2">
              {onSelect && (
                <button
                  onClick={() => onSelect(business)}
                  className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                >
                  Open
                </button>
              )}
              {onEdit && business.role === 'Owner' && (
                <button
                  onClick={() => onEdit(business)}
                  className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                >
                  Edit
                </button>
              )}
              {onDelete && business.role === 'Owner' && (
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
                      onDelete(business.id);
                    }
                  }}
                  className="text-red-600 hover:text-red-900 text-sm font-medium"
                >
                  Delete
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onSelect, onEdit, onDelete]
  );

  const table = useReactTable({
    data: businesses,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
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
                No businesses found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => onSelect?.(row.original)}>
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
  );
}