// src/components/charts/CashFlowChart.tsx
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CashFlowItem {
  month: string;
  income: number;
  expense: number;
}

interface Props {
  data: CashFlowItem[];
  currency?: string;
}

export const CashFlowChart: React.FC<Props> = ({ data, currency = 'USD' }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No transaction cash flow data recorded for this period.
      </div>
    );
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.income, d.expense)), 1000);
  const chartHeight = 180;

  return (
    <div className="w-full">
      <div className="flex items-center justify-end gap-6 mb-4 text-xs font-medium text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-emerald-600 inline-block" />
          <span>Income</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-rose-500 inline-block" />
          <span>Expenses</span>
        </div>
      </div>

      <div className="relative pt-6">
        <div className="flex items-end justify-between gap-3 sm:gap-6 h-48 border-b border-slate-200 px-2 pb-1">
          {data.map((item, idx) => {
            const incHeight = (item.income / maxVal) * chartHeight;
            const expHeight = (item.expense / maxVal) * chartHeight;
            const isHovered = hoveredIndex === idx;

            return (
              <div
                key={item.month}
                className="flex-1 flex flex-col items-center justify-end h-full relative group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Tooltip */}
                {isHovered && (
                  <div className="absolute -top-12 z-20 bg-slate-900 text-white text-xs rounded-md py-1.5 px-2.5 shadow-lg whitespace-nowrap pointer-events-none transform -translate-y-1 transition-all">
                    <p className="font-semibold text-slate-200">{item.month}</p>
                    <p className="text-emerald-400">In: {formatCurrency(item.income, currency)}</p>
                    <p className="text-rose-400">Out: {formatCurrency(item.expense, currency)}</p>
                  </div>
                )}

                {/* Bars */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  <div
                    style={{ height: `${Math.max(incHeight, 4)}px` }}
                    className="w-full max-w-[18px] bg-emerald-600 rounded-t-xs transition-all duration-300 group-hover:bg-emerald-500"
                  />
                  <div
                    style={{ height: `${Math.max(expHeight, 4)}px` }}
                    className="w-full max-w-[18px] bg-rose-500 rounded-t-xs transition-all duration-300 group-hover:bg-rose-400"
                  />
                </div>

                {/* Month label */}
                <span className="text-xs font-medium text-slate-500 mt-2 truncate w-full text-center">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
