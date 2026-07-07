"use client";

import { useEffect, useState } from "react";
import { Plus, Home, Utensils, Car, ShoppingBag, Gamepad2, HeartPulse, X, Trash2 } from "lucide-react";
import api from "../../../lib/api";

const CATEGORY_ICONS: Record<string, any> = {
  Housing: Home,
  Dining: Utensils,
  Transport: Car,
  Shopping: ShoppingBag,
  Leisure: Gamepad2,
  Health: HeartPulse,
};

const CATEGORY_COLORS: Record<string, string> = {
  Housing: 'text-blue-500 bg-blue-50',
  Dining: 'text-orange-500 bg-orange-50',
  Transport: 'text-indigo-500 bg-indigo-50',
  Shopping: 'text-pink-500 bg-pink-50',
  Leisure: 'text-purple-500 bg-purple-50',
  Health: 'text-emerald-500 bg-emerald-50',
};

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    categoryName: "Housing",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error("Failed to fetch budgets", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/budgets", { ...formData, amount: parseFloat(formData.amount) });
      setIsModalOpen(false);
      setFormData({ amount: "", categoryName: "Housing", month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      fetchBudgets();
    } catch (err) {
      console.error("Failed to create budget", err);
    }
  };

  const handleDeleteBudget = async (id: string) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error("Failed to delete budget", err);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Manage</p>
          <h1 className="text-2xl font-bold text-white mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>Budgets & Analytics</h1>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-2xl" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="rounded-2xl border border-white/5 bg-[#1E293B] p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-cyan-500/10 p-4">
            <Plus className="h-8 w-8 text-cyan-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-200" style={{ fontFamily: "var(--font-outfit)" }}>No budgets yet</h3>
          <p className="text-slate-500 text-sm max-w-xs">Set spending limits for each category to track where your money goes.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition"
          >
            Create your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((budget: any) => {
            const categoryName = budget.category?.name || 'General';
            const Icon = CATEGORY_ICONS[categoryName] || Home;
            const spent = budget.spent || 0;
            const limit = budget.amount;
            const percentage = Math.min((spent / limit) * 100, 100);
            const isNearLimit = percentage > 85;

            return (
              <div key={budget.id} className="rounded-2xl border border-white/5 bg-[#1E293B] p-5 flex flex-col hover:border-white/10 transition">
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-200" style={{ fontFamily: "var(--font-outfit)" }}>{categoryName}</h3>
                      <p className="text-xs text-slate-600">{budget.month}/{budget.year}</p>
                    </div>
                  </div>

                  <div className="flex gap-2 items-center">
                    <button onClick={() => handleDeleteBudget(budget.id)}
                      className="p-1.5 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="relative w-12 h-12">
                      <svg className="w-12 h-12 transform -rotate-90">
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-white/5" />
                        <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="3" fill="transparent"
                          strokeDasharray={20 * 2 * Math.PI}
                          strokeDashoffset={20 * 2 * Math.PI - (percentage / 100) * 20 * 2 * Math.PI}
                          className={isNearLimit ? "text-red-400" : "text-cyan-400"}
                          style={{ transition: "stroke-dashoffset 0.5s ease" }}
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[9px] font-bold text-slate-300">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Spent</span>
                    <span className="font-bold text-slate-200">NPR {spent.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isNearLimit ? "bg-red-400" : "bg-gradient-to-r from-cyan-500 to-cyan-400"}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-600">Budget: NPR {limit.toLocaleString()}</span>
                    <span className={`font-bold ${isNearLimit ? "text-red-400" : "text-emerald-400"}`}>
                      NPR {(limit - spent).toLocaleString()} left
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
          onClick={(e) => e.target === e.currentTarget && setIsModalOpen(false)}
        >
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#1E293B] p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>Add New Budget</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-300 transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Amount (NPR)</label>
                <input type="number" required value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none transition"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Category</label>
                <select required value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#0F172A] py-3 px-4 text-sm text-slate-200 focus:outline-none"
                >
                  {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Month</label>
                  <input type="number" min="1" max="12" required value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">Year</label>
                  <input type="number" required value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 py-3 px-4 text-sm text-slate-200 focus:border-cyan-500/50 focus:outline-none"
                  />
                </div>
              </div>
              <button type="submit"
                className="w-full rounded-xl bg-cyan-500 hover:bg-cyan-400 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-cyan-500/25 transition-all mt-2 hover:scale-[1.02] active:scale-[0.98]"
              >
                Save Budget
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
