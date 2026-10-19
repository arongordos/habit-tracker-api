import 'dotenv/config';
import db from './index.ts';
import { users, habits, entries, tags, habitTags } from './schema.ts';
import { hashPassword } from '../utils/passwords.ts';

const seed = async () => {
  console.log('🌱 Starting db seed...');

  try {
    console.log('Clearing existing data...');
    await db.delete(entries);
    await db.delete(habitTags);
    await db.delete(habits);
    await db.delete(tags);
    await db.delete(users);

    console.log('Creating demo users...');

    const password = 'password123';
    const [demoUser] = await db
      .insert(users)
      .values({
        email: 'demo@app.com',
        password: await hashPassword(password),
        firstName: 'Demo',
        lastName: 'User',
      })
      .returning();

    console.log('Creating tags...');
    const [healthTag] = await db
      .insert(tags)
      .values({
        name: 'Health',
        color: '#f0f0f0',
      })
      .returning();

    console.log('Creating habits...');
    const [exerciseHabit] = await db
      .insert(habits)
      .values({
        userId: demoUser.id,
        name: 'Exercise',
        description: 'Daily workout',
        frequency: 'daily',
        targetCount: 1,
      })
      .returning();

    console.log('Creating habit tags...');
    await db.insert(habitTags).values({
      habitId: exerciseHabit.id,
      tagId: healthTag.id,
    });

    console.log('Adding completion entries...');
    const today = new Date();
    today.setHours(12, 0, 0);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      await db.insert(entries).values({
        habitId: exerciseHabit.id,
        completionDate: date,
      });
    }

    console.log('✅ DB seeded successfully');
    console.log('🔑 User credentials:');
    console.log(`Email: ${demoUser.email}`);
    console.log(`Password: ${password}`);
  } catch (e) {
    console.error('❌ Seed failed', e);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => process.exit(0))
    .catch((e) => process.exit(1));
}

export default seed;
