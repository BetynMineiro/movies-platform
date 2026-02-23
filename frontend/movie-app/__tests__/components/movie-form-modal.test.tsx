import { render, screen, fireEvent } from "@testing-library/react";
import { MovieFormModal } from "@/components/movies";
import type { MultiSelectOption } from "@/components/common";

const mockActors: MultiSelectOption[] = [
  { id: 1, label: "Actor 1" },
  { id: 2, label: "Actor 2" },
];

describe("MovieFormModal", () => {
  it("does not render when isOpen is false", () => {
    render(
      <MovieFormModal
        isOpen={false}
        mode="create"
        availableActors={mockActors}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.queryByText("Create New Movie")).not.toBeInTheDocument();
  });

  it("renders create mode correctly", () => {
    render(
      <MovieFormModal
        isOpen={true}
        mode="create"
        availableActors={mockActors}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Create New Movie")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("renders edit mode correctly", () => {
    render(
      <MovieFormModal
        isOpen={true}
        mode="edit"
        availableActors={mockActors}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByText("Edit Movie")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("displays initial data in edit mode", () => {
    render(
      <MovieFormModal
        isOpen={true}
        mode="edit"
        initialData={{
          title: "Test Movie",
          description: "Test description",
          releaseYear: 2020,
          genre: "Drama",
          actorIds: [1],
        }}
        availableActors={mockActors}
        onSave={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByDisplayValue("Test Movie")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Test description")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2020")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Drama")).toBeInTheDocument();
  });

  it("validates required fields", () => {
    const onSave = jest.fn();
    render(
      <MovieFormModal
        isOpen={true}
        mode="create"
        availableActors={mockActors}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(
      screen.getByText("Description must be at least 10 characters"),
    ).toBeInTheDocument();
    expect(screen.getByText("Genre is required")).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("validates release year range", () => {
    const onSave = jest.fn();
    render(
      <MovieFormModal
        isOpen={true}
        mode="create"
        availableActors={mockActors}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    const yearInput = screen.getByPlaceholderText("Enter release year");
    fireEvent.change(yearInput, { target: { value: "3000" } });
    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(
      screen.getByText("Release year must be between 1800 and 2100"),
    ).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it("calls onSave with form data when valid", () => {
    const onSave = jest.fn();
    render(
      <MovieFormModal
        isOpen={true}
        mode="create"
        availableActors={mockActors}
        onSave={onSave}
        onCancel={jest.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Enter movie title"), {
      target: { value: "New Movie" },
    });
    fireEvent.change(
      screen.getByPlaceholderText(
        "Enter movie description (min. 10 characters)",
      ),
      {
        target: { value: "This is a description" },
      },
    );
    fireEvent.change(screen.getByPlaceholderText("Enter release year"), {
      target: { value: "2022" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter genre"), {
      target: { value: "Action" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Create" }));

    expect(onSave).toHaveBeenCalledWith({
      title: "New Movie",
      description: "This is a description",
      releaseYear: 2022,
      genre: "Action",
      actorIds: [],
    });
  });

  it("calls onCancel when Cancel button is clicked", () => {
    const onCancel = jest.fn();
    render(
      <MovieFormModal
        isOpen={true}
        mode="create"
        availableActors={mockActors}
        onSave={jest.fn()}
        onCancel={onCancel}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
