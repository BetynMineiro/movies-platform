import { render, screen, fireEvent } from "@testing-library/react";
import { ConfirmDeleteModal } from "@/components/common";

describe("ConfirmDeleteModal", () => {
  it("does not render when isOpen is false", () => {
    render(
      <ConfirmDeleteModal
        isOpen={false}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByText("Delete Item")).not.toBeInTheDocument();
  });

  it("renders when isOpen is true", () => {
    render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Delete Item")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
  });

  it("calls onConfirm when Delete button is clicked", () => {
    const onConfirm = jest.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={onConfirm}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Delete" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <ConfirmDeleteModal
        isOpen={true}
        title="Delete Item"
        message="Are you sure?"
        onConfirm={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
