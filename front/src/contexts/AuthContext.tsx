// Le hook useAuth est volontairement colocalisé avec son provider (un seul fichier
// de contexte) — exception assumée à react-refresh/only-export-components.
/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { api } from '../lib/api';
import { MeRequest } from 'platform/contracts/login/me/me.request';
import { LogoutRequest } from 'platform/contracts/login/logout/logout.request';

export interface AuthUser {
  sub: string;
  slug: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  isAdmin: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function refresh() {
    try {
      const { data } = await api.get<AuthUser>(MeRequest.buildUrl());
      setUser(data);
    } catch {
      setUser(null);
    }
  }

  async function logout() {
    await api.post(LogoutRequest.buildUrl());
    setUser(null);
  }

  useEffect(() => {
    // Bootstrap de session au montage : fetch /me, puis fin du loading. Le setState
    // est asynchrone (post-fetch), pas une cascade synchrone que la règle vise.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh().finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
