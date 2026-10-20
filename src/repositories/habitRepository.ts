import { and, eq } from 'drizzle-orm';
import db from '../db/index.ts';
import {
  type Habit,
  type NewHabit,
  entries,
  habitTags,
  habits,
} from '../db/schema.ts';

export const habitRepository = {
  createHabit: (data: NewHabit) => {
    return db.insert(habits).values(data).returning();
  },

  createHabitTags: (values: { habitId: string; tagId: string }[]) => {
    return db.insert(habitTags).values(values);
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
        entries: {
          orderBy: {
            createdAt: 'desc',
          },
          limit: 10,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  },

  getHabit: ({ habitId, userId }: { habitId: string; userId: string }) => {
    return db.query.habits.findFirst({
      where: {
        userId: {
          eq: userId,
        },
        id: {
          eq: habitId,
        },
      },

      with: {
        habitTags: {
          with: {
            tag: true,
          },
        },
        entries: {
          orderBy: {
            completionDate: 'desc',
          },
          limit: 10,
        },
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

  deleteHabit: ({ userId, habitId }: { userId: string; habitId: string }) => {
    return db
      .delete(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)));
  },

  deleteHabitTags: (habitId: string) => {
    return db.delete(habitTags).where(eq(habitTags.habitId, habitId));
  },

  newEntry: ({
    habitId,
    completionDate,
    note,
  }: {
    habitId: string;
    completionDate: Date;
    note: string;
  }) => {
    return db
      .insert(entries)
      .values({ habitId, completionDate, note })
      .returning();
  },
};
