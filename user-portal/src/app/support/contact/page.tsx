"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import authApi from "@/lib/authapi";

export default function ContactSupportPage() {
  const router = useRouter();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function submitContact() {
    setError("");
    setSuccess("");

    if (!subject.trim()) {
      setError("Please enter a subject.");
      return;
    }

    if (!message.trim()) {
      setError("Please enter your message.");
      return;
    }

    try {
      setLoading(true);

      // Using authApi to point directly to your backend service
      const response = await authApi.post("/api/user-portal/auth/support/contacts", {
        subject: subject.trim(),
        message: message.trim(),
      });

      setSuccess(
        response.data?.message || "Your message has been sent successfully."
      );
      setSubject("");
      setMessage("");

      setTimeout(() => {
        router.push("/support");
      }, 1200);
    } catch (err: any) {
      console.error("Failed to send contact message:", err);

      // Axios error structure extraction
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to send your message.";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={() => router.push("/support")}
        className="mb-6 text-sm text-gray-400 hover:text-white"
      >
        ← Back to Support
      </button>

      <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-8">
        <h1 className="text-2xl font-bold text-white">Contact Us</h1>

        <p className="mt-2 text-sm text-gray-400">
          Send us your question or problem and our support team will review it.
        </p>

        {error && (
          <div className="mt-6 rounded-xl bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {success && (
          <div className="mt-6 rounded-xl bg-green-500/10 p-4 text-sm text-green-400">
            {success}
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div>
            <label className="mb-2 block text-sm text-gray-300">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="What can we help you with?"
              className="w-full rounded-xl border border-white/10 bg-[#010312] p-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              placeholder="Describe your problem..."
              className="w-full resize-none rounded-xl border border-white/10 bg-[#010312] p-3 text-white outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={submitContact}
            disabled={loading}
            className="rounded-xl bg-[#106EE9] px-6 py-3 font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </div>
      </div>
    </div>
  );
}