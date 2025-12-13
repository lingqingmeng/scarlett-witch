import api from './http';

export type User = {
  id: number;
  email: string;
  role: 'admin' | 'editor';
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
};

export type LoginResponse = AuthTokens & { user: User };

export async function login(payload: { email: string; password: string }) {
  const { data } = await api.post<LoginResponse>('/auth/login', payload);
  return data;
}

export async function register(payload: { email: string; password: string; role?: 'admin' | 'editor' }) {
  const { data } = await api.post<{ id: number; email: string; role: User['role'] }>('/auth/register', payload);
  return data;
}

export async function logout(refreshToken: string) {
  await api.post('/auth/logout', { refreshToken });
}

export async function fetchCurrentUser() {
  const { data } = await api.get<{ user: User }>('/auth/me');
  return data.user;
}
