import { render, screen, fireEvent } from "@testing-library/react";
import { ActorFormModal } from "@/components/actors";
import type { MultiSelectOption } from "@/components/common";

const mockMovies: MultiSelectOption[] = [
  { id: 1, label: "Movie 1" },
  { id: 2, label: "Movie 2" },
];

describe("ActorFormModal", () => {
  it("does not render when isOpen is false", () => {
    render(
      <ActorFormModal
        isOpen={false}
        mode="create"
        availableMovies={mockMovies}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByText("Create New Actor")).not.toBeInTheDocument();
  });

  it("renders create mode correctly", () => {
    render(
      <ActorFormModal
        isOpen={true}
        mode="create"
        availableMovies={mockMovies}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Create New Actor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(
      <ActorFormModal
        isOpen={true}
        mode="edit"
        availableMovies={mockMovies}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Edit Actor")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("displays initial data in edit mode", () => {
    render(
      <ActorFormModal
        isOpen={true}
        mode="edit"
        initialData={{
          name: "Test Actor",
          nationality: "USA",
          movieIds: [1],
        }}
        availableMovies={mockMovies}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Test Actor")).toBeInTheDocument();
    expect(screen.getByDisplayValue("USA")).toBeInTheDocument();
  });

  it("validates required fields", () => {
    const onSave = jest.fn();
    render(
      <ActorFormModal
        isOpen={true}
        mode="create"
        availableMovies={mockMovies}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Name is required")).toBeInTheDocument();
    expect(
      screen.getByText("Nationality must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("validates nationality minimum length", () => {
    const onSave = jest.fn();
    render(
      <ActorFormModal
        isOpen={true}
        mode="create"
        availableMovies={mockMovies}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter actor name"), {
      target: { value: "Actor Name" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter nationality"), {
      target: { value: "U" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      screen.getByText("Nationality must be at least 2 characters"),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with form data when valid", () => {
    const onSave = jest.fn();
    render(
      <ActorFormModal
        isOpen={true}
        mode="create"
        availableMovies={mockMovies}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter actor name"), {
      target: { value: "New Actor" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter nationality"), {
      target: { value: "USA" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(onSave).toHaveBeenCalledWith({
      name: "New Actor",
      nationality: "USA",
      movieIds: [],
    });
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <ActorFormModal
        isOpen={true}
        mode="create"
        availableMovies={mockMovies}
        onSave={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
