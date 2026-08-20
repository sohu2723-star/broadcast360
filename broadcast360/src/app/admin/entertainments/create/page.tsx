"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import EntertainmentForm from "@/components/admin/entertainments/entertainmentForm";
import type { EntertainmentFormData } from "@/types/entertainment";
import { uploadAdminFileDirect } from "@/lib/media/direct-upload";

function getVideoDuration(file: File) {
  return new Promise<number>((resolve) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = Number.isFinite(video.duration) ? video.duration : 0;
      URL.revokeObjectURL(url);
      resolve(Math.max(0, Math.round(duration)));
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(0);
    };
    video.src = url;
  });
}

export default function CreateEntertainmentPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");


  const [messageType, setMessageType] =
    useState<"success" | "error" | "">("");
      const [titleError, setTitleError] = useState("");


  async function handleSubmit(data: EntertainmentFormData) {
    try {
      if (!(data.video instanceof File)) {
        throw new Error("Entertainment video file is required");
      }
      if (!(data.thumbnail instanceof File)) {
        throw new Error("Entertainment thumbnail is required");
      }

      const [videoUpload, thumbnailUpload, duration] = await Promise.all([
        uploadAdminFileDirect(data.video, "videos/entertainments"),
        uploadAdminFileDirect(data.thumbnail, "thumbnails/entertainments"),
        getVideoDuration(data.video),
      ]);

      const formData = new FormData();
      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("releaseYear", String(data.releaseYear));
      formData.append("duration", String(duration));
      formData.append("videoUrl", videoUpload.publicUrl);
      formData.append("thumbnailUrl", thumbnailUpload.publicUrl);

      const res = await fetch("/api/entertainments", {
        method: "POST",
        body: formData,
      });


      const result = await res.json();


    if (!res.ok) {

  if (
    result.message ===
    "Entertainment title already exists"
  ) {

    setTitleError(result.message);

    return;

  }


  setMessage(
    result.message ||
    "Failed to create entertainment"
  );

  setMessageType("error");

  return;

}

      setMessage(
        "Entertainment created successfully"
      );

      setMessageType("success");


      setTimeout(() => {

        router.push(
          "/admin/entertainments"
        );

        router.refresh();

      }, 1500);


    } catch (err) {

      console.error(err);

      setMessage(
        "Something went wrong"
      );

      setMessageType("error");

    }
  }


  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">
        Create Entertainment
      </h1>


      {message && (

        <div
         className={`
      fixed
      top-6
      left-1/2
      -translate-x-1/2
      z-50
      flex
      items-center
      gap-3
      rounded-xl
      border
      px-5
      py-4
      shadow-xl

      ${messageType === "success"
              ? "bg-green-900/20 border-green-500/30 text-green-400"
              : "bg-red-900/20 border-red-500/30 text-red-400"
            }
    `}
        >

          <div
            className={`
        flex
        h-8
        w-8
        items-center
        justify-center
        rounded-full
        font-bold

        ${messageType === "success"
                ? "bg-green-500/20"
                : "bg-red-500/20"
              }
      `}
          >

            {
              messageType === "success"
                ? "✓"
                : "!"
            }

          </div>


          <p className="text-sm font-medium">
            {message}
          </p>


        </div>

      )}

   <EntertainmentForm
  onSubmit={handleSubmit}
  titleError={titleError}
  clearTitleError={() => setTitleError("")}
  onCancel={() =>
    router.push("/admin/entertainments")
  }
/>
    </div>
  );
}

