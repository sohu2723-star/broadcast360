import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, XCircle } from "lucide-react";

type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

type ReactivationRequest = {
  id: number;
  name: string;
  email: string;
  message: string;
  status: RequestStatus;
  createdAt: string;
  reviewedAt: string | null;
  user: {
    id: number;
    name: string;
    email: string;
    status: string;
    lastLoginAt: string | null;
  };
};

export default function ReactivationRequestsPage() {
  const [status, setStatus] = useState<"ALL" | RequestStatus>("PENDING");
  const [requests, setRequests] = useState<ReactivationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const query = status === "ALL" ? "" : `?status=${status}`;
      const response = await fetch(`/api/support/reactivation-requests${query}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to load requests");
      setRequests(data.data ?? []);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load requests");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  async function review(id: number, nextStatus: "APPROVED" | "REJECTED") {
    const label = nextStatus === "APPROVED" ? "activate this user account" : "reject this request";
    if (!window.confirm(`Are you sure you want to ${label}?`)) return;

    setWorkingId(id);
    try {
      const response = await fetch(`/api/support/reactivation-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: nextStatus }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to review request");
      await loadRequests();
    } catch (reviewError) {
      window.alert(reviewError instanceof Error ? reviewError.message : "Unable to review request");
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] p-6 text-slate-100 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-white">Account Reactivation Requests</h2>
            <p className="mt-1 text-sm text-slate-400">Read requests from users inactive for three months and reactivate only after review.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as "ALL" | RequestStatus)}
              className="rounded-xl border border-white/10 bg-[#111936] px-3 py-2 text-sm text-white"
            >
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ALL">All requests</option>
            </select>
            <button
              type="button"
              onClick={() => void loadRequests()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 transition hover:bg-white/10"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error}</div> : null}

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B1026] shadow-xl">
          {loading ? (
            <div className="flex min-h-48 items-center justify-center text-slate-400">
              <Clock3 className="mr-2 h-5 w-5 animate-pulse" /> Loading requests...
            </div>
          ) : requests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No reactivation requests found.</div>
          ) : (
            <div className="divide-y divide-white/10">
              {requests.map((request) => (
                <article key={request.id} className="space-y-4 p-5 sm:p-6">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold text-white">{request.name}</h3>
                      <p className="text-sm text-slate-400">{request.email}</p>
                      <p className="mt-1 text-xs text-slate-500">Submitted {new Date(request.createdAt).toLocaleString()} · Current status: {request.user.status}</p>
                    </div>
                    <span className={`inline-flex w-fit rounded-full border px-3 py-1 text-xs font-semibold ${request.status === "PENDING" ? "border-amber-400/20 bg-amber-400/10 text-amber-300" : request.status === "APPROVED" ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300" : "border-red-400/20 bg-red-400/10 text-red-300"}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap rounded-xl border border-white/5 bg-black/10 p-4 text-sm leading-6 text-slate-300">{request.message}</p>
                  {request.status === "PENDING" ? (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={workingId === request.id}
                        onClick={() => void review(request.id, "APPROVED")}
                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#4f6689] to-[#7898bf] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Activate Account
                      </button>
                      <button
                        type="button"
                        disabled={workingId === request.id}
                        onClick={() => void review(request.id, "REJECTED")}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-300 transition hover:bg-red-400/20 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </button>
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
