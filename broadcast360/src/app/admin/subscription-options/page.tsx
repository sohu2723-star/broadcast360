"use client";

import { FormEvent, useEffect, useState } from "react";

interface SubscriptionOption {
  id: number;
  planId: number;
  durationDays: number;
  price: number;
  discountPercent: number;
  isActive: boolean;

  plan: {
    id: number;
    name: string;
  };
}

interface Plan {
  id: number;
  name: string;
  isActive: boolean;
}

const emptyForm = {
  planId: "",
  durationDays: "",
  price: "",
  discountPercent: "0",
  isActive: true,
};

function formatDuration(days: number) {
  if (days === 30) return "1 Month";
  if (days === 90) return "3 Months";
  if (days === 180) return "6 Months";
  if (days === 365) return "1 Year";

  return `${days} Days`;
}

export default function SubscriptionOptionsPage() {
  const [options, setOptions] = useState<SubscriptionOption[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState(emptyForm);

  // Helper function to safely parse server responses
  async function parseResponse(response: Response) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await response.json();
    }
    const text = await response.text();
    throw new Error(
      `Server returned ${response.status} ${response.statusText} (${contentType || "non-JSON"}).`
    );
  }

  async function fetchOptions() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/subscription-options?page=1&limit=100"
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          "Failed to load subscription options"
        );
      }

      setOptions(result.data ?? []);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load subscription options"
      );
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlans() {
    try {
      const response = await fetch(
        "/api/subscription-plans?page=1&limit=100"
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error("Failed to load subscription plans");
      }

      setPlans(result.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchOptions();
    fetchPlans();
  }, []);

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(option: SubscriptionOption) {
    setEditingId(option.id);
    setForm({
      planId: option.planId.toString(),
      durationDays: option.durationDays.toString(),
      price: option.price.toString(),
      discountPercent: option.discountPercent.toString(),
      isActive: option.isActive,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        planId: Number(form.planId),
        durationDays: Number(form.durationDays),
        price: Number(form.price),
        discountPercent: Number(form.discountPercent),
        isActive: form.isActive,
      };

      const url = editingId
        ? `/api/subscription-options/${editingId}`
        : "/api/subscription-options";

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          "Failed to save subscription option"
        );
      }

      setMessage(
        editingId
          ? "Subscription option updated successfully."
          : "Subscription option created successfully."
      );

      closeForm();
      await fetchOptions();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save subscription option"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(option: SubscriptionOption) {
    const confirmed = window.confirm(
      `Delete ${formatDuration(option.durationDays)} subscription option?`
    );

    if (!confirmed) return;

    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscription-options/${option.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to delete option"
        );
      }

      setMessage("Subscription option deleted successfully.");
      await fetchOptions();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete subscription option"
      );
    }
  }

  async function toggleActive(
    option: SubscriptionOption,
  ) {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `/api/subscription-options/${option.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            planId: Number(option.planId),
            durationDays: Number(option.durationDays),
            price: Number(option.price),
            discountPercent: Number(
              option.discountPercent,
            ),
            isActive: !option.isActive,
          }),
        },
      );

      const result = await parseResponse(response);

      if (!response.ok) {
        throw new Error(
          result.error ||
          result.message ||
          "Failed to update status",
        );
      }

      await fetchOptions();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to update option status",
      );
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 text-slate-100 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Subscription Options
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Manage Premium subscription durations, prices, discounts, and availability.
          </p>
        </div>

        <button
          onClick={openCreateForm}
          className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        >
          + Add Option
        </button>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-950/50 p-4 text-sm text-emerald-400">
          {message}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-500/20 bg-rose-950/50 p-4 text-sm text-rose-400">
          {error}
        </div>
      )}

      {/* Form Card */}
      {showForm && (
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {editingId ? "Edit Subscription Option" : "Add Subscription Option"}
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Configure the Premium subscription option.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            {/* Plan */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Plan
              </label>
              <select
                required
                value={form.planId}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    planId: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" className="bg-slate-900">
                  Select plan
                </option>
                {plans
                  .filter((plan) => plan.isActive)
                  .map((plan) => (
                    <option key={plan.id} value={plan.id} className="bg-slate-900">
                      {plan.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Duration
              </label>
              <select
                required
                value={form.durationDays}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    durationDays: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="" className="bg-slate-900">
                  Select duration
                </option>
                <option value="30" className="bg-slate-900">
                  1 Month
                </option>
                <option value="90" className="bg-slate-900">
                  3 Months
                </option>
                <option value="180" className="bg-slate-900">
                  6 Months
                </option>
                <option value="365" className="bg-slate-900">
                  1 Year
                </option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Price (MMK)
              </label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.price}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
                placeholder="10000"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Discount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                Discount (%)
              </label>
              <input
                required
                type="number"
                min="0"
                max="100"
                step="1"
                value={form.discountPercent}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    discountPercent: event.target.value,
                  }))
                }
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-sm text-slate-100 outline-none transition-all focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Active Checkbox */}
            <div className="flex items-center gap-3 md:col-span-2">
              <input
                id="isActive"
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-slate-300">
                Active
              </label>
            </div>

            {/* Submit / Cancel Buttons */}
            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-slate-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Option"
                    : "Create Option"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Data Table Container */}
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-xl">
        {loading ? (
          <div className="p-10 text-center text-slate-400">
            Loading subscription options...
          </div>
        ) : options.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-slate-400">No subscription options found.</p>
            <button
              onClick={openCreateForm}
              className="mt-4 text-sm font-medium text-indigo-400 hover:text-indigo-300 hover:underline"
            >
              Add your first option
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-4 font-semibold">Plan</th>
                  <th className="px-5 py-4 font-semibold">Duration</th>
                  <th className="px-5 py-4 font-semibold">Price</th>
                  <th className="px-5 py-4 font-semibold">Discount</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800">
                {options.map((option) => (
                  <tr
                    key={option.id}
                    className="transition-colors hover:bg-slate-800/50"
                  >
                    <td className="px-5 py-4 font-medium text-white">
                      {option.plan?.name ?? `Plan #${option.planId}`}
                    </td>

                    <td className="px-5 py-4">
                      {formatDuration(option.durationDays)}
                    </td>

                    <td className="px-5 py-4 font-medium text-white">
                      {Number(option.price).toLocaleString()} MMK
                    </td>

                    <td className="px-5 py-4">
                      {option.discountPercent > 0 ? (
                        <span className="font-medium text-emerald-400">
                          {option.discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="text-slate-500">No discount</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleActive(option)}
                        className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${option.isActive
                            ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                          }`}
                      >
                        {option.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEditForm(option)}
                          className="text-indigo-400 transition-colors hover:text-indigo-300 hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(option)}
                          className="text-rose-400 transition-colors hover:text-rose-300 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}