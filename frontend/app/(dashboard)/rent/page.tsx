"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle, Clock, User, FileText, Trash2, AlertCircle, ArrowUpRight, TrendingUp, Search, Download, Filter, Receipt, Calendar, AlertTriangle, X, MoreVertical, Edit2, Eye, Bell, CreditCard, Send, UserPlus, FileBarChart } from "lucide-react";
import api from "../../../lib/api";
import { useAlert } from "../../../context/AlertContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function RentDashboard() {
  const { showAlert } = useAlert();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generalRentIncome, setGeneralRentIncome] = useState(0);
  const [rentTransactions, setRentTransactions] = useState<any[]>([]);
  
  const [activeTab, setActiveTab] = useState("All");

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
      setRentTransactions(rentTx);
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
    (t.bills || []).map((b: any) => ({ 
      ...b, 
      tenantName: t.name, 
      roomOrProperty: t.roomOrProperty 
    }))
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalPending = allBills.filter(b => b.status === "UNPAID").reduce((s, b) => s + b.amount, 0);
  const totalCollected = allBills.filter(b => b.status === "PAID").reduce((s, b) => s + b.amount, 0) + generalRentIncome;
  const overdueCount = allBills.filter(b => b.status === "UNPAID").length;

  const paidCount = allBills.filter(b => b.status === "PAID").length;
  const pendingCount = overdueCount; // all unpaid are pending for now
  const actualOverdueCount = 0; // simple split

  const pieData = [
    { name: 'Paid', value: paidCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Overdue', value: actualOverdueCount },
  ];

  const totalUnits = tenants.length;

  const monthlyData: Record<string, number> = {};
  rentTransactions.forEach(tx => {
    const d = new Date(tx.createdAt || tx.date || new Date());
    const month = d.toLocaleString('default', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + tx.amount;
  });
  const collectionData = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
  if (collectionData.length === 0) collectionData.push({ name: 'No Data', amount: 0 });

  const filteredBills = allBills.filter(bill => {
    if (activeTab === "All") return true;
    if (activeTab === "Paid" && bill.status === "PAID") return true;
    if (activeTab === "Pending" && bill.status === "UNPAID") return true; // simplified for now
    if (activeTab === "Overdue" && bill.status === "UNPAID") return true; // simplified
    return false;
  });

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Rent Dashboard</h1>
          <p className="text-sm text-slate-500">Track rent collection, payments and tenants in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition shadow-sm">
            <Calendar className="h-4 w-4" />
            <span>May 1 - May 31, 2025</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <Download className="h-4 w-4" /> Export Report
          </button>
          <button onClick={() => setIsBillModalOpen(true)} className="flex items-center gap-2 rounded-lg bg-[#00B87C] hover:bg-[#009B69] px-4 py-2 text-sm font-semibold text-white shadow-sm transition">
            <Plus className="h-4 w-4" /> Generate Rent Bill
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collection */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 text-emerald-500 flex items-center justify-center">
              <span className="text-lg font-bold">$</span>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Collection</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">NPR {totalCollected.toLocaleString()}</p>
          <p className="text-xs text-emerald-500 font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> Active</p>
        </div>

        {/* Occupancy Rate */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"/><path d="M9 8h1"/><path d="M9 12h1"/><path d="M9 16h1"/><path d="M14 8h1"/><path d="M14 12h1"/><path d="M14 16h1"/><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/></svg>
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Total Tenants</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">{totalUnits}</p>
          <div className="mt-2 flex flex-col gap-1.5">
            <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: `${totalUnits > 0 ? 100 : 0}%` }}></div>
            </div>
            <p className="text-xs text-slate-500">{totalUnits} Active Tenants</p>
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 rounded-lg bg-red-50 text-red-500 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="text-sm font-medium text-slate-500 mb-1">Overdue Payments</p>
          <p className="text-2xl font-bold text-slate-900 mb-2">NPR {totalPending.toLocaleString()}</p>
          <p className="text-xs text-slate-500 mb-2">{overdueCount} Tenants outstanding</p>
          <a href="#" className="text-xs font-semibold text-red-500 hover:underline flex items-center gap-1">View Overdue <ArrowUpRight className="h-3 w-3" /></a>
        </div>

        {/* AI Revenue Forecast */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
           <div className="flex justify-between items-start mb-4">
             <div className="h-10 w-10 rounded-lg bg-purple-50 text-purple-500 flex items-center justify-center">
               <TrendingUp className="h-5 w-5" />
             </div>
           </div>
           <p className="text-sm font-medium text-slate-500 mb-1">AI Revenue Forecast</p>
           <p className="text-2xl font-bold text-slate-900 mb-2">NPR {(totalCollected * 1.11).toLocaleString(undefined, {maximumFractionDigits:0})}</p>
           <p className="text-xs text-emerald-500 font-medium flex items-center gap-1"><ArrowUpRight className="h-3 w-3" /> 11.2% next month</p>
        </div>
      </div>

      {/* Middle Section: Charts & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Collection Overview Line Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1 xl:col-span-1">
           <div className="flex justify-between items-center mb-6">
            <h2 className="text-md font-bold text-slate-900">Collection Overview</h2>
            <select className="text-xs border border-slate-200 rounded px-2 py-1 bg-slate-50 text-slate-600 outline-none">
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={collectionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(val) => `${val / 1000}K`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: any) => [`NPR ${Number(value || 0).toLocaleString()}`, 'Amount']}
                />
                <Line type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rent Status Donut Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-md font-bold text-slate-900 mb-4">Rent Status Overview</h2>
          <div className="flex flex-col h-[220px] justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-slate-900">{totalUnits}</span>
              <span className="text-xs text-slate-500">Total Units</span>
            </div>
            
            <div className="absolute right-0 top-1/2 -translate-y-1/2 flex flex-col gap-4">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div> Paid
                </div>
                <span className="text-[10px] text-slate-500 ml-4">{paidCount} ({((paidCount / (totalUnits || 1)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></div> Pending
                </div>
                <span className="text-[10px] text-slate-500 ml-4">{pendingCount} ({((pendingCount / (totalUnits || 1)) * 100).toFixed(1)}%)</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div> Overdue
                </div>
                <span className="text-[10px] text-slate-500 ml-4">{actualOverdueCount} ({((actualOverdueCount / (totalUnits || 1)) * 100).toFixed(1)}%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-md font-bold text-slate-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-3 gap-3">
            <button onClick={() => setIsTenantModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-[#00B87C] hover:bg-[#00B87C]/5 transition group">
              <UserPlus className="h-6 w-6 text-[#00B87C] mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-[#00B87C]">Add Tenant</span>
            </button>
            <button onClick={() => setIsBillModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-[#00B87C] hover:bg-[#00B87C]/5 transition group">
              <FileText className="h-6 w-6 text-[#00B87C] mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-[#00B87C]">Generate Bill</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group">
              <Send className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-600">Send Reminder</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition group">
              <Receipt className="h-6 w-6 text-purple-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-purple-600">Rent Receipt</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group">
              <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-600">Record Payment</span>
            </button>
            <button className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition group">
              <FileBarChart className="h-6 w-6 text-orange-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-orange-600">View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: Ledger and Sidebars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Rent Ledger */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-100">
            <h2 className="text-md font-bold text-slate-900 mb-4">Recent Rent Ledger</h2>
            <div className="flex justify-between items-center">
              <div className="flex gap-2 bg-slate-50 p-1 rounded-lg">
                {["All", "Paid", "Pending", "Overdue"].map((tab) => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-50">
                  <Filter className="h-3 w-3" /> Filter
                </button>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search tenant / room..." 
                    className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg outline-none focus:border-[#00B87C] w-48"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50/50">
                <tr>
                  <th className="px-5 py-3 font-semibold">TENANT</th>
                  <th className="px-5 py-3 font-semibold">PROPERTY / ROOM</th>
                  <th className="px-5 py-3 font-semibold">DUE DATE</th>
                  <th className="px-5 py-3 font-semibold">AMOUNT</th>
                  <th className="px-5 py-3 font-semibold">STATUS</th>
                  <th className="px-5 py-3 font-semibold">PAYMENT METHOD</th>
                  <th className="px-5 py-3 font-semibold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredBills.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-500 text-sm">No records found.</td>
                  </tr>
                ) : (
                  filteredBills.map((bill: any) => (
                    <tr key={bill.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <img src={`https://ui-avatars.com/api/?name=${bill.tenantName}&background=f1f5f9&color=0f172a`} alt="avatar" className="w-8 h-8 rounded-full" />
                          <span className="font-semibold text-slate-800 text-sm">{bill.tenantName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-xs">{bill.roomOrProperty || "General"}</td>
                      <td className="px-5 py-3 text-slate-600 text-xs">
                        {new Date(bill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 font-semibold text-slate-700 text-xs">NPR {bill.amount.toLocaleString()}</td>
                      <td className="px-5 py-3">
                        {bill.status === "PAID" ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                            Paid
                          </span>
                        ) : (
                           <span className="inline-flex items-center text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                            Overdue
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-slate-600 text-xs flex items-center gap-1.5">
                        <div className="w-5 h-3.5 bg-green-500 text-white rounded-[2px] flex items-center justify-center text-[8px] font-bold tracking-tighter">
                          eS
                        </div>
                        eSewa
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                           <button className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded">
                             <Eye className="h-3.5 w-3.5" />
                           </button>
                           <button className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded">
                             <Edit2 className="h-3.5 w-3.5" />
                           </button>
                           <button className="p-1 text-slate-400 hover:text-slate-600 border border-slate-200 rounded">
                             <MoreVertical className="h-3.5 w-3.5" />
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500 mt-auto">
            <span>Showing 1 to {Math.min(filteredBills.length, 5)} of {filteredBills.length} entries</span>
            <div className="flex items-center gap-1">
              <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50">&lt;</button>
              <button className="w-6 h-6 flex items-center justify-center bg-[#00B87C] text-white rounded">1</button>
              <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50">2</button>
              <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-600 hover:bg-slate-50">3</button>
              <button className="w-6 h-6 flex items-center justify-center border border-slate-200 rounded text-slate-400 hover:bg-slate-50">&gt;</button>
            </div>
          </div>
        </div>

        {/* Sidebars */}
        <div className="flex flex-col gap-4">
          {/* Overdue Tenants */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Overdue Tenants</h3>
              <a href="#" className="text-xs text-[#00B87C] hover:underline">View All</a>
            </div>
            <div className="space-y-4">
              {allBills.filter(b => b.status === "UNPAID").slice(0, 4).map((bill, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <img src={`https://ui-avatars.com/api/?name=${bill.tenantName}&background=f1f5f9`} alt="avatar" className="w-8 h-8 rounded-full" />
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{bill.tenantName}</p>
                      <p className="text-[10px] text-slate-500">{bill.roomOrProperty || "General"}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-red-500">NPR {bill.amount.toLocaleString()}</p>
                    <p className="text-[10px] text-red-400">Unpaid</p>
                  </div>
                </div>
              ))}
              {allBills.filter(b => b.status === "UNPAID").length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No overdue tenants.</p>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-900 text-sm">Recent Activity</h3>
              <a href="#" className="text-xs text-[#00B87C] hover:underline">View All</a>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
              {allBills.slice(0, 4).map((bill, i) => (
                <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-white ${bill.status === 'PAID' ? 'bg-emerald-500' : 'bg-blue-500'} text-white shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 ml-0 mr-3`}>
                    {bill.status === 'PAID' ? <CheckCircle className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                  </div>
                  <div className="w-[calc(100%-2.5rem)]">
                    <div className="flex justify-between items-start">
                      <p className="text-xs text-slate-700">
                        {bill.status === 'PAID' ? (
                          <>Bill paid by <span className="font-semibold text-slate-900">{bill.tenantName}</span></>
                        ) : (
                          <>Rent bill generated for <span className="font-semibold text-slate-900">{bill.tenantName}</span></>
                        )}
                      </p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                        {new Date(bill.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {allBills.length === 0 && (
                <p className="text-xs text-slate-500 text-center py-4">No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Tenant Modal */}
      {isTenantModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsTenantModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Add New Tenant</h2>
              <button onClick={() => setIsTenantModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddTenant} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Tenant Name</label>
                <input type="text" required value={newTenant.name} onChange={e => setNewTenant({ ...newTenant, name: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" placeholder="e.g. Ram Shah" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Room / Property</label>
                <input type="text" value={newTenant.roomOrProperty} onChange={e => setNewTenant({ ...newTenant, roomOrProperty: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" placeholder="e.g. Green Villa / 203" />
              </div>
              {tenantError && <div className="text-sm text-red-500 bg-red-50 rounded-lg p-3 border border-red-100">{tenantError}</div>}
              {tenantSuccess && <div className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3 border border-emerald-100">{tenantSuccess}</div>}
              <div className="pt-2">
                <button type="submit" disabled={savingTenant} className="w-full rounded-lg bg-[#00B87C] hover:bg-[#009B69] py-2.5 text-sm font-bold text-white shadow-sm transition">
                  {savingTenant ? "Saving..." : "Save Tenant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Bill Modal */}
      {isBillModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsBillModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Generate Rent Bill</h2>
              <button onClick={() => setIsBillModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddBill} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Select Tenant</label>
                <select required value={newBill.tenantId} onChange={e => setNewBill({ ...newBill, tenantId: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition">
                  <option value="">Choose tenant...</option>
                  {tenants.map(t => <option key={t.id} value={t.id}>{t.name} {t.roomOrProperty ? `(${t.roomOrProperty})` : ""}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Bill Title</label>
                <input type="text" placeholder="e.g. May 2025 Rent" required value={newBill.title} onChange={e => setNewBill({ ...newBill, title: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Amount (NPR)</label>
                <input type="number" required value={newBill.amount} onChange={e => setNewBill({ ...newBill, amount: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" placeholder="e.g. 20000" />
              </div>
              {billError && <div className="text-sm text-red-500 bg-red-50 rounded-lg p-3 border border-red-100">{billError}</div>}
              {billSuccess && <div className="text-sm text-emerald-600 bg-emerald-50 rounded-lg p-3 border border-emerald-100">{billSuccess}</div>}
              <div className="pt-2">
                <button type="submit" disabled={savingBill || tenants.length === 0} className="w-full rounded-lg bg-[#00B87C] hover:bg-[#009B69] py-2.5 text-sm font-bold text-white shadow-sm transition mt-2">
                  {savingBill ? "Generating..." : "Issue Bill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (kept hidden typically unless invoked) */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Delete Tenant?</h2>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="text-slate-400 hover:text-slate-600 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this tenant and all their bills? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}
                className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteTenant} disabled={isDeleting}
                className="flex-1 rounded-lg bg-red-500 hover:bg-red-600 py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
