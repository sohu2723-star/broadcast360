"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

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

  // Prevent browser from opening after drop
  const justDroppedRef = useRef(false);

  // Remember whether browser file picker is open
  const pickerOpenRef = useRef(false);

  // Cancel detection timer
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const [preview, setPreview] = useState<string | undefined>(
    value,
  );

  const [validation, setValidation] =
    useState<ImageValidationResult | null>(null);

  const [dragging, setDragging] = useState(false);

  /* =====================================================
     SYNC PARENT VALUE
  ===================================================== */

  useEffect(() => {
    setPreview(value);
  }, [value]);

  /* =====================================================
     CLEAR IMAGE
  ===================================================== */

  const clearImage = useCallback(() => {
    setPreview((oldPreview) => {
      if (oldPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(oldPreview);
      }

      return undefined;
    });

    setValidation(null);

    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [onChange]);

  /* =====================================================
     ESC = CLEAR DROPPED / SELECTED IMAGE
  ===================================================== */

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key !== "Escape") {
        return;
      }

      /*
       * If image is already previewed,
       * pressing ESC removes it.
       */
      if (preview) {
        clearImage();
      }
    }

    window.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [preview, clearImage]);

  /* =====================================================
     CLEANUP
  ===================================================== */

  useEffect(() => {
    return () => {
      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
      }

      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  /* =====================================================
     PROCESS IMAGE
  ===================================================== */

  async function processFile(file: File) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    /* ---------------------------------------------
       WRONG FORMAT
    --------------------------------------------- */

    if (!allowedTypes.includes(file.type)) {
      setPreview(undefined);

      setValidation({
        valid: false,
        width: 0,
        height: 0,
        fileSize: file.size,
        expectedRatio: "",
        currentRatio: "",
        message:
          "Only JPG, PNG and WEBP images are allowed.",
      });

      onChange(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    /* ---------------------------------------------
       WRONG SIZE
    --------------------------------------------- */

    if (file.size > maxSizeMB * 1024 * 1024) {
      setPreview(undefined);

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

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    /* ---------------------------------------------
       CHECK IMAGE RATIO
    --------------------------------------------- */

    const result =
      await validateClientImageRatio(file, type);

    setValidation(result);

    /* ---------------------------------------------
       WRONG RATIO
    --------------------------------------------- */

    if (!result.valid) {
      setPreview(undefined);

      onChange(null);

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    /* ---------------------------------------------
       VALID IMAGE
    --------------------------------------------- */

    setPreview((oldPreview) => {
      if (oldPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(oldPreview);
      }

      return undefined;
    });

    const url = URL.createObjectURL(file);

    setPreview(url);

    onChange(file);
  }

  /* =====================================================
     BROWSER FILE CHANGE
  ===================================================== */

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0];

    /*
     * User selected an image
     */
    if (file) {
      pickerOpenRef.current = false;

      if (cancelTimerRef.current) {
        clearTimeout(cancelTimerRef.current);
        cancelTimerRef.current = null;
      }

      processFile(file);

      return;
    }

    /*
     * User pressed Browser Cancel
     */
    pickerOpenRef.current = false;

    clearImage();
  }

  /* =====================================================
     DETECT BROWSER CANCEL
  ===================================================== */

  function handleWindowFocus() {
    if (!pickerOpenRef.current) {
      return;
    }

    if (cancelTimerRef.current) {
      clearTimeout(cancelTimerRef.current);
    }

    cancelTimerRef.current = setTimeout(() => {
      const input = inputRef.current;

      if (!input) {
        return;
      }

      /*
       * No file selected
       * = Browser Cancel
       */
      if (
        !input.files ||
        input.files.length === 0
      ) {
        clearImage();
      }

      pickerOpenRef.current = false;
      cancelTimerRef.current = null;
    }, 300);
  }

  /* =====================================================
     OPEN BROWSER
  ===================================================== */

  function openBrowser() {
    const input = inputRef.current;

    if (!input || disabled) {
      return;
    }

    /*
     * Reset input.
     *
     * This allows selecting the same
     * image again.
     */
    input.value = "";

    pickerOpenRef.current = true;

    window.addEventListener(
      "focus",
      handleWindowFocus,
    );

    input.click();
  }

  /* =====================================================
     DROPZONE CLICK
  ===================================================== */

  function handleClick() {
    /*
     * IMPORTANT:
     *
     * Drop ဖြစ်ပြီးနောက် automatic click
     * ကို ignore လုပ်မယ်။
     *
     * ဒါကြောင့် Drop တစ်ခါတည်းနဲ့
     * Preview ပေါ်မယ်။
     *
     * Browser မဖွင့်ဘူး။
     */
    if (justDroppedRef.current) {
      justDroppedRef.current = false;
      return;
    }

    openBrowser();
  }

  /* =====================================================
     DRAG OVER
  ===================================================== */

  function handleDragOver(
    e: React.DragEvent<HTMLDivElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (!disabled) {
      setDragging(true);
    }
  }

  /* =====================================================
     DRAG LEAVE
  ===================================================== */

  function handleDragLeave(
    e: React.DragEvent<HTMLDivElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();

    setDragging(false);
  }

  /* =====================================================
     DROP
  ===================================================== */

  function handleDrop(
    e: React.DragEvent<HTMLDivElement>,
  ) {
    e.preventDefault();
    e.stopPropagation();

    if (disabled) {
      return;
    }

    /*
     * Prevent browser from opening
     * after dropping.
     */
    justDroppedRef.current = true;

    setDragging(false);

    const file = e.dataTransfer.files?.[0];

    if (!file) {
      return;
    }

    /*
     * ONE DROP = ONE IMAGE
     */
    processFile(file);
  }

  /* =====================================================
     RECOMMENDED
  ===================================================== */

  const recommended =
    type === "POSTER"
      ? "1000 × 1500 px (2:3 Portrait)"
      : "1920 × 1080 px (16:9 Landscape)";

  return (
    <div className="space-y-4 text-white">
      {/* =================================================
          LABEL
      ================================================= */}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-base font-semibold">
          {label}
        </label>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="font-semibold text-gray-300">
            Recommended:
          </span>

          <span>JPG/PNG/WEBP</span>

          <span>•</span>

          <span>Max {maxSizeMB}MB</span>

          <span>•</span>

          <span>{recommended}</span>
        </div>
      </div>

      {/* =================================================
          DROPZONE
      ================================================= */}

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex h-48 w-full cursor-pointer items-center justify-center rounded-xl border-2 border-dashed transition ${
          dragging
            ? "border-blue-500 bg-blue-500/10"
            : "border-gray-600 bg-slate-900/40 hover:border-gray-500"
        }`}
      >
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

      {/* =================================================
          PREVIEW + INFORMATION
      ================================================= */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* =================================================
            THUMBNAIL
        ================================================= */}

        <div className="flex h-64 items-center justify-center overflow-hidden rounded-xl border border-gray-800 bg-slate-900/60 p-2">
          {preview ? (
            <Image
              src={preview}
              alt="Preview"
              width={300}
              height={450}
              className="h-full w-full object-contain"
              unoptimized
            />
          ) : (
            <span className="text-sm font-medium text-gray-400">
              No Thumbnail
            </span>
          )}
        </div>

        {/* =================================================
            IMAGE INFORMATION
        ================================================= */}

        <div className="flex h-64 flex-col justify-center rounded-xl border border-gray-800 bg-slate-900/60 p-5 text-sm">
          {validation ? (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-200">
                Image Information
              </h3>

              {/* DIMENSIONS */}

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">
                  Dimensions
                </span>

                <span className="text-gray-200">
                  {validation.width}×
                  {validation.height} px
                </span>
              </div>

              {/* FILE SIZE */}

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">
                  File Size
                </span>

                <span className="font-mono text-gray-200">
                  {(
                    validation.fileSize /
                    1024 /
                    1024
                  ).toFixed(2)}{" "}
                  MB
                </span>
              </div>

              {/* REQUIRED */}

              <div className="flex justify-between border-b border-gray-800 pb-2">
                <span className="text-gray-400">
                  Required
                </span>

                <span className="font-mono text-gray-200">
                  {validation.expectedRatio}
                </span>
              </div>

              {/* VALIDATION */}

              <div className="pt-1">
                <span
                  className={
                    validation.valid
                      ? "font-semibold text-green-400"
                      : "font-semibold text-red-400"
                  }
                >
                  {validation.valid
                    ? "✅ Valid image"
                    : "❌ Invalid image"}
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
              <span>
                Upload an image to see details
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}