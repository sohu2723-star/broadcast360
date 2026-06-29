import React from "react";
import AdvertisementForm from "@/components/admin/advertisements/advertisementForm";

export default function CreateAdvertisementPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-6">Create New Advertisement</h1>
      <AdvertisementForm />
    </div>
  );
}