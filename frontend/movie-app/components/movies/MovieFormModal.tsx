"use client";

import { useState } from "react";
import MultiSelect, { type MultiSelectOption } from "../common/MultiSelect";

export interface MovieFormData {
  title: string;
  description: string;
  releaseYear: number;
  genre: string;
  actorIds: number[];
}

interface MovieFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Partial<MovieFormData>;
  availableActors: MultiSelectOption[];
  loadingActors?: boolean;
  onSave: (data: MovieFormData) => void;
  onCancel: () => void;
}

export default function MovieFormModal({
  isOpen,
  mode,
  initialData,
  availableActors,
  loadingActors = false,
  onSave,
  onCancel,
}: MovieFormModalProps) {
  const [formData, setFormData] = useState<MovieFormData>({
    title: initialData?.title || "",
    description: initialData?.description || "",
    releaseYear: initialData?.releaseYear || new Date().getFullYear(),
    genre: initialData?.genre || "",
    actorIds: initialData?.actorIds || [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MovieFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof MovieFormData, string>> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim() || formData.description.length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    if (formData.releaseYear < 1800 || formData.releaseYear > 2100) {
      newErrors.releaseYear = "Release year must be between 1800 and 2100";
    }

    if (!formData.genre.trim()) {
      newErrors.genre = "Genre is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  const handleChange = (
    field: keyof MovieFormData,
    value: string | number | number[],
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onCancel}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-700 dark:bg-stone-950">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
            Movie
          </p>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          {mode === "create" ? "Create New Movie" : "Edit Movie"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.title
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter movie title"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.title}
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.description
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter movie description (min. 10 characters)"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>

          {/* Release Year */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Release Year *
            </label>
            <input
              type="number"
              value={formData.releaseYear}
              onChange={(e) =>
                handleChange("releaseYear", parseInt(e.target.value, 10) || 0)
              }
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.releaseYear
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter release year"
            />
            {errors.releaseYear && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.releaseYear}
              </p>
            )}
          </div>

          {/* Genre */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Genre *
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => handleChange("genre", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.genre
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter genre"
            />
            {errors.genre && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.genre}
              </p>
            )}
          </div>

          {/* Actors MultiSelect */}
          <MultiSelect
            label="Actors"
            options={availableActors}
            selectedIds={formData.actorIds}
            onChange={(ids) => handleChange("actorIds", ids)}
            placeholder="Search and select actors..."
            loading={loadingActors}
          />

          {/* Actions */}
          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-700 transition hover:border-green-400 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300 dark:hover:border-green-600 dark:hover:bg-green-900/40"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
