// src/features/goals/GoalModal.tsx
import React, { useState, useEffect } from 'react';
import { Modal } from '../../components/ui/Modal';
import { financeApi } from '../../api/finance.api';
import { SavingsGoal } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editItem?: SavingsGoal | null;
}

export const GoalModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, editItem }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editItem) {
      setName(editItem.name);
      setTargetAmount(String(editItem.targetAmount));
      setCurrentAmount(String(editItem.currentAmount));
      setTargetDate(new Date(editItem.targetDate).toISOString().split('T')[0]);
    } else {
      setName('');
      setTargetAmount('');
      setCurrentAmount('0');
      // Default target date 6 months in future
      const future = new Date();
      future.setMonth(future.getMonth() + 6);
      setTargetDate(future.toISOString().split('T')[0]);
    }
    setError(null);
  }, [editItem, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount || '0');

    if (isNaN(target) || target <= 0) {
      setError('Target amount must be a positive number.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (editItem) {
        const res = await financeApi.updateGoal(editItem._id, {
          name: name.trim(),
          targetAmount: target,
          currentAmount: current,
          targetDate,
        });
        if (!res.success) throw new Error(res.message);
      } else {
        const res = await financeApi.createGoal({
          name: name.trim(),
          targetAmount: target,
          currentAmount: current,
          targetDate,
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
      title={editItem ? 'Edit Savings Goal' : 'Create New Savings Goal'}
      description="Define a target financial milestone with an ambitious deadline."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Goal Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Emergency Fund, New Car, Vacation..."
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Target Amount</label>
            <input
              type="number"
              step="1"
              required
              min="1"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 10000"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg tabular-nums focus:outline-hidden focus:border-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Current Saved</label>
            <input
              type="number"
              step="1"
              min="0"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="0"
              className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg tabular-nums focus:outline-hidden focus:border-slate-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Target Completion Date</label>
          <input
            type="date"
            required
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full text-xs px-3 py-2 border border-slate-200 rounded-lg focus:outline-hidden focus:border-slate-400"
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
            {isSubmitting ? 'Saving...' : editItem ? 'Update Goal' : 'Create Goal'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
