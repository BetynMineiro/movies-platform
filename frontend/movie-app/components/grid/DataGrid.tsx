"use client";

import { useEffect, useRef, useState } from "react";

export interface DataGridColumn<T> {
  key: keyof T;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface DataGridProps<T extends { id: number | string }> {
  title: string;
  rows: T[];
  columns: DataGridColumn<T>[];
  showFilter?: boolean;
  showActions?: boolean;
  showAdd?: boolean;
  selectedRowId?: number | string | null;
  page: number;
  pageSize: number;
  totalPages?: number;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPageChange: (page: number) => void;
  onUpdate?: (row: T) => void;
  onDelete?: (row: T) => void;
  onSelectedRow?: (row: T) => void;
  onFilter?: (value: string) => void;
  onAdd?: () => void;
  filterDebounceMs?: number;
  filterPlaceholder?: string;
  initialFilterValue?: string;
  emptyMessage?: string;
  tableMinWidthClass?: string;
}

export default function DataGrid<T extends { id: number | string }>({
  title,
  rows,
  columns,
  showFilter = true,
  showActions = true,
  showAdd = false,
  selectedRowId,
  page,
  pageSize,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
  onUpdate,
  onDelete,
  onSelectedRow,
  onFilter,
  onAdd,
  filterDebounceMs = 400,
  filterPlaceholder = "Type to filter...",
  initialFilterValue = "",
  emptyMessage = "No records found.",
  tableMinWidthClass = "min-w-[620px]",
}: DataGridProps<T>) {
  const [filterValue, setFilterValue] = useState(initialFilterValue);
  const [internalSelectedRowId, setInternalSelectedRowId] = useState<
    number | string | null | undefined
  >(selectedRowId);
  const hasUserTypedRef = useRef(false);
  const onFilterRef = useRef(onFilter);

  useEffect(() => {
    if (selectedRowId === undefined) {
      return;
    }

    setInternalSelectedRowId(selectedRowId);
  }, [selectedRowId]);

  useEffect(() => {
    onFilterRef.current = onFilter;
  }, [onFilter]);

  useEffect(() => {
    if (!showFilter || !onFilterRef.current || !hasUserTypedRef.current) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setInternalSelectedRowId(undefined);
      onFilterRef.current?.(filterValue.trim());
    }, filterDebounceMs);

    return () => clearTimeout(timeoutId);
  }, [filterDebounceMs, filterValue, showFilter]);

  const computedTotalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = totalPages
    ? Math.min(Math.max(page, 1), Math.max(totalPages, 1))
    : Math.max(page, 1);
  const resolvedTotalPages = totalPages ?? computedTotalPages;
  const start = (safePage - 1) * pageSize;
  const end = start + pageSize;
  const paginatedRows = rows.slice(start, end);

  const canGoPrevious = hasPreviousPage ?? safePage > 1;
  const canGoNext = hasNextPage ?? safePage < resolvedTotalPages;
  const previousPage = Math.max(safePage - 1, 1);
  const nextPage = totalPages
    ? Math.min(safePage + 1, Math.max(totalPages, 1))
    : safePage + 1;

  const selectedId =
    selectedRowId !== undefined ? selectedRowId : internalSelectedRowId;

  const handleSelectRow = (row: T) => {
    setInternalSelectedRowId(row.id);
    onSelectedRow?.(row);
  };

  const handlePageNavigation = (targetPage: number) => {
    setInternalSelectedRowId(undefined);
    onPageChange(targetPage);
  };

  const handleAdd = () => {
    setInternalSelectedRowId(undefined);
    onAdd?.();
  };

  return (
    <section className="rounded-3xl border border-black/10 bg-white/80 px-6 py-6 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 sm:px-8">
      <div className="border-b border-stone-200 pb-4 dark:border-stone-700">
        <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
          {title}
        </h2>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        {showFilter ? (
          <input
            type="search"
            value={filterValue}
            onChange={(event) => {
              hasUserTypedRef.current = true;
              setFilterValue(event.target.value);
            }}
            placeholder={filterPlaceholder}
            className="flex-1 rounded-full border border-stone-300 bg-white px-4 py-2 text-sm text-stone-700 outline-none transition focus:border-stone-400 dark:border-stone-600 dark:bg-stone-900/40 dark:text-stone-200 dark:focus:border-stone-400\"
          />
        ) : null}
        {showAdd ? (
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-full border border-green-300 bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 transition hover:border-green-400 hover:bg-green-100 dark:border-green-700 dark:bg-green-900/20 dark:text-green-300 dark:hover:border-green-600 dark:hover:bg-green-900/40"
          >
            + Add
          </button>
        ) : null}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table
          className={`w-full ${tableMinWidthClass} border-collapse text-left text-sm`}
        >
          <thead>
            <tr className="border-b border-stone-200 dark:border-stone-700">
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className="px-3 py-3 font-semibold text-stone-700 dark:text-stone-200"
                >
                  {column.header}
                </th>
              ))}
              {showActions ? (
                <th className="px-3 py-3 text-right font-semibold text-stone-700 dark:text-stone-200">
                  Actions
                </th>
              ) : null}
            </tr>
          </thead>

          <tbody>
            {paginatedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showActions ? 1 : 0)}
                  className="px-3 py-8 text-center text-sm text-stone-500 dark:text-stone-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedRows.map((row) => (
                <tr
                  key={String(row.id)}
                  onClick={() => handleSelectRow(row)}
                  className={`border-b border-stone-100 transition dark:border-stone-800 ${
                    selectedId === row.id
                      ? "bg-stone-200/60 dark:bg-stone-700/40"
                      : "hover:bg-stone-50 dark:hover:bg-stone-900/40"
                  }`}
                >
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="px-3 py-3 text-stone-700 dark:text-stone-300"
                    >
                      {column.render
                        ? column.render(row)
                        : String(row[column.key] ?? "-")}
                    </td>
                  ))}
                  {showActions ? (
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectedRow?.(row);
                            onUpdate?.(row);
                            setInternalSelectedRowId(undefined);
                          }}
                          className="rounded-full border border-stone-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition hover:border-stone-400 dark:border-stone-600 dark:text-stone-200 dark:hover:border-stone-400"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onSelectedRow?.(row);
                            onDelete?.(row);
                            setInternalSelectedRowId(undefined);
                          }}
                          className="rounded-full border border-red-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-red-700 transition hover:border-red-400 dark:border-red-700 dark:text-red-300 dark:hover:border-red-500"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="relative mt-6 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500 dark:text-stone-400">
          {rows.length} item(s)
        </p>
        <p className="absolute left-1/2 transform -translate-x-1/2 text-sm text-stone-500 dark:text-stone-400">
          Page {safePage} of {resolvedTotalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handlePageNavigation(previousPage)}
            disabled={!canGoPrevious}
            className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:text-stone-200 dark:enabled:hover:border-stone-400"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() => handlePageNavigation(nextPage)}
            disabled={!canGoNext}
            className="rounded-full border border-stone-300 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-700 transition enabled:hover:border-stone-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:text-stone-200 dark:enabled:hover:border-stone-400"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
