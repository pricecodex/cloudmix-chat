"use client";

import { useRouter } from "next/navigation";
import useMutation from "@/hooks/use-mutation";
import useSession from "@/hooks/use-session";
import { AuthorizeSessionDto } from "@/entities/session/dtos/authorize-session.dto";
import { findUserDto } from "@/entities/user/dtos/find-user.dto";
import { ApiRoute, ClientRoute } from "@/types/route";
import prevent from "@/utils/event";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { set: setSession } = useSession();

  const { mutate, formData, setFormData, errors } = useMutation<typeof findUserDto, AuthorizeSessionDto>({
    schema: findUserDto,
    path: ApiRoute.Login,
    formData: { username: "", password: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = prevent(async () => {
    const { isValid, result } = await mutate();

    if (isValid && result) {
      setSession(result);
      router.push(ClientRoute.ChatList);
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <h1 className="mb-6 text-center text-2xl font-bold">Sign In</h1>

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

        <div className="mb-6">
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
          Login
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don’t have an account?{" "}
          <Link href="/register" className="text-blue-500 hover:underline">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}
