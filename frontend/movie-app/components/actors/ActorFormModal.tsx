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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm p-4">
      <div className="h-[50vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#f7f1e9] p-8 shadow-xl dark:bg-[#1a1916]">
        <h2 className="mb-6 font-display text-3xl font-bold text-stone-900 dark:text-stone-100">
          {mode === "create" ? "Create New Actor" : "Edit Actor"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.name
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
            <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
              Nationality *
            </label>
            <input
              type="text"
              value={formData.nationality}
              onChange={(e) => handleChange("nationality", e.target.value)}
              className={`w-full rounded-2xl border px-4 py-2 transition focus:outline-none ${
                errors.nationality
                  ? "border-red-500"
                  : "border-stone-300 focus:border-stone-500 dark:border-stone-600"
              } bg-white dark:bg-stone-800`}
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
