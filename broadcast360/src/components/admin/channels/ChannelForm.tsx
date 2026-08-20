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

export default function ChannelForm({
  mode,
  initialData,
}: ChannelFormProps) {
  const router = useRouter();

  const [name, setName] = useState(
    initialData?.name ?? "",
  );

  const [country, setCountry] = useState(
    initialData?.country ?? "",
  );

  const [description, setDescription] =
    useState(
      initialData?.description ?? "",
    );

  const [accessType, setAccessType] =
    useState<"FREE" | "PREMIUM">(
      initialData?.accessType ?? "FREE",
    );

  const [logo, setLogo] =
    useState<File | null>(null);

  const [logoUrl, setLogoUrl] = useState(
    initialData?.logo ?? "",
  );

  const [preview, setPreview] =
    useState("");

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  async function uploadLogo() {
    if (!logo) {
      return logoUrl;
    }

    const form = new FormData();

    form.append("file", logo);

    const res = await fetch(
      "/api/upload/logo",
      {
        method: "POST",
        body: form,
      },
    );

    const data = await res.json();

    return data.url;
  }

  async function submit() {
    setErrors({});

    const uploadedLogo =
      await uploadLogo();

    const payload = {
      name,
      country,
      description,
      logo: uploadedLogo,
      accessType,
    };

    const validation =
      mode === "create"
        ? createChannelSchema.safeParse(
            payload,
          )
        : updateChannelSchema.safeParse(
            payload,
          );

    if (!validation.success) {
      const fieldErrors =
        validation.error.flatten()
          .fieldErrors;

      setErrors({
        name:
          fieldErrors.name?.[0] ?? "",

        country:
          fieldErrors.country?.[0] ?? "",

        description:
          fieldErrors.description?.[0] ??
          "",

        logo:
          fieldErrors.logo?.[0] ?? "",

        accessType:
          fieldErrors.accessType?.[0] ??
          "",
      });

      return;
    }

    if (mode === "create") {
      const res = await fetch(
        "/api/channels",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload,
          ),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          name:
            data.error ||
            "Something went wrong",
        });

        return;
      }
    } else {
      const res = await fetch(
        `/api/channels/${initialData?.id}`,
        {
          method: "PUT",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify(
            payload,
          ),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        setErrors({
          name:
            data.error ||
            data.message ||
            "Something went wrong",
        });

        return;
      }
    }

    router.push("/admin/channels");
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        {mode === "create"
          ? "Create Channel"
          : "Edit Channel"}
      </h1>

      <div className="max-w-xl space-y-5 rounded-2xl bg-[#0B1026] p-8">

        {/* CHANNEL NAME */}

        <div>
          <label className="mb-2 block">
            Channel Name
          </label>

          <input
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            className="w-full rounded-xl bg-[#010312] p-3"
          />

          {errors.name && (
            <p className="text-sm text-red-500">
              {errors.name}
            </p>
          )}
        </div>

        {/* COUNTRY */}

        <div>
          <label className="mb-2 block">
            Country
          </label>

          <select
            value={country}
            onChange={(e) =>
              setCountry(e.target.value)
            }
            className="w-full rounded-xl bg-[#010312] p-3"
          >
            <option value="">
              Select Country
            </option>

            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {errors.country && (
            <p className="text-sm text-red-500">
              {errors.country}
            </p>
          )}
        </div>

        {/* DESCRIPTION */}

        <div>
          <label className="mb-2 block">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) =>
              setDescription(
                e.target.value,
              )
            }
            rows={4}
            className="w-full rounded-xl bg-[#010312] p-3"
          />

          {errors.description && (
            <p className="text-sm text-red-500">
              {errors.description}
            </p>
          )}
        </div>

        {/* ACCESS TYPE */}

        <div>
          <label className="mb-2 block">
            Channel Access
          </label>

          <select
            value={accessType}
            onChange={(e) =>
              setAccessType(
                e.target.value as
                  | "FREE"
                  | "PREMIUM",
              )
            }
            className="w-full rounded-xl bg-[#010312] p-3"
          >
            <option value="FREE">
              FREE
            </option>

            <option value="PREMIUM">
              PREMIUM
            </option>
          </select>

          {errors.accessType && (
            <p className="text-sm text-red-500">
              {errors.accessType}
            </p>
          )}

          <p className="mt-2 text-sm text-gray-500">
            FREE channels are available to
            normal users. PREMIUM channels
            require an active Premium
            subscription.
          </p>
        </div>

        {/* LOGO */}

        <div>
          <label className="mb-2 block">
            Logo
          </label>

          {(logoUrl || preview) && (
            <Image
              src={preview || logoUrl}
              alt="logo"
              width={90}
              height={90}
              className="mb-3 rounded-xl object-cover"
            />
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file =
                e.target.files?.[0];

              if (!file) return;

              if (
                !file.type.startsWith(
                  "image/",
                )
              ) {
                setErrors({
                  logo:
                    "Only image files allowed",
                });

                return;
              }

              setLogo(file);

              setPreview(
                URL.createObjectURL(
                  file,
                ),
              );
            }}
          />

          {errors.logo && (
            <p className="text-sm text-red-500">
              {errors.logo}
            </p>
          )}
        </div>

        {/* BUTTONS */}

        <div className="flex gap-4">
          <button
            onClick={submit}
            className="rounded-xl bg-[#4f6689] px-6 py-3"
          >
            {mode === "create"
              ? "Save"
              : "Update"}
          </button>

          <button
            onClick={() =>
              router.push(
                "/admin/channels",
              )
            }
            className="rounded-xl bg-[#F41010] px-6 py-3"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}