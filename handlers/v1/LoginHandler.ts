import { Router } from 'express';
import { sign } from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { User } from '../../entities';
import { GenericError, UnathorizedError } from '../../errors';
import { JWT_SECRET } from '../../globals/Constants';
import { asyncHandlers } from '../../middlewares';
import { verifyPassword } from '../../utils';

export const router = Router();

router.post('/', asyncHandlers(async (req, res, next) => {
  try {
    const email: string = req.body?.email;
    const password: string = req.body?.password;
    const target = await getRepository(User).findOneOrFail({ email });
    if (verifyPassword(password, target.password)) {
      const payload = {
        id: target.id,
        name: target.name,
        role: target.role,
        email: target.email,
      };
      const jwt = sign(payload, JWT_SECRET, {
        algorithm: 'HS512',
        expiresIn: '6h',
        subject: target.id.toString(),
        issuer: 'http://127.0.0.1:8000/api/login',
      });
      res.status(200).json({
        token: jwt,
        token_type: 'bearer',
        expiresIn: 21600,
      });
    } else {
      throw new UnathorizedError('Unathorized');
    }
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}));
