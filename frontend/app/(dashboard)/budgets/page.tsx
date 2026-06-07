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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Monthly Budgets</h1>
          <p className="text-sm text-slate-500 mt-1">Manage and track your spending limits</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30 shrink-0"
        >
          <Plus className="h-4 w-4" />
          Add Budget
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-100 rounded-2xl" />)}
        </div>
      ) : budgets.length === 0 ? (
        <div className="glass rounded-2xl p-16 border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-4">
          <div className="rounded-full bg-primary/10 p-4">
            <Plus className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No budgets yet</h3>
          <p className="text-slate-400 text-sm max-w-xs">Set spending limits for each category to track where your money goes.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-hover shadow-lg shadow-primary/30 transition"
          >
            Create your first budget
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget: any) => {
            const categoryName = budget.category?.name || 'General';
            const Icon = CATEGORY_ICONS[categoryName] || Home;
            const colorClass = CATEGORY_COLORS[categoryName] || 'text-slate-500 bg-slate-50';
            const spent = budget.spent || 0;
            const limit = budget.amount;
            const percentage = Math.min((spent / limit) * 100, 100);
            const isNearLimit = percentage > 85;

            return (
              <div key={budget.id} className="glass rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${colorClass}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-lg">{categoryName}</h3>
                  </div>

                  <div className="flex gap-3 items-center">
                    <button
                      onClick={() => handleDeleteBudget(budget.id)}
                      className="p-2 text-slate-400 hover:text-danger hover:bg-danger/10 rounded-full transition"
                      title="Delete Budget"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {/* Custom SVG Donut for Progress */}
                    <div className="relative w-14 h-14">
                      <svg className="w-14 h-14 transform -rotate-90">
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                        <circle cx="28" cy="28" r="24" stroke="currentColor" strokeWidth="4" fill="transparent"
                          strokeDasharray={24 * 2 * Math.PI}
                          strokeDashoffset={24 * 2 * Math.PI - (percentage / 100) * 24 * 2 * Math.PI}
                          className={isNearLimit ? "text-danger" : "text-primary"}
                        />
                      </svg>
                      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-700">
                        {Math.round(percentage)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Spent</span>
                    <span className="font-bold text-slate-900">NPR {spent.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Total Budget</span>
                    <span className="font-semibold text-slate-700">NPR {limit.toLocaleString()}</span>
                  </div>
                  <div className="w-full border-t border-dashed border-slate-200 my-2"></div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500">Remaining</span>
                    <span className={`font-bold ${isNearLimit ? "text-danger" : "text-success"}`}>
                      NPR {(limit - spent).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl relative bg-white">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-slate-900 mb-6">Add New Budget</h2>
            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Amount (NPR)</label>
                <input
                  type="number"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
                <select
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Object.keys(CATEGORY_ICONS).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Month</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">Year</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover shadow-lg shadow-primary/30 mt-4 transition"
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
