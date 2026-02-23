import {
  apiClient,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "./api-client";

export interface LoginResponse {
  accessToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
}

export interface ApiResponse<T> {
  data: T;
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await apiClient.post<
    ApiResponse<LoginResponse> | LoginResponse
  >("/auth/login", {
    email,
    password,
  });

  const responseData = response.data as
    | ApiResponse<LoginResponse>
    | LoginResponse;
  const payload =
    "data" in responseData
      ? responseData.data
      : (responseData as LoginResponse);

  if (!payload?.accessToken || payload.accessToken === "undefined") {
    throw new Error("Invalid login response: missing access token");
  }

  setAccessToken(payload.accessToken);

  return payload;
}

export function logout(): void {
  clearAccessToken();
}

export function isAuthenticated(): boolean {
  return Boolean(getAccessToken());
}
