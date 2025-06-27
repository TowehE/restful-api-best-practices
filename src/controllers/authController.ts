import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import { ResponseUtils } from '../utils';
import { CreateUserRequest, LoginRequest, AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData: CreateUserRequest = req.body;
      const result = await AuthService.register(userData);

      res.status(201).json(
        ResponseUtils.success('User registered successfully', {
          user: result.user,
          token: result.token
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const credentials: LoginRequest = req.body;
      const result = await AuthService.login(credentials);

      res.status(200).json(
        ResponseUtils.success('Login successful', {
          user: result.user,
          token: result.token
        })
      );
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user!.id;
      const user = await AuthService.getUserProfile(userId);

      res.status(200).json(
        ResponseUtils.success('Profile retrieved successfully', user)
      );
    } catch (error) {
      next(error);
    }
  }
}