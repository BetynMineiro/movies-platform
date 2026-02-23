import { apiClient, setAccessToken } from "./api-client";

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
  const response = await apiClient.post<ApiResponse<LoginResponse>>(
    "/auth/login",
    {
      email,
      password,
    },
  );

  const payload = response.data.data;
  setAccessToken(payload.accessToken);

  return payload;
}
