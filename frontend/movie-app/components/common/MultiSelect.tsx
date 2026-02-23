"use client";

import { useState, useEffect, useRef } from "react";

export interface MultiSelectOption {
  id: number;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  selectedIds: number[];
  onChange: (selectedIds: number[]) => void;
  placeholder?: string;
  label: string;
  loading?: boolean;
}

export default function MultiSelect({
  options,
  selectedIds,
  onChange,
  placeholder = "Search and select...",
  label,
  loading = false,
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectedOptions = options.filter((opt) => selectedIds.includes(opt.id));

  const toggleOption = (id: number) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const removeOption = (id: number) => {
    onChange(selectedIds.filter((selectedId) => selectedId !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-2 block text-sm font-semibold text-stone-700 dark:text-stone-300">
        {label}
      </label>

      {/* Selected items */}
      {selectedOptions.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedOptions.map((option) => (
            <span
              key={option.id}
              className="inline-flex items-center gap-1 rounded-xl bg-stone-200 px-3 py-1 text-sm font-medium text-stone-700 dark:bg-stone-700 dark:text-stone-200"
            >
              {option.label}
              <button
                type="button"
                onClick={() => removeOption(option.id)}
                className="ml-1 hover:text-red-600 dark:hover:text-red-400"
                aria-label={`Remove ${option.label}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Input/Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-2 text-left transition hover:border-stone-400 focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-800 dark:hover:border-stone-500"
        >
          <span className="text-stone-500 dark:text-stone-400">
            {placeholder}
          </span>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full rounded-2xl border border-stone-300 bg-white shadow-lg dark:border-stone-600 dark:bg-stone-800">
          <div className="p-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter..."
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm focus:border-stone-500 focus:outline-none dark:border-stone-600 dark:bg-stone-700"
              autoFocus
            />
          </div>

          <div className="max-h-[450px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-3 text-center text-sm text-stone-500 dark:text-stone-400">
                Loading...
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-stone-500 dark:text-stone-400">
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selectedIds.includes(option.id);
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => toggleOption(option.id)}
                    className={`w-full px-4 py-2 text-left text-sm transition hover:bg-stone-100 dark:hover:bg-stone-700 ${
                      isSelected
                        ? "bg-stone-100 font-semibold text-stone-900 dark:bg-stone-700 dark:text-stone-100"
                        : "text-stone-700 dark:text-stone-300"
                    }`}
                  >
                    <span className="mr-2">
                      {isSelected ? "✓" : "\u00A0\u00A0"}
                    </span>
                    {option.label}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
