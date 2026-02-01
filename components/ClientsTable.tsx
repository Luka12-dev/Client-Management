'use client';

import { useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { ClientOverview } from '@/types/database.types';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import EditClientModal from './EditClientModal';

interface ClientsTableProps {
  clients: ClientOverview[];
}

export default function ClientsTable({ clients }: ClientsTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ]);
  const [editingClient, setEditingClient] = useState<ClientOverview | null>(null);
  const router = useRouter();

  const handleDelete = async (clientId: string, clientName: string) => {
    if (!confirm(`Are you sure you want to delete "${clientName}"? This will also delete all associated projects and tasks.`)) {
      return;
    }

    try {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      router.refresh();
    } catch (error) {
      console.error('Error deleting client:', error);
      alert('Failed to delete client. Please try again.');
    }
  };

  const columns: ColumnDef<ClientOverview>[] = [
    {
      accessorKey: 'name',
      header: 'Client Name',
      cell: (info) => (
        <div className="font-semibold text-white" style={{ fontFamily: 'Inria Sans, sans-serif' }}>{info.getValue() as string}</div>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: (info) => (
        <div className="text-gray-400" style={{ fontFamily: 'Inria Sans, sans-serif' }}>{info.getValue() as string || '-'}</div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 ${
              status === 'active'
                ? 'bg-white/20 text-white border border-white/30'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
            }`}
            style={{ fontFamily: 'Inria Sans, sans-serif' }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    },
    {
      accessorKey: 'project_count',
      header: 'Projects',
      cell: (info) => (
        <div className="text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 text-white font-semibold border border-white/20 transition-all duration-300 hover:scale-110" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            {info.getValue() as number}
          </span>
        </div>
      ),
    },
    {
      accessorKey: 'total_budget',
      header: 'Total Budget',
      cell: (info) => {
        const budget = info.getValue() as number;
        return (
          <div className="text-right font-semibold text-white" style={{ fontFamily: 'Clash Display, sans-serif' }}>
            ${budget.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        );
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date Added',
      cell: (info) => {
        const date = new Date(info.getValue() as string);
        return (
          <div className="text-gray-400 text-sm" style={{ fontFamily: 'Inria Sans, sans-serif' }}>
            {date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: (info) => {
        const client = info.row.original;
        return (
          <div className="flex gap-2 justify-end">
            <button
              onClick={() => setEditingClient(client)}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 border border-white/10"
              title="Edit client"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => handleDelete(client.id, client.name)}
              className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all duration-300 border border-red-500/20"
              title="Delete client"
            >
              <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: clients,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <>
      <div className="w-full overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-black/50">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {table.getHeaderGroups().map((headerGroup) =>
                  headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
                      onClick={header.column.getToggleSortingHandler()}
                      style={{ fontFamily: 'Inria Sans, sans-serif' }}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          <span className="text-white">
                            {header.column.getIsSorted() === 'desc' ? '↓' : '↑'}
                          </span>
                        )}
                      </div>
                    </th>
                  ))
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-12 text-center text-[#bdbdbd]"
                    style={{ fontFamily: 'Inria Sans, sans-serif' }}
                  >
                    No clients found. Add your first client to get started.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-white/5 transition-all duration-300"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-6 py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {table.getRowModel().rows.length > 0 && (
          <div className="px-6 py-4 border-t border-white/10 bg-white/5">
            <p className="text-sm text-gray-400" style={{ fontFamily: 'Inria Sans, sans-serif' }}>
              Showing <span className="font-semibold text-white">{table.getRowModel().rows.length}</span> client(s)
            </p>
          </div>
        )}
      </div>

      <EditClientModal
        isOpen={!!editingClient}
        onClose={() => setEditingClient(null)}
        onSuccess={() => {
          setEditingClient(null);
          router.refresh();
        }}
        client={editingClient}
      />
    </>
  );
}
