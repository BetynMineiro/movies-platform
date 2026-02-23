import { render, screen, waitFor } from "@testing-library/react";
import AuthGate from "../../components/auth/AuthGate";

const replaceMock = jest.fn();
let pathnameMock = "/";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: replaceMock,
  }),
  usePathname: () => pathnameMock,
}));

describe("AuthGate", () => {
  beforeEach(() => {
    window.localStorage.clear();
    replaceMock.mockClear();
    pathnameMock = "/";
  });

  it("redirects to login when unauthenticated", async () => {
    pathnameMock = "/movies";

    render(
      <AuthGate>
        <div>Protected</div>
      </AuthGate>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects to home when authenticated on login page", async () => {
    window.localStorage.setItem("accessToken", "token-123");
    pathnameMock = "/login";

    render(
      <AuthGate>
        <div>Login</div>
      </AuthGate>,
    );

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });
  });

  it("renders children when authenticated", async () => {
    window.localStorage.setItem("accessToken", "token-123");
    pathnameMock = "/movies";

    render(
      <AuthGate>
        <div>Protected</div>
      </AuthGate>,
    );

    expect(await screen.findByText("Protected")).toBeInTheDocument();
  });
});
