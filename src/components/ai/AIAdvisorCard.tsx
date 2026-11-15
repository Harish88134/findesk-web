// src/components/ai/AIAdvisorCard.tsx
import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertCircle, TrendingUp, Award } from 'lucide-react';
import { financeApi, AIInsightData } from '../../api/finance.api';

export const AIAdvisorCard: React.FC = () => {
  const [insight, setInsight] = useState<AIInsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsights = async () => {
    setIsLoading(true);
    try {
      const res = await financeApi.getAIInsights();
      if (res.success && res.data) {
        setInsight(res.data);
      }
    } catch (err) {
      console.error('Failed to load AI insights:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden mb-6 border border-indigo-800/40">
      {/* Decorative ambient background glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-400 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white">AI Financial Intelligence Advisor</h2>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {insight?.generatedBy === 'gemini-ai' ? 'Gemini 2.5 Flash' : 'Smart Analytics'}
              </span>
            </div>
            <p className="text-xs text-indigo-200/80">Real-time algorithmic review of your cash flow and spending habits</p>
          </div>
        </div>

        <button
          onClick={fetchInsights}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/15 active:scale-95 transition-all text-white border border-white/10 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Refresh Analysis</span>
        </button>
      </div>

      {isLoading && !insight ? (
        <div className="py-8 flex flex-col items-center justify-center gap-2 text-indigo-200/60">
          <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
          <p className="text-xs">Analyzing balance sheets and transaction vectors...</p>
        </div>
      ) : insight ? (
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
          {/* Health Score Pill */}
          <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <Award className="w-6 h-6 text-indigo-300 mb-1" />
            <span className="text-[11px] font-semibold tracking-wide uppercase text-indigo-200">Financial Health Score</span>
            <div className="text-4xl font-extrabold tracking-tight mt-1 text-white">
              {insight.healthScore}
              <span className="text-sm font-normal text-indigo-300">/100</span>
            </div>
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 mt-2 rounded-full border ${getScoreColor(insight.healthScore)}`}>
              {insight.healthScore >= 80 ? 'Excellent Standing' : insight.healthScore >= 60 ? 'Moderate Health' : 'Needs Optimization'}
            </span>
            <p className="text-[11px] text-indigo-200/70 mt-2">{insight.projectedSavings}</p>
          </div>

          {/* Observations and Recommendations */}
          <div className="lg:col-span-9 flex flex-col justify-between gap-3">
            <p className="text-xs text-slate-200 leading-relaxed font-medium bg-white/5 p-3 rounded-lg border border-white/5">
              "{insight.summary}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-indigo-950/40 border border-indigo-800/30 rounded-xl p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                  Key Observations
                </span>
                <ul className="space-y-1.5 text-indigo-100/90">
                  {insight.keyObservations.slice(0, 3).map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{obs}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-950/30 border border-emerald-800/30 rounded-xl p-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Strategic Actions
                </span>
                <ul className="space-y-1.5 text-emerald-100/90">
                  {insight.actionableRecommendations.slice(0, 3).map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 text-[11px] leading-tight">
                      <span className="text-emerald-400 font-bold">✓</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
