"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Users, Receipt, UserPlus, CheckCircle2, Loader2, Copy, Check, Key, X, Trash2, AlertTriangle } from "lucide-react";
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

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const confirmDelete = (id: string) => {
    setGroupToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDeleteGroup = async () => {
    if (!groupToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/groups/${groupToDelete}`);
      setDeleteModalOpen(false);
      setGroupToDelete(null);
      fetchGroups();
    } catch (err) {
      console.error("Failed to delete group", err);
    } finally {
      setIsDeleting(false);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Split Expenses</h1>
          <p className="text-sm text-slate-500">Keep track of shared bills and group trips effortlessly.</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => { setError(""); setIsCreateModalOpen(true); }}
          className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 p-5 flex flex-col items-center justify-center gap-3 transition group"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
            <Plus className="h-6 w-6 text-emerald-500" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Create Group</span>
        </button>
        <button
          onClick={() => { setError(""); setIsJoinModalOpen(true); }}
          className="rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 p-5 flex flex-col items-center justify-center gap-3 transition group"
        >
          <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition">
            <UserPlus className="h-6 w-6 text-emerald-400" />
          </div>
          <span className="text-sm font-semibold text-slate-800">Join with Code</span>
        </button>
      </div>

      {/* Groups List */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-6" style={{ fontFamily: "var(--font-outfit)" }}>Your Groups</h2>

        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-50" />)}
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-14 flex flex-col items-center justify-center text-center gap-4">
            <div className="rounded-full bg-emerald-500/10 p-4"><Users className="h-8 w-8 text-emerald-400" /></div>
            <h3 className="text-lg font-bold text-slate-800">No groups yet</h3>
            <p className="text-slate-500 text-sm max-w-xs">Create a group or join one using an invite code to start splitting expenses.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsJoinModalOpen(true)} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition">
                Join with code
              </button>
              <button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl bg-emerald-500 hover:bg-emerald-500 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition">
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
                  className="rounded-2xl border border-slate-200 bg-white p-6 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 hover:border-slate-200 transition"
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-slate-500">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg mb-1">{group.name}</h3>
                      {group.description && <p className="text-xs text-slate-500 mb-1">{group.description}</p>}
                      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                        <span>Members: {memberNames.slice(0, 4).join(", ")}{memberNames.length > 4 ? ` +${memberNames.length - 4}` : ""}</span>
                      </div>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto flex flex-col sm:items-end gap-3 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-slate-500 bg-slate-50 rounded-lg px-2.5 py-1">{group.inviteCode}</span>
                      <button
                        onClick={() => copyInviteCode(group.inviteCode)}
                        title="Copy invite code"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 transition"
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <Link
                        href={`/split/${group.id}`}
                        className="flex-1 sm:flex-none rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 px-5 py-2 text-sm font-semibold text-emerald-500 transition text-center"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => confirmDelete(group.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 transition shrink-0"
                        title="Delete Group"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500"><Users className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>{detailGroup.name}</h2>
              </div>
              <button onClick={() => setDetailGroup(null)} className="text-slate-500 hover:text-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>

            {detailGroup.description && (
              <p className="text-sm text-slate-500 mb-4">{detailGroup.description}</p>
            )}

            {/* Invite Code */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-emerald-500" />
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Invite Code</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-mono font-bold text-slate-900 tracking-widest">{detailGroup.inviteCode}</span>
                <button
                  onClick={() => copyInviteCode(detailGroup.inviteCode)}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1.5 text-xs font-semibold text-emerald-500 transition"
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
                    <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-900 shrink-0">
                      {(m.user?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{m.user?.name || "Unknown"}</p>
                      <p className="text-xs text-slate-500">{m.user?.email || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setDetailGroup(null)} className="mt-5 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Create Group Modal ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsCreateModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>Create New Group</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Group Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Europe Trip 2024"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this group for?"
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition resize-none" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-500 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
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
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>Join a Group</h2>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-500 hover:text-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Invite Code</label>
                <input type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3D4"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition font-mono tracking-widest uppercase" />
                <p className="text-xs text-slate-500 mt-1.5">Ask the group creator to share their invite code with you.</p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-emerald-500 hover:bg-emerald-500 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {saving ? "Joining..." : "Join Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ─── */}
      {deleteModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}
        >
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-rose-400" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>Delete Group?</h2>
                  <p className="text-xs text-slate-500 mt-0.5">This action cannot be undone</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="text-slate-500 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              All expenses, splits, and member data associated with this group will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-rose-500/20 transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Group
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
