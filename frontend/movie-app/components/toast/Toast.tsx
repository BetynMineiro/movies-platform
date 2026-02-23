"use client";

import { useEffect } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  duration = 3000,
  onClose,
}: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColor = {
    success:
      "bg-green-50 border-green-300 dark:bg-green-900/20 dark:border-green-700",
    error: "bg-red-50 border-red-300 dark:bg-red-900/20 dark:border-red-700",
    info: "bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700",
  };

  const textColor = {
    success: "text-green-800 dark:text-green-200",
    error: "text-red-800 dark:text-red-200",
    info: "text-blue-800 dark:text-blue-200",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg backdrop-blur transition-all ${bgColor[type]}`}
      role="alert"
    >
      <p className={`text-sm font-semibold ${textColor[type]}`}>{message}</p>
      <button
        type="button"
        onClick={onClose}
        className={`text-sm font-bold transition hover:opacity-70 ${textColor[type]}`}
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
