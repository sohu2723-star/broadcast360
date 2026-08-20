"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (page: number | ((prev: number) => number)) => void;
  loading?: boolean;
}

export default function Pagination({
  page,
  totalPages,
  setPage,
  loading = false,
}: PaginationProps) {
  if (loading || totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    //Total is 5 page if low than 5 show all
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    pages.push(1);

    const startPage = Math.max(2, page - 1);
    const endPage = Math.min(totalPages - 1, page + 1);

    if (startPage > 2) {
      pages.push("...");
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-6 flex items-center justify-between rounded-xl border border-white/10 bg-[#0B1026] px-5 py-4">
      <div className="text-sm text-gray-400">
        Page <span className="font-semibold text-white">{page}</span> of{" "}
        <span className="font-semibold text-white">{totalPages}</span>
      </div>

      <div className="flex items-center gap-2">
        {/* PREV BUTTON */}
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5"
        >
          Prev
        </button>

        {/* PAGE NUMBER & ELLIPSIS BUTTONS */}
        {getPageNumbers().map((item, index) => {
          if (item === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="flex h-10 w-10 items-center justify-center text-sm font-semibold text-gray-500 select-none"
              >
                ...
              </span>
            );
          }

          return (
            <button
              key={item}
              onClick={() => setPage(Number(item))}
              className={`h-10 w-10 rounded-lg text-sm transition ${
                page === item
                  ? "bg-[#4f6689] font-semibold text-white shadow-md shadow-blue-500/20"
                  : "bg-white/5 text-gray-300 hover:bg-white/10"
              }`}
            >
              {item}
            </button>
          );
        })}

        {/* NEXT BUTTON */}
        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5"
        >
          Next
        </button>
      </div>
    </div>
  );
}
