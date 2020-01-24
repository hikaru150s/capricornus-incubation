import { NextFunction, Request, Response } from 'express';

export function asyncHandlers(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(error => next(error));
  };
}
