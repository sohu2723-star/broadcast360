import { useEffect, useState } from "react";
import { useLocation, useParams } from 'wouter';

import EntertainmentForm from "@/components/admin/entertainments/entertainmentForm";

import type { Entertainment } from "@/types/entertainment";

export default function EditEntertainmentPage() {
  const params = useParams();

  const [, setLocation] = useLocation();

  const id = Number(params.id);

  const [entertainment, setEntertainment] = useState<Entertainment | null>(
    null,
  );

  const [loading, setLoading] = useState(true);

  const [titleError, setTitleError] = useState("");

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error" | "">("");

  useEffect(() => {
    async function loadEntertainment() {
      try {
        const res = await fetch(`/api/entertainments/${id}`);

        if (!res.ok) {
          throw new Error("Failed to fetch entertainment");
        }

        const data: Entertainment = await res.json();

        setEntertainment(data);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadEntertainment();
    }
  }, [id]);

  if (loading) {
    return <p className="p-10 text-gray-400">Loading...</p>;
  }

  if (!entertainment) {
    return <p className="p-10 text-red-400">Entertainment not found</p>;
  }

  return (
    <div className="space-y-6 p-6 text-white">
      {message && (
        <div
          className={`fixed top-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border px-5 py-4 shadow-xl ${
            messageType === "success"
              ? "border-green-500/30 bg-green-900/20 text-green-400"
              : "border-red-500/30 bg-red-900/20 text-red-400"
          } `}
        >
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-full font-bold ${
              messageType === "success" ? "bg-green-500/20" : "bg-red-500/20"
            } `}
          >
            {messageType === "success" ? "✓" : "!"}
          </div>

          <p className="text-sm font-medium">{message}</p>
        </div>
      )}

      {/* HEADER */}

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Entertainment</h1>

        <button
          onClick={() => setLocation("/entertainments")}

          className="rounded-lg bg-white/10 px-4 py-2 hover:bg-white/20"
        >
          Back
        </button>
      </div>

      {/* FORM */}

      <div className="grid grid-cols-1 gap-6">
        <EntertainmentForm
          entertainmentId={entertainment.id}
          titleError={titleError}

          clearTitleError={() => setTitleError("")}

          initialData={{
            title: entertainment.title,

            description: entertainment.description ?? "",

            category: entertainment.category ?? "",

            releaseYear: entertainment.releaseYear ?? 0,

            duration: entertainment.duration ?? 0,

            video: null,

            thumbnail: null,
          }}

          initialThumbnail={entertainment.thumbnail ?? ""}

          initialVideo={entertainment.videoUrl ?? ""}

          onSubmit={async (form) => {
            const noChanges =
              form.title === entertainment.title &&
              form.description === (entertainment.description ?? "") &&
              form.category === (entertainment.category ?? "") &&
              form.releaseYear === (entertainment.releaseYear ?? 0) &&
              form.duration === (entertainment.duration ?? 0) &&
              !form.video &&
              !form.thumbnail;

            if (noChanges) {
              setMessage("No changes. Update successful.");

              setMessageType("success");

              setTimeout(() => {
                setLocation("/entertainments");

                
              }, 1500);

              return;
            }

            const formData = new FormData();

            formData.append("title", form.title);

            formData.append("description", form.description);

            formData.append("category", form.category);

            formData.append("releaseYear", String(form.releaseYear));

            formData.append("duration", String(form.duration));

            if (form.video) {
              formData.append("video", form.video);
            }

            if (form.thumbnail) {
              formData.append("thumbnail", form.thumbnail);
            }

            const res = await fetch(
              `/api/entertainments/${entertainment.id}`,

              {
                method: "PUT",

                body: formData,
              },
            );

            if (res.ok) {
              setMessage("Entertainment updated successfully");

              setMessageType("success");

              setTimeout(() => {
                setLocation("/entertainments");

                
              }, 1500);
            } else {
              const error = await res.json();

              if (error.message === "Entertainment title already exists") {
                setTitleError(error.message);

                return;
              }

              setMessage("Failed to update entertainment");

              setMessageType("error");
            }
          }}
        />
      </div>
    </div>
  );
}
