import type { Response } from 'express';
import type { AuthenticatedRequest } from '../middleware/auth.ts';
import { habitRepository } from '../repositories/habitRepository.ts';

export const habitController = {
  createHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { name, description, frequency, targetCount, tagIds } = req.body;

      const [result] = await habitRepository.createHabit({
        userId: req.user!.id,
        name,
        frequency,
        description,
        targetCount,
      });

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: result.id,
          tagId,
        }));

        await habitRepository.createHabitTags(habitTagValues);
      }

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

  getHabitById: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitId = req.params.id as string;
      const userId = req.user!.id;

      const habit = await habitRepository.getHabit({ habitId, userId });

      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      const habitWithTags = {
        ...habit,
        tags: habit.habitTags.map((habitTag) => habitTag.tag),
        habitTags: undefined,
      };

      res.status(200).json({ habit: habitWithTags });
    } catch (e) {
      console.error('Get habit error', e);
      res.status(500).json({ error: 'Failed to get habit' });
    }
  },

  updateHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitId = req.params.id as string;
      const userId = req.user!.id;

      const { tagIds, ...updates } = req.body;

      const [result] = await habitRepository.updateHabit({
        data: updates,
        userId,
        habitId,
      });

      if (!result) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      if (tagIds !== undefined) {
        await habitRepository.deleteHabitTags(habitId);
      }

      if (tagIds && tagIds.length > 0) {
        const habitTagValues = tagIds.map((tagId: string) => ({
          habitId: result.id,
          tagId,
        }));

        await habitRepository.createHabitTags(habitTagValues);
      }

      res.status(201).json({ message: 'Habit updated', habit: result });
    } catch (e) {
      console.error('Update habit error', e);
      res.status(500).json({ error: 'Failed to update habit' });
    }
  },

  deleteHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitId = req.params.id as string;
      const userId = req.user!.id;

      await habitRepository.deleteHabit({ userId, habitId });

      res.status(204).end();
    } catch (e) {
      console.error('Delete habit error', e);
      res.status(500).json({ error: 'Failed to delete habit' });
    }
  },

  completeHabit: async (req: AuthenticatedRequest, res: Response) => {
    try {
      const habitId = req.params.id as string;
      const userId = req.user!.id;
      const { note } = req.body;

      const habit = await habitRepository.getHabit({ habitId, userId });

      if (!habit) {
        return res.status(404).json({ error: 'Habit not found' });
      }

      if (!habit.isActive) {
        return res
          .status(400)
          .json({ error: 'Cannot complete an inactive habit' });
      }

      const [newEntry] = await habitRepository.newEntry({
        habitId,
        completionDate: new Date(),
        note,
      });

      res.status(201).json({ message: 'Habit completed', entry: newEntry });
    } catch (e) {
      console.error('Complete habit error', e);
      res.status(500).json({ error: 'Failed to complete habit' });
    }
  },
};
