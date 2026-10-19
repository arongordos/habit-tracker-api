import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { habitRepository } from '../repositories/habitRepository.ts';

export const habitController = {
  createHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, frequency, targetCount } = req.body;

      const [result] = await habitRepository.createHabit({
        userId: req.user!.id,
        name,
        frequency,
        description,
        targetCount,
      });

      res.status(201).json({ message: 'Habit created', habit: result });
    } catch (e) {
      console.error('Create habit error', e);
      res.status(500).json({ error: 'Failed to create habit' });
    }
  },

  getUserHabits: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitsWithTags = await habitRepository.getHabits(req.user!.id);

      const result = habitsWithTags.map((habit) => ({
        ...habit,
        tags: habit.habitTags.map((habitTag) => habitTag.tag),
        habitTags: undefined,
      }));

      res.status(200).json({ habits: result });
    } catch (e) {
      console.error('Get habits error', e);
      res.status(500).json({ error: 'Failed to get habits' });
    }
  },

  updateHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitId = req.params.id as string;
      const userId = req.user!.id;

      const [result] = await habitRepository.updateHabit({
        data: req.body,
        userId,
        habitId,
      });

      if (!result) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      res.status(201).json({ message: 'Habit updated', habit: result });
    } catch (e) {
      console.error('Update habit error', e);
      res.status(500).json({ error: 'Failed to update habit' });
    }
  },
};
