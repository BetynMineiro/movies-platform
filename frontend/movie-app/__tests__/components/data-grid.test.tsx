import { act, fireEvent, render, screen } from "@testing-library/react";
import DataGrid, { type DataGridColumn } from "../../components/grid/DataGrid";

interface TestRow {
  id: number;
  name: string;
  role: string;
}

const columns: DataGridColumn<TestRow>[] = [
  { key: "name", header: "Name" },
  { key: "role", header: "Role" },
];

const rows: TestRow[] = [
  { id: 1, name: "Alice", role: "Admin" },
  { id: 2, name: "Bob", role: "User" },
  { id: 3, name: "Carol", role: "Editor" },
];

describe("DataGrid", () => {
  it("renders data and actions", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.queryByText("Carol")).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Update" }).length).toBe(2);
    expect(screen.getAllByRole("button", { name: "Delete" }).length).toBe(2);
  });

  it("applies custom table min width class", () => {
    const { container } = render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        tableMinWidthClass="min-w-0"
        onPageChange={jest.fn()}
      />,
    );

    const table = container.querySelector("table");
    expect(table).toHaveClass("min-w-0");
  });

  it("calls action handlers with selected row", () => {
    const onUpdate = jest.fn();
    const onDelete = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={onUpdate}
        onDelete={onDelete}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Update" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);

    expect(onUpdate).toHaveBeenCalledWith(rows[0]);
    expect(onDelete).toHaveBeenCalledWith(rows[0]);
  });

  it("calls onPageChange when pagination buttons are clicked", () => {
    const onPageChange = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={onPageChange}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("emits filter event with 1 second debounce", () => {
    jest.useFakeTimers();
    const onFilter = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onFilter={onFilter}
        filterDebounceMs={1000}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Type to filter..."), {
      target: { value: "ali" },
    });

    act(() => {
      jest.advanceTimersByTime(999);
    });
    expect(onFilter).not.toHaveBeenCalledWith("ali");

    act(() => {
      jest.advanceTimersByTime(1);
    });
    expect(onFilter).toHaveBeenLastCalledWith("ali");

    jest.useRealTimers();
  });

  it("does not emit filter event on initial render", () => {
    jest.useFakeTimers();
    const onFilter = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onFilter={onFilter}
        filterDebounceMs={1000}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onFilter).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("renders provided external total pages", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        totalPages={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
  });

  it("enables next in cursor mode when hasNextPage is true", () => {
    const onPageChange = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows.slice(0, 2)}
        columns={columns}
        page={1}
        pageSize={2}
        hasNextPage
        hasPreviousPage={false}
        onPageChange={onPageChange}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const nextButton = screen.getByRole("button", { name: "Next" });
    const previousButton = screen.getByRole("button", { name: "Previous" });

    expect(nextButton).toBeEnabled();
    expect(previousButton).toBeDisabled();

    fireEvent.click(nextButton);
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it("enables previous in cursor mode when hasPreviousPage is true", () => {
    const onPageChange = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows.slice(0, 2)}
        columns={columns}
        page={2}
        pageSize={2}
        hasNextPage={false}
        hasPreviousPage
        onPageChange={onPageChange}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const previousButton = screen.getByRole("button", { name: "Previous" });
    const nextButton = screen.getByRole("button", { name: "Next" });

    expect(previousButton).toBeEnabled();
    expect(nextButton).toBeDisabled();

    fireEvent.click(previousButton);
    expect(onPageChange).toHaveBeenCalledWith(1);
  });

  it("hides filter when showFilter is false", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showFilter={false}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.queryByPlaceholderText("Type to filter..."),
    ).not.toBeInTheDocument();
  });

  it("hides actions when showActions is false", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showActions={false}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
      />,
    );

    expect(screen.queryByText("Actions")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Update" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Delete" }),
    ).not.toBeInTheDocument();
  });

  it("does not emit filter event when filter is disabled", () => {
    jest.useFakeTimers();
    const onFilter = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showFilter={false}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onFilter={onFilter}
      />,
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(onFilter).not.toHaveBeenCalled();
    jest.useRealTimers();
  });

  it("emits onSelectedRow when a row is clicked", () => {
    const onSelectedRow = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onSelectedRow={onSelectedRow}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    expect(onSelectedRow).toHaveBeenCalledWith(rows[0]);
  });

  it("applies selected row style when selectedRowId is provided", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        selectedRowId={1}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");
  });

  it("emits selected event and update action when clicking update", () => {
    const onSelectedRow = jest.fn();
    const onUpdate = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onSelectedRow={onSelectedRow}
        onUpdate={onUpdate}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Update" })[0]);

    expect(onSelectedRow).toHaveBeenCalledWith(rows[0]);
    expect(onUpdate).toHaveBeenCalledWith(rows[0]);
  });

  it("clears selected row when update action is emitted", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getAllByRole("button", { name: "Update" })[0]);
    expect(aliceRow).not.toHaveClass("bg-stone-200/60");
  });

  it("clears selected row when delete action is emitted", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getAllByRole("button", { name: "Delete" })[0]);
    expect(aliceRow).not.toHaveClass("bg-stone-200/60");
  });

  it("clears selected row when navigating pages", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        hasNextPage
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(aliceRow).not.toHaveClass("bg-stone-200/60");
  });

  it("clears selected row when filter event is emitted", () => {
    jest.useFakeTimers();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onFilter={jest.fn()}
        filterDebounceMs={1000}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");

    fireEvent.change(screen.getByPlaceholderText("Type to filter..."), {
      target: { value: "ali" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(aliceRow).not.toHaveClass("bg-stone-200/60");
    jest.useRealTimers();
  });

  it("hides add button when showAdd is false", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showAdd={false}
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
      />,
    );

    expect(
      screen.queryByRole("button", { name: "+ Add" }),
    ).not.toBeInTheDocument();
  });

  it("shows add button when showAdd is true", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showAdd
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAdd={jest.fn()}
      />,
    );

    expect(screen.getByRole("button", { name: "+ Add" })).toBeInTheDocument();
  });

  it("calls onAdd when add button is clicked", () => {
    const onAdd = jest.fn();

    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showAdd
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    expect(onAdd).toHaveBeenCalled();
  });

  it("clears selected row when add button is clicked", () => {
    render(
      <DataGrid
        title="Users"
        rows={rows}
        columns={columns}
        showAdd
        page={1}
        pageSize={2}
        onPageChange={jest.fn()}
        onUpdate={jest.fn()}
        onDelete={jest.fn()}
        onAdd={jest.fn()}
      />,
    );

    fireEvent.click(screen.getByText("Alice"));
    const aliceRow = screen.getByText("Alice").closest("tr");
    expect(aliceRow).toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));
    expect(aliceRow).not.toHaveClass("bg-stone-200/60");
  });
});
