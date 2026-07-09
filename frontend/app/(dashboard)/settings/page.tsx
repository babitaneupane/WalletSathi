"use client";

import { useState, useEffect } from "react";
import { User, Shield, Moon, DollarSign, Bell, Lock, AlertTriangle, Upload, EyeOff, Save } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

export default function SettingsPage() {
  const { user } = useAuth();

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: ""
  });

  const [preferences, setPreferences] = useState({
    darkMode: true,
    currency: "USD",
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
        location: ""
      });
    }

    const savedPrefs = localStorage.getItem("settings_prefs");
    if (savedPrefs) setPreferences(JSON.parse(savedPrefs));

    const savedPrivacy = localStorage.getItem("settings_privacy");
    if (savedPrivacy) setPrivacy(JSON.parse(savedPrivacy));
  }, [user]);

  const handleSave = () => {
    localStorage.setItem("settings_profile", JSON.stringify(profile));
    localStorage.setItem("settings_prefs", JSON.stringify(preferences));
    localStorage.setItem("settings_privacy", JSON.stringify(privacy));
    alert("Settings saved successfully!");
  };

  return (
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
            <User className="h-5 w-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Profile Information</h2>
          </div>
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-8 items-start mb-8 border-b border-white/5 pb-8">
              <div className="flex flex-col items-center gap-3">
                <div className="h-24 w-24 rounded-full border border-white/10 bg-[#0F172A] flex items-center justify-center text-3xl font-bold text-white overflow-hidden relative group cursor-pointer">
                  {profile.name ? profile.name.charAt(0).toUpperCase() : (user?.name?.charAt(0).toUpperCase() || "U")}
                  <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Upload className="h-5 w-5 text-white mb-1" />
                    <span className="text-[10px] text-white font-semibold">Change</span>
                  </div>
                </div>
                <button className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">Remove Photo</button>
              </div>
              <div className="flex-1 grid sm:grid-cols-2 gap-6 w-full">
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Full Name</label>
                  <input type="text" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Email Address</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Phone Number</label>
                  <input type="tel" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-widest">Location</label>
                  <input type="text" value={profile.location} onChange={e => setProfile({...profile, location: e.target.value})} className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-white focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition shadow-inner" />
                </div>
              </div>
            </div>
            <div className="flex justify-end">
              <button 
                onClick={handleSave}
                className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition">
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
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] shadow-xl divide-y divide-white/5">
            
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
                  setPreferences({...preferences, darkMode: !preferences.darkMode});
                  if (preferences.darkMode) {
                    alert("Light mode is coming soon! The toggle now works but full theming is pending.");
                  }
                }} 
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${preferences.darkMode ? 'bg-cyan-500' : 'bg-slate-600'}`}
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
                onChange={(e) => setPreferences({...preferences, currency: e.target.value})}
                className="rounded-xl border border-white/10 bg-[#0F172A] px-4 py-2.5 text-sm font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
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
                onClick={() => setPreferences({...preferences, smartAlerts: !preferences.smartAlerts})} 
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
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-6 shadow-xl space-y-6">
            
            <label className="flex items-start gap-4 cursor-pointer group">
              <div className="relative flex items-start">
                <input type="checkbox" className="sr-only" checked={privacy.allowAITraining} onChange={() => setPrivacy({...privacy, allowAITraining: !privacy.allowAITraining})} />
                <div className={`h-5 w-5 rounded border flex items-center justify-center transition ${privacy.allowAITraining ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0F172A] border-white/20 group-hover:border-white/40'}`}>
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
                <input type="checkbox" className="sr-only" checked={privacy.anonymizeData} onChange={() => setPrivacy({...privacy, anonymizeData: !privacy.anonymizeData})} />
                <div className={`h-5 w-5 rounded border flex items-center justify-center transition ${privacy.anonymizeData ? 'bg-cyan-500 border-cyan-500' : 'bg-[#0F172A] border-white/20 group-hover:border-white/40'}`}>
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
              <button className="flex-1 sm:flex-none rounded-xl border border-white/10 bg-transparent px-5 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/5 transition">
                Deactivate
              </button>
              <button className="flex-1 sm:flex-none rounded-xl bg-rose-500 hover:bg-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/25 transition">
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
