"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import { Mail, Lock, ArrowRight, ArrowLeft, Key, Sparkles } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "forgot" | "reset">("login");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const { login } = useAuth();

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, { id: res.data.id, name: res.data.name, email: res.data.email });
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email, type: "RESET_PASSWORD" });
      setView("reset");
      setCooldown(60);
      setSuccess("Verification code sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send reset code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!code || !newPassword) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, code, newPassword });
      setView("login");
      setEmail("");
      setPassword("");
      setSuccess("Password reset successful! You can now log in with your new password.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Password reset failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex h-screen flex-col items-center justify-center bg-[#0F172A] overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center justify-center">
            <img src="/logo.png" alt="WalletSathi Logo" className="h-30 w-48 object-contain" />
          </div>
        </div>
        <p className="text-sm text-slate-500 uppercase tracking-widest font-medium">
          Smart Financial Management
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md rounded-2xl border border-white/5 bg-[#1E293B] p-8 shadow-2xl">
        
        {view === "login" && (
          <>
            <div className="mb-7">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Welcome back
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Sign in to your AI-powered dashboard
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400 text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
                  <button
                    type="button"
                    onClick={() => { setView("forgot"); setError(""); setSuccess(""); }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 transition"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                ) : (
                  <>
                    Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {view === "forgot" && (
          <>
            <div className="mb-7">
              <button
                onClick={() => { setView("login"); setError(""); setSuccess(""); }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition uppercase tracking-wider mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Login
              </button>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Forgot Password
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter your email address to receive a 6-digit recovery code
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                ) : (
                  <>
                    Send Recovery Code <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}

        {view === "reset" && (
          <>
            <div className="mb-7">
              <button
                onClick={() => { setView("forgot"); setError(""); setSuccess(""); }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition uppercase tracking-wider mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                Reset Password
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Enter the code sent to <span className="text-cyan-400 font-semibold">{email}</span> and your new password
              </p>
            </div>

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400 text-center">
                {success}
              </div>
            )}

            <form onSubmit={handleResetSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verification Code
                </label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-center tracking-[0.5em] text-lg font-bold text-slate-200 placeholder:text-slate-600 placeholder:tracking-normal focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  New Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                ) : (
                  <>
                    Reset Password <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={handleForgotSubmit}
                disabled={loading || cooldown > 0}
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 transition"
              >
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Code"}
              </button>
            </div>
          </>
        )}

        <p className="mt-7 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 flex gap-6 text-xs text-slate-600">
        <Link href="#" className="hover:text-slate-400 transition">Privacy Policy</Link>
        <Link href="#" className="hover:text-slate-400 transition">Terms of Service</Link>
        <Link href="#" className="hover:text-slate-400 transition">Support</Link>
      </div>
    </div>
  );
}
