"use client";

import { useRouter } from "next/navigation";

export default function MoviesPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,187,0.55),_rgba(247,241,233,0.1)_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(60,57,48,0.8),_rgba(18,17,15,0.2)_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(170,179,166,0.25),_rgba(247,241,233,0.05)_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(79,85,74,0.35),_rgba(18,17,15,0.15)_60%)]" />
      <main className="relative mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-12 sm:px-10 lg:px-12">
        <button
          type="button"
          onClick={handleBack}
          className="w-fit rounded-full border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
        >
          Voltar
        </button>
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
      </main>
    </div>
  );
}
