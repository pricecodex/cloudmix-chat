"use client";

import { useState } from "react";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof LoginFormData, string>>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const formErrors: Partial<Record<keyof LoginFormData, string>> = {};
      result.error.errors.forEach((err) => {
        const fieldName = err.path[0] as keyof LoginFormData;
        formErrors[fieldName] = err.message;
      });
      setErrors(formErrors);
      return;
    }

    setErrors({});
    console.log("Login submitted:", formData);
    // TODO: Call backend API here
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center">Sign In</h1>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            name="username"
            type="text"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={formData.username}
            onChange={handleChange}
          />
          {errors.username && <p className="text-sm text-red-500 mt-1">{errors.username}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            name="password"
            type="password"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
        </div>

        <button type="submit" className="w-full rounded bg-blue-500 py-2 text-white hover:bg-blue-600 transition">
          Login
        </button>
      </form>
    </div>
  );
}
