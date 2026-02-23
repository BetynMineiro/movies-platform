import { render, screen, fireEvent } from "@testing-library/react";
import { MultiSelect, type MultiSelectOption } from "@/components/common";

const mockOptions: MultiSelectOption[] = [
  { id: 1, label: "Option 1" },
  { id: 2, label: "Option 2" },
  { id: 3, label: "Option 3" },
];

describe("MultiSelect", () => {
  it("renders with label and placeholder", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[]}
        onChange={jest.fn()}
        placeholder="Choose options"
      />,
    );

    expect(screen.getByText("Select Items")).toBeInTheDocument();
    expect(screen.getByText("Choose options")).toBeInTheDocument();
  });

  it("displays selected options as chips", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[1, 2]}
        onChange={jest.fn()}
      />,
    );

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
    expect(screen.queryByText("Option 3")).not.toBeInTheDocument();
  });

  it("opens dropdown when button is clicked", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[]}
        onChange={jest.fn()}
        placeholder="Choose options"
      />,
    );

    fireEvent.click(screen.getByText("Choose options"));

    // All options should now be visible
    const allOptions = screen.getAllByText(/Option \d/);
    expect(allOptions.length).toBeGreaterThan(1);
  });

  it("calls onChange when an option is selected", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[]}
        onChange={onChange}
        placeholder="Choose options"
      />,
    );

    fireEvent.click(screen.getByText("Choose options"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(onChange).toHaveBeenCalledWith([1]);
  });

  it("calls onChange when an option is deselected", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[1, 2]}
        onChange={onChange}
        placeholder="Choose options"
      />,
    );

    fireEvent.click(screen.getByText("Choose options"));
    fireEvent.click(screen.getByText("Option 1"));

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("removes option when × button is clicked on chip", () => {
    const onChange = jest.fn();
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[1, 2]}
        onChange={onChange}
      />,
    );

    const removeButton = screen.getByLabelText("Remove Option 1");
    fireEvent.click(removeButton);

    expect(onChange).toHaveBeenCalledWith([2]);
  });

  it("filters options based on search query", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[]}
        onChange={jest.fn()}
        placeholder="Choose options"
      />,
    );

    fireEvent.click(screen.getByText("Choose options"));

    const searchInput = screen.getByPlaceholderText("Filter...");
    fireEvent.change(searchInput, { target: { value: "Option 1" } });

    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.queryByText("Option 2")).not.toBeInTheDocument();
  });

  it("shows loading state", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={mockOptions}
        selectedIds={[]}
        onChange={jest.fn()}
        loading={true}
      />,
    );

    fireEvent.click(screen.getByText("Search and select..."));

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("shows no options message when list is empty", () => {
    render(
      <MultiSelect
        label="Select Items"
        options={[]}
        selectedIds={[]}
        onChange={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Search and select..."));

    expect(screen.getByText("No options found")).toBeInTheDocument();
  });
});
