"use client";

import { useState, useEffect } from "react";
import { Users, SplitSquareHorizontal, Receipt } from "lucide-react";
import api from "../../../lib/api";

export default function SplitPage() {
  const [splits, setSplits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSplits = async () => {
    try {
      const res = await api.get("/split");
      setSplits(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSplits();
  }, []);

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [friends, setFriends] = useState([{ ghostName: "Me", amount: "" }, { ghostName: "", amount: "" }]);

  const handleAddFriend = () => {
    setFriends([...friends, { ghostName: "", amount: "" }]);
  };

  const handleFriendChange = (index: number, field: string, value: string) => {
    const newFriends = [...friends];
    newFriends[index] = { ...newFriends[index], [field]: value };
    setFriends(newFriends);
  };

  const handleSplitEvenly = () => {
    if (!amount) return;
    const total = parseFloat(amount);
    const evenSplit = (total / friends.length).toFixed(2);
    setFriends(friends.map(f => ({ ...f, amount: evenSplit })));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/split", {
      title,
      totalAmount: amount,
      splits: friends
    });
    setTitle("");
    setAmount("");
    setFriends([{ ghostName: "Me", amount: "" }, { ghostName: "", amount: "" }]);
    fetchSplits();
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Split Expenses</h1>
        <p className="text-sm text-slate-500 mt-1">Quickly divide bills and track who owes you money.</p>
      </div>

      <div className="glass p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><SplitSquareHorizontal className="h-5 w-5 text-primary" /> Create Split</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Expense Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Dinner at KFC" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Total Amount (NPR)</label>
              <input type="number" required value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm" />
            </div>
          </div>

          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-sm text-slate-900">Split Details</h3>
              <button type="button" onClick={handleSplitEvenly} className="text-xs text-primary font-medium hover:underline">Split Evenly</button>
            </div>
            <div className="space-y-3">
              {friends.map((f, i) => (
                <div key={i} className="flex gap-4">
                  <input type="text" placeholder="Name" required value={f.ghostName} onChange={e => handleFriendChange(i, 'ghostName', e.target.value)} readOnly={i === 0} className="w-1/2 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm" />
                  <input type="number" placeholder="Amount" required value={f.amount} onChange={e => handleFriendChange(i, 'amount', e.target.value)} className="w-1/2 rounded-lg border border-slate-200 bg-white py-2 px-3 text-sm" />
                </div>
              ))}
            </div>
            <button type="button" onClick={handleAddFriend} className="mt-4 text-xs font-medium text-slate-500 hover:text-primary transition">+ Add Another Person</button>
          </div>

          <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-white hover:bg-primary-hover shadow-md transition">Save Split Expense</button>
        </form>
      </div>

      <div className="glass p-6 rounded-2xl border border-slate-200">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Receipt className="h-5 w-5 text-slate-700" /> Recent Splits</h2>
        {loading ? <p className="text-sm text-slate-500">Loading...</p> : splits.length === 0 ? <p className="text-sm text-slate-500">No split expenses yet.</p> : (
          <div className="space-y-4">
            {splits.map((expense: any) => (
              <div key={expense.id} className="border border-slate-100 rounded-xl p-4 bg-white hover:shadow-sm transition">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-slate-900">{expense.title}</h3>
                  <p className="font-bold text-primary">NPR {expense.amount.toLocaleString()}</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {expense.splits.map((s: any) => (
                    <span key={s.id} className="bg-slate-100 text-slate-600 text-xs font-medium px-2.5 py-1 rounded-md">
                      {s.ghostName}: NPR {s.amount.toLocaleString()}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
