import { Request, Response, NextFunction } from 'express';
import { ValidationUtils, ResponseUtils } from '../utils';
import { CreateUserRequest, LoginRequest, CreatePostRequest, UpdatePostRequest } from '../types';

export const validateRegistration = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, username, password, firstName, lastName }: CreateUserRequest = req.body;

  const errors: string[] = [];

  if (!email || !ValidationUtils.isValidEmail(email)) {
    errors.push('Valid email is required');
  }

  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }

  if (!password || !ValidationUtils.isValidPassword(password)) {
    errors.push('Password must be at least 6 characters long');
  }

  if (firstName && firstName.trim().length === 0) {
    errors.push('First name cannot be empty');
  }

  if (lastName && lastName.trim().length === 0) {
    errors.push('Last name cannot be empty');
  }

  if (errors.length > 0) {
    res.status(400).json(ResponseUtils.error('Validation failed', errors.join(', ')));
    return;
  }

  // Sanitize input
  req.body.email = email.toLowerCase().trim();
  req.body.username = username.trim();
  req.body.firstName = firstName?.trim();
  req.body.lastName = lastName?.trim();

  next();
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { email, password }: LoginRequest = req.body;

  if (!email || !ValidationUtils.isValidEmail(email)) {
    res.status(400).json(ResponseUtils.error('Valid email is required'));
    return;
  }

  if (!password) {
    res.status(400).json(ResponseUtils.error('Password is required'));
    return;
  }

  req.body.email = email.toLowerCase().trim();
  next();
};

export const validateCreatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, excerpt, published }: CreatePostRequest = req.body;

  const errors: string[] = [];

  if (!title || title.trim().length === 0) {
    errors.push('Title is required');
  }

  if (!content || content.trim().length === 0) {
    errors.push('Content is required');
  }

  if (title && title.trim().length > 200) {
    errors.push('Title must be less than 200 characters');
  }

  if (excerpt && excerpt.trim().length > 500) {
    errors.push('Excerpt must be less than 500 characters');
  }

  if (published !== undefined && typeof published !== 'boolean') {
    errors.push('Published must be a boolean value');
  }

  if (errors.length > 0) {
    res.status(400).json(ResponseUtils.error('Validation failed', errors.join(', ')));
    return;
  }

  // Sanitize input
  req.body.title = ValidationUtils.sanitizeString(title);
  req.body.content = content.trim();
  req.body.excerpt = excerpt ? ValidationUtils.sanitizeString(excerpt) : undefined;

  next();
};

export const validateUpdatePost = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { title, content, excerpt, published }: UpdatePostRequest = req.body;

  const errors: string[] = [];

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Title cannot be empty');
    } else if (title.trim().length > 200) {
      errors.push('Title must be less than 200 characters');
    }
  }

  if (content !== undefined) {
    if (typeof content !== 'string' || content.trim().length === 0) {
      errors.push('Content cannot be empty');
    }
  }

  if (excerpt !== undefined && excerpt !== null) {
    if (typeof excerpt !== 'string' || excerpt.trim().length > 500) {
      errors.push('Excerpt must be less than 500 characters');
    }
  }

  if (published !== undefined && typeof published !== 'boolean') {
    errors.push('Published must be a boolean value');
  }

  if (errors.length > 0) {
    res.status(400).json(ResponseUtils.error('Validation failed', errors.join(', ')));
    return;
  }

  // Sanitize input
  if (title !== undefined) {
    req.body.title = ValidationUtils.sanitizeString(title);
  }
  if (content !== undefined) {
    req.body.content = content.trim();
  }
  if (excerpt !== undefined) {
    req.body.excerpt = excerpt ? ValidationUtils.sanitizeString(excerpt) : null;
  }

  next();
};