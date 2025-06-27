import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { ResponseUtils } from '../utils';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';


export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';

  // Handle specific error types
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
  } else if (error instanceof PrismaClientKnownRequestError) {
    // Handle Prisma errors
    switch (error.code) {
      case 'P2002':
        statusCode = 409;
        message = 'Resource already exists';
        break;
      case 'P2025':
        statusCode = 404;
        message = 'Resource not found';
        break;
      default:
        statusCode = 400;
        message = 'Database operation failed';
    }
  } else if (error instanceof PrismaClientValidationError) {
    statusCode = 400;
    message = 'Invalid data provided';
  }

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error(error);
  }

  res.status(statusCode).json(
    ResponseUtils.error(message, process.env.NODE_ENV === 'development' ? error.message : undefined)
  );
};

export const notFoundHandler = (req: Request, res: Response): void => {
  res.status(404).json(ResponseUtils.error(`Route ${req.originalUrl} not found`));
};