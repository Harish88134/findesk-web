import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { incomeService } from '../src/services/income.service';
import { expenseService } from '../src/services/expense.service';
import { budgetService } from '../src/services/budget.service';
import { analyticsService } from '../src/services/analytics.service';
import { dbStore } from '../src/repositories/db.store';

describe('Finance Management Business Logic Suite', () => {
  const testUserId = 'usr_demo_002';

  before(async () => {
    await dbStore.init();
  });

  it('should calculate accurate dashboard analytics', async () => {
    const analytics = await analyticsService.getDashboardAnalytics(testUserId);
    assert.ok(analytics);
    assert.ok(analytics.totalIncome > 0);
    assert.ok(analytics.totalExpense > 0);
    assert.strictEqual(analytics.currentBalance, analytics.totalIncome - analytics.totalExpense);
    assert.ok(Array.isArray(analytics.monthlyExpenseTrend));
    assert.ok(Array.isArray(analytics.categoryBreakdown));
  });

  it('should allow logging a new expense and tracking category budget usage', async () => {
    const created = await expenseService.create({
      userId: testUserId,
      title: 'Espresso & Bakery',
      amount: 15.5,
      category: 'Food',
      date: new Date(),
      notes: 'Morning coffee meeting',
    });

    assert.ok(created._id);
    assert.strictEqual(created.amount, 15.5);

    const budgets = await budgetService.getAllWithUsage(testUserId);
    const foodBudget = budgets.find((b) => b.category === 'Food');
    assert.ok(foodBudget);
    assert.ok(foodBudget!.usedAmount >= 15.5);
  });

  it('should allow logging a new income record', async () => {
    const created = await incomeService.create({
      userId: testUserId,
      title: 'Dividend Credit',
      amount: 150,
      source: 'Dividends',
      date: new Date(),
      notes: 'Quarterly reinvestment payout',
    });

    assert.ok(created._id);
    assert.strictEqual(created.amount, 150);
  });
});
