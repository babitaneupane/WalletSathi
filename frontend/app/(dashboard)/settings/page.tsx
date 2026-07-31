"use client";

import { useState, useEffect, useRef } from "react";
import { User, Shield, Moon, DollarSign, Bell, Lock, AlertTriangle, Upload, EyeOff, Save, Loader2, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useAlert } from "../../../context/AlertContext";
import api from "../../../lib/api";

export default function SettingsPage() {
  const { showAlert } = useAlert();
  const { user, logout } = useAuth();

  const [modal, setModal] = useState<"" | "deactivate" | "delete">("");
  const [confirmText, setConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleDeactivate = async () => {
    if (confirmText !== "DEACTIVATE") return;
    setActionLoading(true);
    try {
      await api.post("/auth/deactivate");
      showAlert("Account deactivated. All your data has been cleared.", "success");
      setModal("");
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Failed to deactivate account.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirmText !== "DELETE") return;
    setActionLoading(true);
    try {
      await api.delete("/auth/delete");
      showAlert("Account permanently deleted.", "success");
      setModal("");
      setTimeout(() => logout(), 1500);
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Failed to delete account.", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    photoUrl: ""
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setProfile({ ...profile, photoUrl: url });
    }
  };

  const removePhoto = () => {
    setProfile({ ...profile, photoUrl: "" });
  };

  const [preferences, setPreferences] = useState({
    darkMode: true,
    currency: "NPR",
    smartAlerts: true
  });

  const [privacy, setPrivacy] = useState({
    allowAITraining: true,
    anonymizeData: false
  });

  useEffect(() => {
    const savedProfile = localStorage.getItem("settings_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    } else if (user) {
      setProfile({
        name: user.name || "",
        email: user.email || "",
        phone: "",
        location: "",
        photoUrl: ""
      });
    }

    const savedPrefs = localStorage.getItem("settings_prefs_v2");
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));

    const savedPrivacy = localStorage.getItem("settings_privacy");
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, [user]);

  const handleSave = () => {
    localStorage.setItem("settings_profile", JSON.stringify(profile));
    localStorage.setItem("settings_prefs_v2", JSON.stringify(preferences));
    localStorage.setItem("settings_privacy", JSON.stringify(privacy));
    showAlert("Settings saved successfully!", "success");
  };

  return (
    <div className="min-h-screen bg-[#0F0B1E]">
      <div className="space-y-8 p-6 max-w-4xl mx-auto pb-20">
        {/* Header */}
        <div className="border-b border-white/5 pb-6">
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Account Settings</h1>
          <p className="text-sm text-slate-400">Manage your profile, preferences, and security.</p>
        </div>

        <div className="space-y-8">
          {/* Profile Information */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Profile Information</h2>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-6 shadow-xl">
              <div className="flex flex-col sm:flex-row gap-8 items-start mb-8 border-b border-white/5 pb-8">
                <div className="flex flex-col items-center gap-3">
                  <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} accept="image/*" className="hidden" />
                  <div onClick={() => fileInputRef.current?.click()} className="h-24 w-24 rounded-full border border-white/10 bg-[#0F0B1E] flex items-center justify-center text-3xl font-bold text-white overflow-hidden relative group cursor-pointer">
                    {profile.photoUrl ? (
                      <img src={profile.photoUrl} alt="Profile" className="h-full w-full object-cover" />
                    ) : (
                      profile.name ? profile.name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || "U")
                    )}
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <Upload className="h-5 w-5 text-white mb-1" />
                      <span className="text-[10px] text-white font-semibold">Change</span>
                    </div>
                  </div>
                  <button onClick={removePhoto} className="text-xs font-semibold text-indigo-400 hover:text-indigo-300">Remove Photo</button>
                </div>
                <div className="flex-1 grid sm:grid-cols-2 gap-6 w-full">
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Full Name</label>
                    <input type="text" value={profile.name} onChange={e => setProfile({ ...profile, name: e.target.value })} className="w-full rounded-xl border border-white/5 bg-[#0F0B1E] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Email Address</label>
                    <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full rounded-xl border border-white/5 bg-[#0F0B1E] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Phone Number</label>
                    <input type="tel" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} className="w-full rounded-xl border border-white/5 bg-[#0F0B1E] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Location</label>
                    <input type="text" value={profile.location} onChange={e => setProfile({ ...profile, location: e.target.value })} className="w-full rounded-xl border border-white/5 bg-[#0F0B1E] px-4 py-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition shadow-inner" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition">
                  <Save className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </section>

          {/* System Preferences */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>System Preferences</h2>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#1A1333] shadow-xl divide-y divide-white/5">

              {/* Dark Mode */}
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Dark Mode</h3>
                    <p className="text-xs text-slate-400 mt-1">Adjust the appearance of WalletSathi to reduce glare.</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setPreferences({ ...preferences, darkMode: !preferences.darkMode });
                    if (preferences.darkMode) {
                      showAlert("Light mode is coming soon! The toggle now works but full theming is pending.", "info");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.darkMode ? 'bg-indigo-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.darkMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Currency */}
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">Default Currency</h3>
                    <p className="text-xs text-slate-400 mt-1">Set the primary currency for your dashboard.</p>
                  </div>
                </div>
                <select
                  value={preferences.currency}
                  onChange={(e) => setPreferences({ ...preferences, currency: e.target.value })}
                  className="rounded-xl border border-white/10 bg-[#0F0B1E] px-4 py-2.5 text-sm font-semibold text-white focus:outline-none cursor-pointer"
                >
                  <option value="NPR">NPR (Rs)</option>
                </select>
              </div>

              {/* Smart Alerts */}
              <div className="p-6 flex items-center justify-between hover:bg-white/5 transition">
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-10 rounded-full bg-slate-700/50 flex items-center justify-center">
                    <Bell className="h-5 w-5 text-slate-300" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">AI Smart Alerts</h3>
                    <p className="text-xs text-slate-400 mt-1">Receive AI-driven push notifications for unusual spending patterns.</p>
                  </div>
                </div>
                <button
                  onClick={() => setPreferences({ ...preferences, smartAlerts: !preferences.smartAlerts })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.smartAlerts ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${preferences.smartAlerts ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>
          </section>

          {/* AI & Privacy */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>AI & Privacy</h2>
            </div>
            <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-6 shadow-xl space-y-6">

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-start">
                  <input type="checkbox" className="sr-only" checked={privacy.allowAITraining} onChange={() => setPrivacy({ ...privacy, allowAITraining: !privacy.allowAITraining })} />
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition ${privacy.allowAITraining ? 'bg-indigo-500 border-indigo-500' : 'bg-[#0F0B1E] border-white/20 group-hover:border-white/40'}`}>
                    {privacy.allowAITraining && <svg className="h-3.5 w-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-white text-sm">Allow AI to analyze my transaction patterns</h3>
                  <p className="text-xs text-slate-400 mt-1">Enables personalized insights like 'Cash Flow Projections' and 'Budget Alerts' based on your unique data.</p>
                </div>
              </label>

              <label className="flex items-start gap-4 cursor-pointer group">
                <div className="relative flex items-start">
                  <input type="checkbox" className="sr-only" checked={privacy.anonymizeData} onChange={() => setPrivacy({ ...privacy, anonymizeData: !privacy.anonymizeData })} />
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition ${privacy.anonymizeData ? 'bg-indigo-500 border-indigo-500' : 'bg-[#0F0B1E] border-white/20 group-hover:border-white/40'}`}>
                    {privacy.anonymizeData && <svg className="h-3.5 w-3.5 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">Anonymize my data before processing</h3>
                    <EyeOff className="h-3.5 w-3.5 text-slate-500" />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Strips PII (Personally Identifiable Information) before sending transactions to our AI engine.</p>
                </div>
              </label>
            </div>
          </section>

          {/* Danger Zone */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <h2 className="text-lg font-bold text-rose-500" style={{ fontFamily: "var(--font-outfit)" }}>Danger Zone</h2>
            </div>
            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 shadow-xl flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm mb-1">Delete All Data</h3>
                <p className="text-xs text-rose-200/60 max-w-md">Permanently delete your account, transaction history, savings goals, and tenant records. This cannot be undone.</p>
              </div>
              <div className="flex gap-4 w-full sm:w-auto">
                <button
                  onClick={() => { setModal("deactivate"); setConfirmText(""); }}
                  className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 transition"
                >
                  Deactivate
                </button>
                <button
                  onClick={() => { setModal("delete"); setConfirmText(""); }}
                  className="flex-1 sm:flex-none rounded-xl bg-rose-500 hover:bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Confirmation Modal */}
      {modal !== "" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#1A1333] shadow-2xl p-8 relative">
            <button
              onClick={() => setModal("")}
              className="absolute top-5 right-5 text-slate-400 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${modal === "delete" ? "bg-rose-500/10" : "bg-amber-500/10"}`}>
                <AlertTriangle className={`h-5 w-5 ${modal === "delete" ? "text-rose-400" : "text-amber-400"}`} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">
                  {modal === "delete" ? "Delete Account" : "Deactivate Account"}
                </h2>
                <p className="text-xs text-slate-400">
                  {modal === "delete" ? "This is permanent and cannot be undone." : "All your data will be cleared, but your account stays."}
                </p>
              </div>
            </div>

            <p className="text-sm text-slate-300 mb-4">
              {modal === "delete"
                ? "This will permanently delete your account and all associated data — transactions, budgets, savings goals, tenants, and more."
                : "This will clear all your transactions, budgets, savings goals, tenants and more. Your login credentials will remain intact."}
            </p>

            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">
                Type <span className="text-white font-bold">{modal === "delete" ? "DELETE" : "DEACTIVATE"}</span> to confirm
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder={modal === "delete" ? "DELETE" : "DEACTIVATE"}
                className="w-full rounded-xl border border-white/10 bg-[#0F0B1E] px-4 py-3 text-sm text-white focus:border-rose-500/50 focus:outline-none focus:ring-1 focus:ring-rose-500/30 transition"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setModal("")}
                className="flex-1 rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={modal === "delete" ? handleDelete : handleDeactivate}
                disabled={actionLoading || confirmText !== (modal === "delete" ? "DELETE" : "DEACTIVATE")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition disabled:opacity-40 disabled:cursor-not-allowed ${
                  modal === "delete"
                    ? "bg-rose-500 hover:bg-rose-600 shadow-rose-500/25"
                    : "bg-amber-500 hover:bg-amber-600 shadow-amber-500/25"
                }`}
              >
                {actionLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {modal === "delete" ? "Permanently Delete" : "Deactivate Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
