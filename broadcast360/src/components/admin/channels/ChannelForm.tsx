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
import { uploadAdminFileDirect } from "@/lib/media/direct-upload";

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

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function uploadLogo() {
    if (!logo) {
      return logoUrl;
    }

    const upload = await uploadAdminFileDirect(logo, "logos");
    return upload.publicUrl;
  }

  async function submit(event?: React.FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    if (isSubmitting) return;

    setErrors({});
    setIsSubmitting(true);

    try {
      const uploadedLogo = await uploadLogo();

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
    } catch (error) {
      setErrors({
        logo: error instanceof Error ? error.message : "Unable to save channel",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-bold">
        {mode === "create"
          ? "Create Channel"
          : "Edit Channel"}
      </h1>

      <form onSubmit={submit} className="max-w-xl space-y-5 rounded-2xl bg-[#0B1026] p-8">

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
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              if (!file) return;

              if (!file.type.match(/^image\/(png|jpeg|webp)$/)) {
                setLogo(null);
                setErrors((prev) => ({
                  ...prev,
                  logo: "Choose a PNG, JPG, or WEBP image",
                }));
                return;
              }

              if (file.size > 5 * 1024 * 1024) {
                setLogo(null);
                setErrors((prev) => ({
                  ...prev,
                  logo: "Logo must be 5 MB or smaller",
                }));
                return;
              }

              if (preview.startsWith("blob:")) URL.revokeObjectURL(preview);
              setLogo(file);
              setErrors((prev) => ({ ...prev, logo: "" }));
              setPreview(URL.createObjectURL(file));
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
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-[#4f6689] px-6 py-3 transition hover:bg-[#617fa8] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : mode === "create" ? "Create Channel" : "Save Changes"}
          </button>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => router.push("/admin/channels")}
            className="rounded-xl bg-red-500/90 px-6 py-3 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
            </form>
    </div>
  );
}
