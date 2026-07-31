"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Users, Receipt, X, Loader2, Check, TrendingDown, ArrowUpRight } from "lucide-react";
import api from "../../../../lib/api";

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ title: "", amount: "" });
  const [saving, setSaving] = useState(false);

  const fetchGroup = async () => {
    try {
      const [groupsRes, expensesRes] = await Promise.all([
        api.get("/groups"),
        api.get(`/group-expenses/${id}`)
      ]);
      const found = (groupsRes.data as any[]).find((g: any) => g.id === id);
      setGroup(found || null);
      setExpenses(expensesRes.data);
    } catch (err) {
      console.error("Failed to fetch group details", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchGroup();
  }, [id]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const memberCount = group?.members?.length || 1;
      const totalAmount = parseFloat(expenseForm.amount);
      const splitAmount = totalAmount / memberCount;

      const splits = (group?.members || []).map((m: any) => ({
        userId: m.userId,
        amount: splitAmount
      }));

      await api.post("/group-expenses", {
        title: expenseForm.title,
        amount: totalAmount,
        groupId: id,
        splits
      });

      setIsExpenseModalOpen(false);
      setExpenseForm({ title: "", amount: "" });
      fetchGroup();
    } catch (err) {
      console.error("Failed to add expense", err);
    } finally {
      setSaving(false);
    }
  };

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <div className="flex items-center gap-3 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Loading group details...</span>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 gap-4">
        <p className="text-slate-400">Group not found.</p>
        <button onClick={() => router.push("/groups")} className="text-indigo-400 hover:underline text-sm font-semibold flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to Groups
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.push("/groups")} className="p-2 rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{group.name}</h1>
            <p className="text-sm text-slate-400 mt-0.5">{group.description || "No description"}</p>
          </div>
        </div>
        <button onClick={() => setIsExpenseModalOpen(true)} className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition">
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total Spent</p>
          <p className="text-2xl font-bold text-white">NPR {totalSpent.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Your Share</p>
          <p className="text-2xl font-bold text-indigo-400">NPR {group.members?.length > 0 ? (totalSpent / group.members.length).toLocaleString(undefined, { maximumFractionDigits: 0 }) : "0"}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-5">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Members</p>
          <div className="flex -space-x-2 mt-1">
            {(group.members || []).slice(0, 6).map((m: any, i: number) => (
              <div key={i} className="h-8 w-8 rounded-full border-2 border-[#1E293B] bg-slate-700 flex items-center justify-center text-xs font-bold text-white" title={m.user?.name}>
                {(m.user?.name || "?").charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expenses List */}
      <div>
        <h2 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Expense Feed</h2>
        {expenses.length === 0 ? (
          <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-12 flex flex-col items-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-indigo-500/10 flex items-center justify-center"><Receipt className="h-6 w-6 text-indigo-400" /></div>
            <h3 className="font-bold text-slate-200">No expenses yet</h3>
            <p className="text-sm text-slate-500 max-w-xs">Click "Add Expense" to record a shared expense for this group.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense: any) => (
              <div key={expense.id} className="rounded-2xl border border-white/5 bg-[#1A1333] p-5 flex items-center justify-between hover:border-white/10 transition">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                    <TrendingDown className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-sm">{expense.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Paid by {expense.paidBy?.name || "Someone"} · {new Date(expense.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                      {(expense.splits || []).map((split: any, i: number) => (
                        <span key={i} className="text-[10px] font-semibold bg-white/5 text-slate-400 px-2 py-0.5 rounded-full">
                          {split.user?.name || "?"}: NPR {split.amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-white text-lg">NPR {expense.amount.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">Split equally</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsExpenseModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Add Group Expense</h2>
                <p className="text-xs text-slate-500 mt-0.5">Will be split equally among {group.members?.length || 1} member(s)</p>
              </div>
              <button onClick={() => setIsExpenseModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">What was it for?</label>
                <input type="text" required value={expenseForm.title} onChange={e => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g. Hotel, Dinner, Taxi"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Amount (NPR)</label>
                <input type="number" required min="1" value={expenseForm.amount} onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition" />
                {expenseForm.amount && group.members?.length > 0 && (
                  <p className="text-xs text-slate-500 mt-1.5">Each person pays: <strong className="text-indigo-400">NPR {(parseFloat(expenseForm.amount) / group.members.length).toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></p>
                )}
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? "Saving..." : "Add Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
