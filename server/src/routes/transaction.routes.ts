// server/src/routes/transaction.routes.ts
import { Router } from 'express';
import { transactionController } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => transactionController.getAll(req, res, next));
router.get('/export/csv', (req, res, next) => transactionController.exportCsv(req, res, next));
router.post('/import/csv', (req, res, next) => transactionController.importCsv(req, res, next));

export default router;
