"use client";

import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  const pageTitle = () => {
    const map: Record<string, string> = {
      "/dashboard": "Financial Overview",
      "/transactions": "Transactions",
      "/budgets": "Analytics & Budgets",
      "/groups": "Team & Groups",
      "/rent": "Rent Dashboard",
      "/split": "Split Expenses",
      "/categories": "Categories",
      "/ai-assistant": "AI Assistant",
      "/settings": "Settings",
    };
    return map[pathname] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-white/5 bg-[#0F172A]/90 px-6 backdrop-blur-md">
      <div>
        <h2 className="text-lg font-bold text-white" style={{ fontFamily: "var(--font-outfit)" }}>
          {pageTitle()}
        </h2>
        <p className="text-xs text-slate-500">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-56 rounded-xl border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-slate-300 placeholder:text-slate-600 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 transition"
          />
        </div>

        {/* Bell */}
        <button className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/10 transition">
          <Bell className="h-4 w-4" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
        </button>

        {/* User */}
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 pl-1 pr-3 py-1 cursor-pointer hover:bg-white/10 transition">
          <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-200 leading-none">{user?.name || "User"}</p>
          </div>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500 ml-1" />
        </div>
      </div>
    </header>
  );
}
