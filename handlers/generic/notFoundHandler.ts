import { NextFunction, Request, Response } from 'express';
import { NotFoundError } from '../../errors';

export const router = (_req: Request, _res: Response, next: NextFunction) => {
  const err = new NotFoundError();
  next(err);
};
