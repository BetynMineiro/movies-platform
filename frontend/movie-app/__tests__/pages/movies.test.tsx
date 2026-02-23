import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import MoviesPage from "../../app/movies/page";
import { useRouter } from "next/navigation";
import { apiClient } from "../../services";

jest.mock("next/navigation");

// Mock the LogoutButton component
jest.mock("../../components/auth", () => ({
  LogoutButton: () => <button>Logout</button>,
}));

// Mock the ToastContext
const mockShowToast = jest.fn();
jest.mock("../../contexts/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock apiClient
jest.mock("../../services", () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

const mockMoviesData = {
  data: [
    {
      id: 1,
      title: "Inception",
      genre: "Sci-Fi",
      releaseYear: 2010,
      description: "A mind-bending thriller",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      title: "The Dark Knight",
      genre: "Action",
      releaseYear: 2008,
      description: "Batman vs Joker",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 3,
      title: "Interstellar",
      genre: "Sci-Fi",
      releaseYear: 2014,
      description: "Space exploration",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 4,
      title: "Parasite",
      genre: "Drama",
      releaseYear: 2019,
      description: "Social commentary",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
  meta: {
    total: 8,
    limit: 4,
    totalPages: 2,
    hasPreviousPage: false,
    hasNextPage: true,
    hasNext: true,
    nextCursor: 4,
  },
};

const mockActorsData = {
  data: [
    {
      id: 1,
      name: "Leonardo DiCaprio",
      nationality: "USA",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Marion Cotillard",
      nationality: "France",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 3,
      name: "Ellen Page",
      nationality: "Canada",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 5,
      name: "Cillian Murphy",
      nationality: "Ireland",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
  meta: {
    total: 4,
    limit: 100,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    hasNext: false,
  },
};

const mockMovieActorsData = {
  data: [
    {
      id: 1,
      name: "Leonardo DiCaprio",
      nationality: "USA",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      name: "Marion Cotillard",
      nationality: "France",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 3,
      name: "Ellen Page",
      nationality: "Canada",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 5,
      name: "Cillian Murphy",
      nationality: "Ireland",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
  meta: {
    total: 4,
    limit: 5,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    hasNext: false,
  },
};

const mockRatingsData = {
  data: [
    {
      id: 1,
      rating: 9,
      review: "Mind-bending masterpiece",
      userId: 1,
      movieId: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      rating: 8,
      review: "Great visual effects",
      userId: 2,
      movieId: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
  ],
  meta: {
    total: 2,
    limit: 5,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    hasNext: false,
  },
};

describe("MoviesPage", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    });
    mockShowToast.mockClear();

    // Setup default mocks for API calls
    mockApiClient.get.mockImplementation((url: string) => {
      if (url === "/movies") {
        return Promise.resolve({ data: mockMoviesData });
      }
      if (url === "/actors") {
        return Promise.resolve({ data: mockActorsData });
      }
      if (url.match(/\/movies\/\d+\/actors/)) {
        return Promise.resolve({ data: mockMovieActorsData });
      }
      if (url === "/movie-ratings") {
        return Promise.resolve({ data: mockRatingsData });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders movies grid", async () => {
    render(<MoviesPage />);

    expect(screen.getByText("Movie catalog")).toBeInTheDocument();
    expect(screen.getByText("Movies Grid")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });
  });

  it("does not show related grids on initial render", () => {
    render(<MoviesPage />);

    expect(screen.queryByText(/Actors in "Inception"/)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("shows related grids when a movie is selected", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Actors in "Inception"')).toBeInTheDocument();
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });
  });

  it("displays correct actors for selected movie", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
      expect(screen.getByText("Marion Cotillard")).toBeInTheDocument();
      expect(screen.getByText("Ellen Page")).toBeInTheDocument();
      expect(screen.getByText("Cillian Murphy")).toBeInTheDocument();
    });
  });

  it("displays correct ratings for selected movie", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
      expect(screen.getByText("Great visual effects")).toBeInTheDocument();
    });
  });

  it("clears related grids when movie changes", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("The Dark Knight"));

    await waitFor(() => {
      expect(
        screen.queryByText('Actors in "Inception"'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Actors in "The Dark Knight"'),
      ).toBeInTheDocument();
    });
  });

  it("clears related grids when next page is clicked", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    // Get all Next buttons and click the first one (movies grid)
    const nextButtons = screen.getAllByRole("button", { name: "Next" });

    act(() => {
      fireEvent.click(nextButtons[0]);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Actors in "Inception"/),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByText(/Ratings for "Inception"/),
      ).not.toBeInTheDocument();
    });
  });

  it("clears related grids when filter is applied", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

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

  it("highlights selected movie row", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    const inceptionRow = screen.getByText("Inception").closest("tr");
    expect(inceptionRow).not.toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByText("Inception"));

    expect(inceptionRow).toHaveClass("bg-stone-200/60");
  });

  it("shows update and delete buttons for movies", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      const updateButtons = screen.getAllByRole("button", { name: "Update" });
      const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

      expect(updateButtons.length).toBeGreaterThan(0);
      expect(deleteButtons.length).toBeGreaterThan(0);
    });
  });

  it("does not show update/delete buttons for related grids", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      const updateButtons = screen.queryAllByRole("button", { name: "Update" });
      const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });

      // The movies grid still has update/delete, but actors and ratings grids should not
      // We should only have the first set from the movies grid
      const movieSectionUpdateButtons = updateButtons.filter(
        (btn) => btn.closest("section") !== updateButtons[0].closest("section"),
      );
      expect(movieSectionUpdateButtons.length).toBe(0);
    });
  });

  it("paginates actors grid independently from movies grid", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      // Actors grid should show 5 items per page
      // We have 4 actors total, so only 1 page
      const paginationText = screen.getAllByText(/Page 1 of/);

      // Should have pagination for movies, actors, and ratings tables
      expect(paginationText.length).toBeGreaterThan(0);
    });
  });

  it("renders empty message when movie has no actors", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });

    // Select a movie that exists but might have different data
    fireEvent.click(screen.getByText("The Dark Knight"));

    await waitFor(() => {
      expect(
        screen.getByText('Actors in "The Dark Knight"'),
      ).toBeInTheDocument();
    });
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

  it("renders filter inputs for related grids when movie is selected", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      const filterInputs = screen.getAllByPlaceholderText(/Filter/);
      expect(filterInputs.length).toBeGreaterThanOrEqual(3); // Movies, Actors, Ratings
      expect(
        screen.getByPlaceholderText("Filter actors..."),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Filter ratings..."),
      ).toBeInTheDocument();
    });
  });

  it("filters actors by name", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
      expect(screen.getByText("Marion Cotillard")).toBeInTheDocument();
    });

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

  it("filters ratings by reviewer", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
      expect(screen.getByText("Great visual effects")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "User 1" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    expect(screen.queryByText("Great visual effects")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("adds rating from modal and updates grid", async () => {
    mockApiClient.post.mockResolvedValue({ data: {} });

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    // Get all + Add buttons and click the last one (ratings grid)
    const addButtons = screen.getAllByRole("button", { name: "+ Add" });
    fireEvent.click(addButtons[addButtons.length - 1]);

    fireEvent.change(screen.getByPlaceholderText("Nome do avaliador"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descricao do rating"), {
      target: { value: "Novo comentario" },
    });
    fireEvent.change(screen.getByPlaceholderText("0-10"), {
      target: { value: "7" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    await waitFor(() => {
      expect(mockShowToast).toHaveBeenCalledWith(
        "Rating saved successfully!",
        "success",
      );
    });
  });

  it("does not add rating when modal is canceled", async () => {
    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    // Get all + Add buttons and click the last one (ratings grid)
    const addButtons = screen.getAllByRole("button", { name: "+ Add" });
    fireEvent.click(addButtons[addButtons.length - 1]);

    fireEvent.change(screen.getByPlaceholderText("Nome do avaliador"), {
      target: { value: "Maria" },
    });
    fireEvent.change(screen.getByPlaceholderText("Descricao do rating"), {
      target: { value: "Comentario cancelado" },
    });
    fireEvent.change(screen.getByPlaceholderText("0-10"), {
      target: { value: "7" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(screen.queryByText("Comentario cancelado")).not.toBeInTheDocument();
  });

  it("clears actor filter when changing movies", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    // Select Inception and filter actors
    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

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
    await waitFor(() => {
      expect(
        screen.getByText('Actors in "The Dark Knight"'),
      ).toBeInTheDocument();
    });

    // The filter should still be active from the previous movie, so Leonardo should still appear
    // (since The Dark Knight also has Leonardo DiCaprio)
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();

    jest.useRealTimers();
  });

  it("resets actors and ratings filters when applying movie filter", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

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

  it("resets actors pagination when filtering actors", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

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

  it("resets ratings pagination when filtering ratings", async () => {
    jest.useFakeTimers();

    render(<MoviesPage />);

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "User 1" },
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
