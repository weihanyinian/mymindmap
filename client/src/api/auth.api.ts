import { api } from './client';
import type { IAuthResponse, IUser } from '@mindflow/shared';

export const authApi = {
  register(data: { username: string; password: string }) {
    return api.post('auth/register', { json: data }).json<IAuthResponse>();
  },

  login(data: { username: string; password: string }) {
    return api.post('auth/login', { json: data }).json<IAuthResponse>();
  },

  refresh(refreshToken: string) {
    return api
      .post('auth/refresh', { json: { refreshToken } })
      .json<{ accessToken: string; refreshToken: string }>();
  },

  getMe() {
    return api.get('auth/me').json<{ user: IUser }>();
  },
};
