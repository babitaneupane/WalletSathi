"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Receipt, Users, Loader2, DollarSign, SplitSquareHorizontal } from "lucide-react";
import Link from "next/link";
import api from "../../../../lib/api";
import { useAuth } from "../../../../context/AuthContext";

export default function GroupDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user } = useAuth();
  
  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", amount: "" });
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/groupExpenses/${id}`)
      ]);
      setGroup(groupRes.data);
      setExpenses(expensesRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load group details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || isNaN(Number(formData.amount))) return;
    
    setSaving(true);
    
    // Equal split among all members
    const totalAmount = Number(formData.amount);
    const memberCount = group.members.length;
    const splitAmount = totalAmount / memberCount;
    
    const splits = group.members.map((m: any) => ({
      userId: m.userId,
      amount: splitAmount
    }));
    
    try {
      await api.post("/groupExpenses", {
        title: formData.title,
        amount: totalAmount,
        groupId: id,
        splits
      });
      setIsAddExpenseOpen(false);
      setFormData({ title: "", amount: "" });
      fetchData(); // Refresh list
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to add expense");
    } finally {
      setSaving(false);
    }
  };

  // Calculate balances
  // Positive balance means the person is owed money
  // Negative balance means the person owes money
  const balances: Record<string, { name: string; balance: number }> = {};
  
  if (group) {
    group.members.forEach((m: any) => {
      balances[m.userId] = { name: m.user?.name || "Unknown", balance: 0 };
    });
    
    expenses.forEach(exp => {
      // The person who paid gets credit
      if (balances[exp.paidById]) {
        balances[exp.paidById].balance += exp.amount;
      }
      // Everyone in the split owes their share
      exp.splits.forEach((s: any) => {
        if (balances[s.userId]) {
          balances[s.userId].balance -= s.amount;
        }
      });
    });
  }

  const balanceList = Object.values(balances).filter(b => Math.abs(b.balance) > 0.01);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">{error || "Group not found"}</p>
        <Link href="/split" className="text-cyan-400 hover:underline">← Back to Groups</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button onClick={() => router.push("/split")} className="p-2 rounded-full hover:bg-white/5 transition text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{group.name}</h1>
          <p className="text-sm text-slate-400">{group.members.length} members • Code: <span className="font-mono text-cyan-400">{group.inviteCode}</span></p>
        </div>
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/25 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Expenses */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Recent Expenses</h2>
          
          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-10 flex flex-col items-center text-center">
              <Receipt className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No expenses yet.</p>
              <p className="text-sm text-slate-500 mt-1">Add an expense to start splitting!</p>
            </div>
          ) : (
            expenses.map(exp => (
              <div key={exp.id} className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 shadow flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">{exp.title}</h3>
                    <p className="text-xs text-slate-500">Paid by <span className="font-semibold text-slate-300">{exp.paidBy?.name || "Someone"}</span></p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-white">${exp.amount.toFixed(2)}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{new Date(exp.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Col: Balances & Members */}
        <div className="space-y-6">
          {/* Balances */}
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <SplitSquareHorizontal className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Balances</h2>
            </div>
            
            {balanceList.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Everyone is settled up!</p>
            ) : (
              <div className="space-y-3">
                {balanceList.map((b, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-300">{b.name}</span>
                    <span className={`font-bold ${b.balance > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {b.balance > 0 ? "gets back" : "owes"} ${Math.abs(b.balance).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Members */}
          <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Members</h2>
            </div>
            <div className="space-y-3">
              {group.members.map((m: any, i: number) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                    {(m.user?.name || "?").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{m.user?.name || "Unknown"}</p>
                    <p className="text-xs text-slate-500">{m.user?.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsAddExpenseOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "var(--font-outfit)" }}>Add an Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase">Description</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dinner at Mario's"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input type="number" step="0.01" required value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none" />
                </div>
              </div>
              
              <div className="rounded-lg bg-cyan-500/10 border border-cyan-500/20 p-3 flex items-start gap-2 mt-2">
                <SplitSquareHorizontal className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-xs text-cyan-400/90 leading-relaxed">
                  This expense will be split equally among all {group.members.length} members. You paid for it.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/20 transition flex items-center justify-center gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Expense"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
