// server/src/middlewares/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { dbStore } from '../repositories/db.store';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
  };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Authentication token required. Please log in.',
      });
      return;
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired session token. Please refresh or log in again.',
      });
      return;
    }

    const user = await dbStore.findUserById(decoded.userId);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'The user account associated with this token no longer exists.',
      });
      return;
    }

    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication internal validation error',
    });
  }
};

export const requireRole = (role: string) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || req.user.role !== role) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to ${role} privilege level.`,
      });
      return;
    }
    next();
  };
};
