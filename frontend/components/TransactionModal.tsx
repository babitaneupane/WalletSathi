import { useState, useEffect } from "react";
import { X, Plus, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";
import api from "../lib/api";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface Category {
  id: string;
  name: string;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "EXPENSE",
    categoryName: ""
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
      if (res.data.length > 0 && !formData.categoryName) {
        setFormData(prev => ({ ...prev, categoryName: res.data[0].name }));
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    try {
      const res = await api.post("/categories", { name: newCategoryName });
      setCategories(prev => [...prev, res.data]);
      setFormData(prev => ({ ...prev, categoryName: res.data.name }));
      setIsAddingCategory(false);
      setNewCategoryName("");
    } catch (err) {
      console.error("Failed to create category", err);
    }
  };

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/transactions", formData);
      setFormData({ amount: "", description: "", type: "EXPENSE", categoryName: categories[0]?.name || "" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create transaction", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/50 animate-in fade-in slide-in-from-bottom-4 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Add Transaction
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Record your income or expense</p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleCreateTransaction} className="space-y-4">
          {/* Type Toggle */}
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                formData.type === "EXPENSE"
                  ? "border-red-500/40 bg-red-500/15 text-red-400 shadow-sm shadow-red-500/10"
                  : "border-slate-200 bg-white/3 text-slate-500 hover:bg-white/8"
              }`}
            >
              <input
                type="radio"
                name="type"
                value="EXPENSE"
                checked={formData.type === "EXPENSE"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-1.5">
                <ArrowDownRight className="h-4 w-4" />
                <span className="text-sm font-semibold">Expense</span>
              </div>
            </label>
            <label
              className={`cursor-pointer rounded-xl border p-3 text-center transition-all ${
                formData.type === "INCOME"
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-400 shadow-sm shadow-emerald-500/10"
                  : "border-slate-200 bg-white/3 text-slate-500 hover:bg-white/8"
              }`}
            >
              <input
                type="radio"
                name="type"
                value="INCOME"
                checked={formData.type === "INCOME"}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-1.5">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-semibold">Income</span>
              </div>
            </label>
          </div>

          {/* Amount */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Amount (NPR)
            </label>
            <input
              type="number"
              required
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
              placeholder="0.00"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Category
            </label>
            {isAddingCategory ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  autoFocus
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
                  placeholder="e.g. Groceries"
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleCreateCategory())}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-900 hover:bg-emerald-500 transition"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(false)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <div className="relative w-full">
                  <select
                    required
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-10 text-sm text-slate-800 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
                  >
                    <option value="" disabled>Select a category</option>
                    {(formData.type === "INCOME" 
                      ? ["Salary", "Initial balance", "Freelance", "Investment"] 
                      : ["Food & Dining", "Transport", "Utilities", "Shopping", "Entertainment"]
                    ).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {categories.filter(c => 
                      !(formData.type === "INCOME" 
                        ? ["Salary", "Initial balance", "Freelance", "Investment"] 
                        : ["Food & Dining", "Transport", "Utilities", "Shopping", "Entertainment"]
                      ).includes(c.name)
                    ).map((c) => (
                      <option key={c.id} value={c.name} className="bg-white">
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                    <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory(true)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition"
                  title="Add new category"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm text-slate-800 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
              placeholder="e.g. Grocery shopping"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-500 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Transaction"}
          </button>
        </form>
      </div>
    </div>
  );
}
