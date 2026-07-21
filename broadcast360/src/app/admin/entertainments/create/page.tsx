"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import EntertainmentForm from "@/components/admin/entertainments/entertainmentForm";
import type { EntertainmentFormData } from "@/types/entertainment";

export default function CreateEntertainmentPage() {
  const router = useRouter();

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState<"success" | "error" | "">("");
  const [titleError, setTitleError] = useState("");

  async function handleSubmit(data: EntertainmentFormData) {
    try {
      const formData = new FormData();

      formData.append("title", data.title);
      formData.append("description", data.description);
      formData.append("category", data.category);
      formData.append("releaseYear", String(data.releaseYear));

      formData.append("duration", String(data.duration));

      if (data.video instanceof File) {
        formData.append("video", data.video);
      }

      if (data.thumbnail instanceof File) {
        formData.append("thumbnail", data.thumbnail);
      }

      const res = await fetch("/api/entertainments", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (result.message === "Entertainment title already exists") {
          setTitleError(result.message);

          return;
        }

        setMessage(result.message || "Failed to create entertainment");

        setMessageType("error");

        return;
      }

      setMessage("Entertainment created successfully");

      setMessageType("success");

      setTimeout(() => {
        router.push("/admin/entertainments");

        router.refresh();
      }, 1500);
    } catch (err) {
      console.error(err);

      setMessage("Something went wrong");

      setMessageType("error");
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold text-white">
        Create Entertainment
      </h1>

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

      <EntertainmentForm
        onSubmit={handleSubmit}
        titleError={titleError}
        clearTitleError={() => setTitleError("")}
        onCancel={() => router.push("/admin/entertainments")}
      />
    </div>
  );
}
