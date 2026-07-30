"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../../../context/AuthContext";
import api from "../../../lib/api";
import { User as UserIcon, Mail, Lock, ArrowRight, ArrowLeft, Key } from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
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

  const sendOtp = async () => {
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email, type: "REGISTER" });
      setStep("verify");
      setCooldown(60);
      setInfoMessage(`Verification code sent to ${email}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to send verification code. Please check your email.");
    } finally {
      setLoading(false);
    }
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    await sendOtp();
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfoMessage("");
    setLoading(true);
    try {
      const res = await api.post("/auth/register", { name, email, password, code });
      login(res.data.token, { id: res.data.id, name: res.data.name, email: res.data.email });
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed. Please check the code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#0F172A] py-12 overflow-hidden">
      {/* Background glow orbs */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-purple-600/10 blur-3xl" />

      <div className="mb-8 flex flex-col items-center z-10">
        <div className="flex items-center justify-center mb-3">
          <img src="/logo.png" alt="WalletSathi Logo" className="h-30 w-48 object-contain" />
        </div>
        <p className="text-sm text-slate-500 uppercase tracking-widest font-medium text-center">
          Join the future of autonomous financial management
        </p>
      </div>

      <div className="z-10 w-full max-w-md rounded-2xl border border-white/5 bg-[#1E293B] p-8 shadow-2xl">
        {step === "form" ? (
          <>
            <div className="mb-7">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Create an Account</h1>
              <p className="text-sm text-slate-500 mt-1">
                Setup your AI-powered dashboard
              </p>
            </div>

            {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">{error}</div>}

            <form onSubmit={handleInitialSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Email Address</label>
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
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Password</label>
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
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                ) : (
                  <>
                    Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="mb-7">
              <button
                onClick={() => setStep("form")}
                className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition uppercase tracking-wider mb-4"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to details
              </button>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Verify Your Email</h1>
              <p className="text-sm text-slate-500 mt-1">
                We sent a 6-digit code to <span className="text-cyan-400 font-semibold">{email}</span>
              </p>
            </div>

            {error && <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-center">{error}</div>}
            {infoMessage && <div className="mb-5 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-400 text-center">{infoMessage}</div>}

            <form onSubmit={handleVerifySubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-400 uppercase tracking-wider">Verification Code</label>
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

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-6 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="h-4 w-4 rounded-full border-2 border-slate-900/30 border-t-slate-900 animate-spin" />
                ) : (
                  <>
                    Verify & Create Account <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 text-center">
              <button
                onClick={sendOtp}
                disabled={loading || cooldown > 0}
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300 disabled:text-slate-600 transition"
              >
                {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Code"}
              </button>
            </div>
          </>
        )}

        <p className="mt-7 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-cyan-400 hover:text-cyan-300 transition">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
