"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Wallet,
  Home,
  CreditCard,
  PieChart,
  Users,
  Settings,
  LogOut,
  HelpCircle,
  BrainCircuit,
  Building,
  SplitSquareHorizontal,
  Tag,
  Target,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Categories", href: "/categories", icon: Tag },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Analytics", href: "/budgets", icon: PieChart },
  { name: "Rent Dashboard", href: "/rent", icon: Building },
  { name: "Split Expenses", href: "/split", icon: SplitSquareHorizontal },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-60 flex flex-col h-screen shrink-0 sticky top-0 border-r border-white/5 bg-[#0F172A]">
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-2 shadow-lg shadow-cyan-500/30">
            <Wallet className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              FinFlow
            </span>
            <span className="ml-1 text-xs font-semibold text-cyan-400">AI</span>
          </div>
        </Link>
        <div className="mt-3 mx-1">
          <span className="text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Premium Plan</span>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-cyan-500/15 text-cyan-400 shadow-sm"
                  : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
              )}
            >
              <Icon
                className={clsx(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                )}
                size={18}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
              )}
            </Link>
          );
        })}

        {/* AI Assistant - highlighted */}
        <div className="pt-3 mt-3 border-t border-white/5">
          <Link
            href="/ai-assistant"
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              pathname === "/ai-assistant"
                ? "bg-gradient-to-r from-cyan-500/20 to-purple-600/20 text-cyan-300 shadow-lg shadow-cyan-500/10 border border-cyan-500/20"
                : "bg-gradient-to-r from-cyan-500/10 to-purple-600/10 text-cyan-400 hover:from-cyan-500/20 hover:to-purple-600/20 border border-cyan-500/10 hover:border-cyan-500/25"
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-cyan-400" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 space-y-0.5 border-t border-white/5">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-white/5 hover:text-slate-300 transition-all"
        >
          <HelpCircle className="h-4.5 w-4.5" size={18} />
          Help
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500/80 hover:bg-red-500/10 hover:text-red-400 transition-all"
        >
          <LogOut className="h-4.5 w-4.5" size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
