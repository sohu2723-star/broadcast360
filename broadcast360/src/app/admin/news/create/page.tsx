"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Newspaper, Save } from "lucide-react";

export default function CreateNewsPage() {
  const router = useRouter();
  const [form, setForm] = useState({ title: "", type: "Recorded VIDEO", content: "", videoUrl: "", duration: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function createNews() {
    if (!form.title.trim()) {
      setError("Title is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, duration: form.duration ? Number(form.duration) : null }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || "News creation failed");
      router.push(`/admin/news/${result.data.id}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "News creation failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#010312] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-3xl">
        <Link href="/admin/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c5d7ee] hover:text-white"><ArrowLeft size={16} /> Back to News</Link>
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B1026] p-6 shadow-xl sm:p-8">
          <div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#7898bf]/15 text-[#c5d7ee]"><Newspaper size={22} /></div><div><p className="text-xs uppercase tracking-[0.25em] text-slate-500">Broadcast360</p><h1 className="text-2xl font-bold">Create News</h1></div></div>
          {error ? <div className="mt-5 rounded-xl border border-amber-200/20 bg-amber-100/5 px-4 py-3 text-sm text-amber-100">{error}</div> : null}
          <div className="mt-7 space-y-5">
            <label className="block text-sm font-medium text-slate-200">Title<input value={form.title} onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#08122f] px-4 py-3.5 text-white outline-none focus:border-[#7898bf]/70" /></label>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-200">Type<select value={form.type} onChange={(event) => setForm((previous) => ({ ...previous, type: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#08122f] px-4 py-3.5 text-white outline-none focus:border-[#7898bf]/70"><option>Recorded VIDEO</option><option>Bulletin</option><option>Live News</option></select></label><label className="block text-sm font-medium text-slate-200">Duration (seconds)<input type="number" min="0" value={form.duration} onChange={(event) => setForm((previous) => ({ ...previous, duration: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#08122f] px-4 py-3.5 text-white outline-none focus:border-[#7898bf]/70" /></label></div>
            <label className="block text-sm font-medium text-slate-200">Video URL (optional)<input type="url" value={form.videoUrl} onChange={(event) => setForm((previous) => ({ ...previous, videoUrl: event.target.value }))} placeholder="https://..." className="mt-2 w-full rounded-2xl border border-white/10 bg-[#08122f] px-4 py-3.5 text-white outline-none focus:border-[#7898bf]/70" /></label>
            <label className="block text-sm font-medium text-slate-200">Description (optional)<textarea rows={5} value={form.content} onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))} className="mt-2 w-full rounded-2xl border border-white/10 bg-[#08122f] px-4 py-3.5 text-white outline-none focus:border-[#7898bf]/70" /></label>
            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Link href="/admin/news" className="inline-flex items-center justify-center rounded-2xl border border-white/10 px-5 py-3 text-sm font-semibold text-slate-300 hover:bg-white/5">Cancel</Link><button type="button" onClick={createNews} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#4f6689] to-[#400FD3] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"><Save size={17} />{saving ? "Creating..." : "Create News"}</button></div>
          </div>
        </div>
      </div>
    </main>
  );
}
