// src/features/transactions/TransactionsView.tsx
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Download,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react';
import { financeApi } from '../../api/finance.api';
import { TransactionItem, PaginationMeta } from '../../types';
import { useAuth } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const TransactionsView: React.FC = () => {
  const { currency } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [type, setType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [page, setPage] = useState(1);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const res = await financeApi.getTransactions({
        type: type !== 'all' ? type : undefined,
        search: search || undefined,
        sortBy,
        sortOrder,
        page,
        limit: 10,
      });

      if (res.success && res.data) {
        setTransactions(res.data);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [type, search, sortBy, sortOrder, page]);

  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('/api/transactions/export/csv', {
        method: 'GET',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!response.ok) {
        throw new Error(`Export failed with status ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_export_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert('Error exporting CSV: ' + (err.message || 'Export failed'));
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportCsv = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;

      try {
        const res = await financeApi.importCsv(csvText);
        if (res.success) {
          alert(res.message || 'CSV imported successfully!');
          loadTransactions();
        } else {
          alert('Import failed: ' + (res.message || 'Unknown error'));
        }
      } catch (err: any) {
        alert('Import error: ' + (err.message || 'Failed to process file'));
      }
    };
    reader.readAsText(file);
    e.target.value = ''; // Reset input
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Transaction Ledger</h2>
          <p className="text-xs text-slate-500">
            Unified chronological audit trail of all financial inflows and disbursements.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0 cursor-pointer">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>
          <button
            onClick={handleExportCsv}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-xs transition-colors shrink-0 disabled:opacity-50"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>{isExporting ? 'Exporting...' : 'Export CSV Report'}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search transactions by title, category, or memo..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex p-1 bg-slate-100 rounded-lg shrink-0">
          <button
            onClick={() => {
              setType('all');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              type === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Ledger
          </button>
          <button
            onClick={() => {
              setType('income');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              type === 'income' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Incomes
          </button>
          <button
            onClick={() => {
              setType('expense');
              setPage(1);
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              type === 'expense' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Expenses
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th
                  onClick={() => toggleSort('title')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Title / Memo</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Category / Source</th>
                <th
                  onClick={() => toggleSort('date')}
                  className="py-3 px-4 cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="py-3 px-4 text-right cursor-pointer hover:text-slate-800 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    Loading transactions...
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No transactions recorded matching the filters.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            tx.type === 'income'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {tx.type === 'income' ? (
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[240px]">{tx.title}</p>
                          {tx.notes && <p className="text-[11px] text-slate-400 truncate max-w-[240px]">{tx.notes}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm capitalize ${
                          tx.type === 'income' ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {tx.categoryOrSource}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {formatDate(tx.date)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold tabular-nums ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatCurrency(tx.amount, currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Toolbar */}
        <div className="p-4 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <span className="font-semibold text-slate-900 tabular-nums">{transactions.length}</span> of{' '}
            <span className="font-semibold text-slate-900 tabular-nums">{pagination.total}</span> entries
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={!pagination.hasPrevPage}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="tabular-nums px-2 font-medium text-slate-700">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)}
            </span>
            <button
              disabled={!pagination.hasNextPage}
              onClick={() => setPage((p) => p + 1)}
              className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
