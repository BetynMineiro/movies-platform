"use client";

import { useState } from "react";

interface AddRatingModalProps {
  isOpen: boolean;
  movieTitle?: string;
  onSave: (data: { reviewer: string; comment: string; rating: number }) => void;
  onCancel: () => void;
}

export default function AddRatingModal({
  isOpen,
  movieTitle,
  onSave,
  onCancel,
}: AddRatingModalProps) {
  const [reviewer, setReviewer] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState("");

  if (!isOpen) {
    return null;
  }

  const parsedRating = Number(rating);
  const hasValidRating =
    !Number.isNaN(parsedRating) && parsedRating >= 0 && parsedRating <= 10;
  const canSave =
    reviewer.trim().length > 0 &&
    comment.trim().length > 0 &&
    rating.trim().length > 0 &&
    hasValidRating;

  const handleSave = () => {
    if (!canSave) {
      return;
    }

    onSave({
      reviewer: reviewer.trim(),
      comment: comment.trim(),
      rating: parsedRating,
    });
    setReviewer("");
    setComment("");
    setRating("");
  };

  const handleCancel = () => {
    setReviewer("");
    setComment("");
    setRating("");
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 shadow-xl dark:border-stone-700 dark:bg-stone-950">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
            Rating
          </p>
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100">
            Add rating{movieTitle ? ` for "${movieTitle}"` : ""}
          </h2>
        </div>

        <div className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
            Nome
            <input
              type="text"
              value={reviewer}
              onChange={(event) => setReviewer(event.target.value)}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-200 dark:focus:border-stone-500"
              placeholder="Nome do avaliador"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
            Comentario
            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              className="min-h-[100px] resize-none rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-200 dark:focus:border-stone-500"
              placeholder="Descricao do rating"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold text-stone-700 dark:text-stone-200">
            Nota
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={rating}
              onChange={(event) => {
                const nextValue = event.target.value;
                if (nextValue === "") {
                  setRating("");
                  return;
                }

                if (!/^[0-9]+$/.test(nextValue)) {
                  return;
                }

                const numericValue = Number(nextValue);
                if (numericValue < 0 || numericValue > 10) {
                  setRating("");
                  return;
                }

                setRating(nextValue);
              }}
              className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-200 dark:focus:border-stone-500"
              placeholder="0-10"
            />
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="rounded-full border border-green-300 bg-green-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-green-700 transition enabled:hover:border-green-400 enabled:hover:bg-green-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300 dark:enabled:hover:border-green-600 dark:enabled:hover:bg-green-900/40"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
