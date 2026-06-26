"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { countries } from "@/lib/constants/countries";
import { createChannelSchema } from "@/lib/validators/channel.validator";

export default function CreateChannel() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const [description, setDescription] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function uploadLogo() {
    if (!logo) return "";

    const form = new FormData();
    form.append("file", logo);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    return data.url;
  }

  async function createChannel() {
    setErrors({});

    const logoUrl = logo ? await uploadLogo() : "";

    const payload = {
      name,
      country,
      description,
      logo: logoUrl,
    };

    // ZOD VALIDATION (IMPORTANT FIX)
    const result = createChannelSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] || "",
        country: fieldErrors.country?.[0] || "",
        logo: fieldErrors.logo?.[0] || "",
        description: fieldErrors.description?.[0] || "",
      });

      return;
    }

    await fetch("/api/channels", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    router.push("/admin/channels");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Create Channel</h1>

      <div className="bg-[#0B1026] p-8 rounded-2xl space-y-5 max-w-xl">

        {/* NAME */}
        <div>
          <input
            placeholder="Channel name"
            className="w-full p-3 bg-[#010312] rounded-xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* COUNTRY */}
        <div>
          <select
            className="w-full p-3 bg-[#010312] rounded-xl text-white"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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

        {/* LOGO */}
        <div>
          <label className="block mb-2">Channel Logo</label>

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
              setLogoPreview(URL.createObjectURL(file));

              setErrors((prev) => ({ ...prev, logo: "" }));
            }}
            className="w-full p-3 bg-[#010312] rounded-xl"
          />

          {errors.logo && (
            <p className="text-red-500 text-sm mt-1">{errors.logo}</p>
          )}

          {logoPreview && (
            <img
              src={logoPreview}
              className="w-20 h-20 mt-2 rounded-lg object-cover"
            />
          )}
        </div>

        {/* DESCRIPTION */}
        <div>
          <textarea
            placeholder="Description"
            className="w-full p-3 bg-[#010312] rounded-xl"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description}
            </p>
          )}
        </div>

        {/* BUTTONS */}
        <div className="flex gap-4">
          <button
            onClick={createChannel}
            className="bg-[#1CFE10] text-black px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            Save
          </button>

          <button
            type="button"
            onClick={() => router.push("/admin/channels")}
            className="bg-[#F41010] px-6 py-3 rounded-xl font-bold hover:opacity-80"
          >
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}