"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { Users, CreditCard, Activity, Trash2, ArrowRight, AlertTriangle, X, Shield, ShieldOff } from "lucide-react";
import api from "../../../lib/api";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToDelete, setUserToDelete] = useState<{id: string, name: string} | null>(null);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error("Failed to fetch admin data", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = (id: string, name: string) => {
    setUserToDelete({ id, name });
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await api.delete(`/admin/users/${userToDelete.id}`);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      fetchAdminData(); // Refresh stats
      setUserToDelete(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user. They may have dependent records.");
      setUserToDelete(null);
    }
  };

  const handleRoleChange = async (id: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    try {
      await api.put(`/admin/users/${id}/role`, { role: newRole });
      setUsers((prev) => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update user role.");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 space-y-6 p-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-50 border border-slate-200 rounded-2xl" />
          ))}
        </div>
        <div className="h-96 bg-slate-50 border border-slate-200 rounded-2xl" />
      </div>
    );
  }

  // Prevent non-admins from seeing the UI, although backend protects data
  if (user?.role !== "ADMIN") {
    return (
      <div className="flex-1 p-6 flex flex-col items-center justify-center">
        <p className="text-xl font-bold text-slate-800">Access Denied</p>
        <p className="text-slate-500 mt-2">You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>
          Admin Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Platform overview and user management</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Total Users</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
              <ArrowRight className="h-5 w-5 -rotate-45" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Platform Income</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">NPR {(stats?.totalIncome || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <ArrowRight className="h-5 w-5 rotate-45" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Platform Expense</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">NPR {(stats?.totalExpense || 0).toLocaleString()}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
              <Activity className="h-5 w-5" />
            </div>
            <span className="text-sm font-semibold text-slate-500">Net Flow</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">NPR {(stats?.platformBalance || 0).toLocaleString()}</p>
        </div>
      </div>

      {/* User Management Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>User Management</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Joined Date</th>
                <th className="px-6 py-4 font-semibold">Transactions</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{u.name}</p>
                    <p className="text-xs text-slate-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u._count?.transactions || 0}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleRoleChange(u.id, u.role)}
                      disabled={u.id === user?.id}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-purple-50 hover:text-purple-600 disabled:opacity-30 transition"
                      title={u.id === user?.id ? "Cannot change own role" : (u.role === "ADMIN" ? "Demote to User" : "Promote to Admin")}
                    >
                      {u.role === "ADMIN" ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={u.id === user?.id}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition"
                      title={u.id === user?.id ? "Cannot delete yourself" : "Delete user"}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Delete User Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6">
              <div className="flex items-center justify-center w-14 h-14 rounded-full bg-red-100 mb-5 mx-auto">
                <AlertTriangle className="h-7 w-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 text-center mb-2" style={{ fontFamily: "var(--font-outfit)" }}>
                Delete User
              </h3>
              <p className="text-slate-500 text-center mb-6 leading-relaxed">
                Are you sure you want to completely delete <strong>{userToDelete.name}</strong>? This action cannot be undone and will remove all their data.
              </p>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setUserToDelete(null)}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 shadow-sm shadow-red-500/20 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
