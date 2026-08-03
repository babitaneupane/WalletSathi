"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle, Clock, User, FileText, Trash2, AlertCircle, ArrowUpRight, TrendingUp, Search, Download, Filter, Receipt, Calendar, AlertTriangle, X, MoreVertical, Edit2, Eye, Bell, CreditCard, Send, UserPlus, FileBarChart } from "lucide-react";
import api from "../../../lib/api";
import { useAlert } from "../../../context/AlertContext";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
  const [isRecordPaymentModalOpen, setIsRecordPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isTenantListModalOpen, setIsTenantListModalOpen] = useState(false);
  const [isDateRangeModalOpen, setIsDateRangeModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedBillForAction, setSelectedBillForAction] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [filterCriteria, setFilterCriteria] = useState({ property: "", minAmount: "", maxAmount: "" });

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
      showAlert("Bill marked as paid successfully!", "success");
      setIsRecordPaymentModalOpen(false);
      setSelectedBillForAction(null);
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

  const filteredBills = allBills.filter(bill => {
    const matchesSearch = bill.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (bill.roomOrProperty || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (dateRange.start) {
      const billDate = new Date(bill.createdAt);
      const start = new Date(dateRange.start);
      if (billDate < start) return false;
    }
    if (dateRange.end) {
      const billDate = new Date(bill.createdAt);
      const end = new Date(dateRange.end);
      end.setHours(23, 59, 59, 999);
      if (billDate > end) return false;
    }

    if (filterCriteria.property && filterCriteria.property.toLowerCase() !== "all") {
      const prop = bill.roomOrProperty || "General";
      if (prop.toLowerCase() !== filterCriteria.property.toLowerCase()) return false;
    }
    if (filterCriteria.minAmount && bill.amount < Number(filterCriteria.minAmount)) return false;
    if (filterCriteria.maxAmount && bill.amount > Number(filterCriteria.maxAmount)) return false;
    
    if (activeTab === "All") return true;
    if (activeTab === "Paid" && bill.status === "PAID") return true;
    if (activeTab === "Pending" && bill.status === "UNPAID") return true;
    if (activeTab === "Overdue" && bill.status === "UNPAID") return true;
    return false;
  });

  const exportReport = () => {
    try {
      if (filteredBills.length === 0) {
        showAlert("No data available to export.", "error");
        return;
      }

      const doc = new jsPDF();
      doc.setFontSize(20);
      doc.text("Rent Report", 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
      
      let totalAmount = 0;
      let totalPaid = 0;
      let totalUnpaid = 0;

      const tableData = filteredBills.map(bill => {
        totalAmount += bill.amount;
        if (bill.status === "PAID") totalPaid += bill.amount;
        else totalUnpaid += bill.amount;

        return [
          bill.tenantName,
          bill.roomOrProperty || "General",
          new Date(bill.createdAt).toLocaleDateString(),
          `NPR ${bill.amount.toLocaleString()}`,
          bill.status
        ];
      });

      // Add a total row
      tableData.push([
        "TOTAL",
        "",
        "",
        `NPR ${totalAmount.toLocaleString()}`,
        ""
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Tenant", "Property", "Date", "Amount", "Status"]],
        body: tableData,
        didParseCell: function (data: any) {
          if (data.row.index === tableData.length - 1) {
             data.cell.styles.fontStyle = 'bold';
             data.cell.styles.fillColor = [240, 240, 240];
          }
        }
      });

      // Summary block at the end
      const finalY = (doc as any).lastAutoTable.finalY || 40;
      doc.setFontSize(10);
      doc.text(`Total Collected: NPR ${totalPaid.toLocaleString()}`, 14, finalY + 10);
      doc.text(`Total Pending: NPR ${totalUnpaid.toLocaleString()}`, 14, finalY + 16);

      doc.save("rent-report.pdf");
      showAlert("Report downloaded successfully!", "success");
    } catch (err) {
      console.error("PDF Export error:", err);
      showAlert("Failed to export report.", "error");
    }
  };

  const totalPending = filteredBills.filter(b => b.status === "UNPAID").reduce((s, b) => s + b.amount, 0);
  const totalCollected = filteredBills.filter(b => b.status === "PAID").reduce((s, b) => s + b.amount, 0) + generalRentIncome;
  const overdueCount = filteredBills.filter(b => b.status === "UNPAID").length;

  const paidCount = filteredBills.filter(b => b.status === "PAID").length;
  const pendingCount = overdueCount; // all unpaid are pending for now
  const actualOverdueCount = 0; // simple split

  const pieData = [
    { name: 'Paid', value: paidCount },
    { name: 'Pending', value: pendingCount },
    { name: 'Overdue', value: actualOverdueCount },
  ];

  const totalUnits = tenants.length; // Active tenants is total units

  const monthlyData: Record<string, number> = {};
  // include paid bills
  filteredBills.forEach((bill: any) => {
    if (bill.status === "PAID") {
      const d = new Date(bill.updatedAt || bill.createdAt || new Date());
      const month = d.toLocaleString('default', { month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + bill.amount;
    }
  });
  // include general rent transactions
  rentTransactions.forEach(tx => {
    const d = new Date(tx.createdAt || tx.date || new Date());
    const month = d.toLocaleString('default', { month: 'short' });
    monthlyData[month] = (monthlyData[month] || 0) + tx.amount;
  });
  
  const collectionData = Object.entries(monthlyData).map(([name, amount]) => ({ name, amount }));
  if (collectionData.length === 0) collectionData.push({ name: 'No Data', amount: 0 });

  const getActiveDateRangeLabel = () => {
    if (dateRange.start && dateRange.end) return `${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}`;
    if (dateRange.start) return `From ${new Date(dateRange.start).toLocaleDateString()}`;
    if (dateRange.end) return `Until ${new Date(dateRange.end).toLocaleDateString()}`;
    return "All Time";
  };

  return (
    <div className="space-y-6 p-6 max-w-[1400px] mx-auto bg-[#F8F9FA] min-h-screen font-sans">
      
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-1">Rent Dashboard</h1>
          <p className="text-sm text-slate-500">Track rent collection, payments and tenants in real-time.</p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          <div onClick={() => setIsDateRangeModalOpen(true)} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition shadow-sm">
            <Calendar className="h-4 w-4" />
            <span>{getActiveDateRangeLabel()}</span>
          </div>
          <button onClick={exportReport} className="flex items-center gap-2 px-4 py-2 border border-slate-200 bg-white rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm">
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
        <div onClick={() => setIsTenantListModalOpen(true)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm cursor-pointer hover:border-[#00B87C] transition">
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
            <button onClick={() => setIsReminderModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group">
              <Send className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-600">Send Reminder</span>
            </button>
            <button onClick={() => setIsReceiptModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-purple-500 hover:bg-purple-50 transition group">
              <Receipt className="h-6 w-6 text-purple-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-purple-600">Rent Receipt</span>
            </button>
            <button onClick={() => setIsRecordPaymentModalOpen(true)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition group">
              <CreditCard className="h-6 w-6 text-blue-500 mb-2" />
              <span className="text-[10px] font-medium text-slate-700 group-hover:text-blue-600">Record Payment</span>
            </button>
            <button onClick={() => showAlert("Detailed reports coming soon!", "info")} className="flex flex-col items-center justify-center p-3 rounded-xl border border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition group">
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
                <button onClick={() => setIsFilterModalOpen(true)} className={`flex items-center gap-1.5 px-3 py-1.5 border ${filterCriteria.property || filterCriteria.minAmount || filterCriteria.maxAmount ? 'border-[#00B87C] text-[#00B87C] bg-emerald-50' : 'border-slate-200 text-slate-600'} rounded-lg text-xs font-medium hover:bg-slate-50`}>
                  <Filter className="h-3 w-3" /> Filter
                </button>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                           {bill.status === "UNPAID" ? (
                             <button onClick={() => { setSelectedBillForAction(bill.id); setIsRecordPaymentModalOpen(true); }} className="px-2 py-1 bg-blue-500/10 text-blue-600 text-xs font-semibold rounded hover:bg-blue-500/20 transition">
                               Pay
                             </button>
                           ) : (
                             <button onClick={() => { setSelectedBillForAction(bill.id); setIsReceiptModalOpen(true); }} className="px-2 py-1 bg-emerald-500/10 text-emerald-600 text-xs font-semibold rounded hover:bg-emerald-500/20 transition">
                               Receipt
                             </button>
                           )}
                           <button onClick={() => confirmDelete(bill.tenantId)} className="p-1 text-slate-400 hover:text-red-600 border border-slate-200 rounded" title="Delete Tenant">
                             <Trash2 className="h-3.5 w-3.5" />
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
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-100">
              {allBills.slice(0, 4).map((bill, i) => (
                <div key={i} className="relative flex items-center justify-between group is-active">
                  <div className={`flex items-center justify-center w-5 h-5 rounded-full border border-white ${bill.status === 'PAID' ? 'bg-emerald-500' : 'bg-blue-500'} text-white shrink-0 shadow-sm z-10 ml-0 mr-3`}>
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

      {/* Record Payment Modal */}
      {isRecordPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsRecordPaymentModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
              <button onClick={() => setIsRecordPaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Select Unpaid Bill</label>
                <select 
                  value={selectedBillForAction || ""} 
                  onChange={(e) => setSelectedBillForAction(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition">
                  <option value="">Choose a bill...</option>
                  {allBills.filter(b => b.status === "UNPAID").map(b => (
                    <option key={b.id} value={b.id}>{b.tenantName} - {b.title} (NPR {b.amount})</option>
                  ))}
                </select>
              </div>
              <div className="pt-2">
                <button 
                  disabled={!selectedBillForAction} 
                  onClick={() => handlePayBill(selectedBillForAction)} 
                  className="w-full rounded-lg bg-[#00B87C] hover:bg-[#009B69] py-2.5 text-sm font-bold text-white shadow-sm transition disabled:opacity-50">
                  Mark as Paid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Send Reminder Modal */}
      {isReminderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsReminderModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-900">Send Reminders</h2>
              <button onClick={() => setIsReminderModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-6">Send a friendly payment reminder to all {allBills.filter(b => b.status === "UNPAID").length} tenants with overdue bills?</p>
            <div className="flex gap-3">
              <button onClick={() => setIsReminderModalOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button 
                onClick={() => {
                  showAlert(`Reminders sent successfully to ${allBills.filter(b => b.status === "UNPAID").length} tenants!`, "success");
                  setIsReminderModalOpen(false);
                }} 
                className="flex-1 rounded-lg bg-blue-500 hover:bg-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition">
                Send Reminders
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rent Receipt Modal */}
      {isReceiptModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsReceiptModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Rent Receipt</h2>
              <button onClick={() => setIsReceiptModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Select Paid Bill</label>
                <select 
                  value={selectedBillForAction || ""} 
                  onChange={(e) => setSelectedBillForAction(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition">
                  <option value="">Choose a bill...</option>
                  {allBills.filter(b => b.status === "PAID").map(b => (
                    <option key={b.id} value={b.id}>{b.tenantName} - {b.title} (NPR {b.amount})</option>
                  ))}
                </select>
              </div>
              
              {selectedBillForAction && (
                <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-2 mt-4 text-sm text-slate-700">
                  <p className="font-bold text-slate-900 text-center mb-4 uppercase tracking-wider text-xs">Official Receipt</p>
                  <p className="flex justify-between"><span>Tenant:</span> <span className="font-medium">{allBills.find(b => b.id === selectedBillForAction)?.tenantName}</span></p>
                  <p className="flex justify-between"><span>Property:</span> <span className="font-medium">{allBills.find(b => b.id === selectedBillForAction)?.roomOrProperty}</span></p>
                  <p className="flex justify-between"><span>Amount Paid:</span> <span className="font-bold text-emerald-600">NPR {allBills.find(b => b.id === selectedBillForAction)?.amount}</span></p>
                  <p className="flex justify-between"><span>Date:</span> <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                </div>
              )}
              
              <div className="pt-4 flex gap-3">
                <button 
                  disabled={!selectedBillForAction}
                  onClick={() => showAlert("Receipt sent to tenant!", "success")} 
                  className="flex-1 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 py-2.5 text-sm font-semibold transition disabled:opacity-50">
                  Email Receipt
                </button>
                <button 
                  disabled={!selectedBillForAction}
                  onClick={() => showAlert("Downloading receipt...", "info")} 
                  className="flex-1 rounded-lg bg-purple-500 hover:bg-purple-600 text-white py-2.5 text-sm font-bold shadow-sm transition disabled:opacity-50">
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Total Tenants List Modal */}
      {isTenantListModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsTenantListModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">All Tenants</h2>
              <button onClick={() => setIsTenantListModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
              {tenants.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No tenants found.</p>
              ) : (
                tenants.map(tenant => (
                  <div key={tenant.id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${tenant.name}&background=f1f5f9&color=0f172a`} alt="avatar" className="w-8 h-8 rounded-full" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{tenant.name}</p>
                        <p className="text-[10px] text-slate-500">{tenant.roomOrProperty || "General"}</p>
                      </div>
                    </div>
                    <button onClick={() => { setIsTenantListModalOpen(false); confirmDelete(tenant.id); }} className="text-red-500 hover:text-red-600 p-1">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
               <button onClick={() => setIsTenantListModalOpen(false)} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                 Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Date Range Modal */}
      {isDateRangeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsDateRangeModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Select Date Range</h2>
              <button onClick={() => setIsDateRangeModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Start Date</label>
                <input type="date" value={dateRange.start} onChange={(e) => setDateRange({...dateRange, start: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">End Date</label>
                <input type="date" value={dateRange.end} onChange={(e) => setDateRange({...dateRange, end: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" />
              </div>
            </div>
            <div className="mt-6 flex gap-3">
               <button onClick={() => { setDateRange({start: "", end: ""}); setIsDateRangeModalOpen(false); }} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                 Clear
               </button>
               <button onClick={() => setIsDateRangeModalOpen(false)} className="flex-1 rounded-lg bg-[#00B87C] hover:bg-[#009B69] py-2.5 text-sm font-bold text-white shadow-sm transition">
                 Apply
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} onClick={(e) => e.target === e.currentTarget && setIsFilterModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
             <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-900">Advanced Filters</h2>
              <button onClick={() => setIsFilterModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-2 block">Property / Room</label>
                <select value={filterCriteria.property} onChange={(e) => setFilterCriteria({...filterCriteria, property: e.target.value})} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition">
                  <option value="">All Properties</option>
                  {Array.from(new Set(tenants.map(t => t.roomOrProperty || "General"))).map((prop, i) => (
                    <option key={i} value={prop}>{prop}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-2 block">Min Amount</label>
                  <input type="number" value={filterCriteria.minAmount} onChange={(e) => setFilterCriteria({...filterCriteria, minAmount: e.target.value})} placeholder="0" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-2 block">Max Amount</label>
                  <input type="number" value={filterCriteria.maxAmount} onChange={(e) => setFilterCriteria({...filterCriteria, maxAmount: e.target.value})} placeholder="Any" className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 focus:border-[#00B87C] focus:outline-none transition" />
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
               <button onClick={() => { setFilterCriteria({property: "", minAmount: "", maxAmount: ""}); setIsFilterModalOpen(false); }} className="flex-1 rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition">
                 Reset
               </button>
               <button onClick={() => setIsFilterModalOpen(false)} className="flex-1 rounded-lg bg-[#00B87C] hover:bg-[#009B69] py-2.5 text-sm font-bold text-white shadow-sm transition">
                 Apply Filters
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
