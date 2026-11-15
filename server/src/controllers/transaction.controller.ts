// server/src/controllers/transaction.controller.ts
import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { dbStore } from '../repositories/db.store';

export class TransactionController {
  async getAll(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const {
        type = 'all',
        categoryOrSource,
        search,
        startDate,
        endDate,
        page = '1',
        limit = '10',
        sortBy = 'date',
        sortOrder = 'desc',
      } = req.query;

      const incomes = await dbStore.getIncomes(userId);
      const expenses = await dbStore.getExpenses(userId);

      let items: Array<{
        _id: string;
        type: 'income' | 'expense';
        title: string;
        amount: number;
        categoryOrSource: string;
        date: string;
        notes?: string;
      }> = [];

      if (type === 'all' || type === 'income') {
        items.push(
          ...incomes.map((i) => ({
            _id: i._id,
            type: 'income' as const,
            title: i.title,
            amount: i.amount,
            categoryOrSource: i.source,
            date: new Date(i.date).toISOString(),
            notes: i.notes,
          }))
        );
      }

      if (type === 'all' || type === 'expense') {
        items.push(
          ...expenses.map((e) => ({
            _id: e._id,
            type: 'expense' as const,
            title: e.title,
            amount: e.amount,
            categoryOrSource: e.category,
            date: new Date(e.date).toISOString(),
            notes: e.notes,
          }))
        );
      }

      // Filter by category or source
      if (categoryOrSource && categoryOrSource !== 'All') {
        items = items.filter(
          (item) => item.categoryOrSource.toLowerCase() === (categoryOrSource as string).toLowerCase()
        );
      }

      // Search by title or notes
      if (search) {
        const q = (search as string).toLowerCase();
        items = items.filter(
          (item) => item.title.toLowerCase().includes(q) || (item.notes && item.notes.toLowerCase().includes(q))
        );
      }

      // Date range filtering
      if (startDate) {
        const s = new Date(startDate as string);
        items = items.filter((item) => new Date(item.date) >= s);
      }
      if (endDate) {
        const e = new Date(endDate as string);
        items = items.filter((item) => new Date(item.date) <= e);
      }

      // Sorting
      items.sort((a, b) => {
        let valA: any = a[sortBy as keyof typeof a] || '';
        let valB: any = b[sortBy as keyof typeof b] || '';

        if (sortBy === 'date') {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        }

        if (sortOrder === 'asc') {
          return valA > valB ? 1 : valA < valB ? -1 : 0;
        } else {
          return valA < valB ? 1 : valA > valB ? -1 : 0;
        }
      });

      // Pagination
      const pageNum = parseInt(page as string, 10) || 1;
      const limitNum = parseInt(limit as string, 10) || 10;
      const total = items.length;
      const totalPages = Math.ceil(total / limitNum) || 1;
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedItems = items.slice(startIndex, startIndex + limitNum);

      res.status(200).json({
        success: true,
        data: paginatedItems,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const incomes = await dbStore.getIncomes(userId);
      const expenses = await dbStore.getExpenses(userId);

      const rows: string[] = ['ID,Type,Title,Amount,CategoryOrSource,Date,Notes'];

      incomes.forEach((i) => {
        rows.push(
          `"${i._id}","Income","${i.title.replace(/"/g, '""')}",${i.amount},"${i.source}","${new Date(i.date).toISOString().split('T')[0]}","${(i.notes || '').replace(/"/g, '""')}"`
        );
      });

      expenses.forEach((e) => {
        rows.push(
          `"${e._id}","Expense","${e.title.replace(/"/g, '""')}",${e.amount},"${e.category}","${new Date(e.date).toISOString().split('T')[0]}","${(e.notes || '').replace(/"/g, '""')}"`
        );
      });

      const csvContent = rows.join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="transactions_export.csv"');
      res.status(200).send(csvContent);
    } catch (error) {
      next(error);
    }
  }

  async importCsv(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { csvData } = req.body;

      if (!csvData || typeof csvData !== 'string') {
        res.status(400).json({ success: false, message: 'Valid CSV text data is required' });
        return;
      }

      const lines = csvData.trim().split(/\r?\n/);
      if (lines.length < 2) {
        res.status(400).json({ success: false, message: 'CSV file must include a header and at least one row' });
        return;
      }

      let importedCount = 0;
      // Skip header row
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Simple CSV cell splitter that handles quoted strings
        const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        const parts = line.split(',').map((p) => p.replace(/^"|"$/g, '').trim());

        // Format: ID (optional), Type (Income/Expense), Title, Amount, CategoryOrSource, Date, Notes
        const typeStr = (parts[1] || '').toLowerCase();
        const title = parts[2] || 'Imported Transaction';
        const amount = parseFloat(parts[3]) || 0;
        const categoryOrSource = parts[4] || 'Other';
        const dateStr = parts[5] || new Date().toISOString();
        const notes = parts[6] || 'Imported via CSV';

        if (amount <= 0) continue;

        if (typeStr.includes('income')) {
          await dbStore.createIncome({
            userId,
            title,
            amount,
            source: categoryOrSource as any,
            date: new Date(dateStr),
            notes,
          });
          importedCount++;
        } else if (typeStr.includes('expense')) {
          await dbStore.createExpense({
            userId,
            title,
            amount,
            category: categoryOrSource as any,
            date: new Date(dateStr),
            notes,
          });
          importedCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully imported ${importedCount} transactions.`,
        data: { count: importedCount },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const transactionController = new TransactionController();
