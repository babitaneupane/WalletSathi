"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Bell, Search, ChevronDown, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";

export default function Header() {
  const { showAlert } = useAlert();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      showAlert(`Searching for: ${searchQuery}`, "info");
      setSearchQuery("");
    }
  };

  const pageTitle = () => {
    const map: Record<string, string> = {
      "/dashboard": "Financial Overview",
      "/transactions": "Transactions",
      "/budgets": "Analytics & Budgets",
      "/groups": "Team & Groups",
      "/rent": "Rent Dashboard",
      "/split": "Split Expenses",
      "/ai-assistant": "AI Assistant",
      "/settings": "Settings",
    };
    return map[pathname] || "Dashboard";
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 backdrop-blur-md">
      <div>
        <h2 className="text-lg font-bold text-slate-900" style={{ fontFamily: "var(--font-outfit)" }}>
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="h-9 w-56 rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-700 placeholder:text-slate-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/30 transition"
          />
        </div>

        {/* Bell */}
        <div className="relative" ref={notifRef}>
          <button 
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-red-500"></span>
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 p-4 z-50">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Notifications</h4>
              <div className="flex flex-col gap-2">
                <div className="rounded-lg bg-slate-50 p-2 text-xs text-slate-700 border border-slate-200">
                  <p className="font-medium text-emerald-500 mb-0.5">Welcome!</p>
                  <p>Your WalletSathi account is ready.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User */}
        <div className="relative" ref={profileRef}>
          <div 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 pl-1 pr-3 py-1 cursor-pointer hover:bg-slate-100 transition"
          >
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-emerald-500 to-purple-600 flex items-center justify-center text-slate-900 font-bold text-xs shadow">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-slate-800 leading-none">{user?.name || "User"}</p>
            </div>
            <ChevronDown className={`h-3.5 w-3.5 text-slate-500 ml-1 transition-transform ${isProfileOpen ? "rotate-180" : ""}`} />
          </div>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-200 mb-1 bg-slate-50 rounded-t-xl mx-1 mt-1">
                <p className="text-sm font-semibold text-slate-900">{user?.name || "User"}</p>
                <p className="text-[10px] text-slate-500 truncate mt-0.5">{user?.email || "user@example.com"}</p>
              </div>
              
              <button 
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 mt-1 text-sm text-red-400 hover:bg-red-500/10 transition-colors text-left font-medium"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
