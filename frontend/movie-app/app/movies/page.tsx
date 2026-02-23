"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth";
import AddRatingModal from "@/components/ratings/AddRatingModal";
import { DataGrid, type DataGridColumn } from "@/components/grid";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmDeleteModal } from "@/components/common";
import { MovieFormModal, type MovieFormData } from "@/components/movies";
import type { MultiSelectOption } from "@/components/common";
import { apiClient } from "@/services";
import type {
  MovieDto,
  ActorDto,
  PaginatedResponse,
  CreateMovieDto,
  UpdateMovieDto,
  RatingDto,
} from "@/types/api";

interface MovieRow {
  id: number;
  title: string;
  genre: string;
  year: number;
  description: string;
}

interface ActorRow {
  id: number;
  name: string;
  nationality: string;
}

interface RatingRow {
  id: number;
  rating: number;
  reviewer: string;
  comment: string;
}

interface CreateEntityResponse<T> {
  data: T;
}

const movieColumns: DataGridColumn<MovieRow>[] = [
  { key: "title", header: "Title" },
  { key: "genre", header: "Genre" },
  { key: "year", header: "Year" },
];

const actorColumns: DataGridColumn<ActorRow>[] = [
  { key: "name", header: "Name" },
];

const ratingColumns: DataGridColumn<RatingRow>[] = [
  { key: "rating", header: "Rating" },
  { key: "comment", header: "Description" },
];

export default function MoviesPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [movies, setMovies] = useState<MovieRow[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState(true);

  const [availableActors, setAvailableActors] = useState<MultiSelectOption[]>(
    [],
  );

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [totalMovies, setTotalMovies] = useState(0);
  const [moviesCursorByPage, setMoviesCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [moviesHasNextPage, setMoviesHasNextPage] = useState(false);
  const [moviesHasPreviousPage, setMoviesHasPreviousPage] = useState(false);

  const [selectedMovie, setSelectedMovie] = useState<MovieRow | null>(null);
  const [relatedActors, setRelatedActors] = useState<ActorRow[]>([]);
  const [isLoadingActors, setIsLoadingActors] = useState(false);
  const [relatedActorsPage, setRelatedActorsPage] = useState(1);
  const [actorsFilter, setActorsFilter] = useState("");
  const [totalRelatedActors, setTotalRelatedActors] = useState(0);
  const [relatedActorsCursorByPage, setRelatedActorsCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [relatedActorsHasNextPage, setRelatedActorsHasNextPage] =
    useState(false);
  const [relatedActorsHasPreviousPage, setRelatedActorsHasPreviousPage] =
    useState(false);

  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [isLoadingRatings, setIsLoadingRatings] = useState(false);
  const [movieRatingsPage, setMovieRatingsPage] = useState(1);
  const [ratingsFilter, setRatingsFilter] = useState("");
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingsCursorByPage, setRatingsCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [ratingsHasNextPage, setRatingsHasNextPage] = useState(false);
  const [ratingsHasPreviousPage, setRatingsHasPreviousPage] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const [isMovieFormOpen, setIsMovieFormOpen] = useState(false);
  const [movieFormMode, setMovieFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingMovie, setEditingMovie] = useState<MovieRow | null>(null);
  const [editingMovieActorIds, setEditingMovieActorIds] = useState<number[]>(
    [],
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingMovie, setDeletingMovie] = useState<MovieRow | null>(null);

  const pageSize = 4;
  const relatedDataPageSize = 5;

  const fetchMovies = async () => {
    try {
      setIsLoadingMovies(true);
      const response = await apiClient.get<PaginatedResponse<MovieDto>>(
        "/movies",
        {
          params: {
            limit: pageSize,
            ...(filter && { title: filter }),
            ...(page > 1 && moviesCursorByPage[page]
              ? { cursor: moviesCursorByPage[page] }
              : {}),
          },
        },
      );

      const movieRows: MovieRow[] = response.data.data.map((movie) => ({
        id: movie.id,
        title: movie.title,
        genre: movie.genre,
        year: movie.releaseYear,
        description: movie.description,
      }));

      const meta = response.data.meta;

      setMovies(movieRows);
      setTotalMovies(meta?.total ?? movieRows.length);
      setMoviesHasNextPage(Boolean(meta?.hasNextPage ?? meta?.hasNext));
      setMoviesHasPreviousPage(Boolean(meta?.hasPreviousPage));

      if (meta?.nextCursor !== undefined) {
        setMoviesCursorByPage((prev) => ({
          ...prev,
          [page + 1]: Number(meta.nextCursor),
        }));
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      showToast("Failed to load movies. Please try again.", "error");
      setMovies([]);
      setTotalMovies(0);
      setMoviesHasNextPage(false);
      setMoviesHasPreviousPage(false);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  const fetchAllActors = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<ActorDto>>(
        "/actors",
        {
          params: {
            limit: 100,
          },
        },
      );

      const actorOptions: MultiSelectOption[] = response.data.data.map(
        (actor) => ({
          id: actor.id,
          label: actor.name,
        }),
      );

      setAvailableActors(actorOptions);
    } catch (error) {
      console.error("Error fetching actors:", error);
      setAvailableActors([]);
    }
  };

  const fetchMovieActors = async (movieId: number) => {
    try {
      setIsLoadingActors(true);
      const response = await apiClient.get<PaginatedResponse<ActorDto>>(
        `/movies/${movieId}/actors`,
        {
          params: {
            limit: relatedDataPageSize,
            ...(actorsFilter && { name: actorsFilter }),
            ...(relatedActorsPage > 1 &&
            relatedActorsCursorByPage[relatedActorsPage]
              ? { cursor: relatedActorsCursorByPage[relatedActorsPage] }
              : {}),
          },
        },
      );

      const actorRows: ActorRow[] = response.data.data.map((actor) => ({
        id: actor.id,
        name: actor.name,
        nationality: actor.nationality,
      }));

      const meta = response.data.meta;

      setRelatedActors(actorRows);
      setTotalRelatedActors(meta?.total ?? actorRows.length);
      setRelatedActorsHasNextPage(Boolean(meta?.hasNextPage ?? meta?.hasNext));
      setRelatedActorsHasPreviousPage(Boolean(meta?.hasPreviousPage));

      if (meta?.nextCursor !== undefined) {
        setRelatedActorsCursorByPage((prev) => ({
          ...prev,
          [relatedActorsPage + 1]: Number(meta.nextCursor),
        }));
      }
    } catch (error) {
      console.error("Error fetching movie actors:", error);
      setRelatedActors([]);
      setTotalRelatedActors(0);
      setRelatedActorsHasNextPage(false);
      setRelatedActorsHasPreviousPage(false);
    } finally {
      setIsLoadingActors(false);
    }
  };

  const fetchMovieRatings = async (movieId: number) => {
    try {
      setIsLoadingRatings(true);
      const response = await apiClient.get<PaginatedResponse<RatingDto>>(
        "/movie-ratings",
        {
          params: {
            movieId,
            limit: relatedDataPageSize,
            ...(movieRatingsPage > 1 && ratingsCursorByPage[movieRatingsPage]
              ? { cursor: ratingsCursorByPage[movieRatingsPage] }
              : {}),
          },
        },
      );

      const ratingRows: RatingRow[] = response.data.data.map((rating) => ({
        id: rating.id,
        rating: rating.score,
        reviewer: `User ${rating.userId}`,
        comment: rating.comment ?? "",
      }));

      const meta = response.data.meta;

      setRatings(ratingRows);
      setTotalRatings(meta?.total ?? ratingRows.length);
      setRatingsHasNextPage(Boolean(meta?.hasNextPage ?? meta?.hasNext));
      setRatingsHasPreviousPage(Boolean(meta?.hasPreviousPage));

      if (meta?.nextCursor !== undefined) {
        setRatingsCursorByPage((prev) => ({
          ...prev,
          [movieRatingsPage + 1]: Number(meta.nextCursor),
        }));
      }
    } catch (error) {
      console.error("Error fetching movie ratings:", error);
      setRatings([]);
      setTotalRatings(0);
      setRatingsHasNextPage(false);
      setRatingsHasPreviousPage(false);
    } finally {
      setIsLoadingRatings(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [page, filter]);

  useEffect(() => {
    fetchAllActors();
  }, []);

  useEffect(() => {
    if (selectedMovie) {
      fetchMovieActors(selectedMovie.id);
    }
  }, [selectedMovie?.id, relatedActorsPage, actorsFilter]);

  useEffect(() => {
    if (selectedMovie) {
      fetchMovieRatings(selectedMovie.id);
    }
  }, [selectedMovie?.id, movieRatingsPage]);

  const filteredMovieRows = movies.filter((movie) => {
    const query = filter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      movie.title.toLowerCase().includes(query) ||
      movie.genre.toLowerCase().includes(query) ||
      String(movie.year).includes(query)
    );
  });

  const totalPages = Math.ceil(totalMovies / pageSize);

  const filteredActors = relatedActors.filter((actor) => {
    const query = actorsFilter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      actor.name.toLowerCase().includes(query) ||
      actor.nationality.toLowerCase().includes(query)
    );
  });

  const relatedActorsTotalPages = Math.ceil(
    totalRelatedActors / relatedDataPageSize,
  );

  const filteredRatings = ratings.filter((rating) => {
    const query = ratingsFilter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      String(rating.rating).includes(query) ||
      rating.reviewer.toLowerCase().includes(query) ||
      rating.comment.toLowerCase().includes(query)
    );
  });

  const ratingsTotalPages = Math.ceil(totalRatings / relatedDataPageSize);

  const pushRouteState = (nextPage: number, nextFilter: string) => {
    const params = new URLSearchParams();
    params.set("page", String(nextPage));

    if (nextFilter) {
      params.set("filter", nextFilter);
    }

    router.push(`/movies?${params.toString()}`);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleCreateMovie = () => {
    setMovieFormMode("create");
    setEditingMovie(null);
    setEditingMovieActorIds([]);
    setIsMovieFormOpen(true);
  };

  const handleUpdateMovie = async (movie: MovieRow) => {
    setMovieFormMode("edit");
    setEditingMovie(movie);

    try {
      const actorIds: number[] = [];
      let cursor: number | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const actorsPageResponse = await apiClient.get(
          `/movies/${movie.id}/actors`,
          {
            params: {
              limit: 100,
              ...(cursor !== undefined ? { cursor } : {}),
            },
          },
        );
        const actorsResponse =
          actorsPageResponse.data as PaginatedResponse<ActorDto>;

        const currentIds = actorsResponse.data
          .map((actor) => actor.id)
          .filter((id): id is number => Number.isInteger(id) && id > 0);

        actorIds.push(...currentIds);

        const meta = actorsResponse.meta;
        const nextCursor = meta?.nextCursor;
        hasNextPage = Boolean(meta?.hasNextPage ?? meta?.hasNext);
        cursor =
          nextCursor !== undefined && nextCursor !== null
            ? Number(nextCursor)
            : undefined;

        if (!hasNextPage || cursor === undefined) {
          break;
        }
      }

      setEditingMovieActorIds(actorIds);
    } catch (error) {
      console.error("Error fetching movie actors for edit:", error);
      setEditingMovieActorIds([]);
      showToast(
        "Could not pre-load movie actors for editing. You can still select them manually.",
        "error",
      );
    }

    setIsMovieFormOpen(true);
  };

  const handleDeleteMovie = (movie: MovieRow) => {
    setDeletingMovie(movie);
    setIsDeleteModalOpen(true);
  };

  const handleSaveMovie = async (data: MovieFormData) => {
    try {
      if (movieFormMode === "create") {
        const createDto: CreateMovieDto = {
          title: data.title,
          description: data.description,
          releaseYear: data.releaseYear,
          genre: data.genre,
        };

        const response = await apiClient.post<
          CreateEntityResponse<MovieDto> | MovieDto
        >("/movies", createDto);
        const createdMovie =
          "data" in response.data
            ? (response.data as CreateEntityResponse<MovieDto>).data
            : (response.data as MovieDto);
        const createdMovieId = createdMovie?.id;

        if (!createdMovieId) {
          showToast(
            "Movie created, but linking actors failed due to invalid movie id.",
            "error",
          );
          setIsMovieFormOpen(false);
          await fetchMovies();
          return;
        }

        if (data.actorIds && data.actorIds.length > 0) {
          const validActorIds = data.actorIds.filter(
            (actorId): actorId is number =>
              Number.isInteger(actorId) && actorId > 0,
          );

          await Promise.all(
            validActorIds.map((actorId) =>
              apiClient.post(`/movies/${createdMovieId}/actors/${actorId}`),
            ),
          );
        }

        showToast("Movie created successfully!", "success");
      } else if (editingMovie) {
        const updateDto: UpdateMovieDto = {
          title: data.title,
          description: data.description,
          releaseYear: data.releaseYear,
          genre: data.genre,
        };

        await apiClient.patch(`/movies/${editingMovie.id}`, updateDto);

        if (data.actorIds && data.actorIds.length > 0) {
          const validActorIds = data.actorIds.filter(
            (actorId): actorId is number =>
              Number.isInteger(actorId) && actorId > 0,
          );

          await Promise.all(
            validActorIds.map((actorId) =>
              apiClient.post(`/movies/${editingMovie.id}/actors/${actorId}`),
            ),
          );
        }

        showToast("Movie updated successfully!", "success");
      }

      setIsMovieFormOpen(false);

      await fetchMovies();

      if (
        movieFormMode === "edit" &&
        selectedMovie &&
        editingMovie &&
        selectedMovie.id === editingMovie.id
      ) {
        await fetchMovieActors(editingMovie.id);
      }
    } catch (error) {
      console.error("Error saving movie:", error);
      showToast("Failed to save movie. Please try again.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingMovie) {
      return;
    }

    try {
      await apiClient.delete(`/movies/${deletingMovie.id}`);

      setIsDeleteModalOpen(false);
      setDeletingMovie(null);
      showToast("Movie deleted successfully!", "success");

      if (selectedMovie?.id === deletingMovie.id) {
        setSelectedMovie(null);
        setRelatedActors([]);
        setRatings([]);
      }

      await fetchMovies();
    } catch (error) {
      console.error("Error deleting movie:", error);
      showToast("Failed to delete movie. Please try again.", "error");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingMovie(null);
  };

  const handleSelectMovie = (movie: MovieRow) => {
    setSelectedMovie(movie);
    setRelatedActorsPage(1);
    setMovieRatingsPage(1);
    setRelatedActorsCursorByPage({ 1: undefined });
    setRatingsCursorByPage({ 1: undefined });
    setRelatedActorsHasNextPage(false);
    setRelatedActorsHasPreviousPage(false);
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    setSelectedMovie(null);
    setRelatedActorsPage(1);
    setMovieRatingsPage(1);
    pushRouteState(nextPage, filter);
  };

  const handleFilterMovies = (value: string) => {
    setFilter(value);
    setPage(1);
    setSelectedMovie(null);
    setRelatedActorsPage(1);
    setMovieRatingsPage(1);
    setActorsFilter("");
    setRatingsFilter("");
    setMoviesCursorByPage({ 1: undefined });
    setMoviesHasNextPage(false);
    setMoviesHasPreviousPage(false);
    setRelatedActorsCursorByPage({ 1: undefined });
    setRelatedActorsHasNextPage(false);
    setRelatedActorsHasPreviousPage(false);
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
    pushRouteState(1, value);
  };

  const handleFilterActors = (value: string) => {
    setActorsFilter(value);
    setRelatedActorsPage(1);
    setRelatedActorsCursorByPage({ 1: undefined });
    setRelatedActorsHasNextPage(false);
    setRelatedActorsHasPreviousPage(false);
  };

  const handleFilterRatings = (value: string) => {
    setRatingsFilter(value);
    setMovieRatingsPage(1);
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handleAddRating = () => {
    if (!selectedMovie) {
      return;
    }

    setIsRatingModalOpen(true);
  };

  const handleSaveRating = async (data: {
    reviewer: string;
    comment: string;
    rating: number;
  }) => {
    if (!selectedMovie) {
      return;
    }

    try {
      const createRatingDto = {
        score: data.rating,
        comment: data.comment,
        movieId: selectedMovie.id,
      };

      await apiClient.post("/movie-ratings", createRatingDto);

      setIsRatingModalOpen(false);
      showToast("Rating saved successfully!", "success");

      await fetchMovieRatings(selectedMovie.id);
      setMovieRatingsPage(1);
      setRatingsCursorByPage({ 1: undefined });
    } catch (error) {
      console.error("Error saving rating:", error);
      showToast("Failed to save rating. Please try again.", "error");
    }
  };

  const handleCancelRating = () => {
    setIsRatingModalOpen(false);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,187,0.55),_rgba(247,241,233,0.1)_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(60,57,48,0.8),_rgba(18,17,15,0.2)_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(170,179,166,0.25),_rgba(247,241,233,0.05)_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(79,85,74,0.35),_rgba(18,17,15,0.15)_60%)]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-12 sm:px-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
            >
              Home
            </button>
          </div>
          <LogoutButton className="rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold uppercase tracking-[0.18em] text-stone-600 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-300 dark:hover:border-stone-400" />
        </div>
        <section className="rounded-3xl border border-black/10 bg-white/80 px-6 py-10 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:px-10">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
              Movies
            </p>
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100 sm:text-4xl">
              Movie catalog
            </h1>
            <p className="max-w-2xl text-base text-stone-600 dark:text-stone-300">
              Use this page to list movies, filter by rating, or jump into movie
              details.
            </p>
          </div>
        </section>
        <DataGrid
          title="Movies Grid"
          rows={filteredMovieRows}
          columns={movieColumns}
          showFilter
          showActions
          showAdd
          selectedRowId={selectedMovie?.id}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          hasPreviousPage={moviesHasPreviousPage}
          hasNextPage={moviesHasNextPage}
          onPageChange={handlePageChange}
          onUpdate={handleUpdateMovie}
          onDelete={handleDeleteMovie}
          onSelectedRow={handleSelectMovie}
          onFilter={handleFilterMovies}
          onAdd={handleCreateMovie}
          filterDebounceMs={1000}
          filterPlaceholder="Filter movies..."
          emptyMessage="No movies available."
        />

        {selectedMovie && (
          <div className="grid gap-6 lg:grid-cols-2">
            <DataGrid
              title={`Actors in "${selectedMovie.title}"`}
              rows={filteredActors}
              columns={actorColumns}
              showFilter
              showActions={false}
              tableMinWidthClass="min-w-0"
              page={relatedActorsPage}
              pageSize={relatedDataPageSize}
              totalPages={relatedActorsTotalPages}
              hasPreviousPage={relatedActorsHasPreviousPage}
              hasNextPage={relatedActorsHasNextPage}
              onPageChange={setRelatedActorsPage}
              onFilter={handleFilterActors}
              filterDebounceMs={1000}
              filterPlaceholder="Filter actors..."
              emptyMessage="No actors available for this movie."
            />
            <DataGrid
              title={`Ratings for "${selectedMovie.title}"`}
              rows={filteredRatings}
              columns={ratingColumns}
              showFilter
              showActions={false}
              showAdd
              tableMinWidthClass="min-w-0"
              page={movieRatingsPage}
              pageSize={relatedDataPageSize}
              totalPages={ratingsTotalPages}
              hasPreviousPage={ratingsHasPreviousPage}
              hasNextPage={ratingsHasNextPage}
              onPageChange={setMovieRatingsPage}
              onFilter={handleFilterRatings}
              onAdd={handleAddRating}
              filterDebounceMs={1000}
              filterPlaceholder="Filter ratings..."
              emptyMessage="No ratings available for this movie."
            />
          </div>
        )}
        <AddRatingModal
          isOpen={isRatingModalOpen}
          movieTitle={selectedMovie?.title}
          onSave={handleSaveRating}
          onCancel={handleCancelRating}
        />

        <MovieFormModal
          key={`${movieFormMode}-${editingMovie?.id || "new"}`}
          isOpen={isMovieFormOpen}
          mode={movieFormMode}
          initialData={
            editingMovie
              ? {
                  title: editingMovie.title,
                  description: editingMovie.description,
                  releaseYear: editingMovie.year,
                  genre: editingMovie.genre,
                  actorIds: editingMovieActorIds,
                }
              : undefined
          }
          availableActors={availableActors}
          onSave={handleSaveMovie}
          onCancel={() => setIsMovieFormOpen(false)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Delete Movie"
          message={`Are you sure you want to delete "${deletingMovie?.title}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </main>
    </div>
  );
}
