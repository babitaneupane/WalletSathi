"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Download, Pencil, Trash2, X, Check } from "lucide-react";
import api from "../../../lib/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Transaction = {
  id: string;
  amount: number;
  description: string;
  type: "INCOME" | "EXPENSE";
  createdAt: string;
  category?: { name: string };
};

const DATE_FILTERS = ["All Time", "Today", "Yesterday", "This Month", "This Year", "Custom"] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

const CATEGORIES = ["Food", "Transport", "Utilities", "Rent", "Shopping", "Health", "Entertainment", "General", "Salary", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [categoryFilter, setCategoryFilter] = useState("All Categories");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All Time");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  // Edit modal
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "", type: "EXPENSE", categoryName: "General" });

  const fetchTransactions = async () => {
    try {
      const res = await api.get("/transactions");
      setTransactions(res.data);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // All distinct categories from fetched data
  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category?.name || "General"));
    return ["All Categories", ...Array.from(cats)];
  }, [transactions]);

  // Filtering logic
  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      // Search
      if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // Type
      if (typeFilter !== "All Types" && tx.type !== typeFilter.toUpperCase()) return false;
      // Category
      if (categoryFilter !== "All Categories" && (tx.category?.name || "General") !== categoryFilter) return false;
      // Date
      const d = new Date(tx.createdAt);
      if (dateFilter === "Today") {
        if (d.toDateString() !== now.toDateString()) return false;
      } else if (dateFilter === "Yesterday") {
        const yesterday = new Date(now); yesterday.setDate(now.getDate() - 1);
        if (d.toDateString() !== yesterday.toDateString()) return false;
      } else if (dateFilter === "This Month") {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "This Year") {
        if (d.getFullYear() !== now.getFullYear()) return false;
      } else if (dateFilter === "Custom") {
        if (customFrom && d < new Date(customFrom)) return false;
        if (customTo && d > new Date(customTo + "T23:59:59")) return false;
      }
      return true;
    });
  }, [transactions, searchQuery, typeFilter, categoryFilter, dateFilter, customFrom, customTo]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete", err);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({
      amount: String(tx.amount),
      description: tx.description,
      type: tx.type,
      categoryName: tx.category?.name || "General",
    });
  };

  const handleEditSave = async () => {
    if (!editingTx) return;
    try {
      await api.put(`/transactions/${editingTx.id}`, editForm);
      setEditingTx(null);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to update", err);
    }
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 18);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);

    autoTable(doc, {
      startY: 32,
      head: [["Date", "Description", "Category", "Type", "Amount (NPR)"]],
      body: filtered.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.description,
        tx.category?.name || "General",
        tx.type,
        `${tx.type === "INCOME" ? "+" : "-"} ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      ]),
      headStyles: { fillColor: [99, 102, 241] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });

    const total_income = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
    const total_expense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total Income: NPR ${total_income.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, finalY);
    doc.text(`Total Expense: NPR ${total_expense.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, finalY + 7);
    doc.text(`Net Balance: NPR ${(total_income - total_expense).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 14, finalY + 14);

    doc.save("transactions.pdf");
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
        <p className="text-sm text-slate-500 mt-1">Manage and track your financial flow</p>
      </div>

      <div className="glass rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap gap-3 items-center justify-between bg-white/50">
          <div className="flex flex-wrap gap-3">
            {/* Type filter */}
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary p-2.5 w-36"
            >
              <option>All Types</option>
              <option>Income</option>
              <option>Expense</option>
            </select>

            {/* Category filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary p-2.5 w-44"
            >
              {allCategories.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value as DateFilter)}
              className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary p-2.5 w-40"
            >
              {DATE_FILTERS.map(d => <option key={d}>{d}</option>)}
            </select>

            {/* Custom date range */}
            {dateFilter === "Custom" && (
              <div className="flex gap-2 items-center">
                <input
                  type="date"
                  value={customFrom}
                  onChange={e => setCustomFrom(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary p-2.5"
                />
                <span className="text-slate-400 text-sm">to</span>
                <input
                  type="date"
                  value={customTo}
                  onChange={e => setCustomTo(e.target.value)}
                  className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-primary focus:border-primary p-2.5"
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 items-center">
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-primary transition border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-primary/5"
            >
              <Download className="h-4 w-4" /> Export PDF
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by description..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="h-10 w-64 rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Count */}
        <div className="px-6 py-2 border-b border-slate-100 text-xs text-slate-400 font-medium">
          Showing {filtered.length} of {transactions.length} transactions
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100 bg-slate-50/50 sticky top-0">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Amount (NPR)</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12 text-slate-400">Loading transactions...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map((tx) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-500">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-900 font-semibold">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {tx.category?.name || "General"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${tx.type === "INCOME" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold text-base ${tx.type === "INCOME" ? "text-emerald-600" : "text-red-500"}`}>
                      {tx.type === "INCOME" ? "+" : "-"} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEdit(tx)}
                          className="p-2 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-lg transition"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tx.id)}
                          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    {transactions.length === 0 ? "No transactions yet." : "No transactions match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-900">Edit Transaction</h2>
              <button onClick={() => setEditingTx(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
                <input
                  type="text"
                  value={editForm.description}
                  onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount (NPR)</label>
                <input
                  type="number"
                  value={editForm.amount}
                  onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Type</label>
                  <select
                    value={editForm.type}
                    onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                  <select
                    value={editForm.categoryName}
                    onChange={e => setEditForm({ ...editForm, categoryName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setEditingTx(null)}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-lg shadow-primary/20 transition flex items-center justify-center gap-2"
                >
                  <Check className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
