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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
      <div className="h-[50vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#f7f1e9] p-8 shadow-xl dark:bg-[#1a1916]">
        <h2 className="mb-6 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          {mode === "create" ? "Create New Movie" : "Edit Movie"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.title
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={4}
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.description
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Release Year *
            </label>
            <input
              type="number"
              value={formData.releaseYear}
              onChange={(e) =>
                handleChange("releaseYear", parseInt(e.target.value, 10) || 0)
              }
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.releaseYear
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Genre *
            </label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => handleChange("genre", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.genre
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 rounded-2xl border border-stone-300 bg-transparent px-4 py-2 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 rounded-2xl bg-stone-900 px-4 py-2 font-semibold text-white transition hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-stone-200"
            >
              {mode === "create" ? "Create" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
