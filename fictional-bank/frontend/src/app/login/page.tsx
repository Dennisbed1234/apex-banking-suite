"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch, setCustomerToken } from "@/lib/api";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch<{ accessToken: string }>("/auth/login", {
        method: "POST",
        body: data,
      });
      setCustomerToken(res.accessToken);
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full">
        <h1 className="text-2xl font-bold text-bank-blue mb-6">Customer Login</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-bank-grayDark p-6 rounded-xl shadow-sm">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register("email", { required: true })} type="email" className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input {...register("password", { required: true })} type="password" className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight transition-colors disabled:opacity-60">
            {loading ? "Signing in…" : "Sign In"}
          </button>
          <p className="text-sm text-center">
            No account? <Link href="/register" className="text-bank-blue font-medium">Register</Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
