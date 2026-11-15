// server/src/services/income.service.ts
import { dbStore } from '../repositories/db.store';
import { IIncome } from '../interfaces';

export class IncomeService {
  async getAll(userId: string, filter?: { source?: string; startDate?: Date; endDate?: Date }) {
    return await dbStore.getIncomes(userId, filter);
  }

  async getById(id: string, userId: string) {
    const inc = await dbStore.getIncomeById(id, userId);
    if (!inc) {
      throw new Error('Income record not found');
    }
    return inc;
  }

  async create(data: Partial<IIncome>) {
    return await dbStore.createIncome(data);
  }

  async update(id: string, userId: string, updates: Partial<IIncome>) {
    const updated = await dbStore.updateIncome(id, userId, updates);
    if (!updated) {
      throw new Error('Income record not found or unauthorized');
    }
    return updated;
  }

  async delete(id: string, userId: string) {
    const deleted = await dbStore.deleteIncome(id, userId);
    if (!deleted) {
      throw new Error('Income record not found or unauthorized');
    }
    return true;
  }
}

export const incomeService = new IncomeService();
