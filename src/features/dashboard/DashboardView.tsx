// src/features/dashboard/DashboardView.tsx
import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  AlertTriangle,
  Target,
} from 'lucide-react';
import { MetricCard } from '../../components/ui/MetricCard';
import { CashFlowChart } from '../../components/charts/CashFlowChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { BudgetProgressBar } from '../../components/charts/BudgetProgressBar';
import { financeApi } from '../../api/finance.api';
import { DashboardAnalytics } from '../../types';
import { useAuth } from '../../store/authStore';
import { AIAdvisorCard } from '../../components/ai/AIAdvisorCard';
import { formatCurrency, formatShortDate } from '../../utils/formatters';

interface Props {
  onNavigateTab: (tab: any) => void;
  onOpenQuickModal: () => void;
}

export const DashboardView: React.FC<Props> = ({ onNavigateTab, onOpenQuickModal }) => {
  const { currency } = useAuth();
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await financeApi.getDashboardAnalytics();
      if (res.success && res.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200/70 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-slate-200/70 rounded-xl" />
          <div className="h-72 bg-slate-200/70 rounded-xl" />
        </div>
      </div>
    );
  }

  const data = analytics || {
    totalIncome: 0,
    totalExpense: 0,
    totalSavings: 0,
    currentBalance: 0,
    savingsRate: 0,
    monthlyExpenseTrend: [],
    monthlyIncomeTrend: [],
    categoryBreakdown: [],
    budgetUtilization: [],
    recentTransactions: [],
  };

  // Merge monthly trends for cash flow chart
  const monthlyCashFlow = data.monthlyExpenseTrend.map((expItem, idx) => {
    const incItem = data.monthlyIncomeTrend[idx] || { amount: 0 };
    return {
      month: expItem.month,
      income: incItem.amount,
      expense: expItem.amount,
    };
  });

  return (
    <div className="space-y-6">
      {/* Real-time AI Financial Intelligence Advisor */}
      <AIAdvisorCard />

      {/* 4 Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Current Balance"
          value={formatCurrency(data.currentBalance, currency)}
          subtitle="Net available capital"
          icon={Wallet}
          accentColor="blue"
        />
        <MetricCard
          title="Total Income"
          value={formatCurrency(data.totalIncome, currency)}
          subtitle="All cumulative earnings"
          icon={TrendingUp}
          accentColor="emerald"
        />
        <MetricCard
          title="Total Expenses"
          value={formatCurrency(data.totalExpense, currency)}
          subtitle="All logged disbursements"
          icon={TrendingDown}
          accentColor="rose"
        />
        <MetricCard
          title="Total Savings"
          value={formatCurrency(data.totalSavings, currency)}
          subtitle={`Savings rate: ${data.savingsRate}%`}
          icon={PiggyBank}
          accentColor="amber"
        />
      </div>

      {/* Main Charts Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Cash Flow Comparison */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Cash Flow Trajectory</h3>
              <p className="text-xs text-slate-500">Monthly Income vs. Expense Comparison</p>
            </div>
            <button
              onClick={() => onNavigateTab('analytics')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Full Analytics <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <CashFlowChart data={monthlyCashFlow} currency={currency} />
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Spending by Category</h3>
              <p className="text-xs text-slate-500">Relative allocation of expenses</p>
            </div>
          </div>
          <CategoryPieChart data={data.categoryBreakdown} currency={currency} />
        </div>
      </div>

      {/* Secondary Row: Budget Utilization & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Budget Utilization */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Budget Utilization</h3>
              <p className="text-xs text-slate-500">Current calendar month limit thresholds</p>
            </div>
            <button
              onClick={() => onNavigateTab('budgets')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              Manage Budgets <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.budgetUtilization.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No active category budgets set. Click &ldquo;Manage Budgets&rdquo; to establish limits.
            </div>
          ) : (
            <div className="space-y-4">
              {data.budgetUtilization.slice(0, 4).map((b) => (
                <BudgetProgressBar
                  key={b.category}
                  category={b.category}
                  monthlyLimit={b.monthlyLimit}
                  usedAmount={b.usedAmount}
                  currency={currency}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent Ledger Transactions */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent Transactions</h3>
              <p className="text-xs text-slate-500">Latest recorded ledger entries</p>
            </div>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              All Records <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {data.recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No transactions recorded yet.{' '}
              <button
                onClick={onOpenQuickModal}
                className="text-emerald-600 underline font-semibold ml-1"
              >
                Log your first transaction
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {data.recentTransactions.map((tx) => (
                <div key={tx._id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'income'
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">{tx.title}</p>
                      <p className="text-[11px] text-slate-400">
                        {tx.categoryOrSource} · {formatShortDate(tx.date)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold tabular-nums shrink-0 ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatCurrency(tx.amount, currency)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
