import axios, { AxiosHeaders } from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";

const ACCESS_TOKEN_KEY = "accessToken";
const TOKEN_FALLBACK_KEYS = ["token", "access_token"];
export const AUTH_SESSION_EXPIRED_EVENT = "auth:session-expired";

function resolveStoredToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  const tokenCandidates = [
    window.localStorage.getItem(ACCESS_TOKEN_KEY),
    ...TOKEN_FALLBACK_KEYS.map((key) => window.localStorage.getItem(key)),
  ];

  for (const candidate of tokenCandidates) {
    const normalized = candidate?.trim();
    if (!normalized || normalized === "undefined" || normalized === "null") {
      continue;
    }

    return normalized;
  }

  return null;
}

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

function clearAllStoredTokens(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  TOKEN_FALLBACK_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

apiClient.interceptors.request.use((config) => {
  const token = resolveStoredToken();

  if (token) {
    const headers = AxiosHeaders.from(config.headers);
    headers.set("Authorization", `Bearer ${token}`);
    config.headers = headers;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl: string = error?.config?.url ?? "";
    const isLoginRequest = requestUrl.includes("/auth/login");

    if (status === 401 && !isLoginRequest && typeof window !== "undefined") {
      clearAllStoredTokens();

      window.dispatchEvent(new CustomEvent(AUTH_SESSION_EXPIRED_EVENT));

      if (window.location.pathname !== "/login") {
        window.setTimeout(() => {
          window.location.assign("/login");
        }, 900);
      }
    }

    return Promise.reject(error);
  },
);

export function setAccessToken(token: string): void {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken(): string | null {
  return resolveStoredToken();
}

export function clearAccessToken(): void {
  clearAllStoredTokens();
}
