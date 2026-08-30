import { API_BASE_URL } from "./apiBaseUrl";

export interface ApiSuccessBody<T> {
  success: true;
  data: T;
  message: string;
  meta?: Record<string, unknown>;
}

interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details: unknown[];
  };
}

type ApiBody<T> = ApiSuccessBody<T> | ApiErrorBody;

/**
 * Thrown for every non-2xx response. Carries the backend's error `code`
 * so callers can branch on it directly (err.code === 'APPLICATION_DUPLICATE')
 * rather than string-matching a human-readable message.
 */
export class ApiError extends Error {
  statusCode: number;
  code: string;
  details: unknown[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: unknown[] = [],
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

/**
 * Set once, at app startup, by the auth context — NOT imported directly,
 * to avoid a circular dependency (the auth context itself uses apiClient
 * to call login/register/refresh).
 */
let getAccessToken: () => string | null = () => null;
let onTokenRefreshed: ((token: string) => void) | null = null;
let onUnauthorized: (() => void) | null = null;

export function configureApiClient(options: {
  getAccessToken: () => string | null;
  onTokenRefreshed?: (token: string) => void;
  onUnauthorized?: () => void;
}): void {
  getAccessToken = options.getAccessToken;
  onTokenRefreshed = options.onTokenRefreshed ?? null;
  onUnauthorized = options.onUnauthorized ?? null;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Skip attaching the Authorization header (e.g. for login/register themselves). */
  skipAuth?: boolean;
}

// ---- This function performs one HTTP request. It doesn't retry ----
async function performRequest<T>(
  path: string,
  options: ApiRequestOptions,
): Promise<ApiSuccessBody<T>> {
  const { body, skipAuth, headers: headersInit, ...rest } = options;

  const headers = new Headers(headersInit);
  let finalBody: BodyInit | undefined;

  if (body instanceof FormData) {
    // Never set Content-Type ourselves for FormData — the browser must
    // set it (including the multipart boundary), or file uploads break.
    finalBody = body;
  } else if (body !== undefined) {
    headers.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  if (!skipAuth) {
    const token = getAccessToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
    body: finalBody,
    credentials: "include", // required so the httpOnly refresh cookie is sent
  });

  const json = (await response.json()) as ApiBody<T>;

  if (!json.success) {
    throw new ApiError(
      response.status,
      json.error.code,
      json.error.message,
      json.error.details,
    );
  }

  return json;
}

/**
 * Coalesces concurrent refresh attempts into a single in-flight request —
 * if 5 requests all hit an expired token at the same moment, this ensures
 * exactly ONE call to /auth/refresh happens, not 5.
 *
 * i.e. when several API requests realize at the same time that the access token has expired,
 * they all share one refresh request instead of each sending their own refresh request.
 */
let refreshPromise: Promise<string> | null = null;

async function performRefresh(): Promise<string> {
  if (!refreshPromise) {
    refreshPromise = performRequest<{ accessToken: string }>("/auth/refresh", {
      method: "POST",
      skipAuth: true,
    })
      .then((result) => result.data.accessToken)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest<T>(
  path: string,
  options: ApiRequestOptions = {},
  _isRetry = false,
): Promise<ApiSuccessBody<T>> {
  try {
    return await performRequest<T>(path, options);
  } catch (err) {
    const shouldAttemptRefresh =
      err instanceof ApiError &&
      err.code === "AUTH_TOKEN_EXPIRED" &&
      !options.skipAuth &&
      !_isRetry;

    if (!shouldAttemptRefresh) {
      // Only treat session as expired/unauthorized if the bearer token is rejected on authenticated routes.
      // Do NOT trigger onUnauthorized on login/register/recover forms or when user enters wrong password (AUTH_INVALID_CREDENTIALS).
      const isSessionAuthFailure =
        err instanceof ApiError &&
        !options.skipAuth &&
        (err.code === "AUTH_UNAUTHORIZED" || err.code === "AUTH_TOKEN_INVALID");

      if (isSessionAuthFailure && onUnauthorized) {
        onUnauthorized();
      }
      throw err;
    }

    try {
      const newToken = await performRefresh();
      onTokenRefreshed?.(newToken);
    } catch {
      onUnauthorized?.();
      throw err;
    }

    return apiRequest<T>(path, options, true);
  }
}
