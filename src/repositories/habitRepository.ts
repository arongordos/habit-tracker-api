import { and, eq } from 'drizzle-orm';
import db from '../db/index.ts';
import { type Habit, type NewHabit, habits } from '../db/schema.ts';

export const habitRepository = {
  createHabit: (data: NewHabit) => {
    return db.insert(habits).values(data).returning();
  },

  getHabits: (userId: string) => {
    return db.query.habits.findMany({
      where: {
        userId: {
          eq: userId,
        },
      },
      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  updateHabit: ({
    data,
    habitId,
    userId,
  }: {
    data: Habit;
    habitId: string;
    userId: string;
  }) => {
    return db
      .update(habits)
      .set(data)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .returning();
  },
};
