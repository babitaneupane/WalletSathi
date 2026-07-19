"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle, Clock, User, FileText, Trash2, AlertCircle, ArrowUpRight, TrendingUp, Search, Download, Filter, Receipt, Calendar, AlertTriangle, X } from "lucide-react";
import api from "../../../lib/api";
import { useAlert } from "../../../context/AlertContext";

export default function RentDashboard() {
  const { showAlert } = useAlert();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalRentIncome, setGeneralRentIncome] = useState(0);
  
  // Modal state
  const [isTenantModalOpen, setIsTenantModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);

  const [tenantError, setTenantError] = useState("");
  const [billError, setBillError] = useState("");
  const [tenantSuccess, setTenantSuccess] = useState("");
  const [billSuccess, setBillSuccess] = useState("");
  const [savingTenant, setSavingTenant] = useState(false);
  const [savingBill, setSavingBill] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTenants = async () => {
    try {
      const [tenantsRes, txRes] = await Promise.all([
        api.get("/rent/tenants"),
        api.get("/transactions")
      ]);
      setTenants(tenantsRes.data);
      
      const rentTx = txRes.data.filter((t: any) => 
        t.type === "INCOME" && t.category?.name?.toLowerCase() === "rent"
      );
      const generalRent = rentTx.reduce((sum: number, t: any) => sum + t.amount, 0);
      setGeneralRentIncome(generalRent);
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
      setTimeout(() => {
        setTenantSuccess("");
        setIsTenantModalOpen(false);
      }, 1500);
      fetchTenants();
    } catch (err: any) {
      setTenantError(err?.response?.data?.message || "Failed to save tenant.");
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
      setTimeout(() => {
        setBillSuccess("");
        setIsBillModalOpen(false);
      }, 1500);
      fetchTenants();
    } catch (err: any) {
      setBillError(err?.response?.data?.message || "Failed to issue bill.");
    } finally {
      setSavingBill(false);
    }
  };

  const handlePayBill = async (billId: string) => {
    try {
      await api.put(`/rent/bills/${billId}/pay`);
      fetchTenants();
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Failed to mark as paid.", "error");
    }
  };

  const confirmDelete = (tenantId: string) => {
    setTenantToDelete(tenantId);
    setDeleteModalOpen(true);
  };

  const handleDeleteTenant = async () => {
    if (!tenantToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/rent/tenants/${tenantToDelete}`);
      setDeleteModalOpen(false);
      setTenantToDelete(null);
      fetchTenants();
    } catch (err: any) {
      showAlert(err?.response?.data?.message || "Failed to delete tenant.", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const allBills = tenants.flatMap(t => 
    (t.bills || []).map((b: any) => ({ ...b, tenantName: t.name }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPending = allBills.filter(b => b.status === "UNPAID").reduce((s, b) => s + b.amount, 0);
  const totalCollected = allBills.filter(b => b.status === "PAID").reduce((s, b) => s + b.amount, 0) + generalRentIncome;
  const overdueCount = allBills.filter(b => b.status === "UNPAID").length;

  return (
    <div className="space-y-8 p-6 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "var(--font-outfit)" }}>Rent Dashboard</h1>
          <p className="text-sm text-slate-400">Real-time oversight of your property portfolio performance.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsTenantModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-[#1E293B] border border-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/5 transition">
            <User className="h-4 w-4" /> Add Tenant
          </button>
          <button onClick={() => setIsBillModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition">
            <Receipt className="h-4 w-4" /> Generate Rent Bill
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Total Collection</p>
          <p className="text-3xl font-bold text-white mb-2">NPR {totalCollected.toLocaleString()}</p>
          <p className="text-xs text-emerald-400 flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> +12.5% this month</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Occupancy Rate</p>
          <p className="text-3xl font-bold text-white mb-2">94.2%</p>
          <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden mt-3">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: '94.2%' }}></div>
          </div>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-2">Overdue Payments</p>
          <p className="text-3xl font-bold text-red-400 mb-2">NPR {totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-400">{overdueCount} Tenants outstanding</p>
        </div>
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-[#1E293B] to-[#0F172A] p-5 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-cyan-500/10 blur-2xl"></div>
          <p className="text-xs font-semibold text-cyan-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5"><TrendingUp className="h-3 w-3" /> AI Yield Forecast</p>
          <p className="text-3xl font-bold text-cyan-400 mb-2 relative z-10">NPR {(totalCollected * 1.15).toLocaleString()}</p>
          <p className="text-xs text-slate-400 relative z-10">Predicted for next cycle</p>
        </div>
      </div>

      {/* Active Tenants */}
      <div>
        <div className="flex justify-between items-end mb-4">
          <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Active Tenants</h2>
          <button className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-1">View All <ArrowUpRight className="h-3 w-3" /></button>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-32 rounded-2xl bg-white/5" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tenants.map(tenant => {
              const hasOverdue = (tenant.bills || []).some((b: any) => b.status === "UNPAID");
              return (
                <div key={tenant.id} className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 relative group">
                  <div className="absolute top-4 right-4">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${hasOverdue ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"}`}>
                      {hasOverdue ? "Unpaid" : "Paid"}
                    </span>
                  </div>
                  <button onClick={() => confirmDelete(tenant.id)} className="absolute top-12 right-4 p-1.5 text-slate-600 opacity-0 group-hover:opacity-100 transition hover:bg-red-500/10 hover:text-red-400 rounded-lg">
                    <Trash2 className="h-3 w-3" />
                  </button>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-full bg-slate-700 border-2 border-[#1E293B] shadow-md flex items-center justify-center font-bold text-sm text-white">
                      {tenant.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-200 text-sm">{tenant.name}</h3>
                      <p className="text-xs text-slate-500">{tenant.roomOrProperty || "General"}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-white">
                      NPR {(tenant.bills?.[0]?.amount || 0).toLocaleString()}
                      <span className="text-xs font-normal text-slate-500">/mo</span>
                    </span>
                    <button className="text-slate-500 hover:text-white transition">
                      <div className="flex gap-0.5">
                        <div className="h-1 w-1 bg-current rounded-full"></div>
                        <div className="h-1 w-1 bg-current rounded-full"></div>
                        <div className="h-1 w-1 bg-current rounded-full"></div>
                      </div>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rent Ledger */}
      <div className="rounded-2xl border border-white/5 bg-[#1E293B] overflow-hidden flex flex-col">
        <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Rent Ledger</h2>
            <p className="text-xs text-slate-400 mt-1">Historical and pending payment breakdown</p>
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 border border-white/10 bg-[#0F172A] px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <Filter className="h-3 w-3" /> Filter
            </button>
            <button className="flex items-center gap-2 text-xs font-semibold text-slate-300 border border-white/10 bg-[#0F172A] px-3 py-2 rounded-lg hover:bg-white/5 transition">
              <Download className="h-3 w-3" /> Export
            </button>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-[10px] font-bold uppercase tracking-widest text-slate-500 border-b border-white/5 bg-white/3">
              <tr>
                <th className="px-5 py-4">Transaction ID</th>
                <th className="px-5 py-4">Tenant</th>
                <th className="px-5 py-4">Due Date</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {allBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-500 text-sm">No bills found in the ledger.</td>
                </tr>
              ) : (
                allBills.map((bill: any) => (
                  <tr key={bill.id} className="border-b border-white/5 hover:bg-white/3 transition">
                    <td className="px-5 py-4 text-slate-500 text-xs font-mono">#INV-{bill.id.substring(bill.id.length - 6).toUpperCase()}</td>
                    <td className="px-5 py-4 font-semibold text-slate-200">{bill.tenantName}</td>
                    <td className="px-5 py-4 text-slate-400">
                      <div className="flex flex-col">
                        <span>{new Date(bill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-bold text-white">NPR {bill.amount.toLocaleString()}</td>
                    <td className="px-5 py-4">
                      {bill.status === "PAID" ? (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full w-fit">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-400"></div> Settled
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full w-fit">
                          <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div> Overdue
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {bill.status === "UNPAID" ? (
                        <button onClick={() => handlePayBill(bill.id)} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">
                          Mark Paid
                        </button>
                      ) : (
                        <button className="text-xs font-semibold text-emerald-400 hover:text-emerald-300">
                          View Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={(e) => e.target === e.currentTarget && setIsTenantModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-outfit)" }}>Add New Tenant</h2>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-2 block">Tenant Name</label>
                <input type="text" required value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-2 block">Room / Property</label>
                <input type="text" value={newTenant.roomOrProperty} onChange={e => setNewTenant({ ...newTenant, roomOrProperty: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              {tenantError && <div className="text-sm text-red-400 bg-red-500/10 rounded-xl p-3">{tenantError}</div>}
              {tenantSuccess && <div className="text-sm text-emerald-400 bg-emerald-500/10 rounded-xl p-3">{tenantSuccess}</div>}
              <button type="submit" disabled={savingTenant} className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition mt-2">
                {savingTenant ? "Saving..." : "Save Tenant"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }} onClick={(e) => e.target === e.currentTarget && setIsBillModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6" style={{ fontFamily: "var(--font-outfit)" }}>Generate Rent Bill</h2>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-2 block">Select Tenant</label>
                <select required value={newBill.tenantId} onChange={e => setNewBill({ ...newBill, tenantId: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition">
                  <option value="">Choose tenant...</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name} {t.roomOrProperty ? `(${t.roomOrProperty})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-2 block">Bill Title</label>
                <input type="text" placeholder="e.g. June Rent" required value={newBill.title} onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-cyan-400 mb-2 block">Amount (NPR)</label>
                <input type="number" required value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full rounded-xl border border-white/5 bg-[#0F172A] px-4 py-3 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              {billError && <div className="text-sm text-red-400 bg-red-500/10 rounded-xl p-3">{billError}</div>}
              {billSuccess && <div className="text-sm text-emerald-400 bg-emerald-500/10 rounded-xl p-3">{billSuccess}</div>}
              <button type="submit" disabled={savingBill || tenants.length === 0} className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition mt-2">
                {savingBill ? "Generating..." : "Issue Bill"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Delete Tenant?</h2>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="text-slate-500 hover:text-slate-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-400 mb-6">Are you sure you want to delete this tenant and all their bills? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}
                className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteTenant} disabled={isDeleting}
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
