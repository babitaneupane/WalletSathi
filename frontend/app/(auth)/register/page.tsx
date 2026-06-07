"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import { User as UserIcon, Mail, Lock, ArrowRight, Wallet } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await api.post("/auth/register", { name, email, password });
      login(res.data.token, { id: res.data.id, name: res.data.name, email: res.data.email });
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#f8f9fc] to-[#e6e8f4] py-12">
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-2 text-2xl font-bold text-primary mb-2">
          <Wallet className="h-8 w-8 text-primary" />
          FinFlow
        </div>
        <p className="text-sm text-slate-500 uppercase tracking-widest font-medium text-center">
          Join the future of autonomous financial management
        </p>
      </div>

      <div className="glass w-full max-w-md rounded-2xl p-8 shadow-xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Create an Account</h1>
          <p className="text-sm text-slate-500 mt-1">
            Setup your AI-powered dashboard
          </p>
        </div>

        {error && <div className="mb-4 text-sm text-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
            </div>
          </div>

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
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
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
            Create Account <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
