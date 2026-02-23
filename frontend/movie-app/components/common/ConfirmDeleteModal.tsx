"use client";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDeleteModal({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
}: ConfirmDeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-[#f7f1e9] p-6 shadow-xl dark:bg-[#1a1916]">
        <h2 className="mb-4 font-display text-2xl font-bold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
        <p className="mb-6 text-stone-700 dark:text-stone-300">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-2xl border border-stone-300 bg-transparent px-4 py-2 font-semibold text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-2xl bg-red-600 px-4 py-2 font-semibold text-white transition hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
