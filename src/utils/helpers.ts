import { Response } from 'express';
import { ApiResponse } from '../types';



export const sendResponse = <T>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data?: T,
  meta?: any
): Response => {
  const response: ApiResponse<T> = {
    success,
    message,
    ...(data && { data }),
    ...(meta && { meta }),
  };

  return res.status(statusCode).json(response);
};



export const sendError = (
  res: Response,
  statusCode: number,
  message: string,
  error?: any
): Response => {
  const response: ApiResponse = {
    success: false,
    message,
    ...(error && process.env.NODE_ENV === 'development' && { error }),
  };

  return res.status(statusCode).json(response);
};

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};