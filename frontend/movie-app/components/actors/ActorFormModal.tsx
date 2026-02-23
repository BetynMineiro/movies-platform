"use client";

import { useState } from "react";
import MultiSelect, { type MultiSelectOption } from "../common/MultiSelect";

export interface ActorFormData {
  name: string;
  nationality: string;
  movieIds: number[];
}

interface ActorFormModalProps {
  isOpen: boolean;
  mode: "create" | "edit";
  initialData?: Partial<ActorFormData>;
  availableMovies: MultiSelectOption[];
  loadingMovies?: boolean;
  onSave: (data: ActorFormData) => void;
  onCancel: () => void;
}

export default function ActorFormModal({
  isOpen,
  mode,
  initialData,
  availableMovies,
  loadingMovies = false,
  onSave,
  onCancel,
}: ActorFormModalProps) {
  const [formData, setFormData] = useState<ActorFormData>({
    name: initialData?.name || "",
    nationality: initialData?.nationality || "",
    movieIds: initialData?.movieIds || [],
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof ActorFormData, string>>
  >({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ActorFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.nationality.trim() || formData.nationality.length < 2) {
      newErrors.nationality = "Nationality must be at least 2 characters";
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
    field: keyof ActorFormData,
    value: string | number[],
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
            Actor
          </p>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
          {mode === "create" ? "Create New Actor" : "Edit Actor"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.name
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter actor name"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.name}
              </p>
            )}
          </div>

          {/* Nationality */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-200">
              Nationality *
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 text-sm text-stone-700 outline-none transition dark:text-stone-200 ${
                errors.nationality
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-400 dark:border-stone-700 dark:focus:border-stone-500"
              } bg-white dark:bg-stone-900/40`}
              placeholder="Enter nationality"
            />
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.nationality}
              </p>
            )}
          </div>

          {/* Movies MultiSelect */}
          <MultiSelect
            label="Movies"
            options={availableMovies}
            selectedIds={formData.movieIds}
            onChange={(ids) => handleChange("movieIds", ids)}
            placeholder="Search and select movies..."
            loading={loadingMovies}
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
