// server/src/services/goal.service.ts
import { dbStore } from '../repositories/db.store';
import { ISavingsGoal } from '../interfaces';

export class GoalService {
  async getAll(userId: string) {
    const goals = await dbStore.getGoals(userId);
    return goals.map((g) => {
      const percentage = g.targetAmount > 0 ? Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100)) : 0;
      const isCompleted = g.currentAmount >= g.targetAmount;
      const remainingAmount = Math.max(0, g.targetAmount - g.currentAmount);

      return {
        ...g,
        percentage,
        isCompleted,
        remainingAmount,
      };
    });
  }

  async getById(id: string, userId: string) {
    const goal = await dbStore.getGoalById(id, userId);
    if (!goal) {
      throw new Error('Savings goal not found');
    }
    return goal;
  }

  async create(data: Partial<ISavingsGoal>) {
    return await dbStore.createGoal(data);
  }

  async update(id: string, userId: string, updates: Partial<ISavingsGoal>) {
    const updated = await dbStore.updateGoal(id, userId, updates);
    if (!updated) {
      throw new Error('Savings goal not found or unauthorized');
    }

    if (updated.currentAmount >= updated.targetAmount) {
      await dbStore.createNotification({
        userId,
        title: `Goal Achieved: ${updated.name}! 🎉`,
        message: `Congratulations! You reached your savings target of $${updated.targetAmount}.`,
        type: 'goal_achieved',
        metadata: { goalId: updated._id, targetAmount: updated.targetAmount },
      });
    }

    return updated;
  }

  async contribute(id: string, userId: string, amount: number) {
    const goal = await dbStore.getGoalById(id, userId);
    if (!goal) {
      throw new Error('Savings goal not found');
    }

    const newAmount = goal.currentAmount + Number(amount);
    const updated = await dbStore.updateGoal(id, userId, { currentAmount: newAmount });

    if (updated && newAmount >= goal.targetAmount && goal.currentAmount < goal.targetAmount) {
      await dbStore.createNotification({
        userId,
        title: `Goal Achieved: ${goal.name}! 🎉`,
        message: `Awesome accomplishment! You reached your savings target of $${goal.targetAmount}.`,
        type: 'goal_achieved',
        metadata: { goalId: goal._id, targetAmount: goal.targetAmount },
      });
    }

    return updated;
  }

  async delete(id: string, userId: string) {
    const deleted = await dbStore.deleteGoal(id, userId);
    if (!deleted) {
      throw new Error('Savings goal not found or unauthorized');
    }
    return true;
  }
}

export const goalService = new GoalService();
