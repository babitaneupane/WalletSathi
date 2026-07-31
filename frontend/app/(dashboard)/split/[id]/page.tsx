"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, Receipt, Users, Loader2, DollarSign, SplitSquareHorizontal, CheckCircle2, Circle, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import api from "../../../../lib/api";
import { useAlert } from "../../../../context/AlertContext";

function ReceiptNPRIcon({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <text
        x="12"
        y="14.5"
        fontSize="6.2"
        fontWeight="bold"
        fontFamily="system-ui, -apple-system, sans-serif"
        textAnchor="middle"
        fill="currentColor"
        stroke="none"
      >
        NPR
      </text>
    </svg>
  );
}

export default function GroupDetailsPage() {
  const { showAlert } = useAlert();
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [group, setGroup] = useState<any>(null);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [formData, setFormData] = useState({ title: "", amount: "" });
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    try {
      const [groupRes, expensesRes] = await Promise.all([
        api.get(`/groups/${id}`),
        api.get(`/group-expenses/${id}`)
      ]);
      setGroup(groupRes.data);
      setExpenses((expensesRes.data || []).map((exp: any) => ({
        ...exp,
        splits: (exp.splits || []).map((split: any) => ({ ...split, isPaid: split.isPaid ?? false }))
      })));
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

  useEffect(() => {
    if (group?.members?.length) {
      setSelectedMembers(group.members.map((member: any) => member.userId));
    }
  }, [group]);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || isNaN(Number(formData.amount))) return;

    setSaving(true);

    const totalAmount = Number(formData.amount);
    const memberIds = selectedMembers.length > 0 ? selectedMembers : (group.members || []).map((m: any) => m.userId);
    const participantCount = memberIds.length || 1;
    const splitAmount = totalAmount / participantCount;

    const splits = memberIds.map((userId: string) => ({
      userId,
      amount: splitAmount
    }));

    try {
      await api.post("/group-expenses", {
        title: formData.title,
        amount: totalAmount,
        groupId: id,
        splits
      });
      setIsAddExpenseOpen(false);
      setFormData({ title: "", amount: "" });
      setSelectedMembers((group.members || []).map((member: any) => member.userId));
      fetchData();
      showAlert("Expense added successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err.response?.data?.message || "Failed to add expense", "error");
    } finally {
      setSaving(false);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers((current) =>
      current.includes(userId) ? current.filter((id) => id !== userId) : [...current, userId]
    );
  };

  const updateExpenseSplits = (expenseId: string, nextSplits: any[]) => {
    setExpenses((current) => current.map((exp) => (exp.id === expenseId ? { ...exp, splits: nextSplits } : exp)));
  };

  const handleAddSplitMember = (expenseId: string, userId: string) => {
    setExpenses((current) =>
      current.map((exp) => {
        if (exp.id !== expenseId) return exp;
        const currentSplits = Array.isArray(exp.splits) ? exp.splits : [];
        const nextSplits = [...currentSplits, { userId, amount: 0, isPaid: false }];
        const share = nextSplits.length > 0 ? exp.amount / nextSplits.length : 0;
        return { ...exp, splits: nextSplits.map((split: any) => ({ ...split, amount: share })) };
      })
    );
  };

  const handleRemoveSplitMember = (expenseId: string, userId: string) => {
    setExpenses((current) =>
      current.map((exp) => {
        if (exp.id !== expenseId) return exp;
        const currentSplits = Array.isArray(exp.splits) ? exp.splits : [];
        const nextSplits = currentSplits.filter((split: any) => split.userId !== userId);
        const share = nextSplits.length > 0 ? exp.amount / nextSplits.length : 0;
        return { ...exp, splits: nextSplits.map((split: any) => ({ ...split, amount: share })) };
      })
    );
  };

  const handleTogglePaid = async (expenseId: string, userId: string) => {
    const expense = expenses.find((exp) => exp.id === expenseId);
    const split = expense?.splits?.find((s: any) => s.userId === userId);
    if (!split) return;

    // Optimistically update the UI
    setExpenses((current) =>
      current.map((exp) => {
        if (exp.id !== expenseId) return exp;
        return {
          ...exp,
          splits: (exp.splits || []).map((s: any) =>
            s.userId === userId ? { ...s, isPaid: !s.isPaid } : s
          )
        };
      })
    );

    try {
      await api.patch(`/group-expenses/splits/${split.id}/toggle-paid`);
      showAlert("Split payment status updated!", "success");
    } catch (err: any) {
      console.error(err);
      showAlert(err.response?.data?.message || "Failed to update split payment status", "error");
      // Rollback on error
      setExpenses((current) =>
        current.map((exp) => {
          if (exp.id !== expenseId) return exp;
          return {
            ...exp,
            splits: (exp.splits || []).map((s: any) =>
              s.userId === userId ? { ...s, isPaid: !s.isPaid } : s
            )
          };
        })
      );
    }
  };

  const balances: Record<string, { name: string; balance: number }> = {};

  if (group) {
    group.members.forEach((m: any) => {
      balances[m.userId] = { name: m.user?.name || "Unknown", balance: 0 };
    });

    expenses.forEach((exp: any) => {
      (exp.splits || []).forEach((s: any) => {
        // Only calculate outstanding balances for unpaid splits, excluding the payer
        if (!s.isPaid && s.userId !== exp.paidById) {
          if (balances[s.userId]) {
            balances[s.userId].balance -= s.amount;
          }
          if (balances[exp.paidById]) {
            balances[exp.paidById].balance += s.amount;
          }
        }
      });
    });
  }

  const balanceList = Object.values(balances).filter((b: any) => Math.abs(b.balance) > 0.01);
  const memberMap = useMemo(() => {
    const map: Record<string, any> = {};
    (group?.members || []).forEach((member: any) => {
      map[member.userId] = member;
    });
    return map;
  }, [group]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
      </div>
    );
  }

  if (error || !group) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-400 mb-4">{error || "Group not found"}</p>
        <Link href="/split" className="text-indigo-400 hover:underline">← Back to Groups</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto pb-24">
      <div className="flex items-center gap-4 border-b border-white/5 pb-6">
        <button onClick={() => router.push("/split")} className="p-2 rounded-full hover:bg-white/5 transition text-slate-400 hover:text-white">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>{group.name}</h1>
          <p className="text-sm text-slate-400">{group.members.length} members • Code: <span className="font-mono text-indigo-400">{group.inviteCode}</span></p>
        </div>
        <button
          onClick={() => setIsAddExpenseOpen(true)}
          className="rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/25 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-white mb-4" style={{ fontFamily: "var(--font-outfit)" }}>Recent Expenses</h2>

          {expenses.length === 0 ? (
            <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-10 flex flex-col items-center text-center">
              <ReceiptNPRIcon className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-slate-400 font-medium">No expenses yet.</p>
              <p className="text-sm text-slate-500 mt-1">Add an expense to start splitting!</p>
            </div>
          ) : (
            expenses.map((exp: any) => {
              const splitRows = (group.members || []).map((member: any) => {
                const existingSplit = (exp.splits || []).find((split: any) => split.userId === member.userId);
                return {
                  userId: member.userId,
                  name: member.user?.name || "Unknown",
                  email: member.user?.email || "",
                  isIncluded: Boolean(existingSplit),
                  amount: existingSplit?.amount || 0,
                  isPaid: Boolean(existingSplit?.isPaid)
                };
              });

              return (
                <div key={exp.id} className="rounded-2xl border border-white/5 bg-[#1A1333] p-5 shadow space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <ReceiptNPRIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-200">{exp.title}</h3>
                        <p className="text-xs text-slate-500">Paid by <span className="font-semibold text-slate-300">{exp.paidBy?.name || "Someone"}</span></p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-white">NPR {Number(exp.amount || 0).toFixed(2)}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{new Date(exp.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Split details</p>
                      <span className="text-[11px] text-slate-400">{splitRows.filter((row: any) => row.isIncluded).length} joined</span>
                    </div>
                    <div className="space-y-2">
                      {splitRows.map((row: any) => (
                        <div key={row.userId} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-[#0F0B1E] px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-slate-200">{row.name}</p>
                            <p className="text-[11px] text-slate-500">{row.isIncluded ? `Share: NPR ${row.amount.toFixed(2)}` : "Not in this split"}</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {row.isIncluded ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleTogglePaid(exp.id, row.userId)}
                                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${row.isPaid ? "bg-emerald-500/15 text-emerald-400" : "bg-white/5 text-slate-400 hover:text-white"}`}
                                >
                                  {row.isPaid ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                                  {row.isPaid ? "Done" : "Mark paid"}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSplitMember(exp.id, row.userId)}
                                  className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-500/20"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />Remove
                                </button>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleAddSplitMember(exp.id, row.userId)}
                                className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-[11px] font-semibold text-indigo-400 hover:bg-indigo-500/20"
                              >
                                <UserPlus className="h-3.5 w-3.5" />Add
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <SplitSquareHorizontal className="h-5 w-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Balances</h2>
            </div>

            {balanceList.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-4">Everyone is settled up!</p>
            ) : (
              <div className="space-y-3">
                {balanceList.map((b: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-300">{b.name}</span>
                    <span className={`font-bold ${b.balance > 0 ? "text-emerald-400" : "text-rose-400"}`}>
                      {b.balance > 0 ? "gets back" : "owes"} NPR {Math.abs(b.balance).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/5 bg-[#1A1333] p-5 shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Joined Members</h2>
            </div>
            <div className="space-y-3">
              {(group.members || []).map((m: any, i: number) => (
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

      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && setIsAddExpenseOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1A1333] p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-white mb-5" style={{ fontFamily: "var(--font-outfit)" }}>Add an Expense</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase">Description</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Dinner at Mario's"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase">Amount (NPR)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500 select-none">NPR</span>
                  <input type="number" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-14 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none" />
                </div>
              </div>

              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3">
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-indigo-400">Add members to this split</p>
                <div className="space-y-2">
                  {(group.members || []).map((member: any) => (
                    <label key={member.userId} className="flex items-center justify-between rounded-lg border border-white/10 bg-[#0F0B1E] px-3 py-2 text-sm text-slate-300">
                      <span>{member.user?.name || "Unknown"}</span>
                      <input type="checkbox" checked={selectedMembers.includes(member.userId)} onChange={() => toggleMemberSelection(member.userId)} className="h-4 w-4 rounded border-slate-600 bg-transparent text-indigo-400 focus:ring-indigo-500" />
                    </label>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 p-3 flex items-start gap-2 mt-2">
                <SplitSquareHorizontal className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
                <p className="text-xs text-indigo-400/90 leading-relaxed">
                  This expense will be split equally among the selected members. You paid for it.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsAddExpenseOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 rounded-xl bg-indigo-500 hover:bg-indigo-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20 transition flex items-center justify-center gap-2">
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
