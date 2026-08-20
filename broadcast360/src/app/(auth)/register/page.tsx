"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type FormData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function RegisterPage() {
  const router = useRouter();
  
  const [form, setForm] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  /*
    Validation starts only
    after first submit attempt
  */
  const [submitted, setSubmitted] = useState(false);

  // -----------------------
  // Validation
  // -----------------------

  function validate(field: keyof FormData, values: FormData): string {
    const value = values[field].trim();

    switch (field) {
      case "name":
        if (!value) return "Name is required.";

        if (value.length < 2) return "Name must be at least 2 characters.";

        return "";

      case "email":
        if (!value) return "Email is required.";

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Invalid email format.";
        }

        if (!value.toLowerCase().endsWith("@gmail.com")) {
          return "Only Gmail accounts are allowed.";
        }

        return "";

      case "password":
        if (!value) return "Password is required.";

        if (value.length < 8) return "Minimum 8 characters.";

        if (!/[A-Z]/.test(value)) return "Need one uppercase letter.";

        if (!/[a-z]/.test(value)) return "Need one lowercase letter.";

        if (!/[0-9]/.test(value)) return "Need one number.";

        if (!/[^A-Za-z0-9]/.test(value)) return "Need one special character.";

        return "";

      case "confirmPassword":
        if (!value) return "Please confirm password.";

        if (value !== values.password) return "Passwords do not match.";

        return "";
    }
  }

  // -----------------------
  // Validate One Field
  // -----------------------

  function validateField(field: keyof FormData, values: FormData) {
    const message = validate(field, values);

    setErrors((prev) => ({
      ...prev,
      [field]: message || undefined,
    }));
  }

  // -----------------------
  // Validate All
  // -----------------------

  function validateAll(values: FormData) {
    const nextErrors: FormErrors = {};

    (Object.keys(values) as (keyof FormData)[]).forEach((field) => {
      const message = validate(field, values);

      if (message) {
        nextErrors[field] = message;
      }
    });

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  // -----------------------
  // Change
  // -----------------------

  function handleChange(field: keyof FormData, value: string) {
    const next = {
      ...form,
      [field]: value,
    };

    setForm(next);

    if (!submitted) return;

    validateField(field, next);

    if (field === "password" && next.confirmPassword) {
      validateField("confirmPassword", next);
    }
  }

  // -----------------------
  // Blur
  // -----------------------

  function handleBlur(field: keyof FormData) {
    if (!submitted) return;

    validateField(field, form);
  }

  // -----------------------
  // Submit (API later)
  // -----------------------

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setSubmitted(true);

    const ok = validateAll(form);

    if (!ok) return;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log(data);
        return;
      }

      // success
      router.push("/login");
    } catch (error) {
      console.error(error);
    }
  }

  // -----------------------
  // Input Border
  // -----------------------

  function border(field: keyof FormData) {
    if (!submitted) return "border-white/10";

    if (errors[field]) return "border-red-500";

    return "border-green-500";
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#060A1B] px-6">
      <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111936] p-10 shadow-2xl">
        <h1 className="mb-2 text-center text-4xl font-bold text-white">
          Create Account
        </h1>

        <p className="mb-8 text-center text-gray-400">
          Register your Hxu Movie account
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {[
            {
              key: "name",
              label: "Name",
              type: "text",
            },
            {
              key: "email",
              label: "Email",
              type: "email",
            },
            {
              key: "password",
              label: "Password",
              type: "password",
            },
            {
              key: "confirmPassword",
              label: "Confirm Password",
              type: "password",
            },
          ].map((item) => (
            <div key={item.key}>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                {item.label}
              </label>

              <input
                type={item.type}
                value={form[item.key as keyof FormData]}
                onChange={(e) =>
                  handleChange(item.key as keyof FormData, e.target.value)
                }
                onBlur={() => handleBlur(item.key as keyof FormData)}
                className={`w-full rounded-xl border bg-[#0B1026] px-4 py-3 text-white transition-all duration-200 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 ${border(
                  item.key as keyof FormData,
                )}`}
              />

              <div className="mt-1 min-h-[20px]">
                {errors[item.key as keyof FormData] && (
                  <p className="text-sm text-red-400">
                    {errors[item.key as keyof FormData]}
                  </p>
                )}
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-blue-600 py-3 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            Register
          </button>
        </form>

        <p className="mt-8 text-center text-gray-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-400 hover:text-blue-300"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
