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
  SplitSquareHorizontal
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import clsx from "clsx";

const navItems = [
  { name: "Home", href: "/dashboard", icon: Home },
  { name: "Transactions", href: "/transactions", icon: CreditCard },
  { name: "Analytics", href: "/budgets", icon: PieChart },
  { name: "Team", href: "/groups", icon: Users },
  { name: "Rent Dashboard", href: "/rent", icon: Building },
  { name: "Split Expenses", href: "/split", icon: SplitSquareHorizontal },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0 sticky top-0">
      <div className="p-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-slate-900">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Wallet className="h-5 w-5" />
          </div>
          FinFlow <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full ml-1">AI</span>
        </Link>
        <p className="mt-2 text-xs text-slate-500 font-medium tracking-wide px-1">PREMIUM PLAN</p>
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        <div className="mt-8 pt-8 border-t border-slate-100">
          <Link
            href="/ai-assistant"
            className={clsx(
              "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors",
              pathname === "/ai-assistant"
                ? "bg-primary text-white shadow-md"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <BrainCircuit className="h-5 w-5" />
            AI Assistant
          </Link>
        </div>
      </div>

      <div className="p-4 space-y-1">
        <Link
          href="/help"
          className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        >
          <HelpCircle className="h-5 w-5" />
          Help
        </Link>
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
