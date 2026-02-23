"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/auth";
import { DataGrid, type DataGridColumn } from "@/components/grid";

interface ActorRow {
  id: number;
  name: string;
  nationality: string;
  age: number;
}

interface MovieRow {
  id: number;
  title: string;
  genre: string;
  year: number;
}

interface RatingRow {
  id: number;
  rating: number;
  reviewer: string;
  comment: string;
}

// Mock data for actors
const actorRows: ActorRow[] = [
  { id: 1, name: "Leonardo DiCaprio", nationality: "USA", age: 51 },
  { id: 2, name: "Scarlett Johansson", nationality: "USA", age: 42 },
  { id: 3, name: "Song Kang-ho", nationality: "South Korea", age: 59 },
  { id: 4, name: "Natalie Portman", nationality: "Israel", age: 45 },
  { id: 5, name: "Cillian Murphy", nationality: "Ireland", age: 50 },
  { id: 6, name: "Ana de Armas", nationality: "Cuba", age: 38 },
];

// Mock data for movies by actor
const actorMovies: Record<number, MovieRow[]> = {
  1: [
    { id: 1, title: "Inception", genre: "Sci-Fi", year: 2010 },
    { id: 2, title: "The Dark Knight", genre: "Action", year: 2008 },
    { id: 3, title: "Interstellar", genre: "Sci-Fi", year: 2014 },
  ],
  2: [
    { id: 6, title: "Arrival", genre: "Sci-Fi", year: 2016 },
    { id: 2, title: "The Dark Knight", genre: "Action", year: 2008 },
  ],
  3: [
    { id: 4, title: "Parasite", genre: "Drama", year: 2019 },
    { id: 3, title: "Interstellar", genre: "Sci-Fi", year: 2014 },
  ],
  4: [
    { id: 2, title: "The Dark Knight", genre: "Action", year: 2008 },
    { id: 4, title: "Parasite", genre: "Drama", year: 2019 },
  ],
  5: [
    { id: 1, title: "Inception", genre: "Sci-Fi", year: 2010 },
    { id: 5, title: "Whiplash", genre: "Drama", year: 2014 },
    { id: 3, title: "Interstellar", genre: "Sci-Fi", year: 2014 },
  ],
  6: [{ id: 2, title: "The Dark Knight", genre: "Action", year: 2008 }],
};

// Mock data for ratings by movie
const movieRatings: Record<number, RatingRow[]> = {
  1: [
    {
      id: 1,
      rating: 9,
      reviewer: "John Doe",
      comment: "Mind-bending masterpiece",
    },
    {
      id: 2,
      rating: 8,
      reviewer: "Jane Smith",
      comment: "Great visual effects",
    },
    { id: 3, rating: 9, reviewer: "Bob Johnson", comment: "Excellent plot" },
    {
      id: 4,
      rating: 8,
      reviewer: "Alice Brown",
      comment: "Confusing but great",
    },
    { id: 5, rating: 7, reviewer: "Charlie Davis", comment: "Good movie" },
  ],
  2: [
    { id: 6, rating: 9, reviewer: "David Lee", comment: "Best Batman movie" },
    {
      id: 7,
      rating: 9,
      reviewer: "Eve Wilson",
      comment: "Joker performance is insane",
    },
    { id: 8, rating: 8, reviewer: "Frank Miller", comment: "Dark and gritty" },
  ],
  3: [
    {
      id: 9,
      rating: 8,
      reviewer: "Grace Taylor",
      comment: "Epic space adventure",
    },
    {
      id: 10,
      rating: 9,
      reviewer: "Henry White",
      comment: "Beautiful cinematography",
    },
  ],
  4: [
    {
      id: 11,
      rating: 8,
      reviewer: "Ivy King",
      comment: "Sharp social commentary",
    },
  ],
  5: [
    {
      id: 12,
      rating: 9,
      reviewer: "Jack Thomas",
      comment: "Intense and brilliant",
    },
  ],
  6: [
    {
      id: 13,
      rating: 7,
      reviewer: "Karen Harris",
      comment: "Thought-provoking",
    },
    {
      id: 14,
      rating: 8,
      reviewer: "Leo Martin",
      comment: "Interesting concept",
    },
  ],
};

const actorColumns: DataGridColumn<ActorRow>[] = [
  { key: "name", header: "Name" },
  { key: "nationality", header: "Nationality" },
  { key: "age", header: "Age" },
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
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [selectedActor, setSelectedActor] = useState<ActorRow | null>(null);
  const [relatedMoviesPage, setRelatedMoviesPage] = useState(1);
  const [moviesFilter, setMoviesFilter] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<MovieRow | null>(null);
  const [movieRatingsPage, setMovieRatingsPage] = useState(1);
  const [ratingsFilter, setRatingsFilter] = useState("");
  const pageSize = 4;
  const relatedDataPageSize = 5;

  const filteredActorRows = actorRows.filter((actor) => {
    const query = filter.toLowerCase();
    if (!query) {
      return true;
    }

    return (
      actor.name.toLowerCase().includes(query) ||
      actor.nationality.toLowerCase().includes(query) ||
      String(actor.age).includes(query)
    );
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredActorRows.length / pageSize),
  );

  const relatedMovies = selectedActor
    ? actorMovies[selectedActor.id] || []
    : [];

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

  const relatedMoviesTotalPages = Math.max(
    1,
    Math.ceil(filteredMovies.length / relatedDataPageSize),
  );

  const ratings = selectedMovie ? movieRatings[selectedMovie.id] || [] : [];

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

  const ratingsTotalPages = Math.max(
    1,
    Math.ceil(filteredRatings.length / relatedDataPageSize),
  );

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

  const handleUpdateActor = (actor: ActorRow) => {
    router.push(`/actors/${actor.id}/update`);
  };

  const handleDeleteActor = (actor: ActorRow) => {
    router.push(`/actors/${actor.id}/delete`);
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    setSelectedActor(null);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setMoviesFilter("");
    setRatingsFilter("");
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
    pushRouteState(1, value);
  };

  const handleSelectActor = (actor: ActorRow) => {
    setSelectedActor(actor);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setMoviesFilter("");
    setRatingsFilter("");
  };

  const handleSelectMovie = (movie: MovieRow) => {
    setSelectedMovie(movie);
    setMovieRatingsPage(1);
    setRatingsFilter("");
  };

  const handleMoviePageChange = (nextPage: number) => {
    setRelatedMoviesPage(nextPage);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setRatingsFilter("");
  };

  const handleFilterMovies = (value: string) => {
    setMoviesFilter(value);
    setRelatedMoviesPage(1);
    setSelectedMovie(null);
    setMovieRatingsPage(1);
    setRatingsFilter("");
  };

  const handleRatingPageChange = (nextPage: number) => {
    setMovieRatingsPage(nextPage);
  };

  const handleFilterRatings = (value: string) => {
    setRatingsFilter(value);
    setMovieRatingsPage(1);
  };

  const handleAddRating = () => {
    if (selectedMovie) {
      router.push(`/movies/${selectedMovie.id}/ratings/create`);
    }
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
          selectedRowId={selectedActor?.id}
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onUpdate={handleUpdateActor}
          onDelete={handleDeleteActor}
          onSelectedRow={handleSelectActor}
          onFilter={handleFilterActors}
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
      </main>
    </div>
  );
}
