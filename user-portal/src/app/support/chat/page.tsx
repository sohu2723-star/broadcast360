"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import authApi from "@/lib/authapi";

interface Message {
  id: number;
  message: string;
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
  data: Conversation[];
  message?: string;
}

export default function PremiumChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  async function fetchConversations() {
    try {
      setLoading(true);
      setError("");

      const response = await authApi.get<ApiResponse>(
        "/api/user-portal/auth/support/chats",
      );

      setConversations(response.data.data ?? []);
    } catch (error: any) {
      console.error("Failed to load premium chats:", error);

      setError(
        error?.response?.data?.message ??
          "Failed to load your chats.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchConversations();
  }, []);

  async function createConversation() {
    try {
      setCreating(true);
      setError("");

      const response = await authApi.post<ApiResponse>(
        "/api/user-portal/auth/support/chats",
      );

      const conversation = response.data.data as unknown as Conversation;

      if (!conversation?.id) {
        throw new Error("Conversation was not created.");
      }

      window.location.href = `/support/chat/${conversation.id}`;
    } catch (error: any) {
      console.error("Failed to create chat:", error);

      setError(
        error?.response?.data?.message ??
          "Failed to start a chat.",
      );
    } finally {
      setCreating(false);
    }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleString();
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#040914] px-6 py-16 text-white">
        <div className="flex justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#040914] px-6 py-16 text-white">
      <div className="mx-auto max-w-4xl">

        <div className="mb-8">
          <Link
            href="/support"
            className="text-sm text-slate-400 hover:text-white"
          >
            ← Back to Support
          </Link>

          <div className="mt-6 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold">
                  Premium Support Chat
                </h1>

                <span className="rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-semibold text-yellow-400">
                  PREMIUM
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-400">
                Chat directly with the Hxu Movie
                support team.
              </p>
            </div>

            <button
              onClick={createConversation}
              disabled={creating}
              className="
                rounded-xl
                bg-indigo-600
                px-5
                py-3
                text-sm
                font-semibold
                text-white
                transition
                hover:bg-indigo-500
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {creating ? "Starting..." : "+ New Chat"}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            {error}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#0B1026] p-10 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-200">
              <MessageSquare size={26} strokeWidth={1.7} aria-hidden="true" />
            </div>

            <h2 className="text-lg font-semibold">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm text-slate-400">
              Start a chat with our support team.
            </p>

            <button
              onClick={createConversation}
              disabled={creating}
              className="
                mt-6
                rounded-xl
                bg-indigo-600
                px-6
                py-3
                text-sm
                font-semibold
                hover:bg-indigo-500
                disabled:opacity-50
              "
            >
              {creating ? "Starting..." : "Start Premium Chat"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const lastMessage = conversation.messages?.[0];

              return (
                <Link
                  key={conversation.id}
                  href={`/support/chat/${conversation.id}`}
                  className="
                    block
                    rounded-2xl
                    border
                    border-white/10
                    bg-[#0B1026]
                    p-5
                    transition
                    hover:border-indigo-500/40
                    hover:bg-[#0d1430]
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <h2 className="font-semibold">
                          Support Conversation #{conversation.id}
                        </h2>

                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            conversation.status === "OPEN"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-slate-500/10 text-slate-400"
                          }`}
                        >
                          {conversation.status}
                        </span>
                      </div>

                      <p className="mt-2 truncate text-sm text-slate-400">
                        {lastMessage?.message ?? "No messages yet"}
                      </p>
                    </div>

                    <span className="shrink-0 text-xs text-slate-500">
                      {formatDate(conversation.updatedAt)}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}