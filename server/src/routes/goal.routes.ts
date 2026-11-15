// server/src/routes/goal.routes.ts
import { Router } from 'express';
import { goalController } from '../controllers/goal.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => goalController.getAll(req, res, next));
router.post('/', (req, res, next) => goalController.create(req, res, next));
router.put('/:id', (req, res, next) => goalController.update(req, res, next));
router.post('/:id/contribute', (req, res, next) => goalController.contribute(req, res, next));
router.delete('/:id', (req, res, next) => goalController.delete(req, res, next));

export default router;
