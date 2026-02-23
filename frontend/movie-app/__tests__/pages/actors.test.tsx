import { act, fireEvent, render, screen } from "@testing-library/react";
import ActorsPage from "../../app/actors/page";
import { useRouter } from "next/navigation";

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

describe("ActorsPage", () => {
  beforeEach(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: jest.fn(),
      back: jest.fn(),
    });
    mockShowToast.mockClear();
  });

  it("renders actors grid", () => {
    render(<ActorsPage />);

    expect(screen.getByText("Actor directory")).toBeInTheDocument();
    expect(screen.getByText("Actors Grid")).toBeInTheDocument();
    expect(screen.getByText("Leonardo DiCaprio")).toBeInTheDocument();
    expect(screen.getByText("Scarlett Johansson")).toBeInTheDocument();
  });

  it("does not show related grids on initial render", () => {
    render(<ActorsPage />);

    expect(
      screen.queryByText(/Movies with "Leonardo DiCaprio"/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("shows movies grid when an actor is selected", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(
      screen.getByText('Movies with "Leonardo DiCaprio"'),
    ).toBeInTheDocument();
  });

  it("displays correct movies for selected actor", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();
    expect(screen.getByText("Interstellar")).toBeInTheDocument();
  });

  it("shows ratings grid when a movie is selected from actor's movies", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();
  });

  it("displays correct ratings for selected movie", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    expect(screen.getByText("Great visual effects")).toBeInTheDocument();
  });

  it("clears movies and ratings when selecting different actor", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();

    fireEvent.click(screen.getByText("Scarlett Johansson"));

    expect(
      screen.queryByText('Ratings for "Inception"'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Movies with "Scarlett Johansson"'),
    ).toBeInTheDocument();
  });

  it("clears related grids when next page is clicked on actors", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();

    const nextButtons = screen.getAllByRole("button", { name: "Next" });
    fireEvent.click(nextButtons[0]);

    expect(
      screen.queryByText(/Movies with "Leonardo DiCaprio"/),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/Ratings for "Inception"/),
    ).not.toBeInTheDocument();
  });

  it("clears related grids when filter is applied to actors", () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();

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

  it("highlights selected actor row", () => {
    render(<ActorsPage />);

    const actorRow = screen.getByText("Leonardo DiCaprio").closest("tr");
    expect(actorRow).not.toHaveClass("bg-stone-200/60");

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(actorRow).toHaveClass("bg-stone-200/60");
  });

  it("shows filter inputs for related grids when actor is selected", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(screen.getByPlaceholderText("Filter movies...")).toBeInTheDocument();
  });

  it("shows filter input for ratings when movie is selected", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    expect(
      screen.getByPlaceholderText("Filter ratings..."),
    ).toBeInTheDocument();
  });

  it("filters movies by title", () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    expect(screen.getByText("Inception")).toBeInTheDocument();
    expect(screen.getByText("The Dark Knight")).toBeInTheDocument();

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

  it("filters ratings by reviewer", () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    expect(screen.getByText("Great visual effects")).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "John" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(screen.getByText("Mind-bending masterpiece")).toBeInTheDocument();
    expect(screen.queryByText("Great visual effects")).not.toBeInTheDocument();

    jest.useRealTimers();
  });

  it("clears ratings grid when changing selected movie from actors list", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    expect(screen.getByText('Ratings for "Inception"')).toBeInTheDocument();

    fireEvent.click(screen.getByText("The Dark Knight"));

    expect(
      screen.getByText('Ratings for "The Dark Knight"'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Ratings for "Inception"'),
    ).not.toBeInTheDocument();
  });

  it("shows add button for ratings grid", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    const addButtons = screen.getAllByRole("button", { name: "+ Add" });
    expect(addButtons.length).toBeGreaterThan(0);
  });

  it("adds rating from modal and updates grid", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));

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

    expect(screen.getByText("Novo comentario")).toBeInTheDocument();
    expect(mockShowToast).toHaveBeenCalledWith(
      "Rating saved successfully!",
      "success",
    );
  });

  it("does not add rating when modal is canceled", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));
    fireEvent.click(screen.getByRole("button", { name: "+ Add" }));

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

  it("renders back and home buttons", () => {
    render(<ActorsPage />);

    expect(screen.getByRole("button", { name: "Voltar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Home" })).toBeInTheDocument();
  });

  it("renders logout button", () => {
    render(<ActorsPage />);

    expect(screen.getByRole("button", { name: "Logout" })).toBeInTheDocument();
  });

  it("shows update and delete buttons for actors", () => {
    render(<ActorsPage />);

    const updateButtons = screen.getAllByRole("button", { name: "Update" });
    const deleteButtons = screen.getAllByRole("button", { name: "Delete" });

    expect(updateButtons.length).toBeGreaterThan(0);
    expect(deleteButtons.length).toBeGreaterThan(0);
  });

  it("does not show update/delete buttons for related grids", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    const updateButtons = screen.queryAllByRole("button", { name: "Update" });
    const deleteButtons = screen.queryAllByRole("button", { name: "Delete" });

    // The actors grid still has update/delete, but movies and ratings grids should not
    const movieSectionUpdateButtons = updateButtons.filter(
      (btn) => btn.closest("section") !== updateButtons[0].closest("section"),
    );
    expect(movieSectionUpdateButtons.length).toBe(0);
  });

  it("pagineates movies independently from actors", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    const paginationText = screen.getAllByText(/Page 1 of/);
    expect(paginationText.length).toBeGreaterThan(0);
  });

  it("resets movies and ratings grids when changing actor", () => {
    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));

    expect(
      screen.getByText('Movies with "Leonardo DiCaprio"'),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByText("Scarlett Johansson"));

    expect(
      screen.queryByText('Movies with "Leonardo DiCaprio"'),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Movies with "Scarlett Johansson"'),
    ).toBeInTheDocument();
  });

  it("resets ratings pagination when filtering ratings", () => {
    jest.useFakeTimers();

    render(<ActorsPage />);

    fireEvent.click(screen.getByText("Leonardo DiCaprio"));
    fireEvent.click(screen.getByText("Inception"));

    fireEvent.change(screen.getByPlaceholderText("Filter ratings..."), {
      target: { value: "John" },
    });

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const paginationText = screen.getAllByText(/Page 1 of/);
    expect(paginationText.length).toBeGreaterThan(0);

    jest.useRealTimers();
  });
});
