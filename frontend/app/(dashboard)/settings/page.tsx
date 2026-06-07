"use client";

import { useAuth } from "../../../context/AuthContext";
import { User, Shield, Sliders, Globe, Bell, Smartphone, Trash2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your profile, security preferences, and global settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-3xl shadow-lg shadow-primary/20 mb-4 border-4 border-white">
              {user?.name?.charAt(0) || "U"}
            </div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name || "User"}</h2>
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2">
              Premium AI Member
            </span>
            <button className="mt-6 w-full rounded-xl border border-slate-200 bg-white py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
              Update Avatar
            </button>
          </div>
        </div>

        <div className="md:col-span-2 space-y-6">
          <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm">
            <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
              <User className="h-5 w-5 text-primary" /> Personal Details
            </h3>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Full Name</label>
                <input type="text" defaultValue={user?.name} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                <input type="email" defaultValue={user?.email} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Bio / Role</label>
              <textarea rows={3} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Senior Financial Analyst..."></textarea>
            </div>
            <div className="mt-6 flex justify-end">
              <button className="rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30">
                Save Changes
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                <Shield className="h-5 w-5 text-success" /> Security
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Password</p>
                    <p className="text-xs text-slate-500">Last changed 3 months ago</p>
                  </div>
                  <button className="text-sm font-medium text-primary hover:underline">Update</button>
                </div>
                <div className="border-t border-slate-100 my-2"></div>
                <div className="flex flex-col gap-2 rounded-xl bg-success/10 p-4 border border-success/20">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-success">AUTHENTICATOR</span>
                    <span className="text-xs text-success font-medium flex items-center"><Shield className="w-3 h-3 mr-1"/> Enabled</span>
                  </div>
                  <p className="text-xs text-success/80">Two-factor authentication is protecting your account.</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h3 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-6">
                <Sliders className="h-5 w-5 text-warning" /> Preferences
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Globe className="h-4 w-4 text-slate-400" /> Default Currency
                  </div>
                  <span className="text-sm font-bold bg-slate-100 px-3 py-1 rounded-md">NPR (₨)</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                    <Smartphone className="h-4 w-4 text-slate-400" /> Theme
                  </div>
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button className="px-3 py-1 text-xs font-medium bg-white rounded shadow-sm text-slate-900">Light</button>
                    <button className="px-3 py-1 text-xs font-medium text-slate-500">Dark</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-danger/20 shadow-sm bg-danger/5">
            <h3 className="text-lg font-bold text-danger mb-2">Danger Zone</h3>
            <p className="text-sm text-danger/80 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
            <button className="flex items-center gap-2 rounded-xl border border-danger text-danger px-4 py-2 text-sm font-medium hover:bg-danger hover:text-white transition">
              <Trash2 className="h-4 w-4" /> Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
