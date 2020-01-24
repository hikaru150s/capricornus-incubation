import { Router } from 'express';
import { jwtGuard } from '../../middlewares';

export const router = Router();

router.delete('/', jwtGuard, (_req, res) => {
  res.status(204).json();
});
