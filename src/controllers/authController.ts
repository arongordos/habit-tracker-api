import 'dotenv/config';
import type { Request, Response } from 'express';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.ts';
import { comparePassword, hashPassword } from '../utils/passwords.ts';
import { authRepository } from '../repositories/authRepository.ts';

export const authController = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const [user] = await authRepository.findUserByEmail(email);

      if (user) {
        return res.status(409).json({ error: 'This user already exists' });
      }

      const hashedPassword = await hashPassword(password);

      const [newUser] = await authRepository.saveUser(email, hashedPassword);

      const accessToken = await generateAccessToken({
        id: newUser.id,
      });

      const refreshToken = await generateRefreshToken({
        id: newUser.id,
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authRepository.saveRefreshToken(
        newUser.id,
        refreshToken,
        expiresAt,
      );

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.APP_STAGE === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      return res
        .status(201)
        .json({ message: 'User created', user: newUser, accessToken });
    } catch (e) {
      console.error('Registration error', e);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  login: async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const [user] = await authRepository.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const isPasswordValid = await comparePassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const accessToken = await generateAccessToken({
        id: user.id,
      });

      const refreshToken = await generateRefreshToken({
        id: user.id,
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authRepository.saveRefreshToken(user.id, refreshToken, expiresAt);

      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.APP_STAGE === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      return res.status(201).json({
        message: 'Login successful',
        user: {
          id: user.id,
          email: user.email,
        },
        accessToken,
      });
    } catch (e) {
      console.error('Login error', e);
      res.status(500).json({ error: 'Failed to log in user' });
    }
  },

  refreshToken: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;
      if (!refreshToken) {
        return res.status(401).json({ error: 'Missing refresh token' });
      }

      const [token] = await authRepository.findRefreshToken(refreshToken);
      if (!token) {
        return res.status(401).json({ error: 'Invalid refresh token' });
      }

      await authRepository.deleteRefreshToken(refreshToken);

      const newAccessToken = await generateAccessToken({
        id: token.userId,
      });

      const newRefreshToken = await generateRefreshToken({
        id: token.userId,
      });

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

      await authRepository.saveRefreshToken(
        token.userId,
        newRefreshToken,
        expiresAt,
      );

      res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.APP_STAGE === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7d
      });

      return res.json({ accessToken: newAccessToken });
    } catch (e) {
      console.error('Refresh token error', e);
      res.status(500).json({ error: 'Failed to refresh token' });
    }
  },

  logout: async (req: Request, res: Response) => {
    try {
      const refreshToken = req.cookies?.refreshToken;

      if (refreshToken) {
        await authRepository.deleteRefreshToken(refreshToken);
      }

      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.APP_STAGE === 'production',
        sameSite: 'lax',
      });

      return res.status(200).json({ message: 'Logout successful' });
    } catch (e) {
      res.status(500).json({ error: 'Failed to log out' });
    }
  },
};
