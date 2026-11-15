// src/features/goals/ContributeModal.tsx
import React, { useState } from 'react';
import { Modal } from '../../components/ui/Modal';
import { financeApi } from '../../api/finance.api';
import { SavingsGoal } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: SavingsGoal | null;
  currency?: string;
}

export const ContributeModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSuccess,
  goal,
  currency = 'USD',
}) => {
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!goal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const num = parseFloat(amount);
    if (isNaN(num) || num <= 0) {
      setError('Contribution amount must be greater than zero.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await financeApi.contributeToGoal(goal._id, num);
      if (!res.success) throw new Error(res.message);
      setAmount('');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Contribution failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contribute to: ${goal.name}`}
      description="Deposit savings towards reaching this milestone target."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
          <div className="flex justify-between text-slate-500">
            <span>Target Goal:</span>
            <span className="font-semibold text-slate-800">{formatCurrency(goal.targetAmount, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Currently Saved:</span>
            <span className="font-semibold text-emerald-600">{formatCurrency(goal.currentAmount, currency)}</span>
          </div>
          <div className="flex justify-between text-slate-500">
            <span>Remaining to Milestone:</span>
            <span className="font-semibold text-slate-800">{formatCurrency(goal.remainingAmount, currency)}</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">Deposit Amount</label>
          <input
            type="number"
            step="1"
            min="1"
            required
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 250"
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
            {isSubmitting ? 'Processing...' : 'Deposit Contribution'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
