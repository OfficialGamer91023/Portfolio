import { Request, Response, NextFunction } from 'express';
import { ApiErrorResponse } from '../types';

/**
 * Global error handler — must be the last middleware registered.
 * Catches unhandled errors from route handlers and returns a consistent JSON shape.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Unhandled error:', err.message);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  const errorResponse: ApiErrorResponse = {
    error: err.message || 'Internal Server Error',
    status: statusCode,
  };

  res.status(statusCode).json(errorResponse);
}
