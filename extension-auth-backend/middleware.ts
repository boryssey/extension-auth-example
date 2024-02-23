import { NextFunction } from "express"

import { Request, Response } from "express"
import { verifyToken } from "./jwt"
import { getUser } from "./service"
import * as jwt from 'jsonwebtoken';


declare global {
  namespace Express {
    interface Request {
      user: {
        email: string;
        id: string;
      }
    }
  }
}

export const isLoggedInMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const { access_token } = req.cookies
  if (!access_token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const data = verifyToken(access_token);
    if (!data.sub) return res.status(401).json({ error: 'Unauthorized' })
    const user = getUser(data.sub.id)
    if (!user) {
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')
      return res.status(401).json({ error: 'Unauthorized' })
    }
    req.user = user;
    next()
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'AccessTokenExpired' })
    }

    console.error(error);
    return res.status(401).json({ error: 'Unauthorized' })
  }
}