"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

const topNavLinks = [
  { name: "Dashboard", href: "/dashboard" },
  { name: "Transactions", href: "/transactions" },
  { name: "Budgets", href: "/budgets" },
  { name: "Groups", href: "/groups" },
  { name: "AI Insights", href: "/ai-insights" },
];

export default function Header() {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-8 backdrop-blur-md">
      <nav className="flex items-center gap-8">
        {topNavLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={clsx(
                "text-sm font-medium transition-colors hover:text-primary relative py-5",
                isActive ? "text-primary" : "text-slate-500"
              )}
            >
              {link.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 h-0.5 w-full bg-primary rounded-t-full"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-6">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-64 rounded-full border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div className="flex items-center gap-4">
          <button className="relative text-slate-400 hover:text-slate-600 transition">
            <Bell className="h-5 w-5" />
            <span className="absolute 1 top-0 right-0 h-2 w-2 rounded-full bg-danger"></span>
          </button>
          
          <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900 leading-none">{user?.name || "User"}</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-primary to-blue-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {user?.name?.charAt(0) || "U"}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
