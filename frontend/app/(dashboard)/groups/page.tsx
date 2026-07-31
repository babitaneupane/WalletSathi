"use client";

import { useState, useEffect } from "react";
import { Plus, Users, UserPlus, Receipt, X, Loader2, Trash2, Copy, Check, Key, AlertTriangle } from "lucide-react";
import api from "../../../lib/api";

export default function GroupsPage() {
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
      // Open details to show the invite code right away
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
      if (detailGroup?.id === groupToDelete) setDetailGroup(null);
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Collaborate</p>
          <h1 className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>Financial Groups</h1>
          <p className="text-sm text-slate-400 mt-1">Manage shared expenses with friends, family, and teams.</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button onClick={() => { setError(""); setIsJoinModalOpen(true); }} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition">
            <UserPlus className="h-4 w-4" /> Join Group
          </button>
          <button onClick={() => { setError(""); setIsCreateModalOpen(true); }} className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition">
            <Plus className="h-4 w-4" /> Create Group
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
        </div>
      ) : groups.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-indigo-500/10 p-4"><Users className="h-8 w-8 text-indigo-400" /></div>
          <h3 className="text-lg font-bold text-slate-200" style={{ fontFamily: "var(--font-outfit)" }}>No groups yet</h3>
          <p className="text-slate-500 text-sm max-w-xs">Create a group to start splitting expenses, or join one using an invite code.</p>
          <div className="flex gap-3">
            <button onClick={() => setIsJoinModalOpen(true)} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-white/10 transition">
              Join with code
            </button>
            <button onClick={() => setIsCreateModalOpen(true)} className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-5 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition">
              Create your first group
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group: any) => (
            <div key={group.id} className="rounded-2xl border border-white/5 bg-[#1A1333] p-5 flex flex-col hover:border-white/10 transition group">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400"><Users className="h-5 w-5" /></div>
                  <div>
                    <h3 className="font-bold text-slate-200" style={{ fontFamily: "var(--font-outfit)" }}>{group.name}</h3>
                    <p className="text-xs text-slate-500">{group.description || "No description"}</p>
                  </div>
                </div>
                <button onClick={() => confirmDelete(group.id)} className="p-1.5 text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex -space-x-2 my-3">
                {(group.members || []).slice(0, 4).map((m: any, i: number) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-[#1E293B] bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {(m.user?.name || m.name || "?").charAt(0).toUpperCase()}
                  </div>
                ))}
                {(group.members?.length || 0) > 4 && (
                  <div className="h-8 w-8 rounded-full border-2 border-[#1E293B] bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
                    +{group.members.length - 4}
                  </div>
                )}
              </div>

              <div className="mt-auto pt-4 border-t border-white/5 flex justify-between items-center">
                <span className="text-xs text-slate-500">{group.members?.length || 0} member(s)</span>
                <button
                  onClick={() => setDetailGroup(group)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <Receipt className="h-3.5 w-3.5" /> View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── Group Details Modal ─── */}
      {detailGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setDetailGroup(null)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400"><Users className="h-5 w-5" /></div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{detailGroup.name}</h2>
              </div>
              <button onClick={() => setDetailGroup(null)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>

            {detailGroup.description && (
              <p className="text-sm text-slate-400 mb-4">{detailGroup.description}</p>
            )}

            {/* Invite Code Box */}
            <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <Key className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Invite Code</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xl font-mono font-bold text-white tracking-widest">{detailGroup.inviteCode}</span>
                <button
                  onClick={() => copyInviteCode(detailGroup.inviteCode)}
                  className="flex items-center gap-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 px-3 py-1.5 text-xs font-semibold text-indigo-400 transition"
                >
                  {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">Share this code with others so they can join the group.</p>
            </div>

            {/* Members List */}
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

            <button
              onClick={() => setDetailGroup(null)}
              className="mt-5 w-full rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ─── Create Group Modal ─── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsCreateModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Create New Group</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Group Name</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Europe Trip 2024"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description (optional)</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What is this group for?"
                  rows={3}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition resize-none" />
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2">
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
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Join a Group</h2>
              <button onClick={() => setIsJoinModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleJoinGroup} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Invite Code</label>
                <input type="text" required value={joinCode} onChange={e => setJoinCode(e.target.value)}
                  placeholder="e.g. A1B2C3D4"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition font-mono tracking-widest uppercase" />
                <p className="text-xs text-slate-500 mt-1.5">Ask the group creator to share their invite code with you.</p>
              </div>
              {error && <p className="text-xs text-red-400">{error}</p>}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsJoinModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  {saving ? "Joining..." : "Join Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Delete Group?</h2>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="text-slate-500 hover:text-slate-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this group? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteGroup} disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
