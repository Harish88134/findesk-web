// src/features/income/IncomeModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { financeApi } from '../../api/finance.api';
import { Income } from '../../types';
import { INCOME_SOURCES } from '../../../server/src/constants/categories';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: Income | null;
}

export const IncomeModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, editItem }) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState<string>('Salary');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setTitle(editItem.title);
      setAmount(String(editItem.amount));
      setSource(editItem.source);
      setDate(new Date(editItem.date).toISOString().split('T')[0]);
      setNotes(editItem.notes || '');
    } else {
      setTitle('');
      setAmount('');
      setSource('Salary');
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
    setError(null);
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please provide a positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem) {
        const res = await financeApi.updateIncome(editItem._id, {
          title: title.trim(),
          amount: numAmount,
          source: source as any,
          date,
          notes: notes.trim(),
        });
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await financeApi.createIncome({
          title: title.trim(),
          amount: numAmount,
          source: source as any,
          date,
          notes: notes.trim(),
        });
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
      title={editItem ? 'Edit Income Entry' : 'Log New Income'}
      description="Record an income stream with source categorization and date."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Income Title</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Monthly Salary, Freelance milestone..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Amount</label>
            <input
              type="number"
              step="0.01"
              required
              min="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg tabular-nums focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Income Source</label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 bg-white"
          >
            {INCOME_SOURCES.map((src) => (
              <option key={src} value={src}>
                {src}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Notes (Optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Additional context or contract details..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400 resize-none"
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
            {isSubmitting ? 'Saving...' : editItem ? 'Update Income' : 'Create Income'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
