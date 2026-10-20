import type { NextFunction, Request, Response } from 'express';
import { env } from '../../env.ts';

export class APIError extends Error {
  name: string;
  status: number;
  message: string;
  constructor(name: string, message: string, status: number) {
    super();
    this.name = name;
    this.status = status;
    this.message = message;
  }
}

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error(err.stack);

  let status = err.status || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = 'Validation Error';
  }

  if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  }

  res.status(status).json({
    error: message,
    ...(env.APP_STAGE === 'dev' && {
      stack: err.stack,
      details: err.message,
    }),
  });
};
