"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Download, Pencil, Trash2, X, Check, ArrowUpRight, TrendingDown, AlertTriangle } from "lucide-react";
import api from "../../../lib/api";
import TransactionModal from "../../../components/TransactionModal";
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

const DATE_FILTERS = ["All Time", "Today", "This Month", "This Year"] as const;
type DateFilter = (typeof DATE_FILTERS)[number];

const CATEGORIES = ["Food", "Transport", "Utilities", "Rent", "Shopping", "Health", "Entertainment", "General", "Salary", "Other"];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [dateFilter, setDateFilter] = useState<DateFilter>("All Time");
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [editForm, setEditForm] = useState({ amount: "", description: "", type: "EXPENSE", categoryName: "General" });
  
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const filtered = useMemo(() => {
    const now = new Date();
    return transactions.filter(tx => {
      if (searchQuery && !tx.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (typeFilter !== "All Types" && tx.type !== typeFilter.toUpperCase()) return false;
      const d = new Date(tx.createdAt);
      if (dateFilter === "Today") { if (d.toDateString() !== now.toDateString()) return false; }
      else if (dateFilter === "This Month") { if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false; }
      else if (dateFilter === "This Year") { if (d.getFullYear() !== now.getFullYear()) return false; }
      return true;
    });
  }, [transactions, searchQuery, typeFilter, dateFilter]);

  const confirmDelete = (id: string) => {
    setTxToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!txToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/transactions/${txToDelete}`);
      setDeleteModalOpen(false);
      setTxToDelete(null);
      fetchTransactions();
    } catch (err) {
      console.error("Failed to delete transaction", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const openEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setEditForm({ amount: String(tx.amount), description: tx.description, type: tx.type, categoryName: tx.category?.name || "General" });
  };

  const handleEditSave = async () => {
    if (!editingTx) return;
    await api.put(`/transactions/${editingTx.id}`, editForm);
    setEditingTx(null);
    fetchTransactions();
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text("Transaction Report", 14, 18);
    autoTable(doc, {
      startY: 28,
      head: [["Date", "Description", "Category", "Type", "Amount (NPR)"]],
      body: filtered.map(tx => [
        new Date(tx.createdAt).toLocaleDateString(),
        tx.description, tx.category?.name || "General", tx.type,
        `${tx.type === "INCOME" ? "+" : "-"} ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      ]),
      headStyles: { fillColor: [6, 182, 212] },
    });
    doc.save("transactions.pdf");
  };

  const totalIncome = filtered.filter(t => t.type === "INCOME").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter(t => t.type === "EXPENSE").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Manage</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>Transactions</h1>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleExportPDF} className="flex items-center gap-2 text-sm font-medium text-slate-500 border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 hover:bg-slate-100 transition">
            <Download className="h-4 w-4" /> Export
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-emerald-500 hover:bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition">
            <Plus className="h-4 w-4" /> New Transaction
          </button>
        </div>
      </div>

      {/* Summary Chips */}
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2">
          <ArrowUpRight className="h-4 w-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">Income: NPR {totalIncome.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2">
          <TrendingDown className="h-4 w-4 text-red-400" />
          <span className="text-xs font-semibold text-red-400">Expenses: NPR {totalExpense.toLocaleString()}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input type="text" placeholder="Search by description..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none" />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none">
          <option>All Types</option>
          <option>Income</option>
          <option>Expense</option>
        </select>
        <select value={dateFilter} onChange={e => setDateFilter(e.target.value as DateFilter)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl px-3 py-2.5 focus:outline-none">
          {DATE_FILTERS.map(d => <option key={d}>{d}</option>)}
        </select>
        <span className="text-xs text-slate-600 ml-auto">{filtered.length} of {transactions.length} records</span>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-slate-500 font-semibold border-b border-slate-200 bg-white/3 sticky top-0">
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
                <tr><td colSpan={6} className="text-center py-12 text-slate-500">Loading transactions...</td></tr>
              ) : filtered.length > 0 ? (
                filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-200 hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4 text-slate-500 text-xs">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-slate-800 font-semibold">{tx.description}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-50 text-slate-500 text-xs font-semibold px-3 py-1 rounded-full">{tx.category?.name || "General"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${tx.type === "INCOME" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>{tx.type}</span>
                    </td>
                    <td className={`px-6 py-4 text-right font-bold ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}>
                      {tx.type === "INCOME" ? "+" : "-"} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button onClick={() => openEdit(tx)} className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => confirmDelete(tx.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-600">
                    {transactions.length === 0 ? "No transactions yet. Click \"New Transaction\" to add one." : "No transactions match your filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Transaction Modal */}
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchTransactions} />

      {/* Edit Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>Edit Transaction</h2>
              <button onClick={() => setEditingTx(null)} className="text-slate-500 hover:text-slate-700 transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Description</label>
                <input type="text" value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (NPR)</label>
                <input type="number" value={editForm.amount} onChange={e => setEditForm({ ...editForm, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 focus:border-emerald-500/50 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</label>
                  <select value={editForm.type} onChange={e => setEditForm({ ...editForm, type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 focus:outline-none">
                    <option value="INCOME">Income</option>
                    <option value="EXPENSE">Expense</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                  <select value={editForm.categoryName} onChange={e => setEditForm({ ...editForm, categoryName: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 focus:outline-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setEditingTx(null)} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                <button onClick={handleEditSave} className="flex-1 rounded-xl bg-emerald-500 py-2.5 text-sm font-semibold text-slate-900 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && !isDeleting && setDeleteModalOpen(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>Delete Transaction?</h2>
              </div>
              <button onClick={() => setDeleteModalOpen(false)} disabled={isDeleting} className="text-slate-500 hover:text-slate-700 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-slate-500 mb-6">Are you sure you want to delete this transaction? This action cannot be undone.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 transition">
                Cancel
              </button>
              <button type="button" onClick={handleDelete} disabled={isDeleting}
                className="flex-1 rounded-xl bg-red-500 hover:bg-red-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-red-500/20 transition disabled:opacity-50">
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
