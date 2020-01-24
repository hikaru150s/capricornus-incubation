import { NextFunction, Request, Response } from 'express';
import { verify } from 'jsonwebtoken';
import { GenericError, UnathorizedError } from '../errors';
import { JWT_SECRET } from '../globals/Constants';

export function guard(req: Request, _res: Response, next: NextFunction) {
  try {
    if (req.headers?.authorization) {
      const auth = req.headers.authorization.split(' ');
      if (auth.length === 2 && auth[0].toLowerCase() === 'bearer') {
        try {
          verify(auth[1], JWT_SECRET);
          next();
        } catch (x) {
          throw new UnathorizedError('Unathorized!');
        }
      } else {
        throw new UnathorizedError('Unathorized!');
      }
    } else {
      next();
    }
  } catch (e) {
    if (e instanceof GenericError) {
      next(e);
    } else {
      next(new GenericError(e, 500));
    }
  }
}
