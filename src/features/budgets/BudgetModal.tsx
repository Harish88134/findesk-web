// src/features/budgets/BudgetModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { financeApi } from '../../api/finance.api';
import { Budget } from '../../types';
import { EXPENSE_CATEGORIES } from '../../../server/src/constants/categories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: Budget | null;
}

export const BudgetModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, editItem }) => {
  const [category, setCategory] = useState<string>('Food');
  const [monthlyLimit, setMonthlyLimit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setCategory(editItem.category);
      setMonthlyLimit(String(editItem.monthlyLimit));
    } else {
      setCategory('Food');
      setMonthlyLimit('');
    }
    setError(null);
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const limit = parseFloat(monthlyLimit);
    if (isNaN(limit) || limit <= 0) {
      setError('Please provide a valid monthly limit greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem) {
        const res = await financeApi.updateBudget(editItem._id, { monthlyLimit: limit });
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await financeApi.createBudget({ category: category as any, monthlyLimit: limit });
        if (!res.success) throw new Error(res.message);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editItem ? `Update Budget: ${editItem.category}` : 'Set Category Budget'}
      description="Define monthly spending thresholds to receive proactive alerts before exceeding limits."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
          <select
            value={category}
            disabled={!!editItem}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white disabled:bg-slate-50"
          >
            {EXPENSE_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Monthly Spending Limit</label>
          <input
            type="number"
            step="1"
            min="1"
            required
            value={monthlyLimit}
            onChange={(e) => setMonthlyLimit(e.target.value)}
            placeholder="e.g. 500"
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg tabular-nums focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : editItem ? 'Update Limit' : 'Set Budget'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
