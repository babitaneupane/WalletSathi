"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import { Mail, Lock, ArrowRight, Wallet } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, { id: res.data.id, name: res.data.name, email: res.data.email });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fc] to-[#e6e8f4]">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
          <Wallet className="h-8 w-8 text-primary" />
          FinFlow
        </div>
        <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">
          The future of autonomous financial management
        </p>
      </div>

      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
          <p className="text-sm text-slate-500 mt-1">
            Secure access to your AI-powered dashboard
          </p>
        </div>



        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-200"></div>
          <span className="mx-4 text-xs uppercase text-slate-400 font-medium">OR</span>
          <div className="flex-1 border-t border-slate-200"></div>
        </div>

        {error && <div className="mb-4 text-sm text-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <Link href="#" className="text-xs text-primary hover:underline">Forgot?</Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30 mt-6"
          >
            Continue <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 flex gap-6 text-xs text-slate-400">
        <Link href="#">Privacy Policy</Link>
        <Link href="#">Terms of Service</Link>
        <Link href="#">Contact Support</Link>
      </div>
    </div>
  );
}
