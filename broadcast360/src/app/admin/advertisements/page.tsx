import React from "react";
import Link from "next/link";

export default function AdvertisementsPage() {
  return (
    <div className="p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Advertisements</h1>
        <Link href="/admin/advertisements/create" className="px-4 py-2 bg-indigo-600 rounded-lg text-sm">
          + Create New
        </Link>
      </div>
      <p className="text-slate-400">Advertisement lists will be shown here.</p>
    </div>
  );
}