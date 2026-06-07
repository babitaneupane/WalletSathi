"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle, Clock, User, FileText, Trash2, AlertCircle } from "lucide-react";
import api from "../../../lib/api";

export default function RentDashboard() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenantError, setTenantError] = useState("");
  const [billError, setBillError] = useState("");
  const [tenantSuccess, setTenantSuccess] = useState("");
  const [billSuccess, setBillSuccess] = useState("");
  const [savingTenant, setSavingTenant] = useState(false);
  const [savingBill, setSavingBill] = useState(false);

  const fetchTenants = async () => {
    try {
      const res = await api.get("/rent/tenants");
      setTenants(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const [newTenant, setNewTenant] = useState({ name: "", roomOrProperty: "" });
  const [newBill, setNewBill] = useState({ tenantId: "", title: "", amount: "" });

  const handleAddTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenant.name.trim()) {
      setTenantError("Tenant name is required.");
      return;
    }
    setTenantError("");
    setSavingTenant(true);
    try {
      await api.post("/rent/tenants", newTenant);
      setNewTenant({ name: "", roomOrProperty: "" });
      setTenantSuccess("Tenant saved successfully!");
      setTimeout(() => setTenantSuccess(""), 3000);
      fetchTenants();
    } catch (err: any) {
      setTenantError(err?.response?.data?.message || "Failed to save tenant. Please try again.");
    } finally {
      setSavingTenant(false);
    }
  };

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.tenantId) {
      setBillError("Please select a tenant.");
      return;
    }
    setBillError("");
    setSavingBill(true);
    try {
      await api.post("/rent/bills", newBill);
      setNewBill({ tenantId: "", title: "", amount: "" });
      setBillSuccess("Bill issued successfully!");
      setTimeout(() => setBillSuccess(""), 3000);
      fetchTenants();
    } catch (err: any) {
      setBillError(err?.response?.data?.message || "Failed to issue bill. Please try again.");
    } finally {
      setSavingBill(false);
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      await api.put(`/rent/bills/${billId}/pay`);
      fetchTenants();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to mark as paid.");
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm("Delete this tenant and all their bills?")) return;
    try {
      await api.delete(`/rent/tenants/${tenantId}`);
      fetchTenants();
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete tenant.");
    }
  };

  const totalPending = tenants.flatMap(t => t.bills || []).filter((b: any) => b.status === "PENDING").reduce((s: number, b: any) => s + b.amount, 0);
  const totalCollected = tenants.flatMap(t => t.bills || []).filter((b: any) => b.status === "PAID").reduce((s: number, b: any) => s + b.amount, 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Landlord Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Manage tenants and track rent & utility payments</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Tenants</p>
          <p className="text-3xl font-bold text-slate-900">{tenants.length}</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Pending Collection</p>
          <p className="text-3xl font-bold text-red-500">NPR {totalPending.toLocaleString()}</p>
        </div>
        <div className="glass rounded-2xl p-5 border border-slate-200">
          <p className="text-sm text-slate-500 mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-emerald-600">NPR {totalCollected.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Add Tenant */}
        <div className="glass p-6 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" /> Add New Tenant
          </h2>
          <form onSubmit={handleAddTenant} className="space-y-4">
            <input
              type="text"
              placeholder="Tenant Name *"
              required
              value={newTenant.name}
              onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="text"
              placeholder="Room / Property Name"
              value={newTenant.roomOrProperty}
              onChange={e => setNewTenant({ ...newTenant, roomOrProperty: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {tenantError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {tenantError}
              </div>
            )}
            {tenantSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3">
                <CheckCircle className="h-4 w-4 shrink-0" /> {tenantSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={savingTenant}
              className="w-full rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingTenant ? "Saving..." : "Save Tenant"}
            </button>
          </form>
        </div>

        {/* Issue Bill */}
        <div className="glass p-6 rounded-2xl border border-slate-200">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <FileText className="h-5 w-5 text-emerald-600" /> Issue a Bill
          </h2>
          <form onSubmit={handleAddBill} className="space-y-4">
            <select
              required
              value={newBill.tenantId}
              onChange={e => setNewBill({ ...newBill, tenantId: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">Select Tenant</option>
              {tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} {t.roomOrProperty ? `(${t.roomOrProperty})` : ""}</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Bill Title (e.g., June Rent, Water Bill)"
              required
              value={newBill.title}
              onChange={e => setNewBill({ ...newBill, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <input
              type="number"
              placeholder="Amount (NPR)"
              required
              value={newBill.amount}
              onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            {billError && (
              <div className="flex items-center gap-2 text-sm text-red-500 bg-red-50 rounded-xl p-3">
                <AlertCircle className="h-4 w-4 shrink-0" /> {billError}
              </div>
            )}
            {billSuccess && (
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 rounded-xl p-3">
                <CheckCircle className="h-4 w-4 shrink-0" /> {billSuccess}
              </div>
            )}
            <button
              type="submit"
              disabled={savingBill || tenants.length === 0}
              className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {savingBill ? "Sending..." : tenants.length === 0 ? "Add a Tenant First" : "Send Bill"}
            </button>
          </form>
        </div>
      </div>

      {/* Tenants & Bills */}
      <div className="glass p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold mb-6">Active Tenants & Bills</h2>
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2].map(i => <div key={i} className="h-20 bg-slate-100 rounded-xl" />)}
          </div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <User className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No tenants yet</p>
            <p className="text-sm mt-1">Add your first tenant using the form above.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {tenants.map(tenant => {
              const pendingBills = (tenant.bills || []).filter((b: any) => b.status === "PENDING");
              const paidBills = (tenant.bills || []).filter((b: any) => b.status === "PAID");
              return (
                <div key={tenant.id} className="border border-slate-100 rounded-2xl p-5 bg-white/60">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="font-bold text-slate-900 text-base">{tenant.name}</h3>
                      {tenant.roomOrProperty && <p className="text-xs text-slate-500 mt-0.5">{tenant.roomOrProperty}</p>}
                      <div className="flex gap-3 mt-1">
                        <span className="text-xs text-red-500 font-medium">Pending: NPR {pendingBills.reduce((s: number, b: any) => s + b.amount, 0).toLocaleString()}</span>
                        <span className="text-xs text-emerald-600 font-medium">Paid: NPR {paidBills.reduce((s: number, b: any) => s + b.amount, 0).toLocaleString()}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteTenant(tenant.id)}
                      className="p-2 text-slate-300 hover:text-red-400 hover:bg-red-50 rounded-lg transition"
                      title="Delete Tenant"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {tenant.bills && tenant.bills.length > 0 ? (
                    <div className="space-y-2">
                      {tenant.bills.map((bill: any) => (
                        <div key={bill.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            {bill.status === "PAID"
                              ? <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                              : <Clock className="h-5 w-5 text-amber-400 shrink-0" />
                            }
                            <div>
                              <p className="text-sm font-bold text-slate-900">{bill.title}</p>
                              <p className="text-xs text-slate-400">{new Date(bill.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <p className="font-bold text-slate-900">NPR {bill.amount.toLocaleString()}</p>
                            {bill.status === "PENDING" ? (
                              <button
                                onClick={() => handlePayBill(bill.id)}
                                className="text-xs font-medium bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition"
                              >
                                Mark Paid
                              </button>
                            ) : (
                              <span className="text-xs font-medium bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg">Paid</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 py-2">No bills issued yet.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
