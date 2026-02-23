"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/services/auth.service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await login(email, password);
      router.replace("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(245,214,187,0.55),_rgba(247,241,233,0.1)_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(60,57,48,0.8),_rgba(18,17,15,0.2)_55%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,_rgba(170,179,166,0.25),_rgba(247,241,233,0.05)_60%)] dark:bg-[radial-gradient(circle_at_center,_rgba(79,85,74,0.35),_rgba(18,17,15,0.15)_60%)]" />
      <main className="relative mx-auto flex min-h-[calc(100vh-128px)] w-full max-w-6xl items-center justify-center px-5 py-12 sm:px-10 lg:px-12">
        <section className="w-full max-w-xl rounded-3xl border border-black/10 bg-white/80 px-6 py-10 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:px-10">
          <div className="flex flex-col gap-4">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-500 dark:text-stone-400">
              Movies platform
            </p>
            <h1 className="text-3xl font-semibold text-stone-900 dark:text-stone-100 sm:text-4xl">
              Login
            </h1>
            <p className="text-base text-stone-600 dark:text-stone-300">
              Use your credentials to access the catalog.
            </p>
          </div>
          <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-stone-400 dark:border-stone-700 dark:bg-white/5 dark:text-stone-100 dark:focus:border-stone-400"
                placeholder="admin@example.com"
                required
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="rounded-2xl border border-stone-200 bg-white/80 px-4 py-3 text-sm text-stone-800 shadow-sm outline-none transition focus:border-stone-400 dark:border-stone-700 dark:bg-white/5 dark:text-stone-100 dark:focus:border-stone-400"
                placeholder="Admin@123"
                required
              />
            </label>
            {error ? (
              <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
