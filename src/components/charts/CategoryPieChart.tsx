// src/components/charts/CategoryPieChart.tsx
import React, { useState } from 'react';
import { formatCurrency } from '../../utils/formatters';

interface CategoryData {
  category: string;
  amount: number;
  percentage: number;
}

interface Props {
  data: CategoryData[];
  currency?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  Food: '#10b981',
  Rent: '#3b82f6',
  Travel: '#06b6d4',
  Shopping: '#8b5cf6',
  Medical: '#ec4899',
  Education: '#f59e0b',
  Entertainment: '#6366f1',
  Bills: '#f97316',
  Utilities: '#14b8a6',
  Others: '#64748b',
};

export const CategoryPieChart: React.FC<Props> = ({ data, currency = 'USD' }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400 text-sm">
        No expense category records for this timeframe.
      </div>
    );
  }

  const totalAmount = data.reduce((sum, item) => sum + item.amount, 0);

  // Calculate SVG arc paths for donut
  let cumulativeAngle = 0;
  const radius = 65;
  const cx = 80;
  const cy = 80;

  const slices = data.map((item) => {
    const angle = totalAmount > 0 ? (item.amount / totalAmount) * 360 : 0;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle += angle;

    const startRad = (startAngle - 90) * (Math.PI / 180);
    const endRad = (endAngle - 90) * (Math.PI / 180);

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;
    const pathData =
      angle >= 359.99
        ? `M ${cx} ${cy - radius} A ${radius} ${radius} 0 1 1 ${cx - 0.001} ${cy - radius} Z`
        : `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

    const color = CATEGORY_COLORS[item.category] || '#64748b';

    return {
      category: item.category,
      amount: item.amount,
      percentage: item.percentage,
      pathData,
      color,
    };
  });

  const activeItem = activeCategory ? data.find((d) => d.category === activeCategory) : null;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg viewBox="0 0 160 160" className="w-full h-full transform -rotate-90">
          {slices.map((slice) => (
            <path
              key={slice.category}
              d={slice.pathData}
              fill={slice.color}
              className="transition-all duration-200 cursor-pointer hover:opacity-85"
              style={{
                opacity: activeCategory && activeCategory !== slice.category ? 0.45 : 1,
              }}
              onMouseEnter={() => setActiveCategory(slice.category)}
              onMouseLeave={() => setActiveCategory(null)}
            />
          ))}
          {/* Inner cutout for donut hole */}
          <circle cx={cx} cy={cy} r={46} fill="white" />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
          {activeItem ? (
            <>
              <span className="text-xs font-semibold text-slate-800 truncate max-w-[100px]">
                {activeItem.category}
              </span>
              <span className="text-sm font-bold text-slate-900 tabular-nums">
                {activeItem.percentage}%
              </span>
            </>
          ) : (
            <>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                Total
              </span>
              <span className="text-xs font-bold text-slate-900 tabular-nums">
                {formatCurrency(totalAmount, currency)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Category Legend list */}
      <div className="flex-1 w-full space-y-1.5 max-h-48 overflow-y-auto pr-1">
        {data.map((item) => {
          const color = CATEGORY_COLORS[item.category] || '#64748b';
          const isSelected = activeCategory === item.category;

          return (
            <div
              key={item.category}
              onMouseEnter={() => setActiveCategory(item.category)}
              onMouseLeave={() => setActiveCategory(null)}
              className={`flex items-center justify-between text-xs py-1 px-2 rounded-md cursor-pointer transition-colors ${
                isSelected ? 'bg-slate-100 font-semibold' : 'hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span className="text-slate-700 truncate">{item.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0 tabular-nums text-slate-900">
                <span className="font-medium">{formatCurrency(item.amount, currency)}</span>
                <span className="text-slate-400 text-[11px] w-8 text-right">{item.percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
