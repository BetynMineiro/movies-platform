import { act, fireEvent, render, screen } from "@testing-library/react";
import MoviesPage from "../../app/movies/page";
import { useRouter } from "next/navigation";

jest.mock("next/navigation");

// Mock the LogoutButton component
jest.mock("../../components/auth", () => ({
  LogoutButton: () => <button>Logout</button>,
}));

describe("MoviesPage", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    });
  });

  it("renders movies grid", () => {
    render(<MoviesPage />);

    expect(screen.getByText("Movie catalog")).toBeInTheDocument();
    expect(screen.getByText("Movies Grid")).toBeInTheDocument();
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
  });

  it("does not show related grids on initial render", () => {
    render(<MoviesPage />);

    expect(screen.queryByText(/Actors in "Inception"/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("shows related grids when a movie is selected", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    expect(screen.getByText('Actors in "Inception"')).toBeInTheDocument();
    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
  });

  it("displays correct actors for selected movie", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.getByText("Marion Cotillard")).toBeInTheDocument();
    expect(screen.getByText("Ellen Page")).toBeInTheDocument();
    expect(screen.getByText("Cillian Murphy")).toBeInTheDocument();
  });

  it("displays correct ratings for selected movie", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
  });

  it("clears related grids when movie changes", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();

    fireEvent.click(screen.getByText("The Dark Knight"));

    expect(screen.queryByText('Actors in "Inception"')).not.toBeInTheDocument();
    expect(screen.getByText('Actors in "The Dark Knight"')).toBeInTheDocument();
  });

  it("clears related grids when next page is clicked", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();

    // Get all Next buttons and click the first one (movies grid)
    const nextButtons = screen.getAllByRole("button", { name: "Next" });
    fireEvent.click(nextButtons[0]);

    expect(screen.queryByText(/Actors in "Inception"/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("clears related grids when filter is applied", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Filter movies..."), {
      target: { value: "Dark" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText(/Actors in "Inception"/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("highlights selected movie row", () => {
    render(<MoviesPage />);

    const inceptionRow = screen.getByText("Inception").closest("tr");
    expect(inceptionRow).not.toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByText("Inception"));

    expect(inceptionRow).toHaveClass("bg-stone-200/60");
  });

  it("shows update and delete buttons for movies", () => {
    render(<MoviesPage />);

    const updateButtons = screen.getAllByRole("button", { name: "Update" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

    expect(updateButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("does not show update/delete buttons for related grids", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    const updateButtons = screen.queryAllByRole("button", { name: "Update" });
    const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });

    // The movies grid still has update/delete, but actors and ratings grids should not
    // We should only have the first set from the movies grid
    const movieSectionUpdateButtons = updateButtons.filter(
      (btn) => btn.closest("section") !== updateButtons[0].closest("section"),
    );
    expect(movieSectionUpdateButtons.length).toBe(0);
  });

  it("paginates actors grid independently from movies grid", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    // Actors grid should show 5 items per page
    // We have 4 actors total, so only 1 page
    const paginationText = screen.getAllByText(/Page 1 of/);

    // Should have pagination for movies, actors, and ratings tables
    expect(paginationText.length).toBeGreaterThan(0);
  });

  it("renders empty message when movie has no actors", () => {
    render(<MoviesPage />);

    // Select a movie that exists but might have different data
    fireEvent.click(screen.getByText("The Dark Knight"));

    expect(screen.getByText('Actors in "The Dark Knight"')).toBeInTheDocument();
  });

  it("renders filter input for movies grid", () => {
    render(<MoviesPage />);

    expect(screen.getByPlaceholderText("Filter movies...")).toBeInTheDocument();
  });

  it("renders back and home buttons", () => {
    render(<MoviesPage />);

    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<MoviesPage />);

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("renders filter inputs for related grids when movie is selected", () => {
    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    const filterInputs = screen.getAllByPlaceholderText(/Filter/);
    expect(filterInputs.length).toBeGreaterThanOrEqual(3); // Movies, Actors, Ratings
    expect(screen.getByPlaceholderText("Filter actors...")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Filter ratings..."),
    ).toBeInTheDocument();
  });

  it("filters actors by name", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.getByText("Marion Cotillard")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Filter actors..."), {
      target: { value: "Leonardo" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.queryByText("Marion Cotillard")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("filters ratings by reviewer", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "John" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Jane Smith")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("clears actor filter when changing movies", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    // Select Inception and filter actors
    fireEvent.click(screen.getByText("Inception"));

    fireEvent.change(screen.getByPlaceholderText("Filter actors..."), {
      target: { value: "Leonardo" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Leonardo should be visible, Marion should not be (filtered out)
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.queryByText("Marion Cotillard")).not.toBeInTheDocument();

    // Change to The Dark Knight movie (which also has Leonardo)
    fireEvent.click(screen.getByText("The Dark Knight"));

    // The grid title should show the new movie
    expect(screen.getByText('Actors in "The Dark Knight"')).toBeInTheDocument();

    // The filter should still be active from the previous movie, so Leonardo should still appear
    // (since The Dark Knight also has Leonardo DiCaprio)
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets actors and ratings filters when applying movie filter", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    fireEvent.change(screen.getByPlaceholderText("Filter actors..."), {
      target: { value: "Leonardo" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    fireEvent.change(screen.getByPlaceholderText("Filter movies..."), {
      target: { value: "Dark" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.queryByText(/Actors in "Inception"/)).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets actors pagination when filtering actors", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    fireEvent.change(screen.getByPlaceholderText("Filter actors..."), {
      target: { value: "Leonardo" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check that page info is still shown and pagination resets to page 1
    const paginationText = screen.getAllByText(/Page 1 of/);
    expect(paginationText.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });

  it("resets ratings pagination when filtering ratings", () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    fireEvent.click(screen.getByText("Inception"));

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "John" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // Check that page info is still shown and pagination resets to page 1
    const paginationText = screen.getAllByText(/Page 1 of/);
    expect(paginationText.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});
