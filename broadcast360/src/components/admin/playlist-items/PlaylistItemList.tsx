"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminConfirmDialog from "@/components/admin/ui/AdminConfirmDialog";

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
  const [deleteTarget, setDeleteTarget] = useState<Item | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  async function handleDelete() {
    if (!deleteTarget) return;

    setDeleteLoading(true);
    setActionMessage("");
    const res = await fetch(
      `/api/programs/${programId}/playlists/${playlistId}/items/${deleteTarget.id}`,
      { method: "DELETE" },
    );

    if (!res.ok) {
      setActionMessage("Delete failed");
      setDeleteLoading(false);
      return;
    }

    setDeleteTarget(null);
    setDeleteLoading(false);
    router.refresh();
  }

  return (
    <>
      {actionMessage && (
        <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {actionMessage}
        </div>
      )}
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
                    type="button"
                    onClick={() => setDeleteTarget(item)}
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

      <AdminConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete playlist item?"
        description="This playlist item will be permanently removed from the playlist."
        confirmLabel="Delete item"
        destructive
        loading={deleteLoading}
        onCancel={() => {
          if (!deleteLoading) setDeleteTarget(null);
        }}
        onConfirm={handleDelete}
      />
    </>
  );
}
