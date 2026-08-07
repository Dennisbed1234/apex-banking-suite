"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { apiFetch, setAdminToken } from "@/lib/api";

// This route is intentionally excluded from Navbar/Footer and any public
// sitemap. It is only reachable by typing the URL directly. In production,
// consider additionally restricting it by IP allowlist or VPN at the
// infrastructure level.

type FormData = { username: string; password: string };

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/admin/login", {
        method: "POST",
        body: data,
      });
      setAdminToken(res.accessToken);
      router.push("/admin-portal/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-bank-grayDark flex items-center justify-center px-4">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white dark:bg-gray-900 rounded-xl p-8 shadow-lg w-full max-w-sm space-y-4">
        <h1 className="text-xl font-bold text-bank-blue">Administrator Portal</h1>
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input {...register("username", { required: true })} className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input {...register("password", { required: true })} type="password" className="w-full border rounded-lg px-3 py-2 dark:bg-gray-800 dark:border-gray-600" />
        </div>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button disabled={loading} type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight disabled:opacity-60">
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p className="text-xs text-gray-400 text-center">Authorized personnel only. All access is logged.</p>
      </form>
    </main>
  );
}
