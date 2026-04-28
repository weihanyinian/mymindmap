import { User, type IUserDocument } from '../models/User';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import type { IUser, IAuthResponse } from '@mindflow/shared';

function toUserResponse(doc: IUserDocument): IUser {
  return {
    _id: doc._id.toString(),
    username: doc.username,
    avatar: doc.avatar,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function generateTokens(userId: string, tokenVersion: number): {
  accessToken: string;
  refreshToken: string;
} {
  const payload = { userId, tokenVersion };
  return {
    accessToken: signAccessToken(payload),
    refreshToken: signRefreshToken(payload),
  };
}

export async function register(
  username: string,
  password: string
): Promise<IAuthResponse> {
  const existing = await User.findOne({ username });
  if (existing) {
    throw Object.assign(new Error('Username already exists'), {
      statusCode: 409,
      code: 'DUPLICATE_FIELD',
      details: [{ field: 'username', message: 'This username is already taken' }],
    });
  }

  const user = await User.create({ username, password });
  const tokens = generateTokens(user._id.toString(), user.tokenVersion);

  return { user: toUserResponse(user), ...tokens };
}

export async function login(
  username: string,
  password: string
): Promise<IAuthResponse> {
  const user = await User.findOne({ username });
  if (!user) {
    throw Object.assign(new Error('Invalid username or password'), {
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    throw Object.assign(new Error('Invalid username or password'), {
      statusCode: 401,
      code: 'INVALID_CREDENTIALS',
    });
  }

  const tokens = generateTokens(user._id.toString(), user.tokenVersion);
  return { user: toUserResponse(user), ...tokens };
}

export async function refresh(
  token: string
): Promise<{ accessToken: string; refreshToken: string }> {
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw Object.assign(new Error('Invalid or expired refresh token'), {
      statusCode: 401,
      code: 'INVALID_REFRESH_TOKEN',
    });
  }

  const user = await User.findById(payload.userId);
  if (!user || user.tokenVersion !== payload.tokenVersion) {
    throw Object.assign(new Error('Token has been revoked'), {
      statusCode: 401,
      code: 'TOKEN_REVOKED',
    });
  }

  // Rotate tokens
  user.tokenVersion += 1;
  await user.save();

  return generateTokens(user._id.toString(), user.tokenVersion);
}

export async function getMe(userId: string): Promise<IUser> {
  const user = await User.findById(userId);
  if (!user) {
    throw Object.assign(new Error('User not found'), {
      statusCode: 404,
      code: 'USER_NOT_FOUND',
    });
  }
  return toUserResponse(user);
}
