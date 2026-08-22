import { useEffect, useState, useCallback } from "react";
import { Link } from 'wouter';

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: "NEW" | "READ" | "RESOLVED";
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);

  // Helper to safely extract JSON or handle HTML 404/500 responses
  const parseJsonResponse = async (res: Response) => {
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return res.json();
    }
    const text = await res.text();
    throw new Error(
      `Server returned ${res.status} ${res.statusText} instead of JSON. Check backend endpoint URL.`
    );
  };

  const loadMessages = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        page: String(page),
        limit: String(pagination.limit),
      });

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      const res = await fetch(`/api/support/contacts?${params.toString()}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load contact messages");
      }

      setMessages(data.data ?? []);
      setPagination(
        data.pagination ?? {
          page,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );
    } catch (err) {
      console.error("Failed to load contact messages:", err);
      setError(err instanceof Error ? err.message : "Failed to load contact messages");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, pagination.limit]);

  useEffect(() => {
    loadMessages(1);
  }, [statusFilter, loadMessages]);

  async function updateStatus(id: number, status: "NEW" | "READ" | "RESOLVED") {
    try {
      const res = await fetch(`/api/support/contacts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to update message");
      }

      setMessages((current) =>
        current.map((msg) => (msg.id === id ? { ...msg, status } : msg))
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage((prev) => (prev ? { ...prev, status } : null));
      }
    } catch (err) {
      console.error("Failed to update contact message:", err);
      alert(err instanceof Error ? err.message : "Failed to update message");
    }
  }

  async function deleteMessage(id: number) {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      const res = await fetch(`/api/support/contacts/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await parseJsonResponse(res);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to delete message");
      }

      setSelectedMessage(null);
      await loadMessages(pagination.page);
    } catch (err) {
      console.error("Failed to delete contact message:", err);
      alert(err instanceof Error ? err.message : "Failed to delete message");
    }
  }

  function getStatusBadge(status: ContactMessage["status"]) {
    switch (status) {
      case "NEW":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400 border border-rose-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400 animate-pulse" />
            New
          </span>
        );
      case "READ":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            Read
          </span>
        );
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Resolved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-400 border border-slate-500/20">
            Unknown
          </span>
        );
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-[#070B19] p-6 lg:p-10 text-slate-100 font-sans antialiased selection:bg-blue-500/30">
      <div className="mx-auto max-w-7xl">

        {/* HEADER */}
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Contact Messages
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage incoming customer inquiries and support tickets.
            </p>
          </div>

          <Link
            href=""
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-slate-700 hover:bg-slate-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Dashboard
          </Link>
        </header>

        {/* METRICS & FILTER BAR */}
        <section className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-800/80 bg-[#0D132D]/60 p-5 backdrop-blur-md">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Messages
            </p>
            <p className="mt-2 text-3xl font-bold text-white">{pagination.total}</p>
          </div>

          <div className="sm:col-span-1 lg:col-span-3 flex items-center justify-end rounded-2xl border border-slate-800/80 bg-[#0D132D]/60 p-5 backdrop-blur-md">
            <div className="flex items-center gap-3">
              <label htmlFor="status-filter" className="text-sm font-medium text-slate-300">
                Filter Status
              </label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-xl border border-slate-700/60 bg-[#070B19] px-4 py-2 text-sm font-medium text-slate-200 outline-none transition hover:border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="ALL">All Messages</option>
                <option value="NEW">New</option>
                <option value="READ">Read</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
        </section>

        {/* ERROR NOTICE */}
        {error && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300 backdrop-blur-md">
            <svg className="h-5 w-5 shrink-0 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <p className="font-semibold text-rose-200">Unable to load data</p>
              <p className="mt-0.5 text-xs text-rose-300/80">{error}</p>
            </div>
          </div>
        )}

        {/* DATA TABLE CONTAINER */}
        <div className="overflow-hidden rounded-2xl border border-slate-800/80 bg-[#0D132D]/80 shadow-2xl backdrop-blur-md">
          {loading ? (
            <div className="flex flex-col items-center justify-center p-16 text-slate-400">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              <p className="mt-4 text-sm font-medium">Fetching support tickets...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="p-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/50 text-slate-400">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="mt-4 text-base font-semibold text-white">No messages found</h3>
              <p className="mt-1 text-sm text-slate-400">
                There are no tickets matching your current filter criteria.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800/80 bg-slate-900/40 text-xs uppercase tracking-wider text-slate-400">
                    <th className="px-6 py-4 font-semibold">Sender</th>
                    <th className="px-6 py-4 font-semibold">Subject</th>
                    <th className="px-6 py-4 font-semibold">Preview</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Date</th>
                    <th className="px-6 py-4 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {messages.map((message) => (
                    <tr
                      key={message.id}
                      className="group transition-colors hover:bg-slate-800/30"
                    >
                      {/* SENDER */}
                      <td className="px-6 py-4">
                        <div className="font-medium text-white">
                          {message.user?.name || message.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {message.user?.email || message.email}
                        </div>
                      </td>

                      {/* SUBJECT */}
                      <td className="max-w-[180px] px-6 py-4">
                        <p className="truncate font-medium text-slate-200" title={message.subject}>
                          {message.subject}
                        </p>
                      </td>

                      {/* PREVIEW */}
                      <td className="max-w-[260px] px-6 py-4">
                        <p className="truncate text-slate-400" title={message.message}>
                          {message.message}
                        </p>
                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(message.status)}
                      </td>

                      {/* DATE */}
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-400">
                        {formatDate(message.createdAt)}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedMessage(message);
                              if (message.status === "NEW") {
                                updateStatus(message.id, "READ");
                              }
                            }}
                            className="rounded-lg bg-[#4f6689]/10 px-3 py-1.5 text-xs font-semibold text-blue-400 transition hover:bg-[#4f6689]/20 hover:text-blue-300"
                          >
                            View
                          </button>

                          {message.status !== "RESOLVED" && (
                            <button
                              type="button"
                              onClick={() => updateStatus(message.id, "RESOLVED")}
                              className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20 hover:text-emerald-300"
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {!loading && pagination.totalPages > 1 && (
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-400">
              Showing page <span className="text-white">{pagination.page}</span> of{" "}
              <span className="text-white">{pagination.totalPages}</span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadMessages(pagination.page - 1)}
                className="rounded-xl border border-slate-800 bg-[#0D132D] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadMessages(pagination.page + 1)}
                className="rounded-xl border border-slate-800 bg-[#0D132D] px-4 py-2 text-xs font-semibold text-slate-300 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* MODAL DETAIL VIEW */}
        {selectedMessage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setSelectedMessage(null)}
          >
            <div
              className="w-full max-w-2xl rounded-2xl border border-slate-800 bg-[#0D132D] p-6 shadow-2xl transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{selectedMessage.subject}</h2>
                    {getStatusBadge(selectedMessage.status)}
                  </div>
                  <p className="mt-1 text-xs text-slate-400">
                    Received on {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* SENDER INFO */}
              <div className="my-5 rounded-xl border border-slate-800/80 bg-[#070B19]/60 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">From</p>
                <p className="mt-1 font-semibold text-slate-200">
                  {selectedMessage.user?.name || selectedMessage.name}
                </p>
                <p className="text-xs text-slate-400">
                  {selectedMessage.user?.email || selectedMessage.email}
                </p>
              </div>

              {/* MESSAGE CONTENT */}
              <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-800/80 bg-[#070B19]/60 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-300">
                  {selectedMessage.message}
                </p>
              </div>

              {/* MODAL ACTIONS */}
              <div className="mt-6 flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => deleteMessage(selectedMessage.id)}
                  className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-xs font-semibold text-rose-400 transition hover:bg-rose-500/20"
                >
                  Delete Ticket
                </button>

                <div className="flex items-center gap-2">
                  {selectedMessage.status !== "RESOLVED" && (
                    <button
                      type="button"
                      onClick={() => updateStatus(selectedMessage.id, "RESOLVED")}
                      className="rounded-xl bg-emerald-500 px-4 py-2 text-xs font-semibold text-white transition hover:bg-emerald-600"
                    >
                      Mark Resolved
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setSelectedMessage(null)}
                    className="rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-700 hover:text-white"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}