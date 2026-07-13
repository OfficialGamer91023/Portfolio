import { Request, Response, NextFunction } from 'express';

/**
 * Logs method, path, status code, and response time for every request.
 * Placed early in the middleware chain to capture all routes.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(`${req.method} ${req.path} ${res.statusCode} - ${duration}ms`);
  });

  next();
}
