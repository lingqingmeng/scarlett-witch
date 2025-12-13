import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, login as loginApi, logout as logoutApi } from '../api/auth';
import type { LoginResponse, User } from '../api/auth';

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem(ACCESS_TOKEN_KEY));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem(REFRESH_TOKEN_KEY));
  const [loading, setLoading] = useState<boolean>(!!accessToken);

  useEffect(() => {
    const hydrate = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }
      try {
        const me = await fetchCurrentUser();
        setUser(me);
      } catch (error) {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        setAccessToken(null);
        setRefreshToken(null);
      } finally {
        setLoading(false);
      }
    };
    void hydrate();
  }, [accessToken]);

  const persistTokens = (data: LoginResponse) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
    setAccessToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  };

  const login = async (email: string, password: string) => {
    const data = await loginApi({ email, password });
    persistTokens(data);
    setUser(data.user);
  };

  const logout = async () => {
    if (refreshToken) {
      try {
        await logoutApi(refreshToken);
      } catch (error) {
        // ignore network/log out errors to keep UX simple
      }
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      accessToken,
      refreshToken,
      loading,
      login,
      logout,
    }),
    [user, accessToken, refreshToken, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return ctx;
}
