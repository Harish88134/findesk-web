// src/features/analytics/AnalyticsView.tsx
import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import { financeApi } from '../../api/finance.api';
import { CashFlowChart } from '../../components/charts/CashFlowChart';
import { CategoryPieChart } from '../../components/charts/CategoryPieChart';
import { useAuth } from '../../store/authStore';
import { formatCurrency } from '../../utils/formatters';

export const AnalyticsView: React.FC = () => {
  const { currency } = useAuth();
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [monthlyData, setMonthlyData] = useState<Array<{ month: string; income: number; expense: number; netCashFlow: number }>>([]);
  const [categoryData, setCategoryData] = useState<Array<{ category: string; count: number; totalAmount: number; percentage: number }>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [mRes, cRes] = await Promise.all([
          financeApi.getMonthlyAnalytics(selectedYear),
          financeApi.getCategoryAnalytics(),
        ]);

        if (mRes.success && mRes.data) setMonthlyData(mRes.data);
        if (cRes.success && cRes.data) setCategoryData(cRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  const totalYearIncome = monthlyData.reduce((acc, curr) => acc + curr.income, 0);
  const totalYearExpense = monthlyData.reduce((acc, curr) => acc + curr.expense, 0);
  const netYearCashFlow = totalYearIncome - totalYearExpense;

  const chartCashFlow = monthlyData.map((m) => ({
    month: m.month,
    income: m.income,
    expense: m.expense,
  }));

  const pieCategoryData = categoryData.map((c) => ({
    category: c.category,
    amount: c.totalAmount,
    percentage: c.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Analytics & Financial Intelligence</h2>
          <p className="text-xs text-slate-500">
            Deep dive into historical cash flow trends, category distribution, and net savings margin.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200/80 rounded-lg p-1.5 shadow-xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="text-xs font-semibold text-slate-800 bg-transparent focus:outline-hidden cursor-pointer"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
          </select>
        </div>
      </div>

      {/* Annual Summary Strips */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Year Income</span>
          <h3 className="text-2xl font-bold text-emerald-600 tabular-nums mt-1">{formatCurrency(totalYearIncome, currency)}</h3>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Year Expense</span>
          <h3 className="text-2xl font-bold text-rose-600 tabular-nums mt-1">{formatCurrency(totalYearExpense, currency)}</h3>
        </div>
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-xs">
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Net Cash Flow Trajectory</span>
          <h3 className={`text-2xl font-bold tabular-nums mt-1 ${netYearCashFlow >= 0 ? 'text-blue-600' : 'text-rose-600'}`}>
            {netYearCashFlow >= 0 ? '+' : ''}{formatCurrency(netYearCashFlow, currency)}
          </h3>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Cash Flow Comparison ({selectedYear})</h3>
          <p className="text-xs text-slate-500 mb-4">Inflows vs. Outflows across all 12 calendar periods</p>
          <CashFlowChart data={chartCashFlow} currency={currency} />
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Cumulative Category Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Portfolio allocation breakdown</p>
          <CategoryPieChart data={pieCategoryData} currency={currency} />
        </div>
      </div>

      {/* Monthly Breakdown Table */}
      <div className="bg-white border border-slate-200/80 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Monthly Ledger Audit Summary</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Period</th>
                <th className="py-3 px-4 text-right">Income</th>
                <th className="py-3 px-4 text-right">Expenses</th>
                <th className="py-3 px-4 text-right">Net Flow</th>
                <th className="py-3 px-4 text-right">Savings Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyData.map((row) => {
                const rate = row.income > 0 ? Math.round(((row.income - row.expense) / row.income) * 100) : 0;
                return (
                  <tr key={row.month} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-800">{row.month} {selectedYear}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600 tabular-nums">
                      {formatCurrency(row.income, currency)}
                    </td>
                    <td className="py-3 px-4 text-right font-medium text-rose-600 tabular-nums">
                      {formatCurrency(row.expense, currency)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-bold tabular-nums ${
                        row.netCashFlow >= 0 ? 'text-slate-900' : 'text-rose-600'
                      }`}
                    >
                      {row.netCashFlow >= 0 ? '+' : ''}{formatCurrency(row.netCashFlow, currency)}
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-slate-600">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
