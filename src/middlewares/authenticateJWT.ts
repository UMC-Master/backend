import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Request 타입 확장
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        email: string;
      };
    }
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Authorization header is missing or invalid' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    if (!process.env.JWT_SECRET) {
      res.status(500).json({ message: 'Internal server error: Missing JWT secret' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; email: string };

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
    };


    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(403).json({ message: 'Token has expired' });
    } else if (error instanceof jwt.JsonWebTokenError) {
      res.status(403).json({ message: 'Invalid token' });
    } else {
      res.status(500).json({ message: 'Internal server error during token verification' });
    }
  }
};