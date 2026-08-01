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
  ShieldAlert,
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
  const { user, logout } = useAuth();

  return (
    <aside className="w-60 flex flex-col h-screen shrink-0 sticky top-0 border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="px-4 py-4">
        <Link href="/dashboard" className="flex items-center gap-4">
          <img src="/logo.png " height={100} width={130} alt="WalletSathi Logo" />
          <div>

          </div>
        </Link>

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
                  ? "bg-emerald-500/15 text-emerald-500 shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon
                className={clsx(
                  "h-4.5 w-4.5 shrink-0 transition-colors",
                  isActive ? "text-emerald-500" : "text-slate-500 group-hover:text-slate-700"
                )}
                size={18}
              />
              {item.name}
              {isActive && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-500" />
              )}
            </Link>
          );
        })}

        {/* Admin Dashboard - conditional */}
        {user?.role === "ADMIN" && (
          <div className="pt-3 mt-3 border-t border-slate-200">
            <Link
              href="/admin"
              className={clsx(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
                pathname === "/admin"
                  ? "bg-purple-500/15 text-purple-600 shadow-sm"
                  : "text-purple-500 hover:bg-purple-50 hover:text-purple-700"
              )}
            >
              <ShieldAlert className="h-4.5 w-4.5 shrink-0" size={18} />
              Admin Area
            </Link>
          </div>
        )}

        {/* AI Assistant - highlighted */}
        <div className="pt-3 mt-3 border-t border-slate-200">
          <Link
            href="/ai-assistant"
            className={clsx(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200",
              pathname === "/ai-assistant"
                ? "bg-gradient-to-r from-emerald-500/20 to-purple-600/20 text-teal-500 shadow-lg shadow-emerald-500/10 border border-emerald-500/20"
                : "bg-gradient-to-r from-emerald-500/10 to-purple-600/10 text-emerald-500 hover:from-emerald-500/20 hover:to-purple-600/20 border border-emerald-500/10 hover:border-emerald-500/25"
            )}
          >
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-500" />
            AI Assistant
          </Link>
        </div>
      </div>

      {/* Bottom */}
      <div className="p-3 space-y-0.5 border-t border-slate-200">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all"
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
