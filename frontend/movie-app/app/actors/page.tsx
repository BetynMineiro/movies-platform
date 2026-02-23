/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth";
import AddRatingModal from "@/components/ratings/AddRatingModal";
import { DataGrid, type DataGridColumn } from "@/components/grid";
import { useToast } from "@/contexts/ToastContext";
import { ConfirmDeleteModal } from "@/components/common";
import { ActorFormModal, type ActorFormData } from "@/components/actors";
import type { MultiSelectOption } from "@/components/common";
import { apiClient } from "@/services";
import type {
  MovieDto,
  ActorDto,
  PaginatedResponse,
  CreateActorDto,
  UpdateActorDto,
  RatingDto,
} from "@/types/api";

interface ActorRow {
  id: number;
  name: string;
  nationality: string;
}

interface MovieRow {
  id: number;
  title: string;
  genre: string;
  year: number;
  description: string;
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

const actorColumns: DataGridColumn<ActorRow>[] = [
  { key: "name", header: "Name" },
  { key: "nationality", header: "Nationality" },
];

const movieColumns: DataGridColumn<MovieRow>[] = [
  { key: "title", header: "Title" },
  { key: "genre", header: "Genre" },
  { key: "year", header: "Year" },
];

const ratingColumns: DataGridColumn<RatingRow>[] = [
  { key: "rating", header: "Rating" },
  { key: "reviewer", header: "Reviewer" },
  { key: "comment", header: "Comment" },
];

export default function ActorsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [actors, setActors] = useState<ActorRow[]>([]);

  const [availableMovies, setAvailableMovies] = useState<MultiSelectOption[]>(
    [],
  );

  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [totalActors, setTotalActors] = useState(0);
  const [actorsCursorByPage, setActorsCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [actorsHasNextPage, setActorsHasNextPage] = useState(false);
  const [actorsHasPreviousPage, setActorsHasPreviousPage] = useState(false);

  const [selectedActor, setSelectedActor] = useState<ActorRow | null>(null);
  const [relatedMovies, setRelatedMovies] = useState<MovieRow[]>([]);
  const [relatedMoviesPage, setRelatedMoviesPage] = useState(1);
  const [moviesFilter, setMoviesFilter] = useState("");
  const [totalRelatedMovies, setTotalRelatedMovies] = useState(0);
  const [relatedMoviesCursorByPage, setRelatedMoviesCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [relatedMoviesHasNextPage, setRelatedMoviesHasNextPage] =
    useState(false);
  const [relatedMoviesHasPreviousPage, setRelatedMoviesHasPreviousPage] =
    useState(false);

  const [selectedMovie, setSelectedMovie] = useState<MovieRow | null>(null);
  const [ratings, setRatings] = useState<RatingRow[]>([]);
  const [movieRatingsPage, setMovieRatingsPage] = useState(1);
  const [ratingsFilter, setRatingsFilter] = useState("");
  const [totalRatings, setTotalRatings] = useState(0);
  const [ratingsCursorByPage, setRatingsCursorByPage] = useState<
    Record<number, number | undefined>
  >({ 1: undefined });
  const [ratingsHasNextPage, setRatingsHasNextPage] = useState(false);
  const [ratingsHasPreviousPage, setRatingsHasPreviousPage] = useState(false);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);

  const [isActorFormOpen, setIsActorFormOpen] = useState(false);
  const [actorFormMode, setActorFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [editingActor, setEditingActor] = useState<ActorRow | null>(null);
  const [editingActorMovieIds, setEditingActorMovieIds] = useState<number[]>(
    [],
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingActor, setDeletingActor] = useState<ActorRow | null>(null);

  const pageSize = 4;
  const relatedDataPageSize = 5;

  const fetchActors = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<ActorDto>>(
        "/actors",
        {
          params: {
            limit: pageSize,
            ...(filter && { name: filter }),
            ...(page > 1 && actorsCursorByPage[page]
              ? { cursor: actorsCursorByPage[page] }
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

      setActors(actorRows);
      setTotalActors(meta?.total ?? actorRows.length);
      setActorsHasNextPage(Boolean(meta?.hasNextPage ?? meta?.hasNext));
      setActorsHasPreviousPage(Boolean(meta?.hasPreviousPage));

      if (meta?.nextCursor !== undefined) {
        setActorsCursorByPage((prev) => ({
          ...prev,
          [page + 1]: Number(meta.nextCursor),
        }));
      }
    } catch (error) {
      console.error("Error fetching actors:", error);
      showToast("Failed to load actors. Please try again.", "error");
      setActors([]);
      setTotalActors(0);
      setActorsHasNextPage(false);
      setActorsHasPreviousPage(false);
    }
  };

  const fetchAllMovies = async () => {
    try {
      const response = await apiClient.get<PaginatedResponse<MovieDto>>(
        "/movies",
        {
          params: {
            limit: 100, // Large page size to get all movies
          },
        },
      );

      const movieOptions: MultiSelectOption[] = response.data.data.map(
        (movie) => ({
          id: movie.id,
          label: movie.title,
        }),
      );

      setAvailableMovies(movieOptions);
    } catch (error) {
      console.error("Error fetching movies:", error);
      setAvailableMovies([]);
    }
  };

  const fetchActorMovies = async (actorId: number) => {
    try {
      const response = await apiClient.get<PaginatedResponse<MovieDto>>(
        `/actors/${actorId}/movies`,
        {
          params: {
            limit: relatedDataPageSize,
            ...(moviesFilter && { title: moviesFilter }),
            ...(relatedMoviesPage > 1 &&
            relatedMoviesCursorByPage[relatedMoviesPage]
              ? { cursor: relatedMoviesCursorByPage[relatedMoviesPage] }
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

      setRelatedMovies(movieRows);
      setTotalRelatedMovies(meta?.total ?? movieRows.length);
      setRelatedMoviesHasNextPage(Boolean(meta?.hasNextPage ?? meta?.hasNext));
      setRelatedMoviesHasPreviousPage(Boolean(meta?.hasPreviousPage));

      if (meta?.nextCursor !== undefined) {
        setRelatedMoviesCursorByPage((prev) => ({
          ...prev,
          [relatedMoviesPage + 1]: Number(meta.nextCursor),
        }));
      }
    } catch (error) {
      console.error("Error fetching actor movies:", error);
      setRelatedMovies([]);
      setTotalRelatedMovies(0);
      setRelatedMoviesHasNextPage(false);
      setRelatedMoviesHasPreviousPage(false);
    }
  };

  const fetchMovieRatings = async (movieId: number) => {
    try {
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
    }
  };

  useEffect(() => {
    fetchActors();
  }, [page, filter]);

  useEffect(() => {
    fetchAllMovies();
  }, []);

  useEffect(() => {
    if (selectedActor) {
      fetchActorMovies(selectedActor.id);
    }
  }, [selectedActor?.id, relatedMoviesPage, moviesFilter]);

  useEffect(() => {
    if (selectedMovie) {
      fetchMovieRatings(selectedMovie.id);
    }
  }, [selectedMovie?.id, movieRatingsPage]);

  const filteredActorRows = actors.filter((actor) => {
    const query = filter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      actor.name.toLowerCase().includes(query) ||
      actor.nationality.toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(totalActors / pageSize);

  const filteredMovies = relatedMovies.filter((movie) => {
    const query = moviesFilter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      movie.title.toLowerCase().includes(query) ||
      movie.genre.toLowerCase().includes(query) ||
      String(movie.year).includes(query)
    );
  });

  const relatedMoviesTotalPages = Math.ceil(
    totalRelatedMovies / relatedDataPageSize,
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

    router.push(`/actors?${params.toString()}`);
  };

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  const handleCreateActor = () => {
    setActorFormMode("create");
    setEditingActor(null);
    setEditingActorMovieIds([]);
    setIsActorFormOpen(true);
  };

  const handleUpdateActor = async (actor: ActorRow) => {
    setActorFormMode("edit");
    setEditingActor(actor);

    try {
      const movieIds: number[] = [];
      let cursor: number | undefined = undefined;
      let hasNextPage = true;

      while (hasNextPage) {
        const moviesPageResponse = await apiClient.get(
          `/actors/${actor.id}/movies`,
          {
            params: {
              limit: 100,
              ...(cursor !== undefined ? { cursor } : {}),
            },
          },
        );
        const moviesResponse =
          moviesPageResponse.data as PaginatedResponse<MovieDto>;

        const currentIds = moviesResponse.data
          .map((movie) => movie.id)
          .filter((id): id is number => Number.isInteger(id) && id > 0);

        movieIds.push(...currentIds);

        const meta = moviesResponse.meta;
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

      setEditingActorMovieIds(movieIds);
    } catch (error) {
      console.error("Error fetching actor movies for edit:", error);
      setEditingActorMovieIds([]);
      showToast(
        "Could not pre-load actor movies for editing. You can still select them manually.",
        "error",
      );
    }

    setIsActorFormOpen(true);
  };

  const handleDeleteActor = (actor: ActorRow) => {
    setDeletingActor(actor);
    setIsDeleteModalOpen(true);
  };

  const handleSaveActor = async (data: ActorFormData) => {
    try {
      if (actorFormMode === "create") {
        const createDto: CreateActorDto = {
          name: data.name,
          nationality: data.nationality,
        };

        const response = await apiClient.post<
          CreateEntityResponse<ActorDto> | ActorDto
        >("/actors", createDto);
        const createdActor =
          "data" in response.data
            ? (response.data as CreateEntityResponse<ActorDto>).data
            : (response.data as ActorDto);
        const createdActorId = createdActor?.id;

        if (!createdActorId) {
          showToast(
            "Actor created, but linking movies failed due to invalid actor id.",
            "error",
          );
          setIsActorFormOpen(false);
          await fetchActors();
          return;
        }

        if (data.movieIds && data.movieIds.length > 0) {
          const validMovieIds = data.movieIds.filter(
            (movieId): movieId is number =>
              Number.isInteger(movieId) && movieId > 0,
          );

          await Promise.all(
            validMovieIds.map((movieId) =>
              apiClient.post(`/movies/${movieId}/actors/${createdActorId}`),
            ),
          );
        }

        showToast("Actor created successfully!", "success");
      } else if (editingActor) {
        const updateDto: UpdateActorDto = {
          name: data.name,
          nationality: data.nationality,
        };

        await apiClient.patch(`/actors/${editingActor.id}`, updateDto);

        if (data.movieIds && data.movieIds.length > 0) {
          const validMovieIds = data.movieIds.filter(
            (movieId): movieId is number =>
              Number.isInteger(movieId) && movieId > 0,
          );

          await Promise.all(
            validMovieIds.map((movieId) =>
              apiClient.post(`/movies/${movieId}/actors/${editingActor.id}`),
            ),
          );
        }

        showToast("Actor updated successfully!", "success");
      }

      setIsActorFormOpen(false);

      await fetchActors();

      if (
        actorFormMode === "edit" &&
        selectedActor &&
        editingActor &&
        selectedActor.id === editingActor.id
      ) {
        await fetchActorMovies(editingActor.id);
      }
    } catch (error) {
      console.error("Error saving actor:", error);
      showToast("Failed to save actor. Please try again.", "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingActor) {
      return;
    }

    try {
      await apiClient.delete(`/actors/${deletingActor.id}`);

      setIsDeleteModalOpen(false);
      setDeletingActor(null);
      showToast("Actor deleted successfully!", "success");

      if (selectedActor?.id === deletingActor.id) {
        setSelectedActor(null);
        setRelatedMovies([]);
        setSelectedMovie(null);
        setRatings([]);
      }

      await fetchActors();
    } catch (error) {
      console.error("Error deleting actor:", error);
      showToast("Failed to delete actor. Please try again.", "error");
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingActor(null);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    setSelectedActor(null);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setMoviesFilter("");
    setRatingsFilter("");
    setRelatedMoviesCursorByPage({ 1: undefined });
    setRelatedMoviesHasNextPage(false);
    setRelatedMoviesHasPreviousPage(false);
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
    pushRouteState(nextPage, filter);
  };

  const handleFilterActors = (value: string) => {
    setFilter(value);
    setPage(1);
    setSelectedActor(null);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setMoviesFilter("");
    setRatingsFilter("");
    setActorsCursorByPage({ 1: undefined });
    setActorsHasNextPage(false);
    setActorsHasPreviousPage(false);
    setRelatedMoviesCursorByPage({ 1: undefined });
    setRelatedMoviesHasNextPage(false);
    setRelatedMoviesHasPreviousPage(false);
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
    pushRouteState(1, value);
  };

  const handleSelectActor = (actor: ActorRow) => {
    setSelectedActor(actor);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setMoviesFilter("");
    setRatingsFilter("");
    setRelatedMoviesCursorByPage({ 1: undefined });
    setRatingsCursorByPage({ 1: undefined });
    setRelatedMoviesHasNextPage(false);
    setRelatedMoviesHasPreviousPage(false);
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handleSelectMovie = (movie: MovieRow) => {
    setSelectedMovie(movie);
    setMovieRatingsPage(1);
    setRatingsFilter("");
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handleMoviePageChange = (nextPage: number) => {
    setRelatedMoviesPage(nextPage);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setRatingsFilter("");
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handleFilterMovies = (value: string) => {
    setMoviesFilter(value);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setRatingsFilter("");
    setRelatedMoviesCursorByPage({ 1: undefined });
    setRelatedMoviesHasNextPage(false);
    setRelatedMoviesHasPreviousPage(false);
    setRatingsCursorByPage({ 1: undefined });
    setRatingsHasNextPage(false);
    setRatingsHasPreviousPage(false);
  };

  const handleRatingPageChange = (nextPage: number) => {
    setMovieRatingsPage(nextPage);
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
              Actors
            </p>
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100 sm:text-4xl">
              Actor directory
            </h1>
            <p className="max-w-2xl text-base text-stone-600 dark:text-stone-300">
              Use this page to browse actors and jump into related movies.
            </p>
          </div>
        </section>
        <DataGrid
          title="Actors Grid"
          rows={filteredActorRows}
          columns={actorColumns}
          showFilter
          showActions
          showAdd
          selectedRowId={selectedActor?.id}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          hasPreviousPage={actorsHasPreviousPage}
          hasNextPage={actorsHasNextPage}
          onPageChange={handlePageChange}
          onUpdate={handleUpdateActor}
          onDelete={handleDeleteActor}
          onSelectedRow={handleSelectActor}
          onFilter={handleFilterActors}
          onAdd={handleCreateActor}
          filterDebounceMs={1000}
          filterPlaceholder="Filter actors..."
          emptyMessage="No actors available."
        />

        {selectedActor && (
          <div className="flex flex-col gap-6">
            <DataGrid
              title={`Movies with "${selectedActor.name}"`}
              rows={filteredMovies}
              columns={movieColumns}
              showFilter
              showActions={false}
              selectedRowId={selectedMovie?.id}
              page={relatedMoviesPage}
              pageSize={relatedDataPageSize}
              totalPages={relatedMoviesTotalPages}
              hasPreviousPage={relatedMoviesHasPreviousPage}
              hasNextPage={relatedMoviesHasNextPage}
              onPageChange={handleMoviePageChange}
              onSelectedRow={handleSelectMovie}
              onFilter={handleFilterMovies}
              filterDebounceMs={1000}
              filterPlaceholder="Filter movies..."
              emptyMessage="No movies available for this actor."
            />

            {selectedMovie && (
              <DataGrid
                title={`Ratings for "${selectedMovie.title}"`}
                rows={filteredRatings}
                columns={ratingColumns}
                showFilter
                showActions={false}
                showAdd
                page={movieRatingsPage}
                pageSize={relatedDataPageSize}
                totalPages={ratingsTotalPages}
                hasPreviousPage={ratingsHasPreviousPage}
                hasNextPage={ratingsHasNextPage}
                onPageChange={handleRatingPageChange}
                onFilter={handleFilterRatings}
                onAdd={handleAddRating}
                filterDebounceMs={1000}
                filterPlaceholder="Filter ratings..."
                emptyMessage="No ratings available for this movie."
              />
            )}
          </div>
        )}
        <AddRatingModal
          key={`${selectedMovie?.id ?? "none"}-${isRatingModalOpen ? "open" : "closed"}`}
          isOpen={isRatingModalOpen}
          movieTitle={selectedMovie?.title}
          onSave={handleSaveRating}
          onCancel={handleCancelRating}
        />

        <ActorFormModal
          key={`${actorFormMode}-${editingActor?.id || "new"}`}
          isOpen={isActorFormOpen}
          mode={actorFormMode}
          initialData={
            editingActor
              ? {
                  name: editingActor.name,
                  nationality: editingActor.nationality,
                  movieIds: editingActorMovieIds,
                }
              : undefined
          }
          availableMovies={availableMovies}
          onSave={handleSaveActor}
          onCancel={() => setIsActorFormOpen(false)}
        />

        <ConfirmDeleteModal
          isOpen={isDeleteModalOpen}
          title="Delete Actor"
          message={`Are you sure you want to delete "${deletingActor?.name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      </main>
    </div>
  );
}
