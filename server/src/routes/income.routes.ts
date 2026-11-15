// server/src/routes/income.routes.ts
import { Router } from 'express';
import { incomeController } from '../controllers/income.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => incomeController.getAll(req, res, next));
router.post('/', (req, res, next) => incomeController.create(req, res, next));
router.get('/:id', (req, res, next) => incomeController.getById(req, res, next));
router.put('/:id', (req, res, next) => incomeController.update(req, res, next));
router.delete('/:id', (req, res, next) => incomeController.delete(req, res, next));

export default router;
