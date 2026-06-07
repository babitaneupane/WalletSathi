"use client";

import { useState, useEffect } from "react";
import { Plus, Users, UserPlus, Receipt } from "lucide-react";
import api from "../../../lib/api";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        setGroups(res.data);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  const displayGroups = groups.length > 0 ? groups : [
    {
      id: 1,
      name: "The Loft #402",
      description: "4 Members • Rent & Utilities",
      totalSpent: 124500,
      yourShare: 31125,
      members: [{ name: "U" }, { name: "A" }, { name: "B" }]
    },
    {
      id: 2,
      name: "Pokhara Trip 2024",
      description: "6 Members • Travel & Food",
      totalSpent: 82800,
      yourShare: 13800,
      members: [{ name: "U" }, { name: "C" }, { name: "D" }]
    },
    {
      id: 3,
      name: "Friday Dinners",
      description: "3 Members • Social",
      totalSpent: 4200,
      yourShare: 1400,
      members: [{ name: "U" }, { name: "E" }]
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Financial Groups</h1>
          <p className="text-sm text-slate-500 mt-1">Manage shared expenses with friends, family, and teams</p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            <UserPlus className="h-4 w-4" />
            Join Group
          </button>
          <button className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30">
            <Plus className="h-4 w-4" />
            Create Group
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayGroups.map((group: any) => (
          <div key={group.id} className="glass rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{group.name}</h3>
                  <p className="text-xs text-slate-500">{group.description}</p>
                </div>
              </div>
            </div>

            <div className="flex -space-x-2 my-4">
              {group.members.map((m: any, i: number) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                  {m.name.charAt(0)}
                </div>
              ))}
              <div className="h-8 w-8 rounded-full border-2 border-white bg-slate-50 flex items-center justify-center text-xs font-bold text-slate-400">
                +
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-100">
              <div>
                <p className="text-xs text-slate-500 mb-1">Total Group Spent</p>
                <p className="font-bold text-slate-900">NPR {group.totalSpent.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 mb-1">Your Share</p>
                <p className="font-bold text-primary">NPR {group.yourShare.toLocaleString()}</p>
              </div>
            </div>
            
            <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-slate-50 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition">
              <Receipt className="h-4 w-4" /> View Details
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
