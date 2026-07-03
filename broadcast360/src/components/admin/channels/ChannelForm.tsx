"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { countries } from "@/lib/constants/countries";
import { ChannelFormData } from "@/types/channel";
import {
  createChannelSchema,
  updateChannelSchema,
} from "@/lib/validators/channel.validator";

type ChannelFormProps = {
  mode: "create" | "edit";
  initialData?: ChannelFormData;
};

export default function ChannelForm({ mode, initialData }: ChannelFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [country, setCountry] = useState(initialData?.country ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [logo, setLogo] = useState<File | null>(null);

  const [logoUrl, setLogoUrl] = useState(initialData?.logo ?? "");
  const [preview, setPreview] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  async function uploadLogo() {
    if (!logo) return logoUrl;

    const form = new FormData();

    form.append("file", logo);

    const res = await fetch("/api/upload/logo", {
      method: "POST",
      body: form,
    });

    const data = await res.json();

    return data.url;
  }

  async function submit() {
    setErrors({});
    const uploadedLogo = await uploadLogo();
    const payload = {
      name,
      country,
      description,
      logo: uploadedLogo,
    };

    const validation =
      mode === "create"
        ? createChannelSchema.safeParse(payload)
        : updateChannelSchema.safeParse(payload);

    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;

      setErrors({
        name: fieldErrors.name?.[0] ?? "",
        country: fieldErrors.country?.[0] ?? "",
        description: fieldErrors.description?.[0] ?? "",
        logo: fieldErrors.logo?.[0] ?? "",
      });
      return;
    }
    if (mode === "create") {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          name: data.error || "Something went wrong",
        });

        return;
      }
    } else {
      await fetch(`/api/channels/${initialData?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
    }
    router.push("/admin/channels");
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {mode === "create" ? "Create Channel" : "Edit Channel"}
      </h1>
      <div
        className="
        bg-[#0B1026]
        p-8
        rounded-2xl
        space-y-5
        max-w-xl
      "
      >
        <div>
          <label className="block mb-2">Channel Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="
            w-full
            p-3
            bg-[#010312]
            rounded-xl
            "
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block mb-2">Country</label>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="
            w-full
            p-3
            bg-[#010312]
            rounded-xl
            "
          >
            <option value="">Select Country</option>

            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country}</p>
          )}
        </div>
        <div>
          <label className="block mb-2">Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="
            w-full
            p-3
            bg-[#010312]
            rounded-xl
            "
          />
          {errors.description && (
            <p className="text-red-500 text-sm">{errors.description}</p>
          )}
        </div>

        <div>
          <label className="block mb-2">Logo</label>
          {(logoUrl || preview) && (
            <Image
              src={preview || logoUrl}
              alt="logo"
              width={90}
              height={90}
              className="
              rounded-xl
              mb-3
              object-cover
              "
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];

              if (!file) return;

              if (!file.type.startsWith("image/")) {
                setErrors({
                  logo: "Only image files allowed",
                });

                return;
              }
              setLogo(file);

              setPreview(URL.createObjectURL(file));
            }}
          />

          {errors.logo && <p className="text-red-500 text-sm">{errors.logo}</p>}
        </div>
        <div className="flex gap-4">
          <button
            onClick={submit}
            className="
            bg-[#106EE9]
            px-6
            py-3
            rounded-xl
            "
          >
            {mode === "create" ? "Save" : "Update"}
          </button>
          <button
            onClick={() => router.push("/admin/channels")}
            className="
            bg-[#F41010]
            px-6
            py-3
            rounded-xl
            "
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}