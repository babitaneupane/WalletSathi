"use client";

import { useState } from "react";
import {
  HelpCircle,
  BookOpen,
  Target,
  Users,
  Building,
  Sparkles,
  Search,
  ChevronDown,
  ArrowRight,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "savings" | "split" | "ai" | "rent">("all");

  const helpArticles = [
    {
      id: "savings-1",
      category: "savings",
      title: "How to Create and Track Savings Goals",
      icon: Target,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>Savings goals allow you to set money aside for specific long-term purchases, emergency funds, or trips.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">1</span>
              <p>Click the <strong className="text-white font-medium">plus (+) icon</strong> in the Savings card on the dashboard to open the modal.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">2</span>
              <p>Enter the goal name (e.g., "Europe Trip"), target amount, and initial saved amount.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">3</span>
              <p>Save to view your new goal progress bar with target percentages.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "savings-2",
      category: "savings",
      title: "Editing or Deleting a Savings Goal",
      icon: Edit2,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>If you've saved more money or need to modify your goal details, you can edit it at any time:</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">1</span>
              <p>Hover your cursor over the goal card inside the <strong className="text-white font-medium">Savings</strong> widget on the dashboard.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">2</span>
              <p>Click the <strong className="text-white font-medium">Pencil (Edit)</strong> icon to update details, or the <strong className="text-white font-medium">Trash (Delete)</strong> icon to delete the goal.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold mt-0.5">3</span>
              <p>Inside the edit modal, modify the amounts and click <strong className="text-white font-medium">Save Changes</strong>.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "split-1",
      category: "split",
      title: "How to Split Bills & Expenses",
      icon: Users,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>Split Expenses helps you share costs with friends, roommates, or groups without the headache of manual math.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mt-0.5">1</span>
              <p>Go to the <strong className="text-white font-medium">Split Expenses</strong> page from the sidebar navigation.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mt-0.5">2</span>
              <p>Create a split group and add members by entering their email addresses.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mt-0.5">3</span>
              <p>Add a new expense, select who paid, and divide the shares (equally or unequally).</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-400 text-xs font-bold mt-0.5">4</span>
              <p>Balances are recalculated automatically to show exactly who owes whom.</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "ai-1",
      category: "ai",
      title: "Interacting with WalletSathi AI Assistant",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>The AI Assistant provides intelligent budget insights, spending alerts, and financial tips based on your data.</p>
          <p>Navigate to the <strong className="text-white font-medium">AI Assistant</strong> page to ask queries such as:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>"Where did I spend the most this month?"</li>
            <li>"Give me budget tips to save NPR 10,000 for next month."</li>
            <li>"Analyze my subscriptions and find overlapping services."</li>
          </ul>
        </div>
      ),
    },
    {
      id: "rent-1",
      category: "rent",
      title: "Rent Management & Tenant Tracking",
      icon: Building,
      content: (
        <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
          <p>For landlords or shared apartment managers, Rent Dashboard simplifies tracking property incomes.</p>
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mt-0.5">1</span>
              <p>Add your property listings, monthly rent amount, and tenant names.</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold mt-0.5">2</span>
              <p>Record tenant payments directly to keep real-time status of paid, pending, or late rents.</p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredArticles = helpArticles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || art.category === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              WalletSathi Help Center
            </h1>
            <p className="text-sm text-slate-500">
              Find detailed instructions, tips, and step-by-step guides for all features.
            </p>
          </div>
        </div>
      </div>

      {/* Search & Tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition"
          />
        </div>

        {/* Tabs */}
        <div className="flex gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-white/5 w-full sm:w-auto overflow-x-auto">
          {(["all", "savings", "split", "ai", "rent"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-indigo-500 text-slate-900 shadow-lg shadow-indigo-500/15 font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab === "all" ? "All Guides" : tab === "ai" ? "AI Assistant" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Guides Grid */}
      <div className="grid gap-6">
        {filteredArticles.length > 0 ? (
          filteredArticles.map((article) => {
            const Icon = article.icon;
            return (
              <div
                key={article.id}
                className="group rounded-2xl border border-white/5 bg-[#1A1333] p-6 shadow-xl transition-all duration-300 hover:border-white/10 hover:shadow-2xl"
              >
                <div className="flex items-center gap-3.5 mb-4">
                  <div className="p-2 rounded-xl bg-white/5 text-indigo-400 group-hover:scale-110 transition duration-300">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-lg font-bold text-white group-hover:text-indigo-400 transition" style={{ fontFamily: "var(--font-outfit)" }}>
                    {article.title}
                  </h2>
                </div>
                <div className="border-t border-white/5 pt-4">
                  {article.content}
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-white/5 bg-[#1A1333]/40 text-slate-600">
            <BookOpen className="h-12 w-12 mb-3 opacity-30 animate-pulse" />
            <p className="text-sm font-semibold">No guides found</p>
            <p className="text-xs mt-1">Try searching for a different keyword or category.</p>
          </div>
        )}
      </div>

      {/* FAQs or Fast Help banner */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-600/10 border border-indigo-500/10 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-outfit)" }}>
            <Sparkles className="h-4 w-4 text-indigo-400" /> Need personalized help?
          </h3>
          <p className="text-sm text-slate-400 mt-1 max-w-xl">
            You can always ask our AI assistant to guide you through budgeting details or analyze specific transactions for you.
          </p>
        </div>
        <a
          href="/ai-assistant"
          className="flex items-center gap-2 rounded-xl bg-indigo-500 hover:bg-indigo-400 px-4 py-2.5 text-sm font-bold text-slate-900 shadow-lg shadow-indigo-500/20 transition-all duration-200 shrink-0"
        >
          Ask AI Assistant <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
