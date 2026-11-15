// server/src/routes/expense.routes.ts
import { Router } from 'express';
import { expenseController } from '../controllers/expense.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => expenseController.getAll(req, res, next));
router.post('/', (req, res, next) => expenseController.create(req, res, next));
router.get('/:id', (req, res, next) => expenseController.getById(req, res, next));
router.put('/:id', (req, res, next) => expenseController.update(req, res, next));
router.delete('/:id', (req, res, next) => expenseController.delete(req, res, next));

export default router;
