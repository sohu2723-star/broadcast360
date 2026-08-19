"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

interface SubscriptionPlan {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  _count?: {
    subscriptions: number;
    options: number;
  };
}

interface PlanResponse {
  data: SubscriptionPlan[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  isActive: true,
};

// Helper function to safely handle API responses without throwing JSON parsing syntax errors
async function handleApiResponse(response: Response) {
  const contentType = response.headers.get("content-type");
  
  if (contentType && contentType.includes("application/json")) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }

  // If server returned HTML (e.g. 404/500 route error pages)
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Server returned an error (${response.status}). Check API route configuration.`);
  }

  return text;
}

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(INITIAL_FORM_STATE);

  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchPlans = useCallback(
    async (searchQuery = search, silent = false) => {
      try {
        if (!silent) setLoading(true);
        setError("");

        const params = new URLSearchParams({
          page: "1",
          limit: "100",
        });

        if (searchQuery.trim()) {
          params.set("search", searchQuery.trim());
        }

        const response = await fetch(
          `/api/subscription-plans?${params.toString()}`,
        );

        const result = (await handleApiResponse(response)) as PlanResponse;
        setPlans(result.data ?? []);
      } catch (err) {
        console.error(err);
        setError(
          err instanceof Error ? err.message : "Failed to load plans",
        );
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [search],
  );

  useEffect(() => {
    fetchPlans("", false);
  }, []);

  function openCreate() {
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEdit(plan: SubscriptionPlan) {
    setEditingId(plan.id);
    setForm({
      name: plan.name,
      description: plan.description ?? "",
      isActive: plan.isActive,
    });
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setForm(INITIAL_FORM_STATE);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setError("Plan name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/subscription-plans/${editingId}`
        : "/api/subscription-plans";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      await handleApiResponse(response);

      setMessage(
        editingId
          ? "Subscription plan updated successfully."
          : "Subscription plan created successfully.",
      );

      setShowForm(false);
      setEditingId(null);
      setForm(INITIAL_FORM_STATE);

      await fetchPlans(search, true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to save plan",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(plan: SubscriptionPlan) {
    try {
      setActionId(plan.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscription-plans/${plan.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: plan.name,
            description: plan.description ?? "",
            isActive: !plan.isActive,
          }),
        },
      );

      await handleApiResponse(response);
      await fetchPlans(search, true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleDelete(plan: SubscriptionPlan) {
    const confirmed = window.confirm(`Delete "${plan.name}"?`);
    if (!confirmed) return;

    try {
      setActionId(plan.id);
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscription-plans/${plan.id}`,
        {
          method: "DELETE",
        },
      );

      await handleApiResponse(response);

      setMessage("Subscription plan deleted successfully.");
      await fetchPlans(search, true);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Failed to delete plan",
      );
    } finally {
      setActionId(null);
    }
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    fetchPlans(search, false);
  }

  function handleClearSearch() {
    setSearch("");
    fetchPlans("", false);
  }

  const activeCount = plans.filter((p) => p.isActive).length;
  const inactiveCount = plans.length - activeCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Subscription Plans
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage your subscription tiers, limits, and pricing visibility.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Subscription Plan
        </button>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Plans</p>
          <p className="mt-1 text-2xl font-bold text-white">{plans.length}</p>
        </div>
        <div className="rounded-xl border border-emerald-900/40 bg-slate-900/90 p-4 shadow-sm backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Active Plans</p>
          <p className="mt-1 text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm backdrop-blur">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Inactive Plans</p>
          <p className="mt-1 text-2xl font-bold text-slate-400">{inactiveCount}</p>
        </div>
      </div>

      {/* Alerts */}
      {message && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-3 text-sm text-emerald-300 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>{message}</span>
          </div>
          <button onClick={() => setMessage("")} className="text-emerald-400 hover:text-emerald-200">
            ✕
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-300 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-rose-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-rose-400 hover:text-rose-200">
            ✕
          </button>
        </div>
      )}

      {/* Filter / Search Bar */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/90 p-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex gap-3">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-slate-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search plans by title or keyword..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/60 pl-10 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            >
              Reset
            </button>
          )}

          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-700 focus:outline-none transition"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 shadow-sm">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <svg className="h-8 w-8 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-3 text-sm font-medium text-slate-400">Loading subscription plans...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/80 text-indigo-400">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-200">No plans found</h3>
            <p className="mt-1 text-sm text-slate-500">Get started by creating your first subscription tier.</p>
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
            >
              + Create Plan Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-400">
              <thead className="border-b border-slate-800 bg-slate-950/60 text-xs font-semibold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-6 py-3.5">Plan Name</th>
                  <th className="px-6 py-3.5">Description</th>
                  <th className="px-6 py-3.5">Options</th>
                  <th className="px-6 py-3.5">Subscribers</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {plans.map((plan) => {
                  const isRowBusy = actionId === plan.id;

                  return (
                    <tr key={plan.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{plan.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">ID #{plan.id}</div>
                      </td>

                      <td className="max-w-xs px-6 py-4 text-slate-400 truncate">
                        {plan.description || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
                          {plan._count?.options ?? 0} features
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-medium text-slate-200">
                          {plan._count?.subscriptions ?? 0}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <button
                          type="button"
                          disabled={isRowBusy}
                          onClick={() => toggleActive(plan)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-all focus:outline-none disabled:opacity-50 ${
                            plan.isActive
                              ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40 hover:bg-emerald-900/60"
                              : "bg-slate-800/80 text-slate-400 border border-slate-700/50 hover:bg-slate-800"
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${plan.isActive ? "bg-emerald-400" : "bg-slate-500"}`} />
                          {plan.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => openEdit(plan)}
                            className="font-medium text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
                          >
                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={isRowBusy}
                            onClick={() => handleDelete(plan)}
                            className="font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal Dialog */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl transition-all">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Edit Subscription Plan" : "Create Subscription Plan"}
              </h2>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Plan Name *
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Premium Access"
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Summarize features included in this tier..."
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-600 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Styled Toggle Switch */}
              <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/60 p-3">
                <div>
                  <span className="text-sm font-medium text-slate-200">Active Visibility</span>
                  <p className="text-xs text-slate-500">Allow users to view & subscribe to this plan.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setForm((c) => ({ ...c, isActive: !c.isActive }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    form.isActive ? "bg-indigo-600" : "bg-slate-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      form.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Form Controls */}
              <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-800 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}