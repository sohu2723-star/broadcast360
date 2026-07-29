"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import {
  validateClientImageRatio,
  ImageValidationResult,
} from "./client-image-validator";

type Props = {
  label: string;
  type: "POSTER" | "LANDSCAPE";
  value?: string;
  disabled?: boolean;
  maxSizeMB?: number;
  onChange: (file: File | null) => void;
};

export default function ImageUploader({
  label,
  type,
  value,
  disabled = false,
  maxSizeMB = 5,
  onChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [preview, setPreview] = useState<string | undefined>(value);

  const [validation, setValidation] = useState<ImageValidationResult | null>(
    null,
  );

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (value) {
      setPreview(value);
    }
  }, [value]);

  useEffect(() => {
    return () => {
      if (preview && preview.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function processFile(file: File) {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setValidation({
        valid: false,
        width: 0,
        height: 0,
        fileSize: file.size,
        expectedRatio: "",
        currentRatio: "",
        message: "Only JPG, PNG and WEBP images are allowed.",
      });

      onChange(null);

      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setValidation({
        valid: false,
        width: 0,
        height: 0,
        fileSize: file.size,
        expectedRatio: "",
        currentRatio: "",
        message: `Image size must be less than ${maxSizeMB}MB.`,
      });

      onChange(null);

      return;
    }

    const result = await validateClientImageRatio(file, type);

    setValidation(result);

    if (!result.valid) {
      setPreview(undefined);

      onChange(null);

      return;
    }

    const url = URL.createObjectURL(file);

    setPreview(url);

    onChange(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

    if (!file) return;

    processFile(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (file) {
      processFile(file);
    }
  }

  const recommended =
    type === "POSTER"
      ? "1000 × 1500 px (2:3 Portrait)"
      : "1920 × 1080 px (16:9 Landscape)";

  return (
    <div className="space-y-4 text-white">
      {/* 1. LABEL & RECOMMENDED INLINE */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-base font-semibold">{label}</label>

        {/* Recommended specs right next to/inline with label */}
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-300">Recommended:</span>
          <span>JPG/PNG/WEBP</span>
          <span>•</span>
          <span>Max {maxSizeMB}MB</span>
          <span>•</span>
          <span>{recommended}</span>
        </div>
      </div>

      {/* 2. DROPZONE AREA */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => {
          setDragging(false);
        }}
        onDrop={handleDrop}
        className={`flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition ${
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 bg-slate-900/40 hover:border-gray-500"
        }`}
      >
        {/* Drop image here and click to browse in ONE LINE */}
        <p className="text-sm text-gray-300">
          Drop image here or click to browse
        </p>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          disabled={disabled}
          onChange={handleChange}
        />
      </div>

      {/* 3. LOWER SECTION: THUMBNAIL (LEFT) & IMAGE INFO (RIGHT) */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* LEFT: THUMBNAIL PREVIEW */}
        <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-800 bg-slate-900/60 p-2">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={450}
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-sm font-medium text-gray-400">
              No Thumbnail
            </span>
          )}
        </div>

        {/* RIGHT: IMAGE INFORMATION */}
        <div className="flex h-64 flex-col justify-center rounded-xl border border-gray-800 bg-slate-900/60 p-5 text-sm">
          {validation ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-200">Image Information</h3>

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Dimensions</span>
                <span className="text-gray-200">
                  {validation.width}×{validation.height} px
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">File Size</span>
                <span className="font-mono text-gray-200">
                  {(validation.fileSize / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">Required</span>
                <span className="font-mono text-gray-200">
                  {validation.expectedRatio}
                </span>
              </div>

              <div className="pt-1">
                <span
                  className={
                    validation.valid
                      ? "font-semibold text-green-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {validation.valid ? "✅ Valid image" : "❌ Invalid image"}
                </span>

                {!validation.valid && (
                  <p className="mt-1 text-xs text-red-400">
                    {validation.message}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-400">
              <span>Upload an image to see details</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
