// src/features/income/IncomeView.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, ArrowDownLeft } from 'lucide-react';
import { financeApi } from '../../api/finance.api';
import { Income } from '../../types';
import { IncomeModal } from './IncomeModal';
import { useAuth } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INCOME_SOURCES } from '../../../server/src/constants/categories';

export const IncomeView: React.FC = () => {
  const { currency } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSource, setSelectedSource] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Income | null>(null);

  const loadIncomes = async () => {
    try {
      const res = await financeApi.getIncomes({
        source: selectedSource !== 'All' ? selectedSource : undefined,
      });
      if (res.success && res.data) {
        setIncomes(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIncomes();
  }, [selectedSource]);

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this income record?')) {
      const res = await financeApi.deleteIncome(id);
      if (res.success) {
        setIncomes((prev) => prev.filter((i) => i._id !== id));
      }
    }
  };

  const filteredIncomes = incomes.filter((i) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return i.title.toLowerCase().includes(q) || (i.notes && i.notes.toLowerCase().includes(q));
  });

  const totalIncome = filteredIncomes.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Top action strip */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Income Portfolio</h2>
          <p className="text-xs text-slate-500">Track and monitor all personal inflows and revenue streams.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Income Stream
        </button>
      </div>

      {/* Summary KPI Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Filtered Income</span>
          <h3 className="text-2xl font-bold text-slate-900 tabular-nums">{formatCurrency(totalIncome, currency)}</h3>
        </div>
        <div className="text-xs text-slate-500">
          Showing <span className="font-semibold text-slate-800 tabular-nums">{filteredIncomes.length}</span> income records
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search income title or notes..."
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
          />
        </div>

        {/* Source Select */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white"
          >
            <option value="All">All Sources</option>
            {INCOME_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Incomes Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading income records...
                  </td>
                </tr>
              ) : filteredIncomes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No income records found matching the criteria.
                  </td>
                </tr>
              ) : (
                filteredIncomes.map((inc) => (
                  <tr key={inc._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <ArrowDownLeft className="w-3.5 h-3.5" />
                        </div>
                        <span className="truncate max-w-[200px]">{inc.title}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-medium">
                      {inc.source}
                    </td>
                    <td className="py-3 px-4 text-slate-500 tabular-nums">
                      {formatDate(inc.date)}
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-[220px] truncate">
                      {inc.notes || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-600 tabular-nums">
                      +{formatCurrency(inc.amount, currency)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingItem(inc);
                            setIsModalOpen(true);
                          }}
                          className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(inc._id)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <IncomeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadIncomes}
        editItem={editingItem}
      />
    </div>
  );
};
