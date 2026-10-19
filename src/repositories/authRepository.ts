import db from '../db/index.ts';
import { eq } from 'drizzle-orm';
import { refreshTokens, users } from '../db/schema.ts';

export const authRepository = {
  findUserByEmail: (email: string) => {
    return db.select().from(users).where(eq(users.email, email));
  },

  saveUser: (email: string, hashedPassword: string) => {
    return db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
      })
      .returning({ id: users.id, email: users.email });
  },

  saveRefreshToken: (userId: string, token: string, expiresAt: Date) => {
    return db.insert(refreshTokens).values({
      userId,
      token,
      expiresAt,
    });
  },

  findRefreshToken: (token: string) => {
    return db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.token, token));
  },

  deleteRefreshToken: (token: string) => {
    return db.delete(refreshTokens).where(eq(refreshTokens.token, token));
  },
};
