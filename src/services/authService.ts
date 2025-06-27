import { User } from '@prisma/client';
import { prisma } from '../config/database';
import { PasswordUtils, JwtUtils } from '../utils';
import { CreateUserRequest, LoginRequest } from '../types';
import { AppError } from '../middleware/errorHandler';

export class AuthService {
  static async register(userData: CreateUserRequest): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userData.email },
          { username: userData.username }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw new AppError('Email already registered', 409);
      }
      throw new AppError('Username already taken', 409);
    }

    // Hash password
    const hashedPassword = await PasswordUtils.hash(userData.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    // Generate token
    const token = JwtUtils.generate({
      id: user.id,
      email: user.email,
      username: user.username
    });

    return { user, token };
  }

  static async login(credentials: LoginRequest): Promise<{ user: Omit<User, 'password'>, token: string }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: credentials.email }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    // Verify password
    const isValidPassword = await PasswordUtils.compare(credentials.password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = JwtUtils.generate({
      id: user.id,
      email: user.email,
      username: user.username
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  static async getUserProfile(userId: string): Promise<Omit<User, 'password'>> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }
}