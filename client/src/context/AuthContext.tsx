"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  startTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  apiRequest,
  configureApiClient,
  refreshAccessToken,
} from "@/lib/apiClient";
import {
  AUTH_USER_SNAPSHOT_COOKIE,
  decodeAuthUserSnapshot,
  writeAuthUserSnapshot,
} from "@/lib/authUserSnapshot";

export type UserRole = "candidate" | "recruiter" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  isVerified?: boolean;
  fullName?: string;
  avatarUrl?: string;
}

interface LoginResult {
  accessToken: string;
  user: AuthUser;
}

export interface RegisterInput {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  role: "candidate" | "recruiter";
}

interface RegisterResult {
  userId: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  /** True only during the initial mount-time session-restore attempt. */
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (input: RegisterInput) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  logoutEverywhere: () => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string,
  ) => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  recoverAccount: (email: string, password: string) => Promise<AuthUser>;
  updateUser: (patch: Pick<AuthUser, "fullName" | "avatarUrl">) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({
  children,
  initialUser = null,
}: {
  children: ReactNode;
  initialUser?: AuthUser | null;
}) {
  const router = useRouter();
  const tokenRef = useRef<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(() => {
    if (initialUser) return initialUser;
    if (typeof document !== "undefined") {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${AUTH_USER_SNAPSHOT_COOKIE}=`));
      if (match) {
        return decodeAuthUserSnapshot(
          match.slice(`${AUTH_USER_SNAPSHOT_COOKIE}=`.length),
        );
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState(() => {
    if (initialUser) return false;
    if (typeof document !== "undefined") {
      const match = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${AUTH_USER_SNAPSHOT_COOKIE}=`));
      if (
        match &&
        decodeAuthUserSnapshot(
          match.slice(`${AUTH_USER_SNAPSHOT_COOKIE}=`.length),
        )
      ) {
        return false;
      }
    }
    return false;
  });

  const clearSession = useCallback(() => {
    tokenRef.current = null;
    writeAuthUserSnapshot(null);
    setUser(null);
  }, []);

  // Must run BEFORE the session-restore effect below starts making
  // requests — React runs effects in declaration order on mount.
  useEffect(() => {
    configureApiClient({
      getAccessToken: () => tokenRef.current,
      onTokenRefreshed: (token) => {
        tokenRef.current = token;
      },
      onUnauthorized: () => {
        tokenRef.current = null;
        writeAuthUserSnapshot(null);
        startTransition(() => {
          setUser(null);
          router.replace("/");
          router.refresh();
        });
      },
    });
  }, [router]);

  // The access token lives only in memory and is lost on every page
  // reload — but the httpOnly refresh cookie persists. A silent refresh
  // plus GET /auth/me restores full identity without forcing a fresh
  // login on every reload.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const token = await refreshAccessToken();
        tokenRef.current = token;

        const meResult = await apiRequest<AuthUser>("/auth/me");
        if (!cancelled) {
          writeAuthUserSnapshot(meResult.data);
          setUser(meResult.data);
        }
      } catch {
        // No valid refresh cookie, or it expired — a completely normal
        // "not logged in" state, not an error to surface.
        if (!cancelled) {
          clearSession();
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
  }, [clearSession]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<LoginResult>("/auth/login", {
      method: "POST",
      body: { email, password },
      skipAuth: true,
    });
    tokenRef.current = result.data.accessToken;
    writeAuthUserSnapshot(result.data.user);
    setUser(result.data.user);
    return result.data.user;
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
    tokenRef.current = null;
    writeAuthUserSnapshot(null);

    // Fire backend logout in the background without blocking the UI transition
    void apiRequest("/auth/logout", { method: "POST" }).catch(() => {});

    // Batch React state update and Next.js page transition seamlessly
    startTransition(() => {
      setUser(null);
      router.replace("/");
      router.refresh();
    });
  }, [router]);

  const logoutEverywhere = useCallback(async () => {
    try {
      await apiRequest("/auth/logout-everywhere", { method: "POST" });
    } finally {
      tokenRef.current = null;
      writeAuthUserSnapshot(null);
      startTransition(() => {
        setUser(null);
        router.replace("/");
        router.refresh();
      });
    }
  }, [router]);

  const changePassword = useCallback(
    async (currentPassword: string, newPassword: string) => {
      const result = await apiRequest<LoginResult>("/auth/change-password", {
        method: "POST",
        body: { currentPassword, newPassword },
      });
      tokenRef.current = result.data.accessToken;
      writeAuthUserSnapshot(result.data.user);
      setUser(result.data.user);
    },
    [],
  );

  const deleteAccount = useCallback(
    async (password: string) => {
      await apiRequest("/auth/delete-account", {
        method: "DELETE",
        body: { password },
      });
      clearSession();
    },
    [clearSession],
  );

  const recoverAccount = useCallback(
    async (email: string, password: string) => {
      const result = await apiRequest<LoginResult>("/auth/recover-account", {
        method: "POST",
        body: { email, password },
        skipAuth: true,
      });
      tokenRef.current = result.data.accessToken;
      writeAuthUserSnapshot(result.data.user);
      setUser(result.data.user);
      return result.data.user;
    },
    [],
  );

  const updateUser = useCallback(
    (patch: Pick<AuthUser, "fullName" | "avatarUrl">) => {
      setUser((current) => {
        if (!current) return current;
        const nextUser = { ...current, ...patch };
        writeAuthUserSnapshot(nextUser);
        return nextUser;
      });
    },
    [],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        logoutEverywhere,
        changePassword,
        deleteAccount,
        recoverAccount,
        updateUser,
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
