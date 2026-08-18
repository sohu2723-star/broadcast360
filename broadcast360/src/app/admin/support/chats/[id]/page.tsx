"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface Message {
  id: number;
  message: string;
  senderId: number;
  senderRole: "USER" | "ADMIN";
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  id: number;
  status: "OPEN" | "CLOSED";
  createdAt: string;
  updatedAt: string;

  user: {
    id: number;
    name: string;
    email: string;
    avatar?: string | null;
  };

  messages: Message[];
}

interface ApiResponse {
  success: boolean;
  data: Conversation;
  message?: string;
}

export default function AdminChatPage() {
  const params = useParams();

  const id = params.id as string;

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [closing, setClosing] = useState(false);
  const [error, setError] = useState("");

  async function loadConversation() {
    if (!id) return;

    try {
      setError("");

      const response = await fetch(
        `/api/support/chats/${id}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      const data: ApiResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to load conversation.",
        );
      }

      setConversation(data.data);
    } catch (error: any) {
      console.error(
        "Failed to load admin conversation:",
        error,
      );

      setError(
        error?.message ??
          "Failed to load conversation.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    loadConversation();

    const interval = setInterval(() => {
      loadConversation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  async function sendMessage() {
    const trimmed = message.trim();

    if (!trimmed || !conversation) {
      return;
    }

    try {
      setSending(true);
      setError("");

      const response = await fetch(
        `/api/support/chats/${id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: trimmed,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to send message.",
        );
      }

      setMessage("");

      await loadConversation();
    } catch (error: any) {
      console.error(
        "Failed to send admin message:",
        error,
      );

      setError(
        error?.message ??
          "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  async function closeConversation() {
    if (!conversation) return;

    try {
      setClosing(true);
      setError("");

      const response = await fetch(
        `/api/support/chats/${id}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: "CLOSED",
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ??
            "Failed to close conversation.",
        );
      }

      await loadConversation();
    } catch (error: any) {
      console.error(
        "Failed to close conversation:",
        error,
      );

      setError(
        error?.message ??
          "Failed to close conversation.",
      );
    } finally {
      setClosing(false);
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#040914] p-8 text-white">
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-[#040914] p-8 text-white">
        <div className="mx-auto max-w-4xl">
          <Link
            href="/admin/support/chats"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to Chats
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">
              {error ||
                "Conversation not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040914] p-8 text-white">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}

        <div className="mb-6">
          <Link
            href="/admin/support/chats"
            className="text-sm text-gray-400 hover:text-white"
          >
            ← Back to Premium Chats
          </Link>

          <div className="mt-5 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  Support Chat #{conversation.id}
                </h1>

                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  PREMIUM
                </span>
              </div>

              <div className="mt-3 flex items-center gap-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    conversation.status ===
                    "OPEN"
                      ? "bg-green-500/10 text-green-400"
                      : "bg-gray-500/10 text-gray-400"
                  }`}
                >
                  {conversation.status}
                </span>

                <span className="text-sm text-gray-400">
                  {conversation.user.name}
                  {" · "}
                  {conversation.user.email}
                </span>
              </div>
            </div>

            {conversation.status ===
              "OPEN" && (
              <button
                onClick={
                  closeConversation
                }
                disabled={closing}
                className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold hover:bg-red-500 disabled:opacity-50"
              >
                {closing
                  ? "Closing..."
                  : "Close Chat"}
              </button>
            )}
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* CHAT */}

        <div className="flex min-h-[650px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">

          {/* MESSAGES */}

          <div className="flex-1 space-y-5 overflow-y-auto p-6">

            {conversation.messages.length ===
            0 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                No messages yet.
              </div>
            ) : (
              conversation.messages.map(
                (item) => {
                  const isAdmin =
                    item.senderRole ===
                    "ADMIN";

                  return (
                    <div
                      key={item.id}
                      className={`flex ${
                        isAdmin
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="max-w-[75%]">
                        <div
                          className={`rounded-2xl px-4 py-3 text-sm ${
                            isAdmin
                              ? "rounded-br-md bg-blue-600 text-white"
                              : "rounded-bl-md bg-gray-800 text-gray-200"
                          }`}
                        >
                          {item.message}
                        </div>

                        <p
                          className={`mt-1 text-[10px] text-gray-500 ${
                            isAdmin
                              ? "text-right"
                              : "text-left"
                          }`}
                        >
                          {isAdmin
                            ? "You"
                            : conversation
                                .user
                                .name}
                          {" · "}
                          {formatTime(
                            item.createdAt,
                          )}
                        </p>
                      </div>
                    </div>
                  );
                },
              )
            )}
          </div>

          {/* INPUT */}

          {conversation.status ===
          "OPEN" ? (
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3">

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(
                      e.target.value,
                    )
                  }
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={sending}
                  rows={2}
                  placeholder="Reply to the user..."
                  className="flex-1 resize-none rounded-xl border border-white/10 bg-[#040914] px-4 py-3 text-sm text-white outline-none focus:border-blue-500 disabled:opacity-50"
                />

                <button
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="self-end rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending
                    ? "Sending..."
                    : "Send"}
                </button>

              </div>

              <p className="mt-2 text-[11px] text-gray-500">
                Press Enter to send · Shift +
                Enter for a new line
              </p>
            </div>
          ) : (
            <div className="border-t border-white/10 p-5 text-center text-sm text-gray-500">
              This conversation has been
              closed.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}