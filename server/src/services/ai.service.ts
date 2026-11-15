// server/src/services/ai.service.ts
import { GoogleGenAI } from '@google/genai';
import { dbStore } from '../repositories/db.store';
import { logger } from '../utils/logger';

export interface AIInsightResponse {
  summary: string;
  healthScore: number; // 0 - 100
  keyObservations: string[];
  actionableRecommendations: string[];
  projectedSavings: string;
  generatedBy: 'gemini-ai' | 'intelligent-engine';
}

const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  CAD: 'CA$',
  AUD: 'A$',
  INR: '₹',
};

export class AIService {
  private getClient(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey.trim() === '') {
      return null;
    }
    return new GoogleGenAI({ apiKey });
  }

  async generateFinancialInsights(userId: string): Promise<AIInsightResponse> {
    const user = await dbStore.findUserById(userId);
    const userCurrency = user?.currency || 'USD';
    const sym = currencySymbols[userCurrency] || '$';

    const incomes = await dbStore.getIncomes(userId);
    const expenses = await dbStore.getExpenses(userId);
    const budgets = await dbStore.getBudgets(userId);
    const goals = await dbStore.getGoals(userId);

    const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const netSavings = totalIncome - totalExpense;
    const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

    // Category analysis
    const categoryTotals: Record<string, number> = {};
    expenses.forEach((e) => {
      categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
    });

    const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0] || ['None', 0];

    const promptData = {
      currency: userCurrency,
      currencySymbol: sym,
      totalIncome: `${sym}${totalIncome}`,
      totalExpense: `${sym}${totalExpense}`,
      netSavings: `${sym}${netSavings}`,
      savingsRate: `${savingsRate}%`,
      topExpenseCategory: `${topCategory[0]} (${sym}${topCategory[1]})`,
      budgetLimits: budgets.map((b) => ({ category: b.category, limit: `${sym}${b.monthlyLimit}` })),
      savingsGoalsCount: goals.length,
      recentExpenses: expenses.slice(0, 5).map((e) => ({ title: e.title, amount: `${sym}${e.amount}`, category: e.category })),
    };

    const ai = this.getClient();
    if (ai) {
      try {
        const aiPromise = ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an elite certified financial planner. The user's active currency is ${userCurrency} (symbol: ${sym}).
Always use the user's currency symbol ${sym} for all monetary amounts in your observations, recommendations, and projected savings.
Analyze this user's finances and return ONLY a valid JSON object matching this TypeScript interface:
{
  "summary": "Short 2-3 sentence overview using ${sym}",
  "healthScore": 82,
  "keyObservations": ["bullet 1 using ${sym}", "bullet 2", "bullet 3"],
  "actionableRecommendations": ["tip 1", "tip 2", "tip 3"],
  "projectedSavings": "Estimated projection text using ${sym}"
}

Financial Snapshot:
${JSON.stringify(promptData, null, 2)}
Output strictly raw JSON without markdown code fences.`,
        });

        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('AI request timed out')), 4000)
        );

        const response: any = await Promise.race([aiPromise, timeoutPromise]);
        const text = response.text?.trim() || '';
        const cleaned = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        const parsed = JSON.parse(cleaned);

        return {
          summary: parsed.summary || 'Financial overview generated based on your transaction history.',
          healthScore: Math.min(100, Math.max(0, Number(parsed.healthScore) || 75)),
          keyObservations: Array.isArray(parsed.keyObservations) ? parsed.keyObservations : [],
          actionableRecommendations: Array.isArray(parsed.actionableRecommendations) ? parsed.actionableRecommendations : [],
          projectedSavings: parsed.projectedSavings || `Projected monthly surplus: ${sym}${Math.max(0, netSavings).toLocaleString()}`,
          generatedBy: 'gemini-ai',
        };
      } catch (err: any) {
        logger.warn('Gemini AI unavailable or timed out; generating instant intelligent analysis.', err?.message || err);
      }
    }

    // Heuristic algorithmic financial analysis fallback
    let score = 50;
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate < 0) score -= 25;

    if (goals.length > 0) score += 15;
    if (budgets.length >= 3) score += 10;
    score = Math.min(98, Math.max(20, score));

    const observations: string[] = [
      `Your current savings rate is ${savingsRate}%, with a net cash balance of ${netSavings < 0 ? '-' : ''}${sym}${Math.abs(netSavings).toLocaleString()}.`,
      `Your largest expense sector is ${topCategory[0]} taking ${sym}${topCategory[1].toLocaleString()} (${totalExpense > 0 ? Math.round((topCategory[1] / totalExpense) * 100) : 0}% of all outflows).`,
    ];

    if (savingsRate < 20) {
      observations.push('Recommended benchmark: aim to retain at least 20% of net income for emergency reserves.');
    } else {
      observations.push('Your savings rate outperforms the traditional 50/30/20 benchmark rule.');
    }

    const recommendations: string[] = [];
    if (budgets.length === 0) {
      recommendations.push('Establish category spending caps to prevent discretionary budget creep.');
    } else {
      recommendations.push(`Audit ${topCategory[0]} discretionary expenses to optimize cash retention by 5-10%.`);
    }

    if (goals.length === 0) {
      recommendations.push('Create a milestone savings goal (e.g. 3-6 month Emergency Reserve Fund).');
    } else {
      recommendations.push('Automate monthly goal contributions at the beginning of each pay cycle.');
    }
    recommendations.push('Export transaction records periodically to monitor seasonal spending variances.');

    return {
      summary: `Your financial profile indicates a ${savingsRate >= 20 ? 'healthy' : savingsRate >= 0 ? 'stable' : 'strained'} trajectory with ${sym}${totalIncome.toLocaleString()} income against ${sym}${totalExpense.toLocaleString()} in expenditures.`,
      healthScore: score,
      keyObservations: observations,
      actionableRecommendations: recommendations,
      projectedSavings: `Estimated annual net retention: ${sym}${(Math.max(0, netSavings) * 12).toLocaleString()}`,
      generatedBy: 'intelligent-engine',
    };
  }
}

export const aiService = new AIService();
