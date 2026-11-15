// src/features/budgets/BudgetView.tsx
import React, { useState, useEffect } from 'react';
import { Plus, PieChart, AlertCircle, Edit2, Trash2 } from 'lucide-react';
import { financeApi } from '../../api/finance.api';
import { Budget } from '../../types';
import { BudgetModal } from './BudgetModal';
import { BudgetProgressBar } from '../../components/charts/BudgetProgressBar';
import { useAuth } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';

export const BudgetView: React.FC = () => {
  const { currency } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Budget | null>(null);

  const loadBudgets = async () => {
    try {
      const res = await financeApi.getBudgets();
      if (res.success && res.data) {
        setBudgets(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this budget limit?')) {
      const res = await financeApi.deleteBudget(id);
      if (res.success) {
        setBudgets((prev) => prev.filter((b) => b._id !== id));
      }
    }
  };

  const totalBudgetLimit = budgets.reduce((acc, curr) => acc + curr.monthlyLimit, 0);
  const totalBudgetUsed = budgets.reduce((acc, curr) => acc + curr.usedAmount, 0);
  const overallPercentage = totalBudgetLimit > 0 ? Math.round((totalBudgetUsed / totalBudgetLimit) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Budget Management</h2>
          <p className="text-xs text-slate-500">Establish and monitor spending limits per category for the current month.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Category Budget
        </button>
      </div>

      {/* Aggregate Banner */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Overall Monthly Budget Pool</span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalBudgetUsed, currency)}{' '}
                <span className="text-sm font-normal text-slate-400">/ {formatCurrency(totalBudgetLimit, currency)}</span>
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 tabular-nums">{overallPercentage}% Allocated Used</span>
            <p className="text-[11px] text-slate-400">
              {formatCurrency(Math.max(0, totalBudgetLimit - totalBudgetUsed), currency)} overall remaining
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            className={`h-full rounded-full transition-all duration-500 ${
              overallPercentage >= 100 ? 'bg-rose-500' : overallPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
          />
        </div>
      </div>

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading budget allocations...</div>
        ) : budgets.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/80 rounded-xl p-12 text-center text-xs text-slate-400">
            No category budgets established yet. Click &ldquo;Add Category Budget&rdquo; above to set your first limit.
          </div>
        ) : (
          budgets.map((b) => (
            <div
              key={b._id}
              className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900">{b.category}</span>
                    {b.isOverBudget && (
                      <span className="flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-sm">
                        <AlertCircle className="w-3 h-3" /> Exceeded
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(b);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Limit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Budget"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-4">
                  <BudgetProgressBar
                    category={b.category}
                    monthlyLimit={b.monthlyLimit}
                    usedAmount={b.usedAmount}
                    currency={currency}
                    showDetails={true}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadBudgets}
        editItem={editingItem}
      />
    </div>
  );
};
