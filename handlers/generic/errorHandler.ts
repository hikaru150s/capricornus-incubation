import { NextFunction, Request, Response } from 'express';
import { join } from 'path';
import { GenericError } from '../../errors';
import { IResponse } from '../../interfaces';
import { errorLogger } from '../../utils';

export const router = (err: GenericError, _req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }
  const body: IResponse = {
    error: true,
    info: err.message,
    data: process.env.DEVMODE ? err : null,
  };
  console.error(`[${new Date().toISOString()}] ERR:`, err);
  errorLogger(join(__dirname, '../../logs/errors'), err);
  res.status(err.status || 500).json(body);
};
