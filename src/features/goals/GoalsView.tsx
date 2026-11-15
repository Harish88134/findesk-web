// src/features/goals/GoalsView.tsx
import React, { useState, useEffect } from 'react';
import { Plus, Target, CheckCircle2, Calendar, Coins, Edit2, Trash2 } from 'lucide-react';
import { financeApi } from '../../api/finance.api';
import { SavingsGoal } from '../../types';
import { GoalModal } from './GoalModal';
import { ContributeModal } from './ContributeModal';
import { useAuth } from '../../store/authStore';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const GoalsView: React.FC = () => {
  const { currency } = useAuth();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SavingsGoal | null>(null);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  const loadGoals = async () => {
    try {
      const res = await financeApi.getGoals();
      if (res.success && res.data) {
        setGoals(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm('Delete this savings goal?')) {
      const res = await financeApi.deleteGoal(id);
      if (res.success) {
        setGoals((prev) => prev.filter((g) => g._id !== id));
      }
    }
  };

  const totalTarget = goals.reduce((acc, curr) => acc + curr.targetAmount, 0);
  const totalSaved = goals.reduce((acc, curr) => acc + curr.currentAmount, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Savings Goals</h2>
          <p className="text-xs text-slate-500">Plan long-term wealth milestones, allocate contributions, and celebrate accomplishments.</p>
        </div>
        <button
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Create Savings Goal
        </button>
      </div>

      {/* Aggregate Savings Progress */}
      <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Aggregate Goals Target</span>
            <div className="flex items-baseline gap-3 mt-0.5">
              <h3 className="text-2xl font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalSaved, currency)}{' '}
                <span className="text-sm font-normal text-slate-400">/ {formatCurrency(totalTarget, currency)}</span>
              </h3>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-700 tabular-nums">{overallProgress}% Achieved</span>
            <p className="text-[11px] text-slate-400">
              {formatCurrency(Math.max(0, totalTarget - totalSaved), currency)} to complete all goals
            </p>
          </div>
        </div>
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            style={{ width: `${Math.min(overallProgress, 100)}%` }}
            className="h-full bg-emerald-600 rounded-full transition-all duration-500"
          />
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-xs text-slate-400">Loading savings goals...</div>
        ) : goals.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/80 rounded-xl p-12 text-center text-xs text-slate-400">
            No savings goals set yet. Click &ldquo;Create Savings Goal&rdquo; to begin tracking your financial dreams.
          </div>
        ) : (
          goals.map((g) => (
            <div
              key={g._id}
              className={`bg-white border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all ${
                g.isCompleted ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{g.name}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3" /> Target Date: {formatDate(g.targetDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(g);
                        setIsModalOpen(true);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Edit Goal"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(g._id)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                      title="Delete Goal"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Progress amounts */}
                <div className="mt-4 mb-2 flex items-baseline justify-between text-xs">
                  <span className="font-bold text-slate-900 tabular-nums">
                    {formatCurrency(g.currentAmount, currency)}
                  </span>
                  <span className="text-slate-500 tabular-nums">
                    Target: {formatCurrency(g.targetAmount, currency)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3">
                  <div
                    style={{ width: `${Math.min(g.percentage, 100)}%` }}
                    className={`h-full rounded-full transition-all duration-500 ${
                      g.isCompleted ? 'bg-emerald-500' : 'bg-blue-600'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-4">
                  <span className="tabular-nums font-semibold text-slate-700">{g.percentage}% Completed</span>
                  <span>
                    {g.isCompleted ? (
                      <span className="text-emerald-600 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Achieved!
                      </span>
                    ) : (
                      `${formatCurrency(g.remainingAmount, currency)} remaining`
                    )}
                  </span>
                </div>
              </div>

              {/* Action */}
              <button
                onClick={() => setContributeGoal(g)}
                className={`w-full py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                  g.isCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                <Coins className="w-3.5 h-3.5" />
                {g.isCompleted ? 'Add Extra Funds' : 'Deposit Funds'}
              </button>
            </div>
          ))
        )}
      </div>

      <GoalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadGoals}
        editItem={editingItem}
      />

      <ContributeModal
        isOpen={!!contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSuccess={loadGoals}
        goal={contributeGoal}
        currency={currency}
      />
    </div>
  );
};
