import { Router } from 'express';
import { validateBody } from '../middleware/validation.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { habitController } from '../controllers/habitController.ts';
import { insertHabitSchema, updateHabitSchema } from '../db/schema.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', habitController.getUserHabits);

router.get('/:id', habitController.getHabitById);

router.post('/', validateBody(insertHabitSchema), habitController.createHabit);

router.patch(
  '/:id',
  validateBody(updateHabitSchema.strict()),
  habitController.updateHabit,
);

router.delete('/:id', habitController.deleteHabit);

router.post('/:id/complete', habitController.completeHabit);

export default router;
