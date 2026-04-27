import type { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: Array<{ field: string; message: string }>;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_ERROR';
  const message = statusCode === 500 ? 'Internal server error' : err.message;

  if (statusCode === 500) {
    console.error('Unhandled error:', err);
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
      details: err.details,
    },
  });
}
