import { type JWTPayload, jwtVerify, SignJWT } from 'jose';
import { createSecretKey } from 'node:crypto';
import { env } from '../../env.ts';

export interface JwtPayload extends JWTPayload {
  id: string;
}

export const generateAccessToken = (payload: JwtPayload) => {
  const secretKey = createSecretKey(env.JWT_ACCESS_SECRET, 'utf-8');

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(secretKey);
};

export const generateRefreshToken = (payload: JwtPayload) => {
  const secretKey = createSecretKey(env.JWT_REFRESH_SECRET, 'utf-8');

  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey);
};

export const verifyToken = async (token: string): Promise<JwtPayload> => {
  const secretKey = createSecretKey(env.JWT_ACCESS_SECRET, 'utf-8');
  const { payload } = await jwtVerify(token, secretKey);

  return payload as JwtPayload;
};
