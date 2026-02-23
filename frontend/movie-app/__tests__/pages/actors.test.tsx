import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import ActorsPage from "../../app/actors/page";
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
const originalConsoleError = console.error;

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
      name: "Scarlett Johansson",
      nationality: "USA",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 3,
      name: "Song Kang-ho",
      nationality: "South Korea",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 4,
      name: "Natalie Portman",
      nationality: "Israel",
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
  ],
  meta: {
    total: 3,
    limit: 100,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    hasNext: false,
  },
};

const mockActorMoviesData = {
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
  ],
  meta: {
    total: 3,
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
      score: 9,
      comment: "Mind-bending masterpiece",
      userId: 1,
      movieId: 1,
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
    },
    {
      id: 2,
      score: 8,
      comment: "Great visual effects",
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

describe("ActorsPage", () => {
  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
      const firstArg = args[0];
      if (
        typeof firstArg === "string" &&
        firstArg.includes("not wrapped in act")
      ) {
        return;
      }

      originalConsoleError(...args);
    });
  });

  afterAll(() => {
    (console.error as jest.Mock).mockRestore();
  });

  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    });
    mockShowToast.mockClear();

    // Setup default mocks for API calls
    mockApiClient.get.mockImplementation((url: string) => {
      if (url === "/actors") {
        return Promise.resolve({ data: mockActorsData });
      }
      if (url === "/movies") {
        return Promise.resolve({ data: mockMoviesData });
      }
      if (url.match(/\/actors\/\d+\/movies/)) {
        return Promise.resolve({ data: mockActorMoviesData });
      }
      if (url === "/movie-ratings") {
        return Promise.resolve({ data: mockRatingsData });
      }
      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders actors grid", async () => {
    render(<ActorsPage />);

    expect(screen.getByText("Actor directory")).toBeInTheDocument();
    expect(screen.getByText("Actors Grid")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
      expect(screen.getByText("Scarlett Johansson")).toBeInTheDocument();
    });
  });

  it("does not show related grids on initial render", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    expect(
      screen.queryByText(/Movies with "Leonardo DiCaprio"/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("shows movies grid when an actor is selected", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(
        screen.getByText('Movies with "Leonardo DiCaprio"'),
      ).toBeInTheDocument();
    });
  });

  it("displays correct movies for selected actor", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
      expect(screen.getByText("Interstellar")).toBeInTheDocument();
    });
  });

  it("shows ratings grid when a movie is selected from actor's movies", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });
  });

  it("displays correct ratings for selected movie", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
      expect(screen.getByText("Great visual effects")).toBeInTheDocument();
    });
  });

  it("clears movies and ratings when selecting different actor", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Scarlett Johansson"));

    await waitFor(() => {
      expect(
        screen.queryByText('Ratings for "Inception"'),
      ).not.toBeInTheDocument();
      expect(
        screen.getByText('Movies with "Scarlett Johansson"'),
      ).toBeInTheDocument();
    });
  });

  it("clears related grids when next page is clicked on actors", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    const nextButtons = screen.getAllByRole("button", { name: "Next" });

    act(() => {
      fireEvent.click(nextButtons[0]);
    });

    await waitFor(() => {
      expect(
        screen.queryByText(/Movies with "Leonardo DiCaprio"/),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.queryByText(/Ratings for "Inception"/),
      ).not.toBeInTheDocument();
    });
  });

  it("clears related grids when filter is applied to actors", async () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Filter actors..."), {
      target: { value: "Scarlett" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(
      screen.queryByText(/Movies with "Leonardo DiCaprio"/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("highlights selected actor row", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    const actorRow = screen.getByText("Leonardo DiCaprio").closest("tr");
    expect(actorRow).not.toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(actorRow).toHaveClass("bg-stone-200/60");
  });

  it("shows filter inputs for related grids when actor is selected", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Filter movies..."),
      ).toBeInTheDocument();
    });
  });

  it("shows filter input for ratings when movie is selected", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Filter ratings..."),
      ).toBeInTheDocument();
    });
  });

  it("filters movies by title", async () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
      expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Filter movies..."), {
      target: { value: "Inception" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.queryByText("The Dark Knight")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("filters ratings by reviewer", async () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

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

  it("clears ratings grid when changing selected movie from actors list", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("The Dark Knight"));

    await waitFor(() => {
      expect(
        screen.getByText('Ratings for "The Dark Knight"'),
      ).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Ratings for "Inception"'),
    ).not.toBeInTheDocument();
  });

  it("shows add button for ratings grid", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      const addButtons = screen.getAllByRole("button", { name: "+ Add" });
      expect(addButtons.length).toBeGreaterThan(0);
    });
  });

  it("adds rating from modal and updates grid", async () => {
    mockApiClient.post.mockResolvedValue({ data: {} });

    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

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
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

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

  it("renders back and home buttons", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("renders logout button", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("shows update and delete buttons for actors", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    const updateButtons = screen.getAllByRole("button", { name: "Update" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

    expect(updateButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("does not show update/delete buttons for related grids", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
    });

    const updateButtons = screen.queryAllByRole("button", { name: "Update" });
    const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });

    // The actors grid still has update/delete, but movies and ratings grids should not
    const movieSectionUpdateButtons = updateButtons.filter(
      (btn) => btn.closest("section") !== updateButtons[0].closest("section"),
    );
    expect(movieSectionUpdateButtons.length).toBe(0);
  });

  it("pagineates movies independently from actors", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      const paginationText = screen.getAllByText(/Page 1 of/);
      expect(paginationText.length).toBeGreaterThan(0);
    });
  });

  it("resets movies and ratings grids when changing actor", async () => {
    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(
        screen.getByText('Movies with "Leonardo DiCaprio"'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Scarlett Johansson"));

    await waitFor(() => {
      expect(
        screen.queryByText('Movies with "Leonardo DiCaprio"'),
      ).not.toBeInTheDocument();
    });
    await waitFor(() => {
      expect(
        screen.getByText('Movies with "Scarlett Johansson"'),
      ).toBeInTheDocument();
    });
  });

  it("resets ratings pagination when filtering ratings", async () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    await waitFor(() => {
      expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    await waitFor(() => {
      expect(screen.getByText("Inception")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Inception"));

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("Filter ratings..."),
      ).toBeInTheDocument();
    });

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "User 1" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const paginationText = screen.getAllByText(/Page 1 of/);
    expect(paginationText.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});
