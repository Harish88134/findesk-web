// server/src/repositories/db.store.ts
import fs from 'fs';
import path from 'path';
import { IUser, IIncome, IExpense, IBudget, ISavingsGoal, INotification, IRefreshToken } from '../interfaces';
import { getInitialSeedData } from '../seed/seedData';
import { logger } from '../utils/logger';

interface DatabaseData {
  users: IUser[];
  incomes: IIncome[];
  expenses: IExpense[];
  budgets: IBudget[];
  savingsGoals: ISavingsGoal[];
  notifications: INotification[];
  refreshTokens: IRefreshToken[];
}

class DatabaseStore {
  private users: IUser[] = [];
  private incomes: IIncome[] = [];
  private expenses: IExpense[] = [];
  private budgets: IBudget[] = [];
  private savingsGoals: ISavingsGoal[] = [];
  private notifications: INotification[] = [];
  private refreshTokens: IRefreshToken[] = [];
  private initialized = false;
  private dbFilePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    // Save database to server/data/database.json for reliable, zero-config local persistence
    const dataDir = path.resolve(process.cwd(), 'server', 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (err) {
        // Fallback to process cwd if server directory is not writeable
      }
    }
    this.dbFilePath = path.join(dataDir, 'database.json');
  }

  // Persist current state to database.json (debounced for optimal performance)
  private scheduleSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    this.saveTimeout = setTimeout(() => {
      this.saveToFile().catch((err) => {
        logger.error('Failed to auto-save database file:', err);
      });
    }, 150);
  }

  private async saveToFile(): Promise<void> {
    try {
      const payload: DatabaseData = {
        users: this.users,
        incomes: this.incomes,
        expenses: this.expenses,
        budgets: this.budgets,
        savingsGoals: this.savingsGoals,
        notifications: this.notifications,
        refreshTokens: this.refreshTokens,
      };
      await fs.promises.writeFile(this.dbFilePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      logger.error('Error writing database to disk:', err);
    }
  }

  async init() {
    if (this.initialized) return;

    try {
      // Check if persistent database.json exists on disk
      if (fs.existsSync(this.dbFilePath)) {
        const rawContent = await fs.promises.readFile(this.dbFilePath, 'utf-8');
        const parsed = JSON.parse(rawContent) as DatabaseData;

        if (parsed && Array.isArray(parsed.users) && parsed.users.length > 0) {
          this.users = parsed.users;
          this.incomes = parsed.incomes || [];
          this.expenses = parsed.expenses || [];
          this.budgets = parsed.budgets || [];
          this.savingsGoals = parsed.savingsGoals || [];
          this.notifications = parsed.notifications || [];
          this.refreshTokens = parsed.refreshTokens || [];
          this.initialized = true;
          logger.info(`Database successfully loaded from local storage file: ${this.dbFilePath}`);
          return;
        }
      }

      // First run: Initialize with default seed data
      const seed = await getInitialSeedData();
      this.users = seed.users;
      this.incomes = seed.incomes;
      this.expenses = seed.expenses;
      this.budgets = seed.budgets;
      this.savingsGoals = seed.savingsGoals;
      this.notifications = seed.notifications;
      this.refreshTokens = [];
      this.initialized = true;

      // Save initial state to file
      await this.saveToFile();
      logger.info(`DatabaseStore initialized and created persistent database file at ${this.dbFilePath}`);
    } catch (err) {
      logger.error('Error initializing DatabaseStore:', err);
    }
  }

  // --- Users ---
  async findUserByEmail(email: string): Promise<IUser | undefined> {
    await this.init();
    return this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  async findUserById(id: string): Promise<IUser | undefined> {
    await this.init();
    return this.users.find((u) => u._id === id);
  }

  async createUser(user: Partial<IUser>): Promise<IUser> {
    await this.init();
    const newUser: IUser = {
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: user.name || '',
      email: (user.email || '').toLowerCase(),
      password: user.password || '',
      role: user.role || 'user',
      avatar: user.avatar || '',
      currency: user.currency || 'USD',
      isEmailVerified: user.isEmailVerified ?? true,
      emailVerificationToken: user.emailVerificationToken,
      passwordResetToken: user.passwordResetToken,
      passwordResetExpires: user.passwordResetExpires,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.push(newUser);
    this.scheduleSave();
    return newUser;
  }

  async updateUser(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    await this.init();
    const index = this.users.findIndex((u) => u._id === id);
    if (index === -1) return null;
    this.users[index] = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date(),
    };
    this.scheduleSave();
    return this.users[index];
  }

  async deleteUser(id: string): Promise<boolean> {
    await this.init();
    const initialLen = this.users.length;
    this.users = this.users.filter((u) => u._id !== id);
    // Cascade delete user data
    this.incomes = this.incomes.filter((i) => i.userId !== id);
    this.expenses = this.expenses.filter((e) => e.userId !== id);
    this.budgets = this.budgets.filter((b) => b.userId !== id);
    this.savingsGoals = this.savingsGoals.filter((g) => g.userId !== id);
    this.notifications = this.notifications.filter((n) => n.userId !== id);
    this.scheduleSave();
    return this.users.length < initialLen;
  }

  async getAllUsers(): Promise<Omit<IUser, 'password'>[]> {
    await this.init();
    return this.users.map(({ password, ...rest }) => rest as any);
  }

  // --- Incomes ---
  async getIncomes(userId: string, filter?: { source?: string; startDate?: Date; endDate?: Date }): Promise<IIncome[]> {
    await this.init();
    let res = this.incomes.filter((i) => i.userId === userId);
    if (filter?.source && filter.source !== 'All') {
      res = res.filter((i) => i.source === filter.source);
    }
    if (filter?.startDate) {
      res = res.filter((i) => new Date(i.date) >= new Date(filter.startDate!));
    }
    if (filter?.endDate) {
      res = res.filter((i) => new Date(i.date) <= new Date(filter.endDate!));
    }
    return res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getIncomeById(id: string, userId: string): Promise<IIncome | undefined> {
    await this.init();
    return this.incomes.find((i) => i._id === id && i.userId === userId);
  }

  async createIncome(income: Partial<IIncome>): Promise<IIncome> {
    await this.init();
    const newInc: IIncome = {
      _id: `inc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: income.userId!,
      title: income.title || '',
      amount: Number(income.amount),
      source: income.source || 'Other',
      date: income.date ? new Date(income.date) : new Date(),
      notes: income.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.incomes.unshift(newInc);
    this.scheduleSave();
    return newInc;
  }

  async updateIncome(id: string, userId: string, updates: Partial<IIncome>): Promise<IIncome | null> {
    await this.init();
    const index = this.incomes.findIndex((i) => i._id === id && i.userId === userId);
    if (index === -1) return null;
    this.incomes[index] = {
      ...this.incomes[index],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : this.incomes[index].amount,
      date: updates.date ? new Date(updates.date) : this.incomes[index].date,
      updatedAt: new Date(),
    };
    this.scheduleSave();
    return this.incomes[index];
  }

  async deleteIncome(id: string, userId: string): Promise<boolean> {
    await this.init();
    const initialLen = this.incomes.length;
    this.incomes = this.incomes.filter((i) => !(i._id === id && i.userId === userId));
    this.scheduleSave();
    return this.incomes.length < initialLen;
  }

  // --- Expenses ---
  async getExpenses(
    userId: string,
    filter?: { category?: string; search?: string; startDate?: Date; endDate?: Date }
  ): Promise<IExpense[]> {
    await this.init();
    let res = this.expenses.filter((e) => e.userId === userId);
    if (filter?.category && filter.category !== 'All') {
      res = res.filter((e) => e.category === filter.category);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      res = res.filter((e) => e.title.toLowerCase().includes(q) || (e.notes && e.notes.toLowerCase().includes(q)));
    }
    if (filter?.startDate) {
      res = res.filter((e) => new Date(e.date) >= new Date(filter.startDate!));
    }
    if (filter?.endDate) {
      res = res.filter((e) => new Date(e.date) <= new Date(filter.endDate!));
    }
    return res.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getExpenseById(id: string, userId: string): Promise<IExpense | undefined> {
    await this.init();
    return this.expenses.find((e) => e._id === id && e.userId === userId);
  }

  async createExpense(expense: Partial<IExpense>): Promise<IExpense> {
    await this.init();
    const newExp: IExpense = {
      _id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: expense.userId!,
      title: expense.title || '',
      amount: Number(expense.amount),
      category: expense.category || 'Others',
      date: expense.date ? new Date(expense.date) : new Date(),
      notes: expense.notes || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.expenses.unshift(newExp);
    this.scheduleSave();
    return newExp;
  }

  async updateExpense(id: string, userId: string, updates: Partial<IExpense>): Promise<IExpense | null> {
    await this.init();
    const index = this.expenses.findIndex((e) => e._id === id && e.userId === userId);
    if (index === -1) return null;
    this.expenses[index] = {
      ...this.expenses[index],
      ...updates,
      amount: updates.amount !== undefined ? Number(updates.amount) : this.expenses[index].amount,
      date: updates.date ? new Date(updates.date) : this.expenses[index].date,
      updatedAt: new Date(),
    };
    this.scheduleSave();
    return this.expenses[index];
  }

  async deleteExpense(id: string, userId: string): Promise<boolean> {
    await this.init();
    const initialLen = this.expenses.length;
    this.expenses = this.expenses.filter((e) => !(e._id === id && e.userId === userId));
    this.scheduleSave();
    return this.expenses.length < initialLen;
  }

  // --- Budgets ---
  async getBudgets(userId: string): Promise<IBudget[]> {
    await this.init();
    return this.budgets.filter((b) => b.userId === userId);
  }

  async getBudgetById(id: string, userId: string): Promise<IBudget | undefined> {
    await this.init();
    return this.budgets.find((b) => b._id === id && b.userId === userId);
  }

  async createBudget(budget: Partial<IBudget>): Promise<IBudget> {
    await this.init();
    const existingIndex = this.budgets.findIndex((b) => b.userId === budget.userId && b.category === budget.category);
    if (existingIndex !== -1) {
      this.budgets[existingIndex].monthlyLimit = Number(budget.monthlyLimit);
      this.budgets[existingIndex].updatedAt = new Date();
      this.scheduleSave();
      return this.budgets[existingIndex];
    }
    const newBud: IBudget = {
      _id: `bud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: budget.userId!,
      category: budget.category!,
      monthlyLimit: Number(budget.monthlyLimit),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.budgets.push(newBud);
    this.scheduleSave();
    return newBud;
  }

  async updateBudget(id: string, userId: string, updates: Partial<IBudget>): Promise<IBudget | null> {
    await this.init();
    const index = this.budgets.findIndex((b) => b._id === id && b.userId === userId);
    if (index === -1) return null;
    this.budgets[index] = {
      ...this.budgets[index],
      ...updates,
      monthlyLimit: updates.monthlyLimit !== undefined ? Number(updates.monthlyLimit) : this.budgets[index].monthlyLimit,
      updatedAt: new Date(),
    };
    this.scheduleSave();
    return this.budgets[index];
  }

  async deleteBudget(id: string, userId: string): Promise<boolean> {
    await this.init();
    const initialLen = this.budgets.length;
    this.budgets = this.budgets.filter((b) => !(b._id === id && b.userId === userId));
    this.scheduleSave();
    return this.budgets.length < initialLen;
  }

  // --- Savings Goals ---
  async getGoals(userId: string): Promise<ISavingsGoal[]> {
    await this.init();
    return this.savingsGoals.filter((g) => g.userId === userId);
  }

  async getGoalById(id: string, userId: string): Promise<ISavingsGoal | undefined> {
    await this.init();
    return this.savingsGoals.find((g) => g._id === id && g.userId === userId);
  }

  async createGoal(goal: Partial<ISavingsGoal>): Promise<ISavingsGoal> {
    await this.init();
    const newGoal: ISavingsGoal = {
      _id: `goal_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: goal.userId!,
      name: goal.name || '',
      targetAmount: Number(goal.targetAmount),
      currentAmount: Number(goal.currentAmount || 0),
      targetDate: goal.targetDate ? new Date(goal.targetDate) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.savingsGoals.push(newGoal);
    this.scheduleSave();
    return newGoal;
  }

  async updateGoal(id: string, userId: string, updates: Partial<ISavingsGoal>): Promise<ISavingsGoal | null> {
    await this.init();
    const index = this.savingsGoals.findIndex((g) => g._id === id && g.userId === userId);
    if (index === -1) return null;
    this.savingsGoals[index] = {
      ...this.savingsGoals[index],
      ...updates,
      targetAmount: updates.targetAmount !== undefined ? Number(updates.targetAmount) : this.savingsGoals[index].targetAmount,
      currentAmount: updates.currentAmount !== undefined ? Number(updates.currentAmount) : this.savingsGoals[index].currentAmount,
      targetDate: updates.targetDate ? new Date(updates.targetDate) : this.savingsGoals[index].targetDate,
      updatedAt: new Date(),
    };
    this.scheduleSave();
    return this.savingsGoals[index];
  }

  async deleteGoal(id: string, userId: string): Promise<boolean> {
    await this.init();
    const initialLen = this.savingsGoals.length;
    this.savingsGoals = this.savingsGoals.filter((g) => !(g._id === id && g.userId === userId));
    this.scheduleSave();
    return this.savingsGoals.length < initialLen;
  }

  // --- Notifications ---
  async getNotifications(userId: string): Promise<INotification[]> {
    await this.init();
    return this.notifications
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationAsRead(id: string, userId: string): Promise<INotification | null> {
    await this.init();
    const notif = this.notifications.find((n) => n._id === id && n.userId === userId);
    if (!notif) return null;
    notif.isRead = true;
    notif.updatedAt = new Date();
    this.scheduleSave();
    return notif;
  }

  async markAllNotificationsRead(userId: string): Promise<void> {
    await this.init();
    this.notifications.forEach((n) => {
      if (n.userId === userId) {
        n.isRead = true;
        n.updatedAt = new Date();
      }
    });
    this.scheduleSave();
  }

  async createNotification(notif: Partial<INotification>): Promise<INotification> {
    await this.init();
    const newN: INotification = {
      _id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: notif.userId!,
      title: notif.title || '',
      message: notif.message || '',
      type: notif.type || 'system',
      isRead: false,
      metadata: notif.metadata || {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.notifications.unshift(newN);
    this.scheduleSave();
    return newN;
  }

  // --- Refresh Tokens ---
  async saveRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    this.refreshTokens.push({
      _id: `rt_${Date.now()}`,
      userId,
      token,
      expiresAt,
      revoked: false,
      createdAt: new Date(),
    });
    this.scheduleSave();
  }

  async findRefreshToken(token: string): Promise<IRefreshToken | undefined> {
    return this.refreshTokens.find((r) => r.token === token && !r.revoked && new Date(r.expiresAt) > new Date());
  }

  async revokeRefreshToken(token: string): Promise<void> {
    const item = this.refreshTokens.find((r) => r.token === token);
    if (item) {
      item.revoked = true;
      this.scheduleSave();
    }
  }

  // --- Platform Statistics (Admin) ---
  async getPlatformStats() {
    await this.init();
    const totalUsers = this.users.length;
    const totalIncomesCount = this.incomes.length;
    const totalExpensesCount = this.expenses.length;
    const totalVolume =
      this.incomes.reduce((acc, curr) => acc + curr.amount, 0) +
      this.expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return {
      totalUsers,
      totalTransactions: totalIncomesCount + totalExpensesCount,
      totalVolume,
      activeBudgets: this.budgets.length,
      activeGoals: this.savingsGoals.length,
    };
  }

  // --- Zero-Config Backup, Restore & Reset ---
  async exportDatabase() {
    await this.init();
    return {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        users: this.users,
        incomes: this.incomes,
        expenses: this.expenses,
        budgets: this.budgets,
        savingsGoals: this.savingsGoals,
        notifications: this.notifications,
      },
    };
  }

  async importDatabase(dump: any) {
    if (!dump || !dump.data) {
      throw new Error('Invalid backup file format');
    }
    const d = dump.data;
    if (Array.isArray(d.users)) this.users = d.users;
    if (Array.isArray(d.incomes)) this.incomes = d.incomes;
    if (Array.isArray(d.expenses)) this.expenses = d.expenses;
    if (Array.isArray(d.budgets)) this.budgets = d.budgets;
    if (Array.isArray(d.savingsGoals)) this.savingsGoals = d.savingsGoals;
    if (Array.isArray(d.notifications)) this.notifications = d.notifications;
    this.scheduleSave();
    return true;
  }

  async resetDatabase() {
    this.initialized = false;
    if (fs.existsSync(this.dbFilePath)) {
      try {
        await fs.promises.unlink(this.dbFilePath);
      } catch (err) {
        // ignore
      }
    }
    await this.init();
    return true;
  }
}

export const dbStore = new DatabaseStore();
