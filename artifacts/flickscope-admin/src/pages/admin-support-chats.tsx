import { Link } from 'wouter';
import { useEffect, useState } from "react";

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

  messages: {
    id: number;
    message: string;
    senderRole: "USER" | "ADMIN";
    isRead: boolean;
    createdAt: string;
  }[];
}

interface ApiResponse {
  data: Conversation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages?: number;
  };
}

export default function PremiumChatsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const limit = 10;

  async function loadConversations() {
    try {
      setLoading(true);

      const res = await fetch(
        `/api/support/chats?page=${page}&limit=${limit}`,
        {
          credentials: "include",
          cache: "no-store",
        },
      );

      if (!res.ok) {
        throw new Error("Failed to load conversations");
      }

      const data: ApiResponse = await res.json();

      setConversations(data.data ?? []);
      setTotal(data.pagination?.total ?? 0);
    } catch (error) {
      console.error("Failed to load premium chats:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadConversations();
  }, [page]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="p-8 text-white">
      {/* HEADER */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Premium Chats
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Chat with premium users and manage support conversations.
          </p>
        </div>

        <div className="rounded-xl bg-[#111936] px-4 py-2 text-sm">
          Total:{" "}
          <span className="font-bold text-white">
            {total}
          </span>
        </div>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="rounded-2xl bg-[#0B1026] p-10 text-center text-gray-400">
          Loading conversations...
        </div>
      )}

      {/* EMPTY */}
      {!loading && conversations.length === 0 && (
        <div className="rounded-2xl bg-[#0B1026] p-10 text-center">
          <p className="text-lg font-semibold">
            No premium chats
          </p>

          <p className="mt-2 text-sm text-gray-400">
            There are no support conversations yet.
          </p>
        </div>
      )}

      {/* CONVERSATIONS */}
      {!loading && conversations.length > 0 && (
        <div className="space-y-3">
          {conversations.map((conversation) => {
            const lastMessage =
              conversation.messages?.[0];

            const unreadCount =
              conversation.messages?.filter(
                (message) =>
                  message.senderRole === "USER" &&
                  !message.isRead,
              ).length ?? 0;

            return (
              <Link
                key={conversation.id}
                href={`/admin/support/chats/${conversation.id}`}
                className="
                  block
                  rounded-2xl
                  border border-white/10
                  bg-[#0B1026]
                  p-5
                  transition
                  hover:border-[#4f6689]/50
                  hover:bg-[#111936]
                "
              >
                <div className="flex items-center justify-between gap-4">
                  {/* USER */}
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-[#4f6689]
                        font-bold
                      "
                    >
                      {conversation.user.avatar ? (
                        <img
                          src={conversation.user.avatar}
                          alt={conversation.user.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        conversation.user.name
                          ?.charAt(0)
                          .toUpperCase() ?? "U"
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="truncate font-semibold">
                          {conversation.user.name}
                        </h2>

                        {unreadCount > 0 && (
                          <span
                            className="
                              flex
                              h-5
                              min-w-5
                              items-center
                              justify-center
                              rounded-full
                              bg-red-500
                              px-1.5
                              text-[11px]
                              font-bold
                            "
                          >
                            {unreadCount > 99
                              ? "99+"
                              : unreadCount}
                          </span>
                        )}
                      </div>

                      <p className="truncate text-sm text-gray-500">
                        {conversation.user.email}
                      </p>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="shrink-0">
                    {conversation.status === "OPEN" ? (
                      <span
                        className="
                          rounded-full
                          bg-green-500/10
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-green-400
                        "
                      >
                        OPEN
                      </span>
                    ) : (
                      <span
                        className="
                          rounded-full
                          bg-gray-500/10
                          px-3
                          py-1
                          text-xs
                          font-semibold
                          text-gray-400
                        "
                      >
                        CLOSED
                      </span>
                    )}
                  </div>
                </div>

                {/* LAST MESSAGE */}
                {lastMessage && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="line-clamp-2 text-sm text-gray-400">
                      <span className="font-medium text-gray-300">
                        {lastMessage.senderRole === "USER"
                          ? "User:"
                          : "Admin:"}
                      </span>{" "}
                      {lastMessage.message}
                    </p>

                    <p className="mt-2 text-xs text-gray-600">
                      {new Date(
                        lastMessage.createdAt,
                      ).toLocaleString()}
                    </p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      )}

      {/* PAGINATION */}
      {!loading && total > 0 && (
        <div className="mt-8 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((current) =>
                  Math.max(1, current - 1),
                )
              }
              className="
                rounded-lg
                bg-[#111936]
                px-4
                py-2
                text-sm
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Previous
            </button>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1),
                )
              }
              className="
                rounded-lg
                bg-[#4f6689]
                px-4
                py-2
                text-sm
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}