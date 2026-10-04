import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('API Error:', err);

  if (err.name === 'PrismaClientKnownRequestError') {
    if (err.code === 'P2002') {
      return sendError(res, 'A record with this unique field already exists.', 409);
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Requested record was not found.', 404);
    }
  }

  const message = err.message || 'Internal server error';
  const statusCode = err.statusCode || 500;
  return sendError(res, message, statusCode);
}
