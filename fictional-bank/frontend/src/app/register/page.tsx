"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { apiFetch } from "@/lib/api";

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
};

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/auth/register", { method: "POST", body: data });
      router.push("/login");
    } catch (e: any) {
      setError(e.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-md mx-auto px-4 py-16 w-full">
        <h1 className="text-2xl font-bold text-bank-blue mb-6">Open a Demo Account</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white dark:bg-bank-grayDark p-6 rounded-xl shadow-sm">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">First name</label>
              <input {...register("firstName", { required: true })} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last name</label>
              <input {...register("lastName", { required: true })} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input {...register("email", { required: true })} type="email" className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone (optional)</label>
            <input {...register("phone")} className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input {...register("password", { required: true, minLength: 8 })} type="password" className="w-full border rounded-lg px-3 py-2 dark:bg-bank-grayDark dark:border-gray-600" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button disabled={loading} type="submit" className="w-full bg-bank-blue text-white rounded-lg py-2 font-semibold hover:bg-bank-blueLight transition-colors disabled:opacity-60">
            {loading ? "Creating account…" : "Create Account"}
          </button>
          <p className="text-sm text-center">
            Already have an account? <Link href="/login" className="text-bank-blue font-medium">Login</Link>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
}
