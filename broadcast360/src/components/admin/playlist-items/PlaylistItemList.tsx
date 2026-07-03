"use client";

import { useRouter } from "next/navigation";

interface Item {
  id: number;
  type: string;
  order: number;
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
      }
    );

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    router.refresh();
  }

  return (
    <div className="space-y-2 mt-4">
      {items
        .sort((a, b) => a.order - b.order)
        .map((item) => (
          <div
            key={item.id}
            className="border p-2 rounded flex justify-between items-center"
          >
            <div>
              {item.type} - Order: {item.order}
            </div>

            <button
              onClick={() => handleDelete(item.id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
    </div>
  );
}