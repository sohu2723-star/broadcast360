"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Pencil, Trash2, Image as ImageIcon, Play } from "lucide-react";

interface Entertainment {
  id: number;

  title: string;

  description: string | null;

  category: string | null;

  thumbnail: string | null;

  videoUrl: string;

  duration: number;

  releaseYear: number | null;

  createdAt: string;
}

export default function EntertainmentDetailPage() {
  const router = useRouter();

  const params = useParams();

  const id = params?.id ? String(params.id) : null;

  const [entertainment, setEntertainment] = useState<Entertainment | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [mediaMode, setMediaMode] = useState<"thumbnail" | "video">(
    "thumbnail",
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);




  useEffect(() => {
    async function loadEntertainment() {
      if (!id) return;

      try {
        const res = await fetch(`/api/entertainments/${id}`);

        const result = await res.json();

        setEntertainment(result.data || result);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    loadEntertainment();
  }, [id]);

  function formatDuration(seconds: number) {
    const hour = Math.floor(seconds / 3600);

    const minute = Math.floor((seconds % 3600) / 60);

    const second = seconds % 60;

    return (
      `${String(hour).padStart(2, "0")}:` +
      `${String(minute).padStart(2, "0")}:` +
      `${String(second).padStart(2, "0")}`
    );
  }

  async function handleDelete() {
    try {
      const res = await fetch(`/api/entertainments/${entertainment?.id}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Delete failed");
      }

      setToast({
        message: "Deleted successfully!",

        type: "success",
      });

      setTimeout(() => {
        router.push("/admin/entertainments");
      }, 1500);
    } catch (error: any) {
      setToast({
        message: error.message || "Delete failed",

        type: "error",
      });
    }
  }

  if (loading) {
    return <div className="p-8 text-white">Loading...</div>;
  }

  if (!entertainment) {
    return <div className="p-8 text-white">Entertainment not found</div>;
  }

  return (
    <div className="min-h-screen space-y-8 bg-black p-8 text-white">
      {/* TOAST */}

      {toast && (
        <div
          className={`fixed top-6 left-1/2 z-50 -translate-x-1/2 rounded-xl border px-5 py-3 shadow-xl ${
            toast.type === "success"
              ? "border-green-500 bg-green-900/40 text-green-400"
              : "border-red-500 bg-red-900/40 text-red-400"
          } `}
        >
          {toast.message}
        </div>
      )}

      {/* DELETE MODAL */}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 pt-20">
          <div className="w-[340px] rounded-xl border border-white/10 bg-zinc-900 px-5 py-4 shadow-xl">
            <h2 className="mb-4 text-base font-semibold">
              Delete Entertainment?
            </h2>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-lg bg-white/10 px-4 py-2 text-sm text-gray-300 hover:bg-white/20"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  setShowDeleteModal(false);

                  handleDelete();
                }}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={() => router.back()}
          className="text-lg text-gray-400 hover:text-white"
        >
          ← Back to Entertainment
        </button>

        <h1 className="text-3xl font-bold">{entertainment.title}</h1>
      </div>

      {/* =========================
        60 / 40 LAYOUT
========================= */}

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[3fr_2fr]">
        {/* =========================
          VIDEO
========================= */}

        <div className="h-[480px] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          {mediaMode === "thumbnail" ? (
            entertainment.thumbnail ? (
              <img
                src={entertainment.thumbnail}
                alt={entertainment.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No Thumbnail
              </div>
            )
          ) : (
            <video
              src={entertainment.videoUrl}
              controls
              className="h-full w-full object-cover"
            />
          )}
        </div>

        {/* =========================
          DETAIL
========================= */}

        <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-zinc-900 p-6">
          <h1 className="mb-6 text-3xl font-bold">{entertainment.title}</h1>

          <div className="grid flex-1 grid-rows-6 gap-4 text-lg">
            {/* Category */}

            <div className="flex items-center">
              <span className="w-44 font-medium text-gray-400">Category :</span>

              <span className="font-semibold">
                {entertainment.category || "-"}
              </span>
            </div>

            {/* Duration */}

            <div className="flex items-center">
              <span className="w-44 font-medium text-gray-400">Duration :</span>

              <span className="font-semibold">
                {formatDuration(entertainment.duration)}
              </span>
            </div>

            {/* Release */}

            <div className="flex items-center">
              <span className="w-44 font-medium text-gray-400">
                Release Year :
              </span>

              <span className="font-semibold">
                {entertainment.releaseYear || "-"}
              </span>
            </div>

            {/* Thumbnail */}

            <button
              onClick={() => setMediaMode("thumbnail")}
              className="flex items-center gap-3 font-medium text-blue-400"
            >
              <ImageIcon size={22} />
              View Thumbnail
            </button>

            {/* Video */}

            <button
              onClick={() => setMediaMode("video")}
              className="flex items-center gap-3 font-medium text-red-400"
            >
              <Play size={22} />
              Play Video
            </button>

            {/* Edit/Delete */}

            <div className="flex items-center gap-4">
              <button
                onClick={() =>
                  router.push(`/admin/entertainments/edit/${entertainment.id}`)
                }
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm hover:bg-blue-700"
              >
                <Pencil size={16} />
                Edit
              </button>

              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm hover:bg-red-700"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================
        DESCRIPTION
========================= */}

      <div className="rounded-2xl border border-white/10 bg-zinc-900 p-6">
        <h2 className="mb-2 text-base font-semibold">Description</h2>

        <p className="leading-8 whitespace-pre-line text-gray-300">
          {entertainment.description || "No description available."}
        </p>
      </div>
    </div>
  );
}
