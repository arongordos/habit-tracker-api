import { Router } from 'express';
import { validateBody } from '../middleware/validation.ts';
import { insertUserSchema } from '../db/schema.ts';
import { authController } from '../controllers/authController.ts';

const router = Router();

router.post(
  '/register',
  validateBody(insertUserSchema),
  authController.register,
);

router.post('/login', validateBody(insertUserSchema), authController.login);

router.post('/refresh-token', authController.refreshToken);

router.post('/logout', authController.logout);

export default router;
