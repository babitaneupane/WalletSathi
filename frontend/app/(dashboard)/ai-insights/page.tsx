"use client";

import { useEffect, useState } from "react";
import { BrainCircuit, Sparkles, TrendingDown, RefreshCw, ChevronRight } from "lucide-react";
import api from "../../../lib/api";

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await api.get("/ai/insights");
      setInsights(res.data);
    } catch (err) {
      console.error("Failed to fetch insights", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post("/ai/insights/generate");
      await fetchInsights();
    } catch (err) {
      console.error("Failed to generate insight", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 py-8">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary">
          <BrainCircuit className="h-4 w-4" /> ADVANCED AI MODEL ACTIVE
        </div>
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
          Financial Intelligence,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-500">Personalized for You.</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Unlock deep insights into your spending patterns. Our AI analyzes thousands of data points to help you reach your financial goals faster.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <button 
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-white transition hover:bg-primary-hover shadow-lg shadow-primary/30 disabled:opacity-50"
          >
            {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {generating ? "Analyzing..." : "Generate New Insights"}
          </button>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm">
            View Report
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Weekly Analysis</h2>
          <select className="bg-transparent border-none text-slate-500 text-sm font-medium focus:ring-0 cursor-pointer">
            <option>Last 7 Days</option>
            <option>Last 30 Days</option>
          </select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 glass rounded-2xl p-8 border border-slate-200 shadow-sm bg-gradient-to-br from-white to-slate-50 relative overflow-hidden">
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold text-primary uppercase tracking-widest">SPENDING SUMMARY</span>
              <div className="rounded-full bg-slate-100 p-2">
                <BrainCircuit className="h-5 w-5 text-slate-400" />
              </div>
            </div>
            
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">
              Your spending is <span className="text-success">12% lower</span> than last month.
            </h3>
            <p className="text-slate-600 leading-relaxed mb-8">
              Great job! You've successfully reduced your discretionary spending, particularly in the "Entertainment" category. If you maintain this pace, you'll reach your "Vacation Fund" goal 3 weeks earlier than expected.
            </p>
            
            <div className="flex flex-wrap gap-8 pt-6 border-t border-slate-100">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total Spent</p>
                <p className="text-xl font-bold text-slate-900">NPR 42,500</p>
              </div>
              <div>
                <p className="text-sm font-medium text-success mb-1">Saved</p>
                <p className="text-xl font-bold text-success">NPR 5,200</p>
              </div>
              <div className="ml-auto self-end">
                <button className="text-sm font-bold text-primary flex items-center gap-1 hover:underline">
                  Details <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="glass rounded-2xl p-6 border border-danger/20 shadow-sm bg-danger/5 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-danger/10 rounded-lg text-danger">
                <TrendingDown className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-danger uppercase">Alert</span>
            </div>
            <h4 className="text-lg font-bold text-slate-900 mb-2">Subscription Spike</h4>
            <p className="text-sm text-slate-600 mb-6 flex-1">
              We noticed 2 new recurring charges from CloudSaaS and MediaStream. Your subscription costs increased by NPR 1,800 this month.
            </p>
            <button className="w-full rounded-xl bg-white border border-danger/20 py-2.5 text-sm font-medium text-danger hover:bg-danger/10 transition shadow-sm">
              Review Subscriptions
            </button>
          </div>
        </div>

        {insights.length > 0 && (
          <div className="mt-12 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Generated Insights History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight: any) => (
                <div key={insight.id} className="glass rounded-xl p-5 border border-slate-200 shadow-sm">
                  <p className="text-xs text-slate-400 mb-3">{new Date(insight.createdAt).toLocaleString()}</p>
                  <p className="text-sm text-slate-700 leading-relaxed">{insight.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
