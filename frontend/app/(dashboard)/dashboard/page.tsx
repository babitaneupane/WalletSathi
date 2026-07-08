"use client";

import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Target,
  MoreHorizontal,
  X,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../../../lib/api";
import TransactionModal from "../../../components/TransactionModal";

const CHART_COLORS = ["#06B6D4", "#8B5CF6", "#10B981", "#F59E0B", "#EF4444"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur p-3 text-xs shadow-xl">
        <p className="font-semibold text-slate-300 mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-medium">
            {p.name}: NPR {p.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingsModalOpen, setIsSavingsModalOpen] = useState(false);
  const [savingsForm, setSavingsForm] = useState({ name: "", targetAmount: "", currentAmount: "" });
  const [savingSavings, setSavingSavings] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await api.get("/dashboard/stats");
      setStats(res.data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSavingsGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSavings(true);
    try {
      await api.post("/savings", {
        name: savingsForm.name,
        targetAmount: parseFloat(savingsForm.targetAmount),
        currentAmount: parseFloat(savingsForm.currentAmount || "0"),
      });
      setIsSavingsModalOpen(false);
      setSavingsForm({ name: "", targetAmount: "", currentAmount: "" });
      fetchStats();
    } catch (err) {
      console.error("Failed to create savings goal", err);
    } finally {
      setSavingSavings(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading)
    return (
      <div className="space-y-6 animate-pulse p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-36 bg-white/5 rounded-2xl" />
          ))}
        </div>
        <div className="h-72 bg-white/5 rounded-2xl" />
      </div>
    );

  // Build area chart data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const barDataMap: Record<string, { name: string; income: number; expense: number }> = {};
  (stats?.transactions || []).forEach((tx: any) => {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!barDataMap[key]) barDataMap[key] = { name: monthNames[d.getMonth()], income: 0, expense: 0 };
    if (tx.type === "INCOME") barDataMap[key].income += tx.amount;
    else barDataMap[key].expense += tx.amount;
  });
  const areaData = Object.values(barDataMap).slice(-6);

  // Build pie data
  const categoryMap: Record<string, number> = {};
  (stats?.transactions || [])
    .filter((tx: any) => tx.type === "EXPENSE")
    .forEach((tx: any) => {
      const cat = tx.category?.name || "General";
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const totalSpent = stats?.totalExpenses || 0;
  const savingsGoals: any[] = stats?.savingsGoals || [];

  // Calculate current month's stats
  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${now.getMonth()}`;
  const currentMonthStats = barDataMap[currentMonthKey] || { income: 0, expense: 0 };

  return (
    <div className="flex-1 space-y-5 p-6">
      {/* Page top row */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Overview</p>
          <h1 className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
            Financial Overview
          </h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/30 transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Balance Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/80 to-purple-600/80 p-5 border border-white/10">
          <div className="absolute -right-4 -top-4 h-28 w-28 rounded-full bg-white/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-semibold text-white/80 bg-white/20 px-2 py-1 rounded-full">
              Balance
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            NPR {(stats?.totalSavings || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-white/60">Total balance</p>
        </div>

        {/* Income Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-emerald-500/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <ArrowUpRight className="h-5 w-5 text-emerald-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
              <TrendingUp className="h-3 w-3" /> Income
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            NPR {(currentMonthStats.income || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">This month's income</p>
        </div>

        {/* Expense Card */}
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-red-500/10 blur-xl" />
          <div className="flex items-center justify-between mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <ArrowDownRight className="h-5 w-5 text-red-400" />
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-1 rounded-full">
              <TrendingDown className="h-3 w-3" /> Expenses
            </span>
          </div>
          <p className="text-2xl font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
            NPR {(currentMonthStats.expense || 0).toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">This month's expenses</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Monthly Trend</h2>
              <p className="text-xs text-slate-500 mt-0.5">Income vs Expenses over time</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-cyan-400 inline-block" />Income</span>
              <span className="flex items-center gap-1.5 text-slate-400"><span className="h-2 w-2 rounded-full bg-purple-400 inline-block" />Expense</span>
            </div>
          </div>
          <div className="h-56 w-full">
            {areaData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#475569", fontSize: 11 }}
                  />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Income"
                    stroke="#06B6D4"
                    strokeWidth={2}
                    fill="url(#incomeGrad)"
                    dot={{ fill: "#06B6D4", r: 3, strokeWidth: 0 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Expense"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fill="url(#expenseGrad)"
                    dot={{ fill: "#8B5CF6", r: 3, strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                <TrendingUp className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">No data yet</p>
                <p className="text-xs">Add transactions to see the chart</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <h2 className="font-bold text-white mb-1" style={{ fontFamily: "var(--font-outfit)" }}>Breakdown</h2>
          <p className="text-xs text-slate-500 mb-4">By category</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, index) => (
                        <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: "#0F172A",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#F1F5F9",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xs text-slate-500">Spent</span>
                  <span className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
                    NPR {totalSpent >= 1000 ? `${(totalSpent / 1000).toFixed(0)}k` : totalSpent}
                  </span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.slice(0, 4).map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-xs text-slate-400">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">
                      {((entry.value / totalSpent) * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-44 flex flex-col items-center justify-center text-slate-600 gap-2">
              <p className="text-sm font-medium">No expense data</p>
              <p className="text-xs">Add expenses to see categories</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Recent Transactions + Savings Goals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Recent Transactions</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your latest activity</p>
            </div>
          </div>
          <div className="space-y-2">
            {(stats?.recentTransactions || []).length > 0 ? (
              (stats.recentTransactions as any[]).map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-4 rounded-xl bg-white/3 px-4 py-3 hover:bg-white/5 transition-colors group"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                      tx.type === "INCOME" ? "bg-emerald-500/15 text-emerald-400" : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {tx.type === "INCOME" ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 truncate">{tx.description}</p>
                    <p className="text-xs text-slate-500">
                      {tx.category?.name || "General"} · {new Date(tx.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${tx.type === "INCOME" ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {tx.type === "INCOME" ? "+" : "-"} NPR {tx.amount.toLocaleString()}
                  </span>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-slate-600">
                <Wallet className="h-10 w-10 mb-3 opacity-30" />
                <p className="text-sm font-medium">No transactions yet</p>
                <p className="text-xs mt-1">Click "Add Transaction" to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Savings Goals */}
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Savings</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your goals</p>
            </div>
            <button onClick={() => setIsSavingsModalOpen(true)} className="h-7 w-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-white/5 hover:text-slate-300 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {savingsGoals.length > 0 ? (
            <div className="space-y-4">
              {savingsGoals.map((goal, idx) => {
                const pct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                const colors = ["from-cyan-500 to-cyan-400", "from-purple-500 to-purple-400", "from-emerald-500 to-emerald-400"];
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-slate-500" />
                        <span className="text-sm font-semibold text-slate-200">{goal.name}</span>
                      </div>
                      <span className="text-xs font-bold text-slate-400">{pct.toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-slate-600">NPR {goal.currentAmount.toLocaleString()}</span>
                      <span className="text-xs text-slate-600">NPR {goal.targetAmount.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-slate-600">
              <Target className="h-10 w-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">No savings goals yet</p>
              <p className="text-xs mt-1 text-center">Visit the Savings page to create a goal</p>
            </div>
          )}
        </div>
      </div>

      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={fetchStats} />

      {/* Savings Goal Modal */}
      {isSavingsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={e => e.target === e.currentTarget && setIsSavingsModalOpen(false)}>
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>New Savings Goal</h2>
              <button onClick={() => setIsSavingsModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition"><X className="h-5 w-5" /></button>
            </div>
            <form onSubmit={handleCreateSavingsGoal} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Goal Name</label>
                <input type="text" required value={savingsForm.name} onChange={e => setSavingsForm({ ...savingsForm, name: e.target.value })}
                  placeholder="e.g. Europe Trip, Emergency Fund"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Target Amount (NPR)</label>
                <input type="number" required min="1" value={savingsForm.targetAmount} onChange={e => setSavingsForm({ ...savingsForm, targetAmount: e.target.value })}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Already Saved (NPR)</label>
                <input type="number" min="0" value={savingsForm.currentAmount} onChange={e => setSavingsForm({ ...savingsForm, currentAmount: e.target.value })}
                  placeholder="0.00 (optional)"
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition" />
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setIsSavingsModalOpen(false)} className="flex-1 rounded-xl border border-white/10 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 transition">Cancel</button>
                <button type="submit" disabled={savingSavings} className="flex-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-cyan-500/20 transition">
                  {savingSavings ? "Saving..." : "Create Goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
