// server/src/routes/budget.routes.ts
import { Router } from 'express';
import { budgetController } from '../controllers/budget.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => budgetController.getAll(req, res, next));
router.post('/', (req, res, next) => budgetController.create(req, res, next));
router.put('/:id', (req, res, next) => budgetController.update(req, res, next));
router.delete('/:id', (req, res, next) => budgetController.delete(req, res, next));

export default router;
