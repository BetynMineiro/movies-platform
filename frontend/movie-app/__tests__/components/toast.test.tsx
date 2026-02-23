import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Toast from "@/components/toast/Toast";

describe("Toast Component", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it("renders success toast with message", () => {
    const onClose = jest.fn();
    render(
      <Toast message="Success message" type="success" onClose={onClose} />,
    );

    expect(screen.getByText("Success message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("bg-green-50");
  });

  it("renders error toast with message", () => {
    const onClose = jest.fn();
    render(<Toast message="Error message" type="error" onClose={onClose} />);

    expect(screen.getByText("Error message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("bg-red-50");
  });

  it("renders info toast with message", () => {
    const onClose = jest.fn();
    render(<Toast message="Info message" type="info" onClose={onClose} />);

    expect(screen.getByText("Info message")).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveClass("bg-blue-50");
  });

  it("calls onClose when close button is clicked", () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={onClose} />);

    const closeButton = screen.getByLabelText("Close");
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after default duration", async () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" type="success" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("auto-dismisses after custom duration", async () => {
    const onClose = jest.fn();
    render(
      <Toast
        message="Test message"
        type="success"
        onClose={onClose}
        duration={5000}
      />,
    );

    jest.advanceTimersByTime(4999);
    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });
});
