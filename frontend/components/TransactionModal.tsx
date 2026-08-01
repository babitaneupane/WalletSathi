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
  const [isPredicting, setIsPredicting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (formData.description.trim().length > 2) {
        setIsPredicting(true);
        try {
          const res = await api.post("/ai/predict-category", {
            description: formData.description,
            type: formData.type
          });
          setFormData(prev => ({ ...prev, categoryName: res.data.category || "Other" }));
        } catch (err) {
          console.error("AI Category prediction failed", err);
          setFormData(prev => ({ ...prev, categoryName: "Other" }));
        } finally {
          setIsPredicting(false);
        }
      } else {
        setFormData(prev => ({ ...prev, categoryName: "" }));
      }
    }, 600);

    return () => clearTimeout(delayDebounceFn);
  }, [formData.description, formData.type]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post("/transactions", { ...formData, categoryName: formData.categoryName || "Other" });
      setFormData({ amount: "", description: "", type: "EXPENSE", categoryName: "" });
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
            {isPredicting ? (
               <div className="mt-2 text-xs text-slate-500 flex items-center gap-2">
                 <div className="animate-spin h-3 w-3 border-2 border-emerald-500 border-t-transparent rounded-full"></div>
                 AI is determining category...
               </div>
            ) : formData.categoryName ? (
               <div className="mt-2 text-xs font-medium text-emerald-600 flex items-center gap-1.5 bg-emerald-50 w-fit px-2.5 py-1 rounded-md border border-emerald-100">
                 ✨ AI Predicted: {formData.categoryName}
               </div>
            ) : null}
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
