"use client";

import { useRouter } from "next/navigation";

interface Item {
  id: number;
  type: string;
  order: number;

  episode?: {
    title: string;
    episodeNo: number;
    series?: {
      title: string;
    };
  } | null;

  movie?: {
    title: string;
  } | null;

  advertisement?: {
    title: string;
  } | null;

  stream?: {
    name: string;
  } | null;
}

interface Props {
  items: Item[];
  programId: number;
  playlistId: number;
}

export default function PlaylistItemList({
  items,
  programId,
  playlistId,
}: Props) {
  const router = useRouter();

  async function handleDelete(id: number) {
    if (!confirm("Delete this playlist item?")) {
      return;
    }

    const res = await fetch(
      `/api/programs/${programId}/playlists/${playlistId}/items/${id}`,
      {
        method: "DELETE",
      },
    );

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-6 overflow-hidden rounded-lg border border-gray-700">
      <table className="w-full text-left text-sm text-white">
        <thead className="bg-gray-800">
          <tr>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>

        <tbody>
          {items
            .sort((a, b) => a.order - b.order)
            .map((item) => (
              <tr
                key={item.id}
                className="border-t border-gray-700 hover:bg-gray-800"
              >
                <td className="px-4 py-3">{item.order}</td>

                <td className="px-4 py-3 uppercase">{item.type}</td>
                <td className="px-4 py-3">
                  {item.episode
                    ? item.episode.series?.title
                    : item.movie
                      ? item.movie.title
                      : item.advertisement
                        ? item.advertisement.title
                        : item.stream
                          ? item.stream.name
                          : "Unknown"}
                </td>

                <td className="px-4 py-3">
                  {item.episode ? (
                    <>{item.episode.title}</>
                  ) : item.movie ? (
                    item.movie.title
                  ) : item.advertisement ? (
                    item.advertisement.title
                  ) : item.stream ? (
                    item.stream.name
                  ) : (
                    "Unknown"
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}
