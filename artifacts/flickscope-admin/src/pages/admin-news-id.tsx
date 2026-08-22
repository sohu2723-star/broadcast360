import { Link, useParams } from 'wouter';
import { ArrowLeft, Calendar, Clock, Film, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function NewsDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/news/${id}`)
      .then(res => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then(data => {
        setItem(data.data || data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#010312] p-8 text-white">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </main>
    );
  }

  if (error || !item) {
    return <main className="min-h-screen bg-[#010312] p-8 text-white"><Link href="/news" className="inline-flex items-center gap-2 text-sm text-[#c5d7ee]"><ArrowLeft size={16} /> Back to News</Link><div className="mt-8 rounded-2xl border border-white/10 bg-[#0B1026] p-8">News item not found.</div></main>;
  }

  return (
    <main className="min-h-screen bg-[#010312] p-4 text-white sm:p-8">
      <div className="mx-auto max-w-4xl">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-[#c5d7ee] hover:text-white"><ArrowLeft size={16} /> Back to News</Link>
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B1026] p-6 shadow-xl sm:p-8">
          <div className="flex items-start gap-4"><div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#7898bf]/15 text-[#c5d7ee]"><Newspaper size={24} /></div><div><p className="text-xs uppercase tracking-[0.25em] text-slate-500">News detail</p><h1 className="mt-1 text-3xl font-bold">{item.title}</h1></div></div>
          <div className="mt-8 grid gap-4 sm:grid-cols-3"><div className="rounded-2xl border border-white/10 bg-[#08122f] p-4"><Film size={17} className="text-[#9fb8d5]" /><p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Type</p><p className="mt-1 font-semibold">{item.type}</p></div><div className="rounded-2xl border border-white/10 bg-[#08122f] p-4"><Clock size={17} className="text-[#9fb8d5]" /><p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Duration</p><p className="mt-1 font-semibold">{item.duration ? `${item.duration}s` : "-"}</p></div><div className="rounded-2xl border border-white/10 bg-[#08122f] p-4"><Calendar size={17} className="text-[#9fb8d5]" /><p className="mt-3 text-xs uppercase tracking-widest text-slate-500">Created</p><p className="mt-1 font-semibold">{new Date(item.createdAt).toLocaleString()}</p></div></div>
          {item.content ? <div className="mt-6 rounded-2xl border border-white/10 bg-[#08122f] p-5 text-sm leading-7 text-slate-300">{item.content}</div> : null}
          {item.videoUrl ? <a href={item.videoUrl} target="_blank" rel="noreferrer" className="mt-6 inline-flex rounded-2xl bg-gradient-to-r from-[#4f6689] to-[#400FD3] px-5 py-3 text-sm font-bold">Open media</a> : null}
        </div>
      </div>
    </main>
  );
}