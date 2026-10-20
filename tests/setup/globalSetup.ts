import db from '../../src/db/index.ts';
import {
  users,
  habits,
  entries,
  tags,
  habitTags,
  refreshTokens,
} from '../../src/db/schema.ts';
import { sql } from 'drizzle-orm';
import { execSync } from 'child_process';

export default async function setup() {
  console.log('Setting up test database...');

  try {
    await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${refreshTokens} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
    await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

    console.log('🚀 Pushing schema...');
    execSync(
      `npx drizzle-kit push --url="${process.env.DATABASE_URL}" --schema="./src/db/schema.ts" --dialect="postgresql"`,
      { stdio: 'inherit', cwd: process.cwd() },
    );

    console.log('✅ Test database setup complete');
  } catch (e) {
    console.error('❌ Failed to setup test database...', e);
    throw e;
  }

  return async () => {
    console.log('🧹 Tearing down test database...');

    try {
      await db.execute(sql`DROP TABLE IF EXISTS ${entries} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habits} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${refreshTokens} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${users} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${tags} CASCADE`);
      await db.execute(sql`DROP TABLE IF EXISTS ${habitTags} CASCADE`);

      console.log('✅ Test database teardown complete');
    } catch (e) {
      console.error('❌ Failed to teardown test database...', e);
    }
  };
}
