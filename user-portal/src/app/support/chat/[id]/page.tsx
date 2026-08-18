"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import authApi from "@/lib/authapi";

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
  messages: Message[];
}

interface ApiResponse {
  success: boolean;
  data: Conversation;
  message?: string;
}

export default function PremiumChatPage() {
  const params = useParams();

  const id = params.id as string;

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  async function fetchConversation() {
    if (!id) return;

    try {
      const response =
        await authApi.get<ApiResponse>(
          `/api/user-portal/auth/support/chats/${id}`,
        );

      setConversation(response.data.data);
      setError("");
    } catch (error: any) {
      console.error(
        "Failed to load conversation:",
        error,
      );

      setError(
        error?.response?.data?.message ??
          "Failed to load conversation.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    fetchConversation();

    const interval = setInterval(() => {
      fetchConversation();
    }, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  async function sendMessage() {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    if (!conversation || conversation.status !== "OPEN") {
      return;
    }

    try {
      setSending(true);
      setError("");

      await authApi.post(
        `/api/user-portal/auth/support/chats/${id}`,
        {
          message: trimmedMessage,
        },
      );

      setMessage("");

      await fetchConversation();
    } catch (error: any) {
      console.error(
        "Failed to send message:",
        error,
      );

      setError(
        error?.response?.data?.message ??
          "Failed to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  function formatTime(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#040914] text-white">
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  if (!conversation) {
    return (
      <main className="min-h-screen bg-[#040914] px-6 py-16 text-white">
        <div className="mx-auto max-w-3xl">
          <Link
            href="/support/chat"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Chats
          </Link>

          <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
            <p className="text-red-400">
              {error || "Conversation not found."}
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040914] px-6 py-10 text-white">
      <div className="mx-auto flex max-w-4xl flex-col">

        {/* HEADER */}

        <div className="mb-6">
          <Link
            href="/support/chat"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Chats
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

              <span
                className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                  conversation.status === "OPEN"
                    ? "bg-green-500/10 text-green-400"
                    : "bg-slate-500/10 text-slate-400"
                }`}
              >
                {conversation.status}
              </span>
            </div>
          </div>
        </div>

        {/* CHAT */}

        <div className="flex min-h-[600px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026]">

          {/* MESSAGES */}

          <div className="flex-1 space-y-5 overflow-y-auto p-6">

            {conversation.messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-500">
                Start the conversation with our support team.
              </div>
            ) : (
              conversation.messages.map((item) => {
                const isUser =
                  item.senderRole === "USER";

                return (
                  <div
                    key={item.id}
                    className={`flex ${
                      isUser
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div className="max-w-[75%]">
                      <div
                        className={`rounded-2xl px-4 py-3 text-sm ${
                          isUser
                            ? "rounded-br-md bg-indigo-600 text-white"
                            : "rounded-bl-md bg-slate-800 text-slate-200"
                        }`}
                      >
                        {item.message}
                      </div>

                      <p
                        className={`mt-1 text-[10px] text-slate-500 ${
                          isUser
                            ? "text-right"
                            : "text-left"
                        }`}
                      >
                        {isUser ? "You" : "Support"}
                        {" · "}
                        {formatTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ERROR */}

          {error && (
            <div className="border-t border-white/10 bg-red-500/5 px-5 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {/* INPUT */}

          {conversation.status === "OPEN" ? (
            <div className="border-t border-white/10 p-4">
              <div className="flex gap-3">

                <textarea
                  value={message}
                  onChange={(e) =>
                    setMessage(e.target.value)
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
                  placeholder="Type your message..."
                  className="
                    flex-1
                    resize-none
                    rounded-xl
                    border
                    border-white/10
                    bg-[#040914]
                    px-4
                    py-3
                    text-sm
                    text-white
                    outline-none
                    focus:border-indigo-500
                    disabled:opacity-50
                  "
                />

                <button
                  onClick={sendMessage}
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="
                    self-end
                    rounded-xl
                    bg-indigo-600
                    px-5
                    py-3
                    text-sm
                    font-semibold
                    hover:bg-indigo-500
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {sending ? "Sending..." : "Send"}
                </button>

              </div>

              <p className="mt-2 text-[11px] text-slate-500">
                Press Enter to send · Shift + Enter
                for a new line
              </p>
            </div>
          ) : (
            <div className="border-t border-white/10 p-5 text-center text-sm text-slate-500">
              This conversation has been closed.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}