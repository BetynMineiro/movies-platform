import { apiClient } from "../../services/api-client";
import { login } from "../../services/auth.service";

describe("login service", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores access token after login", async () => {
    const postSpy = jest.spyOn(apiClient, "post").mockResolvedValue({
      data: {
        data: {
          accessToken: "token-123",
          user: {
            id: 1,
            email: "admin@example.com",
            role: "admin",
          },
        },
      },
    });

    await login("admin@example.com", "Admin@123");

    expect(window.localStorage.getItem("accessToken")).toBe("token-123");
    postSpy.mockRestore();
  });

  it("propagates login errors", async () => {
    const error = new Error("Invalid credentials");
    const postSpy = jest.spyOn(apiClient, "post").mockRejectedValue(error);

    await expect(login("admin@example.com", "wrong")).rejects.toThrow(
      "Invalid credentials",
    );

    postSpy.mockRestore();
  });
});
