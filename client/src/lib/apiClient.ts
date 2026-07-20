const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1";

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
    details: string[];
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
  details: string[];

  constructor(
    statusCode: number,
    code: string,
    message: string,
    details: string[] = [],
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

/**
 * The actual fetch + envelope-parsing logic, with NO retry behavior of
 * its own. apiRequest() (below) wraps this with the refresh-and-retry
 * decision. Kept separate so the refresh call itself (which must not
 * trigger its own retry logic) can call this directly.
 */
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
      if (err instanceof ApiError && err.statusCode === 401 && onUnauthorized) {
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
