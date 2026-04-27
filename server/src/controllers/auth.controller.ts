import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authenticate';
import * as authService from '../services/auth.service';

export async function register(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, username, password } = req.body;
    const result = await authService.register(email, username, password);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function login(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body;
    const tokens = await authService.refresh(refreshToken);
    res.json(tokens);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.userId!);
    res.json({ user });
  } catch (err) {
    next(err);
  }
}
