import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { ApiResponse, PaginatedResponse } from '../types';

export class PasswordUtils {
  static async hash(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }

  static async compare(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
}

export class JwtUtils {
  static generate(payload: object): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');
    const expiresIn = (process.env.JWT_EXPIRES_IN ?? '7d') as unknown as SignOptions['expiresIn'];

    const options: SignOptions = { expiresIn };

    return jwt.sign(payload, secret, options);
  }

  static verify(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET is not defined');

    return jwt.verify(token, secret);
  }
}

export class ResponseUtils {
  static success<T>(message: string, data?: T): ApiResponse<T> {
    return {
      success: true,
      message,
      data,
    };
  }

  static error(message: string, error?: string): ApiResponse {
    return {
      success: false,
      message,
      error,
    };
  }

  static paginated<T>(
    data: T[],
    page: number,
    limit: number,
    total: number
  ): PaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}

export class ValidationUtils {
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isValidPassword(password: string): boolean {
    return password.length >= 6;
  }

  static sanitizeString(str: string): string {
    return str.trim().replace(/\s+/g, ' ');
  }
}