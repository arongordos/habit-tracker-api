import { Router } from 'express';
import { validateBody } from '../middleware/validation.ts';
import { authenticateToken } from '../middleware/auth.ts';
import { habitController } from '../controllers/habitController.ts';
import { insertHabitSchema, updateHabitSchema } from '../db/schema.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', habitController.getUserHabits);

router.get('/:id', (req, res) => {
  res.json({ message: 'One habits' });
});

router.post('/', validateBody(insertHabitSchema), habitController.createHabit);

router.patch(
  '/:id',
  validateBody(updateHabitSchema.strict()),
  habitController.updateHabit,
);

router.delete('/:id', (req, res) => {
  res.status(204).json({ message: 'Habit deleted' });
});

router.post('/:id/complete', (req, res) => {
  res.status(201).json({ message: 'Habit completed' });
});

export default router;
