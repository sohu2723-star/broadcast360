"use client";

interface Props {
  page: number;

  totalPages: number;

  onChange: (page: number) => void;
}

export default function Pagination({
  page,

  totalPages,

  onChange,
}: Props) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = Array.from(
    {
      length: totalPages,
    },
    (_, i) => i + 1,
  );

  return (
    <div className="mt-10 flex flex-wrap justify-center gap-2">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="
          rounded
          bg-zinc-800
          px-4
          py-2
          text-white
          disabled:opacity-40
        "
      >
        Previous
      </button>

      {pages.map((item) => (
        <button
          key={item}
          onClick={() => onChange(item)}
          className={`
              rounded
              px-4
              py-2
              text-white
              ${page === item ? "bg-blue-600" : "bg-zinc-800"}
            `}
        >
          {item}
        </button>
      ))}

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="
          rounded
          bg-zinc-800
          px-4
          py-2
          text-white
          disabled:opacity-40
        "
      >
        Next
      </button>
    </div>
  );
}
