"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { updateChannelSchema } from "@/lib/validators/channel.validator";
import { countries } from "@/lib/constants/countries";

export default function EditChannel({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();

  const [id, setId] = useState("");

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");

  const [logoUrl, setLogoUrl] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    async function load() {
      const { id } = await params;
      setId(id);

      const res = await fetch(`/api/channels/${id}`);
      const data = await res.json();

      setName(data.name || "");
      setCountry(data.country || "");
      setDescription(data.description || "");
      setLogoUrl(data.logo || "");
    }

    load();
  }, [params]);

  /* ================= UPLOAD LOGO ================= */
  async function uploadLogo() {
    if (!logo) return logoUrl;

    const formData = new FormData();
    formData.append("file", logo);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    return data.url;
  }

  /* ================= UPDATE ================= */
  async function update() {
    setErrors({});

    const newLogoUrl = logo ? await uploadLogo() : logoUrl;

    const payload = {
      name,
      country,
      description,
      logo: newLogoUrl,
    };

    const result = updateChannelSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] || "",
        country: fieldErrors.country?.[0] || "",
        description: fieldErrors.description?.[0] || "",
        logo: fieldErrors.logo?.[0] || "",
      });

      return;
    }

    await fetch(`/api/channels/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    router.push("/admin/channels");
  }

  /* ================= UI ================= */
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Edit Channel</h1>

      <div className="bg-[#0B1026] p-8 rounded-2xl max-w-xl space-y-5 border border-white/10">

        {/* NAME */}
        <div>
          <label className="block mb-2">Channel Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* COUNTRY (FIXED SELECT) */}
        <div>
          <label className="block mb-2">Country</label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"
          >
            <option value="">Select Country</option>

            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {errors.country && (
            <p className="text-red-500 text-sm mt-1">{errors.country}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block mb-2">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* LOGO */}
        <div>
          <label className="block mb-2">Logo</label>

          {logoUrl && (
            <div className="mb-4">
              <p className="mb-2 text-sm text-gray-400">
                Current Logo
              </p>

              <Image
                src={logoUrl}
                alt="Channel Logo"
                width={96}
                height={96}
                className="rounded-xl object-cover border border-white/10"
              />
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (!file.type.startsWith("image/")) {
                setErrors({ logo: "Only image files are allowed" });
                return;
              }

              setLogo(file);
              setErrors((prev) => ({ ...prev, logo: "" }));
            }}
            className="w-full p-3 bg-[#010312] rounded-xl border border-white/10"
          />

          {logo && (
            <p className="mt-2 text-sm text-green-400">
              Selected: {logo.name}
            </p>
          )}

          {errors.logo && (
            <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={update}
            className="bg-[#106EE9] px-6 py-3 rounded-xl font-semibold hover:opacity-80"
          >
            Update
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/channels")}
            className="bg-[#F41010] px-6 py-3 rounded-xl font-semibold hover:opacity-80"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}