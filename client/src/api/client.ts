import ky from 'ky';

const API_BASE = '/api';

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshPromise: Promise<void> | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

export function loadTokens() {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

async function doRefresh(): Promise<void> {
  if (!refreshToken) throw new Error('No refresh token');

  const res = await ky
    .post(`${API_BASE}/auth/refresh`, {
      json: { refreshToken },
    })
    .json<{ accessToken: string; refreshToken: string }>();

  setTokens(res.accessToken, res.refreshToken);
}

async function tryRefresh(): Promise<void> {
  if (!refreshPromise) {
    refreshPromise = doRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

export const api = ky.create({
  prefixUrl: API_BASE,
  hooks: {
    beforeRequest: [
      (request) => {
        if (accessToken) {
          request.headers.set('Authorization', `Bearer ${accessToken}`);
        }
      },
    ],
    afterResponse: [
      async (request, _options, response) => {
        if (response.status === 401 && refreshToken) {
          try {
            await tryRefresh();
            request.headers.set('Authorization', `Bearer ${accessToken}`);
            return ky(request);
          } catch {
            clearTokens();
            window.location.href = '/login';
          }
        }
        return response;
      },
    ],
  },
});
