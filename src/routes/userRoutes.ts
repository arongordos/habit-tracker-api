import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.ts';

const router = Router();

router.use(authenticateToken);

router.get('/', (req, res) => {
  res.json({ message: 'Users' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'One user' });
});

router.put('/:id', (req, res) => {
  res.json({ message: 'User updated' });
});

router.delete('/:id', (req, res) => {
  res.status(204).json({ message: 'User deleted' });
});

export default router;
