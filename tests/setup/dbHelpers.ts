import db from '../../src/db/index.ts';
import {
  users,
  habits,
  NewHabit,
  entries,
  habitTags,
  tags,
  refreshTokens,
  type NewUser,
} from '../../src/db/schema';
import { generateAccessToken } from '../../src/utils/jwt.ts';
import { hashPassword } from '../../src/utils/passwords.ts';

export const createTestUser = async (userData?: Partial<NewUser>) => {
  const defaultData: NewUser = {
    email: `test-${crypto.randomUUID()}@example.com`,
    password: 'password123',
    ...userData,
  };

  const hashedPassword = await hashPassword(defaultData.password);

  const [user] = await db
    .insert(users)
    .values({ ...defaultData, password: hashedPassword })
    .returning();

  const token = await generateAccessToken({ id: user.id });

  return { user, token, password: defaultData.password };
};

export const createTestHabit = async (
  userId: string,
  habitData: Partial<NewHabit>,
) => {
  const defaultData: NewHabit = {
    name: 'Test Habit',
    description: 'Test Habit',
    userId,
    frequency: 'weekly',
    ...habitData,
  };

  const [habit] = await db.insert(habits).values(defaultData).returning();

  return habit;
};

export const cleanupDatabase = async () => {
  await db.delete(entries);
  await db.delete(habitTags);
  await db.delete(habits);
  await db.delete(tags);
  await db.delete(refreshTokens);
  await db.delete(users);
};
