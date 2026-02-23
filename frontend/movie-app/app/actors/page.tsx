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

const actorRows: ActorRow[] = [
  { id: 1, name: "Leonardo DiCaprio", nationality: "USA", age: 51 },
  { id: 2, name: "Scarlett Johansson", nationality: "USA", age: 42 },
  { id: 3, name: "Song Kang-ho", nationality: "South Korea", age: 59 },
  { id: 4, name: "Natalie Portman", nationality: "Israel", age: 45 },
  { id: 5, name: "Cillian Murphy", nationality: "Ireland", age: 50 },
  { id: 6, name: "Ana de Armas", nationality: "Cuba", age: 38 },
];

const actorColumns: DataGridColumn<ActorRow>[] = [
  { key: "name", header: "Name" },
  { key: "nationality", header: "Nationality" },
  { key: "age", header: "Age" },
];

export default function ActorsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const pageSize = 4;

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
    pushRouteState(nextPage, filter);
  };

  const handleFilterActors = (value: string) => {
    setFilter(value);
    setPage(1);
    pushRouteState(1, value);
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,187,0.55),_rgba(247,241,233,0.1)_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(60,57,48,0.8),_rgba(18,17,15,0.2)_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(170,179,166,0.25),_rgba(247,241,233,0.05)_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(79,85,74,0.35),_rgba(18,17,15,0.15)_60%)]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-12 sm:px-10 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
          >
            Voltar
          </button>
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
          page={page}
          pageSize={pageSize}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onUpdate={handleUpdateActor}
          onDelete={handleDeleteActor}
          onFilter={handleFilterActors}
          filterDebounceMs={1000}
          filterPlaceholder="Filter actors..."
          emptyMessage="No actors available."
        />
      </main>
    </div>
  );
}
