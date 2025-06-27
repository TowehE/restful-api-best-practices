import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { JwtUtils, ResponseUtils } from '../utils';
import { prisma } from '../config/database';

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json(ResponseUtils.error('Access token required'));
      return;
    }

    const decoded = JwtUtils.verify(token);
    
    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true }
    });

    if (!user) {
      res.status(401).json(ResponseUtils.error('User not found'));
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(403).json(ResponseUtils.error('Invalid or expired token'));
  }
};