// src/components/charts/BudgetProgressBar.tsx
import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface Props {
  category: string;
  monthlyLimit: number;
  usedAmount: number;
  currency?: string;
  showDetails?: boolean;
}

export const BudgetProgressBar: React.FC<Props> = ({
  category,
  monthlyLimit,
  usedAmount,
  currency = 'USD',
  showDetails = true,
}) => {
  const percentage = monthlyLimit > 0 ? Math.round((usedAmount / monthlyLimit) * 100) : 0;
  const remaining = Math.max(0, monthlyLimit - usedAmount);
  const isOver = usedAmount > monthlyLimit;

  // Determine threshold color
  let barColor = 'bg-emerald-500';
  let badgeColor = 'text-emerald-700 bg-emerald-50';

  if (isOver) {
    barColor = 'bg-rose-500';
    badgeColor = 'text-rose-700 bg-rose-50';
  } else if (percentage >= 80) {
    barColor = 'bg-amber-500';
    badgeColor = 'text-amber-700 bg-amber-50';
  }

  return (
    <div className="w-full">
      {showDetails && (
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-medium text-slate-800">{category}</span>
          <div className="flex items-center gap-2">
            <span className="text-slate-500 tabular-nums">
              {formatCurrency(usedAmount, currency)} / {formatCurrency(monthlyLimit, currency)}
            </span>
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-sm tabular-nums ${badgeColor}`}>
              {percentage}%
            </span>
          </div>
        </div>
      )}

      {/* Progress track */}
      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          style={{ width: `${Math.min(percentage, 100)}%` }}
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
        />
      </div>

      {showDetails && (
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
          <span>{isOver ? 'Over budget limit' : `${formatCurrency(remaining, currency)} remaining`}</span>
          {isOver && (
            <span className="text-rose-600 font-semibold tabular-nums">
              +{formatCurrency(usedAmount - monthlyLimit, currency)} excess
            </span>
          )}
        </div>
      )}
    </div>
  );
};
