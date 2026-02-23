import {
  apiClient,
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../../services/api-client";

describe("apiClient interceptor", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("adds Authorization header when token exists", () => {
    setAccessToken("test-token");

    const handler = (apiClient.interceptors.request as any).handlers[0]
      .fulfilled;
    const config = handler({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer test-token");
  });

  it("does not add Authorization header when token is missing", () => {
    clearAccessToken();

    const handler = (apiClient.interceptors.request as any).handlers[0]
      .fulfilled;
    const config = handler({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });

  it("clears token from localStorage", () => {
    setAccessToken("token-to-clear");
    clearAccessToken();

    expect(window.localStorage.getItem("accessToken")).toBeNull();
  });

  it("reads token from localStorage", () => {
    setAccessToken("token-to-read");

    expect(getAccessToken()).toBe("token-to-read");
  });
});
