import { useState } from "react";
import { X } from "lucide-react";
import api from "../lib/api";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    type: "EXPENSE",
    categoryName: "Food"
  });

  const categories = ["Food", "Travel", "Household", "Rent", "Friends", "Initial Balance", "Salary", "Other"];

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/transactions", formData);
      setFormData({ amount: "", description: "", type: "EXPENSE", categoryName: "Food" });
      onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to create transaction", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 shadow-2xl relative bg-white">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Add Transaction</h2>
        <form onSubmit={handleCreateTransaction} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-xl border p-3 text-center transition ${formData.type === 'EXPENSE' ? 'border-danger bg-danger/10 text-danger' : 'border-slate-200 text-slate-600'}`}>
              <input type="radio" name="type" value="EXPENSE" checked={formData.type === 'EXPENSE'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="hidden" />
              <span className="font-medium">Expense</span>
            </label>
            <label className={`cursor-pointer rounded-xl border p-3 text-center transition ${formData.type === 'INCOME' ? 'border-success bg-success/10 text-success' : 'border-slate-200 text-slate-600'}`}>
              <input type="radio" name="type" value="INCOME" checked={formData.type === 'INCOME'} onChange={(e) => setFormData({...formData, type: e.target.value})} className="hidden" />
              <span className="font-medium">Income</span>
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Amount (NPR)</label>
            <input type="number" required value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="0.00" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select required value={formData.categoryName} onChange={(e) => setFormData({...formData, categoryName: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <input type="text" required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Grocery shopping" />
          </div>

          <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover shadow-lg shadow-primary/30 mt-4 transition">
            Save Transaction
          </button>
        </form>
      </div>
    </div>
  );
}
