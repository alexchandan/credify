"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { apiRequest, configureApiClient } from "@/lib/apiClient";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
}

interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  role: "candidate" | "recruiter";
}

interface RegisterResult {
  userId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /**
   * Always false. Session restore now happens server-side (see
   * getServerSession in @/lib/serverSession) before the app's first paint,
   * so there's no client-side mount-time gap left to represent. Kept so
   * existing consumers (RequireRole, RequireGuest) don't need to change.
   */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  // update the session without re-implementing token storage. (eg. change Password)
  applySession: (accessToken: string, user: AuthUser) => void;
  /** Clears local session state without calling the API — for use after
   * deleteAccount() succeeds, where there's no account left to log out of. */
  clearLocalSession: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /** Resolved server-side by getServerSession() before this ever mounts. */
  initialUser: AuthUser | null;
  initialAccessToken: string | null;
}

export function AuthProvider({
  children,
  initialUser,
  initialAccessToken,
}: AuthProviderProps) {
  const tokenRef = useRef<string | null>(initialAccessToken);
  const [user, setUser] = useState<AuthUser | null>(initialUser);

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    setUser(null);
  }, []);

  useEffect(() => {
    configureApiClient({
      getAccessToken: () => tokenRef.current,
      onTokenRefreshed: (token) => {
        tokenRef.current = token;
      },
      onUnauthorized: clearSession,
    });
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResult>("/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    });
    tokenRef.current = result.data.accessToken;
    setUser(result.data.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const result = await apiRequest<RegisterResult>("/auth/register", {
      method: "POST",
      body: input,
      skipAuth: true,
    });
    return result.data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiRequest("/auth/logout", { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const logoutEverywhere = useCallback(async () => {
    try {
      await apiRequest("/auth/logout-everywhere", { method: "POST" });
    } finally {
      clearSession();
    }
  }, [clearSession]);

  const applySession = useCallback(
    (accessToken: string, nextUser: AuthUser) => {
      tokenRef.current = accessToken;
      setUser(nextUser);
    },
    [],
  );

  const clearLocalSession = useCallback(() => {
    clearSession();
  }, [clearSession]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading: false,
        login,
        register,
        logout,
        logoutEverywhere,
        applySession,
        clearLocalSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
