"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Banknote, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import api from "../../../lib/api";
import TransactionModal from "../../../components/TransactionModal";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1,2,3].map(i => <div key={i} className="h-40 bg-slate-100 rounded-2xl" />)}
      </div>
      <div className="h-80 bg-slate-100 rounded-2xl" />
    </div>
  );

  // Build real chart data from transactions
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const barDataMap: Record<string, { name: string; income: number; expense: number }> = {};
  (stats?.transactions || []).forEach((tx: any) => {
    const d = new Date(tx.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!barDataMap[key]) barDataMap[key] = { name: monthNames[d.getMonth()], income: 0, expense: 0 };
    if (tx.type === 'INCOME') barDataMap[key].income += tx.amount;
    else barDataMap[key].expense += tx.amount;
  });
  const barData = Object.values(barDataMap).slice(-6);

  // Build real pie data from expense categories
  const categoryMap: Record<string, number> = {};
  (stats?.transactions || []).filter((tx: any) => tx.type === 'EXPENSE').forEach((tx: any) => {
    const cat = tx.category?.name || 'General';
    categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
  });
  const pieData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
  const totalSpent = stats?.totalExpenses || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          New Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-5">
            <ArrowUpRight className="h-48 w-48 text-success" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-success/10 p-2">
              <ArrowUpRight className="h-5 w-5 text-success" />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Income</p>
          </div>
          <p className="text-4xl font-bold text-slate-900 mt-2">
            NPR {(stats?.totalIncome || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-success">
            <TrendingUp className="mr-1 h-4 w-4" />
            All time income
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-5">
            <ArrowDownRight className="h-48 w-48 text-danger" />
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-full bg-danger/10 p-2">
              <ArrowDownRight className="h-5 w-5 text-danger" />
            </div>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Total Expenses</p>
          </div>
          <p className="text-4xl font-bold text-slate-900 mt-2">
            NPR {(stats?.totalExpenses || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-danger">
            <TrendingUp className="mr-1 h-4 w-4 rotate-180" />
            All time expenses
          </div>
        </div>

        <div className="rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden bg-gradient-to-br from-primary to-blue-600 border-none">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 opacity-10">
            <Wallet className="h-48 w-48 text-white" />
          </div>
          <div className="flex items-center gap-3 mb-4 text-white">
            <div className="rounded-full bg-white/20 p-2 text-white">
              <Banknote className="h-5 w-5 text-white" />
            </div>
            <p className="text-sm font-medium text-white uppercase tracking-wide opacity-90">Remaining Balance</p>
          </div>
          <p className="text-4xl font-bold mt-2 text-white">
            NPR {(stats?.totalSavings || 0).toLocaleString()}
          </p>
          <div className="mt-4 flex items-center text-sm font-medium text-white/90">
            Income minus expenses
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-2xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-900">Monthly Income vs Expense</h2>
          </div>
          <div className="h-72 w-full">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis hide={true} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="income" fill="#10b981" radius={[4, 4, 4, 4]} barSize={12} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 4, 4]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                <p className="font-medium">No transaction data yet</p>
                <p className="text-sm">Add transactions to see the chart</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Expense Category</h2>
          {pieData.length > 0 ? (
            <>
              <div className="h-48 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center text-center">
                  <span className="text-sm text-slate-500 font-medium">Spent</span>
                  <span className="text-xl font-bold text-slate-900">NPR {totalSpent >= 1000 ? `${(totalSpent/1000).toFixed(0)}k` : totalSpent}</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    <span className="text-sm text-slate-600 font-medium">{entry.name}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-400 gap-2">
              <p className="font-medium">No expense data yet</p>
              <p className="text-sm">Add expenses to see categories</p>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl p-6 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="text-xs uppercase text-slate-400 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recentTransactions || []).length > 0 ? (
                stats.recentTransactions.map((tx: any) => (
                  <tr key={tx.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-4">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-4 font-medium text-slate-900">{tx.description}</td>
                    <td className="px-4 py-4">
                      <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-full uppercase">
                        {tx.category?.name || "General"}
                      </span>
                    </td>
                    <td className={`px-4 py-4 text-right font-bold ${tx.type === 'INCOME' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'} NPR {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-400">No transactions yet. Add one using the button above!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchStats} 
      />
    </div>
  );
}
