"use client";

import { MAX_SHORT_VARCHAR } from "@/server/shared/constants";
import { useState } from "react";
import { z } from "zod";

const registerSchema = z.object({
  username: z.string(),
  password: z.string().nonempty().max(MAX_SHORT_VARCHAR),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(formData);
    if (!result.success) {
      const formErrors: Partial<Record<keyof RegisterFormData, string>> = {};
      result.error.issues.forEach((err) => {
        const fieldName = err.path[0] as keyof RegisterFormData;
        formErrors[fieldName] = err.message;
      });
      setErrors(formErrors);
      return;
    }

    setErrors({});
    const res = await fetch("/api/register", {
      method: "POST",
      body: JSON.stringify(formData),
    });

    const { data } = await res.json();
    console.log("data", data);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Create Account</h1>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            name="username"
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="mt-1 text-sm text-red-500">{errors.username}</p>}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            name="password"
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
        </div>

        <button type="submit" className="w-full rounded bg-blue-500 py-2 text-white transition hover:bg-blue-600">
          Sign Up
        </button>
      </form>
    </div>
  );
}
