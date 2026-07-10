"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Receipt, UserPlus, CheckCircle2, Loader2, Copy, Check, Key, X } from "lucide-react";
import api from "../../../lib/api";

export default function SplitPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<any | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [joinCode, setJoinCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      setGroups(res.data);
    } catch (err) {
      console.error("Failed to fetch groups", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await api.post("/groups", formData);
      setIsCreateModalOpen(false);
      setFormData({ name: "", description: "" });
      fetchGroups();
      setDetailGroup(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create group");
    } finally {
      setSaving(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post("/groups/join", { code: joinCode.trim().toUpperCase() });
      setIsJoinModalOpen(false);
      setJoinCode("");
      fetchGroups();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to join group");
    } finally {
      setSaving(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Split Expenses</h1>
          <p className="text-sm text-slate-400">Keep track of shared bills and group trips effortlessly.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => { setError(""); setIsCreateModalOpen(true); }}
          className="rounded-2xl border border-white/5 bg-[#1E293B] hover:bg-white/5 p-5 flex flex-col items-center justify-center gap-3 transition group"
        >
          <div className="h-12 w-12 rounded-full bg-cyan-500/10 flex items-center justify-center group-hover:bg-cyan-500/20 transition">
            <Plus className="h-6 w-6 text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Create Group</span>
        </button>
        <button
          onClick={() => { setError(""); setIsJoinModalOpen(true); }}
          className="rounded-2xl border border-white/5 bg-[#1E293B] hover:bg-white/5 p-5 flex flex-col items-center justify-center gap-3 transition group"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
            <UserPlus className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-slate-200">Join with Code</span>
        </button>
      </div>

      {/* Groups List */}
      <div>
        <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-outfit)" }}>Your Groups</h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-white/5" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-14 flex flex-col items-center justify-center text-center gap-4">
            <div className="rounded-full bg-emerald-500/10 p-4"><Users className="h-8 w-8 text-emerald-400" /></div>
            <h3 className="text-lg font-bold text-slate-200">No groups yet</h3>
            <p className="text-slate-500 text-sm max-w-xs">Create a group or join one using an invite code to start splitting expenses.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsJoinModalOpen(true)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition">
                Join with code
              </button>
              <button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition">
                Create group
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map((group: any) => {
              const memberNames = (group.members || []).map((m: any) => m.user?.name || "?");
              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-white/5 bg-[#1E293B] p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-white/10 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-[#0F172A] border border-white/5 flex items-center justify-center shrink-0 text-slate-400">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-lg mb-1">{group.name}</h3>
                      {group.description && <p className="text-xs text-slate-500 mb-1">{group.description}</p>}
                      <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                        <span>Members: {memberNames.slice(0, 4).join(", ")}{memberNames.length > 4 ? ` +${memberNames.length - 4}` : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 bg-white/5 rounded-lg px-2.5 py-1">{group.inviteCode}</span>
                      <button
                        onClick={() => copyInviteCode(group.inviteCode)}
                        title="Copy invite code"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-cyan-400 hover:bg-cyan-500/10 transition"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <Link
                      href={`/split/${group.id}`}
                      className="w-full sm:w-auto rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 px-5 py-2 text-sm font-semibold text-cyan-400 transition text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Group Details Modal ─── */}
      {detailGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setDetailGroup(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400"><Users className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{detailGroup.name}</h2>
              </div>
              <button onClick={() => setDetailGroup(null)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>

            {detailGroup.description && (
              <p className="text-sm text-slate-400 mb-4">{detailGroup.description}</p>
            )}

            {/* Invite Code */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-cyan-400" />
                <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Invite Code</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-mono font-bold text-white tracking-widest">{detailGroup.inviteCode}</span>
                <button
                  onClick={() => copyInviteCode(detailGroup.inviteCode)}
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 px-3 py-1.5 text-xs font-semibold text-cyan-400 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Share this code with others so they can join.</p>
            </div>

            {/* Members */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Members ({detailGroup.members?.length || 0})</p>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(detailGroup.members || []).map((m: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl bg-white/3 px-3 py-2.5">
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {(m.user?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">{m.user?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{m.user?.email || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setDetailGroup(null)} className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Create Group Modal ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsCreateModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Create New Group</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Group Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Europe Trip 2024"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this group for?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition resize-none" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  {saving ? "Creating..." : "Create Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Join Group Modal ─── */}
      {isJoinModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsJoinModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Join a Group</h2>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Invite Code</label>
                <input type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3D4"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition font-mono tracking-widest uppercase" />
                <p className="text-xs text-slate-500 mt-1.5">Ask the group creator to share their invite code with you.</p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {saving ? "Joining..." : "Join Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
