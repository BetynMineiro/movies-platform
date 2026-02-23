import Link from "next/link";

export function Home() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 px-6 py-10 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:px-10 sm:py-14">
      <div className="flex flex-col gap-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
          Movies platform
        </p>
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-semibold leading-tight text-stone-900 dark:text-stone-100 sm:text-4xl lg:text-5xl">
            Navigate movies, actors, and ratings in one place.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-stone-600 dark:text-stone-300 sm:text-lg">
            Single-page experience built for quick evaluation. Log in, browse
            the catalog, and explore relationships without leaving the screen.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="http://localhost:3000/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
          >
            Open Swagger
          </Link>
          <Link
            href="http://localhost:3000/health"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2 text-sm font-semibold text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
          >
            Health Check
          </Link>
        </div>
      </div>
    </section>
  );
}
